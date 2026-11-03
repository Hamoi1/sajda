export const PRAYER_KEYS = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerKey = (typeof PRAYER_KEYS)[number];

export type Lang = "ckb" | "ar" | "en";
export type ThemePref = "system" | "light" | "dark";
export type SoundMode = "adhan" | "chime" | "silent";
export type Madhab = "shafi" | "hanafi";

export const METHOD_KEYS = [
  "Kurdistan",
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

export const WIDGET_THEME_KEYS = ["indigoGold", "glass", "classic", "kilim", "minimal", "midnight"] as const;
export type WidgetTheme = (typeof WIDGET_THEME_KEYS)[number];

export const WIDGET_SIZE_KEYS = ["small", "standard", "large", "huge"] as const;
export type WidgetSize = (typeof WIDGET_SIZE_KEYS)[number];

export interface WidgetPrefs {
  visible: boolean;
  alwaysOnTop: boolean;
  /** Background opacity, 20-100. Text stays fully opaque for legibility. */
  opacity: number;
  locked: boolean;
  theme: WidgetTheme;
  size: WidgetSize;
}

/** How the Quran reading lock picks its surah. */
export type ReaderMode = "random" | "fixed";

export interface ReaderPrefs {
  enabled: boolean;
  /** Minutes after each adhan at which the reader opens; 0 disables that trigger. */
  afterAdhanMin: number;
  /** Extra daily trigger times, "HH:MM" in the place's zone. */
  times: string[];
  mode: ReaderMode;
  /** Fixed surah number (1-114) when mode is "fixed". */
  surah: number;
  /** Surah numbers the random pick may draw from. */
  pool: number[];
}

export interface Settings {
  place: Place;
  method: MethodKey;
  madhab: Madhab;
  offsets: Record<PrayerKey, number>;
  muted: Record<PrayerKey, boolean>;
  sound: SoundMode;
  volume: number;
  /** Which bundled adhan recording plays, from the Bang library. */
  adhanFile: string;
  /** Minutes before each prayer for a reminder notification; 0 disables. */
  reminderMin: number;
  lang: Lang;
  theme: ThemePref;
  clock: "12" | "24";
  widget: WidgetPrefs;
  reader: ReaderPrefs;
  /** Notify when a newer GitHub release exists. The only optional network call. */
  updateCheck: boolean;
  /** First-run setup finished. Installs from before v3 count as done. */
  onboarded: boolean;
}

/** Mirrors `ScheduledEvent` in src-tauri/src/lib.rs. */
export interface ScheduledEvent {
  at: number;
  kind: "prayer" | "reminder" | "reader";
  prayer: PrayerKey;
  title: string;
  body: string;
}
