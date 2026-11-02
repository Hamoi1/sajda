import { useState } from "react";
import { KilimBand } from "../components/KilimBand";
import { PrayerRow } from "../components/main/PrayerRow";
import { SettingsDialog } from "../components/main/SettingsDialog";
import { TitleBar } from "../components/main/TitleBar";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { useScheduler } from "../hooks/useScheduler";
import { useWindowSync } from "../hooks/useWindowSync";
import { dirOf, formatClock, formatCountdown, formatDates, placeName, prayerName, t } from "../lib/i18n";
import { useSettingsStore } from "../store/useSettingsStore";

export function MainWindow() {
  useWindowSync("main");
  useScheduler();
  const state = usePrayerTimes();
  const lang = useSettingsStore((s) => s.lang);
  const place = useSettingsStore((s) => s.place);
  const clock = useSettingsStore((s) => s.clock);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const city = placeName(lang, place);
  const title = `${t(lang, "appName")} · ${city}`;
  const openSettings = () => setSettingsOpen(true);

  if (state.status === "error") {
    return (
      <div className="flex h-full flex-col bg-wool">
        <TitleBar title={title} onOpenSettings={openSettings} />
        <main className="flex flex-1 flex-col items-start justify-center gap-4 px-10">
          <p role="alert" className="max-w-lg text-lg">
            {t(lang, "calcError")}
          </p>
          <button
            type="button"
            onClick={openSettings}
            className="rounded bg-indigo px-4 py-2 font-semibold text-wool hover:opacity-90"
          >
            {t(lang, "changePlace")}
          </button>
        </main>
        <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    );
  }

  const { next, row, now, progress, remainingMs, period } = state;
  const nextName = prayerName(lang, next.key);
  const dates = formatDates(lang, new Date(now), place.tz);

  return (
    <div className={`ambient period-${period} flex h-full flex-col`}>
      <TitleBar title={title} onOpenSettings={openSettings} />
      <KilimBand
        progress={progress}
        rtl={dirOf(lang) === "rtl"}
        label={`${t(lang, "timeLeftUntil", { p: nextName })}: ${Math.round(progress * 100)}%`}
      />

      <main className="flex flex-1 flex-col justify-center gap-6 px-10 py-6 min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between">
        <div>
          <p className="text-lg text-ink-soft">{t(lang, "timeLeftUntil", { p: nextName })}</p>
          <p
            role="timer"
            dir="ltr"
            className="tabular text-start text-[clamp(64px,12vw,112px)] leading-none font-extrabold tracking-tight text-indigo"
          >
            {formatCountdown(remainingMs)}
          </p>
          <p className="mt-3 text-base text-ink-soft">
            {t(lang, "at", { t: formatClock(next.at, place.tz, clock) })}
          </p>
        </div>

        <div className="flex flex-col gap-0.5 text-sm text-ink-soft min-[720px]:items-end min-[720px]:text-end">
          <button
            type="button"
            onClick={openSettings}
            title={t(lang, "changePlace")}
            className="mb-1 rounded px-1 text-lg font-bold text-ink underline decoration-line decoration-2 underline-offset-4 hover:decoration-madder"
          >
            {city}
          </button>
          <span className="font-semibold text-ink">{dates.weekday}</span>
          <span>{dates.gregorian}</span>
          <span>{dates.hijri}</span>
          {dates.kurdish && <span>{dates.kurdish}</span>}
        </div>
      </main>

      <PrayerRow row={row} nextKey={next.key} now={now} />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
