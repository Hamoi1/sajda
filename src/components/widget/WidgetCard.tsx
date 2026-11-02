import type { CSSProperties } from "react";
import { formatClock, formatCountdown, formatDates, placeName, prayerName, t } from "../../lib/i18n";
import type { PrayerKey, WidgetSize, WidgetTheme } from "../../lib/types";
import { useSettingsStore } from "../../store/useSettingsStore";
import { WIDGET_SIZES, WIDGET_THEMES } from "../../lib/widgetThemes";
import { IconLock, IconStop, IconUnlock } from "../Icons";
import { ProgressBand } from "../ProgressBand";
import { usePrayerTimes } from "../../hooks/usePrayerTimes";

interface WidgetCardProps {
  size: WidgetSize;
  theme: WidgetTheme;
  /** 20-100: opacity of the background layer; text stays opaque. */
  opacity: number;
  locked: boolean;
  playing?: boolean;
  /** Hide hover buttons (settings previews already sit in a dialog). */
  buttons?: boolean;
  onToggleLock?: () => void;
  onStopSound?: () => void;
}

/**
 * The one widget card, parameterized by theme and size. Every size is laid out
 * with flex and clamp() so the content fits its window whatever the DPI.
 */
export function WidgetCard({ size, theme, opacity, locked, playing, buttons = true, onToggleLock, onStopSound }: WidgetCardProps) {
  const style = WIDGET_THEMES[theme];
  const state = usePrayerTimes();
  const lang = useSettingsStore((s) => s.lang);
  const place = useSettingsStore((s) => s.place);
  const clock = useSettingsStore((s) => s.clock);

  const card: CSSProperties = {
    color: style.text,
    border: style.border,
    boxShadow: style.shadow,
    textShadow: style.shadow ? "0 1px 3px rgb(0 0 0 / 0.45)" : undefined,
  };

  const hoverBtn = `grid place-items-center rounded transition-colors hover:bg-black/20`;

  const headerButtons = buttons && (
    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
      {playing && onStopSound && (
        <button type="button" onClick={onStopSound} aria-label={t(lang, "stop")} title={t(lang, "stop")} className={`${hoverBtn} h-6 w-7`}>
          <IconStop width={14} height={14} />
        </button>
      )}
      {onToggleLock && (
        <button
          type="button"
          onClick={onToggleLock}
          aria-label={locked ? t(lang, "unlockPosition") : t(lang, "lockPosition")}
          aria-pressed={locked}
          title={locked ? t(lang, "unlockPosition") : t(lang, "lockPosition")}
          className={`${hoverBtn} h-6 w-7`}
        >
          {locked ? <IconLock width={14} height={14} /> : <IconUnlock width={14} height={14} />}
        </button>
      )}
    </div>
  );

  const band = (height: number) => (
    <ProgressBand
      progress={state.status === "error" ? 0 : state.progress}
      height={height}
      rtl={false}
      colors={style.band}
    />
  );

  if (state.status === "error") {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-lg" style={card}>
        <BackgroundLayer theme={style} opacity={opacity} />
        <p role="alert" className="relative flex h-full items-center px-4 text-sm leading-snug">
          {t(lang, "calcError")}
        </p>
      </div>
    );
  }

  const { next, row, now, remainingMs } = state;

  if (size === "small" || size === "standard") {
    const compact = size === "small";
    return (
      <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-[10px]" style={card} data-widget-theme={theme}>
        <BackgroundLayer theme={style} opacity={opacity} />
        <div className="relative flex items-center justify-between gap-2 px-3 pt-2">
          <span className="truncate text-[11px] leading-tight" style={{ color: style.textSoft }}>
            {placeName(lang, place)}
          </span>
          {headerButtons}
        </div>
        <div className="relative flex flex-1 items-center justify-between gap-2 px-3">
          <span className={`truncate ${compact ? "text-xs" : "text-sm"}`}>
            <span className="font-semibold">{prayerName(lang, next.key)}</span>
            <span style={{ color: style.textSoft }}> · </span>
            <span className="tabular" dir="ltr">
              {next.at ? formatClock(next.at, place.tz, clock) : "--:--"}
            </span>
          </span>
          <span
            role="timer"
            dir="ltr"
            className={`tabular shrink-0 leading-none font-extrabold ${compact ? "text-[22px]" : "text-[26px]"}`}
            style={{ color: style.accent }}
          >
            {formatCountdown(remainingMs)}
          </span>
        </div>
        {/* Inset so the line never touches the rounded corners. */}
        <div className="relative px-2.5 pb-2 pt-1">{band(compact ? 6 : 8)}</div>
      </div>
    );
  }

  // large (380×224) and huge (480×304): full day grid plus a big countdown.
  const huge = size === "huge";
  const dates = formatDates(lang, new Date(now), place.tz);

  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-lg" style={card} data-widget-theme={theme}>
      <BackgroundLayer theme={style} opacity={opacity} />
      <div className="relative flex items-center justify-between gap-2 px-3.5 pt-2">
        <span className="truncate text-sm font-semibold">{placeName(lang, place)}</span>
        {huge && (
          <span className="truncate text-xs" style={{ color: style.textSoft }}>
            {dates.hijri}
          </span>
        )}
        {headerButtons}
      </div>

      <div className="relative flex flex-1 items-center justify-between gap-3 px-3.5">
        <div className="min-w-0">
          <p className="truncate text-sm" style={{ color: style.textSoft }}>
            {t(lang, "timeLeftUntil", { p: prayerName(lang, next.key) })}
          </p>
          <p
            role="timer"
            dir="ltr"
            className={`tabular leading-none font-extrabold tracking-tight ${huge ? "text-[56px]" : "text-[44px]"}`}
            style={{ color: style.accent }}
          >
            {formatCountdown(remainingMs)}
          </p>
          <p className="truncate text-xs" style={{ color: style.textSoft }}>
            {next.at && t(lang, "at", { t: formatClock(next.at, place.tz, clock) })}
            {huge && dates.kurdish ? ` · ${dates.kurdish}` : ""}
          </p>
        </div>
      </div>

      <ol className="relative mx-3 mb-1.5 grid grid-cols-3 gap-1" aria-label={t(lang, "tabHome")}>
        {(Object.keys(row) as PrayerKey[]).map((key) => {
          const isNext = key === next.key;
          const passed = !isNext && row[key] !== null && row[key].getTime() <= now;
          return (
            <li
              key={key}
              aria-current={isNext ? "time" : undefined}
              className={`flex flex-col items-center rounded-md px-1 py-1.5 text-center ${isNext ? "on-gold" : ""}`}
              style={{
                background: isNext ? style.accentFill : passed ? "transparent" : style.band.track,
                color: isNext ? style.onAccent : passed ? style.textSoft : style.text,
                opacity: passed ? 0.75 : 1,
              }}
            >
              <span className="truncate text-[11px] leading-tight">{prayerName(lang, key)}</span>
              <span className="tabular text-[13px] leading-tight font-semibold" dir="ltr">
                {row[key] ? formatClock(row[key]!, place.tz, clock) : "--:--"}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="relative px-3 pb-2">{band(huge ? 10 : 8)}</div>
    </div>
  );
}

/** The themed background in its own layer so the opacity setting never dims the text. */
function BackgroundLayer({ theme, opacity }: { theme: { bg: string }; opacity: number }) {
  return <div aria-hidden="true" className="absolute inset-0 rounded-lg" style={{ background: theme.bg, opacity: opacity / 100 }} />;
}

/** Exposed for the settings preview chrome. */
export function widgetWindowSize(size: WidgetSize): { width: number; height: number } {
  return WIDGET_SIZES[size];
}
