import { CalculationMethod, CalculationParameters, Coordinates, HighLatitudeRule, Madhab, PrayerTimes } from "adhan";
import { formatClock, placeName, prayerName, t } from "./i18n";
import { PRAYER_KEYS, type Lang, type PrayerKey, type ScheduledEvent, type Settings } from "./types";

export type CalcInput = Pick<Settings, "place" | "method" | "madhab" | "offsets">;

export type MaybeTime = Date | null;

export interface PrayerInstant {
  key: PrayerKey;
  at: MaybeTime;
}

export interface DayTimes {
  /** "YYYY-MM-DD" in the place's time zone. */
  ymd: string;
  /** A time is null only where the sun event does not happen that day (polar day/night). */
  times: Record<PrayerKey, MaybeTime>;
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
  // The Kurdistan preset reproduces the region's official mosque schedules
  // (calibrated against the published tables): a 17° Fajr, Isha 80 minutes
  // after Maghrib, and the tables' small safety margins on Dhuhr, Asr and
  // Maghrib. Personal per-prayer adjustments stack on top.
  if (input.method === "Kurdistan") {
    const params = CalculationMethod.MuslimWorldLeague();
    params.fajrAngle = 17;
    params.ishaInterval = 80;
    const presetOffsets: Record<PrayerKey, number> = { fajr: 0, sunrise: 0, dhuhr: 8, asr: 4, maghrib: 5, isha: 0 };
    for (const key of PRAYER_KEYS) {
      params.adjustments[key] = (params.adjustments[key] ?? 0) + presetOffsets[key] + (input.offsets[key] ?? 0);
    }
    params.madhab = input.madhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
    params.highLatitudeRule = HighLatitudeRule.recommended(coords);
    return params;
  }
  // Guard against a method key from an older settings version that adhan no
  // longer knows: fall back to MWL rather than crash.
  const params = (CalculationMethod[input.method] ?? CalculationMethod.MuslimWorldLeague)();
  params.madhab = input.madhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  // Keeps Fajr/Isha sane in northern Europe, where twilight may never end in summer.
  params.highLatitudeRule = HighLatitudeRule.recommended(coords);
  params.adjustments = { ...input.offsets };
  return params;
}

/**
 * adhan reads the year/month/day from the Date's local fields, so the date is
 * built from the place's calendar day, not the computer's. Works for any date
 * in any year — past or future — and the returned Dates are absolute instants
 * always displayed with the place's time zone.
 *
 * A time comes back null where the sun event genuinely does not happen that
 * day (midnight sun / polar night): the other five prayers still show.
 */
export function computeDay(input: CalcInput, ymd: string): DayTimes {
  const coords = new Coordinates(input.place.lat, input.place.lng);
  const [y, m, d] = ymd.split("-").map(Number);
  const pt = new PrayerTimes(coords, new Date(y, m - 1, d), buildParams(input, coords));
  const times = {} as Record<PrayerKey, MaybeTime>;
  for (const key of PRAYER_KEYS) {
    const at = pt[key];
    times[key] = at instanceof Date && !Number.isNaN(at.getTime()) ? at : null;
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
 * prayer, a reminder before it if enabled, and — if the Quran reading lock is
 * on — reader events at the configured delays and fixed daily times.
 */
export function buildSchedule(settings: Settings, now: number): ScheduledEvent[] {
  const { lang, place, reminderMin, muted, clock, reader } = settings;
  const todayYmd = ymdInTz(new Date(now), place.tz);
  const days = [computeDay(settings, todayYmd), computeDay(settings, shiftYmd(todayYmd, 1))];
  const city = placeName(lang, place);
  const events: ScheduledEvent[] = [];

  for (const day of days) {
    for (const key of PRAYER_KEYS) {
      if (muted[key]) continue;
      const time = day.times[key];
      // A null time means the sun event does not happen that day — nothing to schedule.
      if (!time) continue;
      const at = time.getTime();
      const name = prayerName(lang, key);
      if (at > now) {
        events.push({
          at,
          kind: "prayer",
          prayer: key,
          title: key === "sunrise" ? t(lang, "notifSunrise") : t(lang, "notifTitle", { p: name }),
          body: `${city} · ${formatClock(time, place.tz, clock)}`,
        });
      }
      const reminderAt = at - reminderMin * 60_000;
      if (reminderMin > 0 && key !== "sunrise" && reminderAt > now) {
        events.push({
          at: reminderAt,
          kind: "reminder",
          prayer: key,
          title: t(lang, "reminderTitle", { n: reminderMin, p: name }),
          body: `${city} · ${formatClock(time, place.tz, clock)}`,
        });
      }
      // The reading lock opens a configurable number of minutes after each adhan.
      if (reader.enabled && reader.afterAdhanMin > 0 && key !== "sunrise") {
        const readerAt = at + reader.afterAdhanMin * 60_000;
        if (readerAt > now) {
          events.push(readerEvent(lang, key, readerAt));
        }
      }
    }
    // Plus fixed daily times, independent of the adhan.
    if (reader.enabled) {
      for (const hm of reader.times) {
        const at = hmToEpoch(day.ymd, hm, place.tz);
        if (at > now) {
          events.push(readerEvent(lang, "isha", at));
        }
      }
    }
  }
  return events.sort((a, b) => a.at - b.at);
}

function readerEvent(lang: Lang, prayer: PrayerKey, at: number): ScheduledEvent {
  return {
    at,
    kind: "reader",
    prayer,
    title: t(lang, "notifReaderTitle"),
    body: t(lang, "readerTitle"),
  };
}

/** "HH:MM" on calendar day `ymd` as seen in `tz` → epoch ms. */
export function hmToEpoch(ymd: string, hm: string, tz: string): number {
  // Treat the wall-clock time as UTC, then subtract the zone's offset at that
  // instant; two passes settle any DST boundary inside the same day.
  let guess = Date.parse(`${ymd}T${hm}:00Z`);
  for (let i = 0; i < 2; i++) {
    const offset = tzOffsetMs(guess, tz);
    guess = Date.parse(`${ymd}T${hm}:00Z`) - offset;
  }
  return guess;
}

/** Milliseconds a zone is ahead of UTC at the given instant. */
function tzOffsetMs(instant: number, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUTC = Date.parse(
    `${get("year")}-${String(get("month")).padStart(2, "0")}-${String(get("day")).padStart(2, "0")}T${String(
      get("hour") % 24,
    ).padStart(2, "0")}:${String(get("minute")).padStart(2, "0")}:${String(get("second")).padStart(2, "0")}Z`,
  );
  return asUTC - instant;
}
