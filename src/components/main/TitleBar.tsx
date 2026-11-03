import { getCurrentWindow } from "@tauri-apps/api/window";
import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { t, type StringKey } from "../../lib/i18n";
import type { UpdateInfo } from "../../lib/updates";
import { inTauri } from "../../lib/tauri";
import { useSettingsStore } from "../../store/useSettingsStore";
import { IconClose, IconMinimize, IconSliders, IconWidget } from "../Icons";
import { LogoMark } from "../Logo";

export type Tab = "home" | "azkar" | "tasbih";

export const TABS: { id: Tab; labelKey: StringKey }[] = [
  { id: "home", labelKey: "tabHome" },
  { id: "azkar", labelKey: "tabAzkar" },
  { id: "tasbih", labelKey: "tabTasbih" },
];

interface TitleBarProps {
  /** Shown next to the mark instead of the app name (settings, onboarding). */
  heading?: string;
  tab?: Tab;
  onTabChange?: (tab: Tab) => void;
  onOpenSettings?: () => void;
  update?: UpdateInfo | null;
  onOpenUpdate?: (url: string) => void;
}

/**
 * One bar for the whole frame: the mark, the section tabs in the middle and the
 * window controls. Empty areas drag the window.
 */
export function TitleBar({ heading, tab, onTabChange, onOpenSettings, update, onOpenUpdate }: TitleBarProps) {
  const lang = useSettingsStore((s) => s.lang);
  const widgetVisible = useSettingsStore((s) => s.widget.visible);
  const updateWidget = useSettingsStore((s) => s.updateWidget);

  const minimize = () => inTauri && void getCurrentWindow().minimize();
  const hideToTray = () => inTauri && void getCurrentWindow().hide();

  return (
    <header
      data-tauri-drag-region
      className="relative grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-line px-3"
    >
      <div data-tauri-drag-region className="flex min-w-0 items-center gap-2.5">
        <LogoMark width={22} height={22} className="pointer-events-none shrink-0 text-accent" />
        <span data-tauri-drag-region className="truncate text-[0.95rem] font-bold">
          {heading ?? t(lang, "appName")}
        </span>
      </div>

      {tab && onTabChange ? <Tabs tab={tab} onChange={onTabChange} /> : <span />}

      <div data-tauri-drag-region className="flex items-center justify-end gap-1">
        {update && onOpenUpdate && (
          <button
            type="button"
            onClick={() => onOpenUpdate(update.url)}
            title={t(lang, "updateOpenReleases")}
            className="me-1 shrink-0 rounded-full bg-gold px-3 py-1 text-xs font-bold text-on-gold hover:bg-gold-bright"
          >
            {t(lang, "updateAvailable", { v: update.version })}
          </button>
        )}
        {onOpenSettings && (
          <>
            <BarButton
              label={widgetVisible ? t(lang, "hideWidget") : t(lang, "showWidget")}
              pressed={widgetVisible}
              onClick={() => updateWidget({ visible: !widgetVisible })}
            >
              <IconWidget />
            </BarButton>
            <BarButton label={t(lang, "settings")} onClick={onOpenSettings}>
              <IconSliders />
            </BarButton>
          </>
        )}
        <BarButton label={t(lang, "minimize")} onClick={minimize}>
          <IconMinimize />
        </BarButton>
        <BarButton label={t(lang, "hideToTray")} onClick={hideToTray} danger>
          <IconClose />
        </BarButton>
      </div>
    </header>
  );
}

/** Segmented tabs; arrow keys move between them, as a tablist should. */
function Tabs({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  const lang = useSettingsStore((s) => s.lang);
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const i = TABS.findIndex((x) => x.id === tab);
    // Visual order follows the reading direction, so mirror the keys in RTL.
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const forward = (e.key === "ArrowRight") !== rtl;
    const next = TABS[(i + (forward ? 1 : TABS.length - 1)) % TABS.length];
    onChange(next.id);
    listRef.current?.querySelector<HTMLElement>(`[data-tab="${next.id}"]`)?.focus();
    e.preventDefault();
  };

  return (
    <div ref={listRef} role="tablist" aria-label={t(lang, "tabs")} className="seg" onKeyDown={onKeyDown}>
      {TABS.map(({ id, labelKey }) => (
        <button
          key={id}
          type="button"
          role="tab"
          data-tab={id}
          aria-selected={tab === id}
          tabIndex={tab === id ? 0 : -1}
          onClick={() => onChange(id)}
          className="seg-item"
        >
          {t(lang, labelKey)}
        </button>
      ))}
    </div>
  );
}

function BarButton({
  label,
  onClick,
  pressed,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-lg text-ink-soft transition-colors ${
        danger ? "hover:bg-[rgb(220_60_60_/_0.85)] hover:text-white" : "hover:bg-tile-2 hover:text-ink"
      } ${pressed ? "text-accent" : ""}`}
    >
      {children}
    </button>
  );
}
