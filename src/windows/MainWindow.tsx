import { useState } from "react";
import { Onboarding } from "../components/main/Onboarding";
import { AzkarView } from "../components/main/AzkarView";
import { PrayerBoard } from "../components/main/PrayerBoard";
import { SettingsDialog } from "../components/main/SettingsDialog";
import { TasbihView } from "../components/main/TasbihView";
import { TitleBar, type Tab } from "../components/main/TitleBar";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { useScheduler } from "../hooks/useScheduler";
import { useWindowSync } from "../hooks/useWindowSync";
import { formatClock, formatCountdown, formatDates, prayerName, t } from "../lib/i18n";
import { useSettingsStore } from "../store/useSettingsStore";

export function MainWindow() {
  useWindowSync("main");
  const { update, openReleases } = useScheduler();
  const state = usePrayerTimes();
  const lang = useSettingsStore((s) => s.lang);
  const place = useSettingsStore((s) => s.place);
  const clock = useSettingsStore((s) => s.clock);
  const onboarded = useSettingsStore((s) => s.onboarded);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("home");

  if (!onboarded) {
    return (
      <div className="grid h-full grid-rows-[auto_1fr] bg-surface">
        <TitleBar />
        <Onboarding />
      </div>
    );
  }

  if (settingsOpen) {
    return (
      <div className="grid h-full grid-rows-[auto_1fr] bg-surface">
        <TitleBar heading={t(lang, "settings")} />
        <SettingsDialog onClose={() => setSettingsOpen(false)} />
      </div>
    );
  }

  const openSettings = () => setSettingsOpen(true);
  const bar = (
    <TitleBar tab={tab} onTabChange={setTab} onOpenSettings={openSettings} update={update} onOpenUpdate={openReleases} />
  );

  if (state.status === "error") {
    return (
      <div className="grid h-full grid-rows-[auto_1fr] bg-surface">
        {bar}
        <main className="flex flex-col items-start justify-center gap-4 px-10">
          <p role="alert" className="max-w-lg text-lg">
            {t(lang, "calcError")}
          </p>
          <button type="button" onClick={openSettings} className="btn-gold">
            {t(lang, "changePlace")}
          </button>
        </main>
      </div>
    );
  }

  const { next, row, now, remainingMs, period, progress } = state;
  const dates = formatDates(lang, new Date(now), place.tz);

  return (
    <div className={`ambient period-${period} grid h-full grid-rows-[auto_1fr]`}>
      {bar}

      {tab === "home" && (
        <div key="home" className="view-enter flex min-h-0 flex-col min-[820px]:flex-row">
          <main className="flex min-w-0 flex-1 flex-col justify-between gap-6 px-11 pt-11 pb-7">
            <div>
              <p className="text-[1.05rem] text-ink-soft">{t(lang, "timeLeftUntil", { p: prayerName(lang, next.key) })}</p>
              <p
                role="timer"
                dir="ltr"
                className="tabular mt-1.5 text-start text-[clamp(4rem,9vw,6.5rem)] leading-none font-extrabold tracking-[-0.02em] text-accent rtl:text-end"
              >
                {formatCountdown(remainingMs)}
              </p>
              <p className="mt-2.5 text-base text-ink-soft">
                {next.at && t(lang, "at", { t: formatClock(next.at, place.tz, clock) })}
              </p>
              <KilimProgress progress={progress} label={t(lang, "timeLeftUntil", { p: prayerName(lang, next.key) })} />
            </div>
            <div className="flex flex-col gap-0.5 text-sm text-ink-soft">
              <span className="text-base font-bold text-ink">{dates.weekday}</span>
              <span>{dates.gregorian}</span>
              <span>{dates.hijri}</span>
              {dates.kurdish && <span>{dates.kurdish}</span>}
            </div>
          </main>
          <PrayerBoard row={row} nextKey={next.key} now={now} onChangePlace={openSettings} />
        </div>
      )}
      {tab === "azkar" && (
        <div key="azkar" className="view-enter min-h-0">
          <AzkarView />
        </div>
      )}
      {tab === "tasbih" && (
        <div key="tasbih" className="view-enter h-full min-h-0">
          <TasbihView />
        </div>
      )}
    </div>
  );
}

const DIAMONDS = 24;

/** The kilim band: unwoven diamonds wait, gold diamonds fill as the prayer approaches. */
function KilimProgress({ progress, label }: { progress: number; label: string }) {
  const filled = Math.round(Math.min(1, Math.max(0, progress)) * DIAMONDS);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className="mt-7 flex gap-[5px]"
    >
      {Array.from({ length: DIAMONDS }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`size-[9px] rotate-45 border-[1.5px] transition-colors duration-700 ${
            i < filled ? "border-gold bg-gold" : "border-line-strong"
          }`}
        />
      ))}
    </div>
  );
}
