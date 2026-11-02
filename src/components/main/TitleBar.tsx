import { getCurrentWindow } from "@tauri-apps/api/window";
import type { ReactNode } from "react";
import { t } from "../../lib/i18n";
import type { UpdateInfo } from "../../lib/updates";
import { inTauri } from "../../lib/tauri";
import { useSettingsStore } from "../../store/useSettingsStore";
import { IconClose, IconMinimize, IconSliders, IconWidget } from "../Icons";
import { LogoMark } from "../Logo";

interface TitleBarProps {
  title: string;
  onOpenSettings: () => void;
  update: UpdateInfo | null;
  onOpenUpdate: (url: string) => void;
}

/**
 * Custom frame: a deep indigo bar under a gold mark, straight from the app icon.
 * The one solid block of brand colour in the window.
 */
export function TitleBar({ title, onOpenSettings, update, onOpenUpdate }: TitleBarProps) {
  const lang = useSettingsStore((s) => s.lang);
  const widgetVisible = useSettingsStore((s) => s.widget.visible);
  const updateWidget = useSettingsStore((s) => s.updateWidget);

  const minimize = () => inTauri && void getCurrentWindow().minimize();
  const hideToTray = () => inTauri && void getCurrentWindow().hide();

  return (
    <header
      data-tauri-drag-region
      className="on-deep flex h-11 shrink-0 items-center gap-2 bg-deep ps-3 text-on-indigo"
    >
      <LogoMark
        width={24}
        height={24}
        className="pointer-events-none shrink-0 text-gold-bright"
        style={{ filter: "drop-shadow(0 0 6px rgb(223 184 91 / 0.35))" }}
      />
      <span data-tauri-drag-region className="flex-1 truncate text-sm font-semibold">
        {title}
      </span>
      {update && (
        <button
          type="button"
          onClick={() => onOpenUpdate(update.url)}
          title={t(lang, "updateOpenReleases")}
          className="me-1 shrink-0 rounded-full bg-gold px-3 py-1 text-xs font-bold text-on-gold hover:opacity-90"
        >
          {t(lang, "updateAvailable", { v: update.version })}
        </button>
      )}
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
      <BarButton label={t(lang, "minimize")} onClick={minimize}>
        <IconMinimize />
      </BarButton>
      <BarButton label={t(lang, "hideToTray")} onClick={hideToTray} danger>
        <IconClose />
      </BarButton>
    </header>
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
      className={`mx-0.5 grid h-7 w-[34px] place-items-center rounded-lg transition-colors ${
        danger ? "hover:bg-[rgba(239,68,68,0.85)] hover:text-white" : "hover:bg-white/10"
      } ${pressed ? "bg-white/15 text-gold-bright" : ""}`}
    >
      {children}
    </button>
  );
}
