import { useLayoutEffect, useRef, useState } from "react";
import { AzkarView } from "../components/main/AzkarView";
import { PrayerRow } from "../components/main/PrayerRow";
import { SettingsDialog } from "../components/main/SettingsDialog";
import { TasbihView } from "../components/main/TasbihView";
import { TitleBar } from "../components/main/TitleBar";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { useScheduler } from "../hooks/useScheduler";
import { useWindowSync } from "../hooks/useWindowSync";
import { formatClock, formatCountdown, formatDates, placeName, prayerName, t } from "../lib/i18n";
import { useSettingsStore } from "../store/useSettingsStore";

type Tab = "home" | "azkar" | "tasbih";

const TABS: { id: Tab; labelKey: "tabHome" | "tabAzkar" | "tabTasbih" }[] = [
  { id: "home", labelKey: "tabHome" },
  { id: "azkar", labelKey: "tabAzkar" },
  { id: "tasbih", labelKey: "tabTasbih" },
];

export function MainWindow() {
  useWindowSync("main");
  const { update, openReleases } = useScheduler();
  const state = usePrayerTimes();
  const lang = useSettingsStore((s) => s.lang);
  const place = useSettingsStore((s) => s.place);
  const clock = useSettingsStore((s) => s.clock);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("home");

  const city = placeName(lang, place);
  const title = `${t(lang, "appName")} · ${city}`;
  const openSettings = () => setSettingsOpen(true);

  if (state.status === "error") {
    return (
      <div className="flex h-full flex-col bg-surface">
        <TitleBar title={title} onOpenSettings={openSettings} update={update} onOpenUpdate={openReleases} />
        <main className="flex flex-1 flex-col items-start justify-center gap-4 px-10">
          <p role="alert" className="max-w-lg text-lg">
            {t(lang, "calcError")}
          </p>
          <button
            type="button"
            onClick={openSettings}
            className="rounded-md bg-indigo px-4 py-2 font-semibold text-on-indigo hover:opacity-90"
          >
            {t(lang, "changePlace")}
          </button>
        </main>
        <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    );
  }

  const { next, row, now, remainingMs, period } = state;
  const nextName = prayerName(lang, next.key);
  const dates = formatDates(lang, new Date(now), place.tz);

  return (
    <div className={`ambient period-${period} grid h-full grid-rows-[auto_auto_1fr_auto]`}>
      <TitleBar title={title} onOpenSettings={openSettings} update={update} onOpenUpdate={openReleases} />
      <TabBar tab={tab} onChange={setTab} />

      {tab === "home" && (
        <>
          <main
            key="home"
            className="view-enter relative flex min-h-0 flex-col justify-center gap-6 px-10 py-6 min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between"
          >
            {/* Soft ambient light behind the countdown. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(circle at 68% 45%, var(--accent-muted) 0%, transparent 62%)" }}
            />
            <div className="relative">
              <p className="text-[1.1rem] text-ink-soft">{t(lang, "timeLeftUntil", { p: nextName })}</p>
              <p
                role="timer"
                dir="ltr"
                className="tabular text-start text-[clamp(3.75rem,7vw,5.5rem)] leading-none font-extrabold tracking-tight text-accent"
                style={{ textShadow: "0 2px 24px rgb(0 0 0 / 0.18)" }}
              >
                {formatCountdown(remainingMs)}
              </p>
              <p className="mt-3 text-base text-ink-soft">
                {next.at && t(lang, "at", { t: formatClock(next.at, place.tz, clock) })}
              </p>
            </div>

            <div className="relative flex flex-col gap-0.5 text-sm text-ink-soft min-[720px]:items-end min-[720px]:text-end">
              <button
                type="button"
                onClick={openSettings}
                title={t(lang, "changePlace")}
                className="text-[1.85rem] font-bold text-ink hover:text-accent"
              >
                {city}
                <span className="mx-auto mt-1 block h-[3px] w-9 rounded bg-gold" />
              </button>
              <span className="mt-1 text-[1.15rem] font-bold text-ink">{dates.weekday}</span>
              <span className="leading-relaxed">{dates.gregorian}</span>
              <span className="leading-relaxed">{dates.hijri}</span>
              {dates.kurdish && <span className="leading-relaxed">{dates.kurdish}</span>}
            </div>
          </main>
          <PrayerRow row={row} nextKey={next.key} now={now} />
        </>
      )}
      {tab === "azkar" && (
        <div key="azkar" className="view-enter min-h-0">
          <AzkarView />
        </div>
      )}
      {tab === "tasbih" && (
        <div key="tasbih" className="view-enter min-h-0 h-full">
          <TasbihView />
        </div>
      )}

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

/** Tab strip with one gold indicator that slides between tabs. */
function TabBar({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  const lang = useSettingsStore((s) => s.lang);
  const listRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const active = listRef.current?.querySelector("[aria-current='page']");
      if (active instanceof HTMLElement) {
        setBar({ left: active.offsetLeft, width: active.offsetWidth });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [tab, lang]);

  return (
    <nav ref={listRef} className="relative flex shrink-0 border-b border-line" aria-label={t(lang, "tabs")}>
      {TABS.map(({ id, labelKey }) => (
        <button
          key={id}
          type="button"
          aria-current={tab === id ? "page" : undefined}
          onClick={() => onChange(id)}
          className={`relative px-5 py-2.5 text-sm transition-colors ${
            tab === id ? "font-bold text-accent" : "text-ink-soft hover:text-ink"
          }`}
        >
          {t(lang, labelKey)}
        </button>
      ))}
      <span
        aria-hidden="true"
        className="absolute bottom-0 h-[3px] rounded-t-[3px] transition-[left,width] duration-300"
        style={{
          // offsetLeft is a physical offset, so position physically — RTL flips
          // inline directions and would mirror this to the wrong side.
          left: bar.left,
          width: bar.width,
          background: "var(--accent-gradient)",
          boxShadow: "var(--accent-glow)",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </nav>
  );
}
