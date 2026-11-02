import { getCurrentWindow } from "@tauri-apps/api/window";
import type { ReactNode } from "react";
import { t } from "../../lib/i18n";
import { inTauri } from "../../lib/tauri";
import { useSettingsStore } from "../../store/useSettingsStore";
import { IconClose, IconMinimize, IconSliders, IconWidget } from "../Icons";
import { LogoMark } from "../Logo";

interface TitleBarProps {
  title: string;
  onOpenSettings: () => void;
}

/** Custom frame: the madder bar is the one solid block of accent colour in the window. */
export function TitleBar({ title, onOpenSettings }: TitleBarProps) {
  const lang = useSettingsStore((s) => s.lang);
  const widgetVisible = useSettingsStore((s) => s.widget.visible);
  const updateWidget = useSettingsStore((s) => s.updateWidget);

  const minimize = () => inTauri && void getCurrentWindow().minimize();
  const hideToTray = () => inTauri && void getCurrentWindow().hide();

  return (
    <header data-tauri-drag-region className="on-madder flex h-10 shrink-0 items-center gap-2 bg-madder ps-3 text-on-madder">
      <LogoMark width={22} height={22} className="pointer-events-none shrink-0" />
      <span data-tauri-drag-region className="flex-1 truncate text-sm font-semibold">
        {title}
      </span>
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
      <BarButton label={t(lang, "hideToTray")} onClick={hideToTray}>
        <IconClose />
      </BarButton>
    </header>
  );
}

function BarButton({
  label,
  onClick,
  pressed,
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`grid h-10 w-11 place-items-center transition-colors hover:bg-black/15 ${
        pressed ? "bg-black/20" : ""
      }`}
    >
      {children}
    </button>
  );
}
