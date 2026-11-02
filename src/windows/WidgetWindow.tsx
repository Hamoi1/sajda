import { availableMonitors, currentMonitor, getCurrentWindow, LogicalPosition, LogicalSize, PhysicalPosition } from "@tauri-apps/api/window";
import { useEffect, useState, type MouseEvent } from "react";
import { WidgetCard } from "../components/widget/WidgetCard";
import { useWindowSync } from "../hooks/useWindowSync";
import { emitEvent, inTauri, onEvent } from "../lib/tauri";
import { WIDGET_SIZES } from "../lib/widgetThemes";
import { useSettingsStore } from "../store/useSettingsStore";

const POSITION_KEY = "sajda-widget-pos";

export function WidgetWindow() {
  useWindowSync("widget");
  useWidgetFrame();
  const widget = useSettingsStore((s) => s.widget);
  const updateWidget = useSettingsStore((s) => s.updateWidget);
  const [playing, setPlaying] = useState(false);

  useEffect(() => onEvent<boolean>("audio-state", setPlaying), []);

  // The whole card drags the window, except its buttons (so their clicks register).
  const startDrag = (e: MouseEvent) => {
    if (!inTauri || e.button !== 0 || widget.locked) return;
    if ((e.target as HTMLElement).closest("button")) return;
    void getCurrentWindow().startDragging();
  };

  return (
    <div className="h-full p-1.5" onMouseDown={startDrag}>
      <div className={widget.locked ? "h-full" : "h-full cursor-grab active:cursor-grabbing"}>
        <WidgetCard
          size={widget.size}
          theme={widget.theme}
          opacity={widget.opacity}
          locked={widget.locked}
          playing={playing}
          onToggleLock={() => updateWidget({ locked: !widget.locked })}
          onStopSound={() => void emitEvent("stop-sound")}
        />
      </div>
    </div>
  );
}

/** Applies visibility, always-on-top, a remembered screen position, and resizes with the size preset. */
function useWidgetFrame() {
  const visible = useSettingsStore((s) => s.widget.visible);
  const alwaysOnTop = useSettingsStore((s) => s.widget.alwaysOnTop);
  const size = useSettingsStore((s) => s.widget.size);

  useEffect(() => {
    if (!inTauri) return;
    const win = getCurrentWindow();
    (visible ? win.show() : win.hide()).catch((err) => console.error("widget visibility failed", err));
  }, [visible]);

  useEffect(() => {
    if (!inTauri) return;
    getCurrentWindow()
      .setAlwaysOnTop(alwaysOnTop)
      .catch((err) => console.error("always-on-top failed", err));
  }, [alwaysOnTop]);

  // Theme and size live in the same prefs object; only a size change resizes the native window.
  useEffect(() => {
    if (!inTauri) return;
    const win = getCurrentWindow();
    const { width, height } = WIDGET_SIZES[size];
    void (async () => {
      try {
        await win.setSize(new LogicalSize(width, height));
        await clampIntoMonitors(win);
      } catch (err) {
        console.error("widget resize failed", err);
      }
    })();
  }, [size]);

  useEffect(() => {
    if (!inTauri) return;
    const win = getCurrentWindow();
    void placeWidget().catch((err) => console.error("widget placement failed", err));
    const unlisten = win.onMoved(({ payload }) => {
      try {
        localStorage.setItem(POSITION_KEY, JSON.stringify({ x: payload.x, y: payload.y }));
      } catch {
        // Position memory is a convenience; the widget still works without it.
      }
    });
    return () => void unlisten.then((fn) => fn());
  }, []);
}

/** Keeps the top-left corner but pulls the window back inside the nearest monitor after a resize. */
async function clampIntoMonitors(win: ReturnType<typeof getCurrentWindow>) {
  const monitors = await availableMonitors();
  if (monitors.length === 0) return;
  const pos = await win.outerPosition();
  const scale = await win.scaleFactor();
  const size = await win.outerSize();
  const w = Math.round(size.width / scale);
  const h = Math.round(size.height / scale);
  const logical = { x: pos.x / scale, y: pos.y / scale };

  let best = monitors[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const m of monitors) {
    const cx = m.position.x / m.scaleFactor + m.size.width / m.scaleFactor / 2;
    const cy = m.position.y / m.scaleFactor + m.size.height / m.scaleFactor / 2;
    const d = (cx - logical.x) ** 2 + (cy - logical.y) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = m;
    }
  }
  const mx = best.position.x / best.scaleFactor;
  const my = best.position.y / best.scaleFactor;
  const mw = best.size.width / best.scaleFactor;
  const mh = best.size.height / best.scaleFactor;
  const x = Math.min(Math.max(logical.x, mx), Math.max(mx, mx + mw - w));
  const y = Math.min(Math.max(logical.y, my), Math.max(my, my + mh - h));
  if (x !== logical.x || y !== logical.y) {
    await win.setPosition(new LogicalPosition(x, y));
  }
}

async function placeWidget() {
  const win = getCurrentWindow();
  const saved = readSavedPosition();
  // A saved spot on a monitor that is no longer connected would hide the widget off-screen.
  if (saved) {
    const monitors = await availableMonitors();
    const onScreen = monitors.some(
      (m) =>
        saved.x >= m.position.x &&
        saved.y >= m.position.y &&
        saved.x < m.position.x + m.size.width &&
        saved.y < m.position.y + m.size.height,
    );
    if (onScreen) {
      await win.setPosition(new PhysicalPosition(saved.x, saved.y));
      return;
    }
  }
  const monitor = await currentMonitor();
  if (!monitor) return;
  const size = await win.outerSize();
  const margin = Math.round(20 * monitor.scaleFactor);
  // Above the taskbar / dock in the bottom corner.
  await win.setPosition(
    new PhysicalPosition(
      monitor.position.x + monitor.size.width - size.width - margin,
      monitor.position.y + monitor.size.height - size.height - margin * 3,
    ),
  );
}

function readSavedPosition(): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(POSITION_KEY);
    if (!raw) return null;
    const pos = JSON.parse(raw) as { x: unknown; y: unknown };
    return typeof pos.x === "number" && typeof pos.y === "number" ? { x: pos.x, y: pos.y } : null;
  } catch {
    return null;
  }
}
