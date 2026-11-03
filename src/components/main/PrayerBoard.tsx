import { formatClock, placeName, prayerName, t } from "../../lib/i18n";
import { PRAYER_KEYS, type PrayerKey } from "../../lib/types";
import { useSettingsStore } from "../../store/useSettingsStore";
import { IconBell, IconBellOff } from "../Icons";

interface PrayerBoardProps {
  row: Record<PrayerKey, Date | null>;
  /** The prayer the countdown points at. */
  nextKey: PrayerKey;
  now: number;
  onChangePlace: () => void;
}

/**
 * The day's six times as a mosque board: one column, the next prayer marked by
 * a gold rule, the ones already passed stepped back.
 */
export function PrayerBoard({ row, nextKey, now, onChangePlace }: PrayerBoardProps) {
  const lang = useSettingsStore((s) => s.lang);
  const clock = useSettingsStore((s) => s.clock);
  const place = useSettingsStore((s) => s.place);
  const method = useSettingsStore((s) => s.method);
  const muted = useSettingsStore((s) => s.muted);
  const toggleMute = useSettingsStore((s) => s.toggleMute);

  return (
    <aside className="flex min-h-0 flex-col border-line bg-veil px-4 py-5 min-[820px]:w-[330px] min-[820px]:border-s max-[819px]:border-t">
      <ol className="flex flex-col gap-1">
        {PRAYER_KEYS.map((key) => {
          const isNext = key === nextKey;
          const passed = !isNext && row[key] !== null && row[key].getTime() <= now;
          const name = prayerName(lang, key);
          const muteLabel = muted[key] ? t(lang, "unmuteP", { p: name }) : t(lang, "muteP", { p: name });
          return (
            <li
              key={key}
              aria-current={isNext ? "time" : undefined}
              className={`flex items-center justify-between rounded-[10px] py-2 ps-4 pe-2 ${
                isNext
                  ? "bg-[color-mix(in_oklab,var(--gold)_14%,transparent)] text-accent shadow-[inset_3px_0_0_var(--gold)] rtl:shadow-[inset_-3px_0_0_var(--gold)]"
                  : passed
                    ? "text-ink-muted"
                    : "text-ink"
              }`}
            >
              <span className={`text-base ${isNext ? "font-bold" : ""}`}>{name}</span>
              <span className="flex items-center gap-2">
                <span className="tabular text-base font-bold" dir="ltr">
                  {row[key] ? formatClock(row[key], place.tz, clock) : "--:--"}
                </span>
                <button
                  type="button"
                  onClick={() => toggleMute(key)}
                  aria-pressed={!muted[key]}
                  aria-label={muteLabel}
                  title={muteLabel}
                  className={`grid h-8 w-8 place-items-center rounded-lg transition-colors hover:bg-tile-2 ${
                    muted[key] ? "opacity-55" : ""
                  }`}
                >
                  {muted[key] ? <IconBellOff width={16} height={16} /> : <IconBell width={16} height={16} />}
                </button>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line px-2 pt-4">
        <button
          type="button"
          onClick={onChangePlace}
          title={t(lang, "changePlace")}
          className="truncate rounded-md text-lg font-bold hover:text-accent"
        >
          {placeName(lang, place)}
        </button>
        {method === "Kurdistan" && (
          <span className="shrink-0 rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-ink-soft">
            {t(lang, "officialBadge")}
          </span>
        )}
      </div>
    </aside>
  );
}
