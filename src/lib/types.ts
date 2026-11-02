export const PRAYER_KEYS = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerKey = (typeof PRAYER_KEYS)[number];

export type Lang = "ckb" | "ar" | "en";
export type ThemePref = "system" | "light" | "dark";
export type SoundMode = "adhan" | "chime" | "silent";
export type Madhab = "shafi" | "hanafi";

export const METHOD_KEYS = [
  "MuslimWorldLeague",
  "Egyptian",
  "Karachi",
  "UmmAlQura",
  "Dubai",
  "Qatar",
  "Kuwait",
  "MoonsightingCommittee",
  "Turkey",
  "Tehran",
  "NorthAmerica",
] as const;
export type MethodKey = (typeof METHOD_KEYS)[number];

export interface Place {
  /** Preset city id, or "custom" for manual coordinates. */
  id: string;
  names: { en: string; ckb?: string; ar?: string };
  lat: number;
  lng: number;
  /** IANA time zone, e.g. "Asia/Baghdad". */
  tz: string;
}

export interface WidgetPrefs {
  visible: boolean;
  alwaysOnTop: boolean;
  /** Background opacity, 20-100. Text stays fully opaque for legibility. */
  opacity: number;
  locked: boolean;
}

export interface Settings {
  place: Place;
  method: MethodKey;
  madhab: Madhab;
  offsets: Record<PrayerKey, number>;
  muted: Record<PrayerKey, boolean>;
  sound: SoundMode;
  volume: number;
  /** Minutes before each prayer for a reminder notification; 0 disables. */
  reminderMin: number;
  lang: Lang;
  theme: ThemePref;
  clock: "12" | "24";
  widget: WidgetPrefs;
}

/** Mirrors `ScheduledEvent` in src-tauri/src/lib.rs. */
export interface ScheduledEvent {
  at: number;
  kind: "prayer" | "reminder";
  prayer: PrayerKey;
  title: string;
  body: string;
}
