import { formatClock, prayerName, t } from "../../lib/i18n";
import { PRAYER_KEYS, type PrayerKey } from "../../lib/types";
import { useSettingsStore } from "../../store/useSettingsStore";
import { IconBell, IconBellOff } from "../Icons";

interface PrayerRowProps {
  row: Record<PrayerKey, Date>;
  /** The prayer the countdown points at. */
  nextKey: PrayerKey;
  now: number;
}

/** The six times as one woven row, like a strip of kilim; the next prayer is the madder cell. */
export function PrayerRow({ row, nextKey, now }: PrayerRowProps) {
  const lang = useSettingsStore((s) => s.lang);
  const clock = useSettingsStore((s) => s.clock);
  const tz = useSettingsStore((s) => s.place.tz);
  const muted = useSettingsStore((s) => s.muted);
  const toggleMute = useSettingsStore((s) => s.toggleMute);

  return (
    <ol className="grid shrink-0 grid-cols-3 border-t border-line min-[720px]:grid-cols-6">
      {PRAYER_KEYS.map((key) => {
        const isNext = key === nextKey;
        const passed = !isNext && row[key].getTime() <= now;
        const name = prayerName(lang, key);
        return (
          <li
            key={key}
            aria-current={isNext ? "time" : undefined}
            className={`flex flex-col items-center gap-1 border-line px-2 pt-4 pb-3 text-center not-last:border-e ${
              isNext ? "on-madder bg-madder text-on-madder" : passed ? "text-ink-soft" : "text-ink"
            }`}
          >
            <span className="text-sm">{name}</span>
            <span className="tabular text-2xl font-bold" dir="ltr">
              {formatClock(row[key], tz, clock)}
            </span>
            <button
              type="button"
              onClick={() => toggleMute(key)}
              aria-pressed={!muted[key]}
              aria-label={muted[key] ? t(lang, "unmuteP", { p: name }) : t(lang, "muteP", { p: name })}
              title={muted[key] ? t(lang, "unmuteP", { p: name }) : t(lang, "muteP", { p: name })}
              className={`grid h-9 w-11 place-items-center rounded transition-colors ${
                isNext ? "hover:bg-black/15" : "hover:bg-wool-2"
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
