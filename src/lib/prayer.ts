import { CalculationMethod, CalculationParameters, Coordinates, HighLatitudeRule, Madhab, PrayerTimes } from "adhan";
import { formatClock, placeName, prayerName, t } from "./i18n";
import { PRAYER_KEYS, type PrayerKey, type ScheduledEvent, type Settings } from "./types";

export type CalcInput = Pick<Settings, "place" | "method" | "madhab" | "offsets">;

export interface PrayerInstant {
  key: PrayerKey;
  at: Date;
}

export interface DayTimes {
  /** "YYYY-MM-DD" in the place's time zone. */
  ymd: string;
  times: Record<PrayerKey, Date>;
}

/** Calendar date of an instant as seen in `tz`, formatted YYYY-MM-DD. */
export function ymdInTz(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function shiftYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function buildParams(input: CalcInput, coords: Coordinates): CalculationParameters {
  const params = CalculationMethod[input.method]();
  params.madhab = input.madhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  // Keeps Fajr/Isha sane in northern Europe, where twilight may never end in summer.
  params.highLatitudeRule = HighLatitudeRule.recommended(coords);
  params.adjustments = { ...input.offsets };
  return params;
}

/**
 * adhan reads the year/month/day from the Date's local fields, so the date is
 * built from the place's calendar day, not the computer's. The returned Dates
 * are absolute instants and are always displayed with the place's time zone.
 */
export function computeDay(input: CalcInput, ymd: string): DayTimes {
  const coords = new Coordinates(input.place.lat, input.place.lng);
  const [y, m, d] = ymd.split("-").map(Number);
  const pt = new PrayerTimes(coords, new Date(y, m - 1, d), buildParams(input, coords));
  const times = {} as Record<PrayerKey, Date>;
  for (const key of PRAYER_KEYS) {
    const at = pt[key];
    if (!(at instanceof Date) || Number.isNaN(at.getTime())) {
      throw new Error(`No ${key} time for ${ymd}`);
    }
    times[key] = at;
  }
  return { ymd, times };
}

/** Yesterday's Isha through tomorrow's times, in order: enough to find previous and next at any moment. */
export function timeline(input: CalcInput, todayYmd: string): PrayerInstant[] {
  const yesterday = computeDay(input, shiftYmd(todayYmd, -1));
  const today = computeDay(input, todayYmd);
  const tomorrow = computeDay(input, shiftYmd(todayYmd, 1));
  return [
    { key: "isha" as PrayerKey, at: yesterday.times.isha },
    ...PRAYER_KEYS.map((key) => ({ key, at: today.times[key] })),
    ...PRAYER_KEYS.map((key) => ({ key, at: tomorrow.times[key] })),
  ];
}

export type Period = "dawn" | "day" | "dusk" | "night";

export function periodOf(current: PrayerKey): Period {
  if (current === "fajr") return "dawn";
  if (current === "maghrib") return "dusk";
  if (current === "isha") return "night";
  return "day";
}

/**
 * Builds the next ~48h of notifications for the Rust scheduler: one per unmuted
 * prayer and, if enabled, a reminder before it.
 */
export function buildSchedule(settings: Settings, now: number): ScheduledEvent[] {
  const { lang, place, reminderMin, muted, clock } = settings;
  const todayYmd = ymdInTz(new Date(now), place.tz);
  const days = [computeDay(settings, todayYmd), computeDay(settings, shiftYmd(todayYmd, 1))];
  const city = placeName(lang, place);
  const events: ScheduledEvent[] = [];

  for (const day of days) {
    for (const key of PRAYER_KEYS) {
      if (muted[key]) continue;
      const at = day.times[key].getTime();
      const name = prayerName(lang, key);
      if (at > now) {
        events.push({
          at,
          kind: "prayer",
          prayer: key,
          title: key === "sunrise" ? t(lang, "notifSunrise") : t(lang, "notifTitle", { p: name }),
          body: `${city} · ${formatClock(day.times[key], place.tz, clock)}`,
        });
      }
      const reminderAt = at - reminderMin * 60_000;
      if (reminderMin > 0 && key !== "sunrise" && reminderAt > now) {
        events.push({
          at: reminderAt,
          kind: "reminder",
          prayer: key,
          title: t(lang, "reminderTitle", { n: reminderMin, p: name }),
          body: `${city} · ${formatClock(day.times[key], place.tz, clock)}`,
        });
      }
    }
  }
  return events.sort((a, b) => a.at - b.at);
}
