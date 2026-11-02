import { availableMonitors, currentMonitor, getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";
import { useEffect, useState, type MouseEvent } from "react";
import { IconLock, IconStop, IconUnlock } from "../components/Icons";
import { KilimBand } from "../components/KilimBand";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { useWindowSync } from "../hooks/useWindowSync";
import { dirOf, formatClock, formatCountdown, placeName, prayerName, t } from "../lib/i18n";
import { emitEvent, inTauri, onEvent } from "../lib/tauri";
import { useSettingsStore } from "../store/useSettingsStore";

const POSITION_KEY = "sajda-widget-pos";

export function WidgetWindow() {
  useWindowSync("widget");
  useWidgetFrame();
  const state = usePrayerTimes();
  const lang = useSettingsStore((s) => s.lang);
  const place = useSettingsStore((s) => s.place);
  const clock = useSettingsStore((s) => s.clock);
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

  const lockLabel = widget.locked ? t(lang, "unlockPosition") : t(lang, "lockPosition");

  return (
    <div className="h-full p-1.5">
      <div
        onMouseDown={startDrag}
        style={{ backgroundColor: `rgb(var(--wool-rgb) / ${widget.opacity / 100})` }}
        className={`group flex h-full flex-col overflow-hidden rounded-md border border-line text-ink [text-shadow:0_0_3px_rgb(var(--wool-rgb))] ${
          widget.locked ? "" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <div className="flex items-center justify-between px-3 pt-1.5">
          <span className="truncate text-xs text-ink-soft">{placeName(lang, place)}</span>
          <div className="flex opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            {playing && (
              <button
                type="button"
                onClick={() => void emitEvent("stop-sound")}
                aria-label={t(lang, "stop")}
                title={t(lang, "stop")}
                className="grid h-6 w-7 place-items-center rounded hover:bg-wool-2"
              >
                <IconStop width={14} height={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => updateWidget({ locked: !widget.locked })}
              aria-label={lockLabel}
              aria-pressed={widget.locked}
              title={lockLabel}
              className="grid h-6 w-7 place-items-center rounded hover:bg-wool-2"
            >
              {widget.locked ? <IconLock width={14} height={14} /> : <IconUnlock width={14} height={14} />}
            </button>
          </div>
        </div>

        {state.status === "error" ? (
          <p role="alert" className="flex-1 px-3 text-xs leading-snug">
            {t(lang, "calcError")}
          </p>
        ) : (
          <>
            <div className="flex flex-1 items-center justify-between gap-2 px-3">
              <span className="text-sm">
                <span className="font-semibold">{prayerName(lang, state.next.key)}</span>
                <span className="text-ink-soft"> · </span>
                <span className="tabular" dir="ltr">
                  {formatClock(state.next.at, place.tz, clock)}
                </span>
              </span>
              <span role="timer" dir="ltr" className="tabular text-[26px] leading-none font-extrabold text-indigo">
                {formatCountdown(state.remainingMs)}
              </span>
            </div>
            <KilimBand progress={state.progress} height={12} rtl={dirOf(lang) === "rtl"} />
          </>
        )}
      </div>
    </div>
  );
}

/** Applies visibility, always-on-top and a remembered screen position to the widget's native window. */
function useWidgetFrame() {
  const visible = useSettingsStore((s) => s.widget.visible);
  const alwaysOnTop = useSettingsStore((s) => s.widget.alwaysOnTop);

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
