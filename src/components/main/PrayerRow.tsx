import { formatClock, prayerName, t } from "../../lib/i18n";
import { PRAYER_KEYS, type PrayerKey } from "../../lib/types";
import { useSettingsStore } from "../../store/useSettingsStore";
import { IconBell, IconBellOff } from "../Icons";

interface PrayerRowProps {
  row: Record<PrayerKey, Date | null>;
  /** The prayer the countdown points at. */
  nextKey: PrayerKey;
  now: number;
}

/** The six times as one row of deep-indigo tiles; the next prayer is the one gold tile. */
export function PrayerRow({ row, nextKey, now }: PrayerRowProps) {
  const lang = useSettingsStore((s) => s.lang);
  const clock = useSettingsStore((s) => s.clock);
  const tz = useSettingsStore((s) => s.place.tz);
  const muted = useSettingsStore((s) => s.muted);
  const toggleMute = useSettingsStore((s) => s.toggleMute);

  return (
    <ol className="grid shrink-0 grid-cols-3 border-t border-line min-[720px]:h-[125px] min-[720px]:grid-cols-6">
      {PRAYER_KEYS.map((key) => {
        const isNext = key === nextKey;
        const passed = !isNext && row[key] !== null && row[key].getTime() <= now;
        const name = prayerName(lang, key);
        return (
          <li
            key={key}
            aria-current={isNext ? "time" : undefined}
            className={`flex flex-col items-center justify-center gap-1.5 border-line px-2 py-4 text-center not-last:border-e ${
              isNext ? "on-gold text-on-gold" : passed ? "text-ink-soft" : "text-ink"
            }`}
            style={
              isNext
                ? { background: "var(--accent-gradient)", boxShadow: "var(--accent-glow)" }
                : passed
                  ? undefined
                  : { background: "var(--tile)" }
            }
          >
            <span className="text-[0.95rem] font-semibold">{name}</span>
            <span className="tabular text-[1.35rem] font-extrabold" dir="ltr">
              {row[key] ? formatClock(row[key], tz, clock) : "--:--"}
            </span>
            <button
              type="button"
              onClick={() => toggleMute(key)}
              aria-pressed={!muted[key]}
              aria-label={muted[key] ? t(lang, "unmuteP", { p: name }) : t(lang, "muteP", { p: name })}
              title={muted[key] ? t(lang, "unmuteP", { p: name }) : t(lang, "muteP", { p: name })}
              className={`grid h-8 w-11 place-items-center rounded-lg transition-all active:scale-90 ${
                isNext ? "hover:bg-black/15" : "hover:bg-white/10"
              } ${muted[key] ? "opacity-70" : ""}`}
            >
              {muted[key] ? <IconBellOff /> : <IconBell />}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
