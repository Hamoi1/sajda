import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_ADHAN_FILE } from "../lib/audio";
import { DEFAULT_PLACE } from "../lib/location";
import { currentLabel, emitEvent, inTauri } from "../lib/tauri";
import { METHOD_KEYS, type PrayerKey, type ReaderPrefs, type Settings, type WidgetPrefs } from "../lib/types";

export const SETTINGS_STORAGE_KEY = "sajda-settings";
export const SETTINGS_EVENT = "settings-updated";

const zeroes: Record<PrayerKey, number> = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };

const DEFAULT_READER: ReaderPrefs = {
  enabled: false,
  afterAdhanMin: 0,
  times: [],
  mode: "random",
  surah: 112,
  pool: [78, 82, 84, 86, 87, 88, 89, 90, 93, 94, 97, 99, 102, 103, 107, 108, 109, 110, 111, 112, 113, 114],
};

export const DEFAULT_SETTINGS: Settings = {
  place: DEFAULT_PLACE,
  method: "Kurdistan",
  madhab: "shafi",
  offsets: zeroes,
  // Sunrise ends Fajr time; there is no adhan for it, so it starts silent.
  muted: { fajr: false, sunrise: true, dhuhr: false, asr: false, maghrib: false, isha: false },
  sound: "adhan",
  volume: 80,
  adhanFile: DEFAULT_ADHAN_FILE,
  reminderMin: 0,
  lang: "ckb",
  theme: "system",
  clock: "12",
  widget: { visible: true, alwaysOnTop: true, opacity: 92, locked: false, theme: "indigoGold", size: "standard" },
  reader: DEFAULT_READER,
  updateCheck: true,
  onboarded: false,
};

interface SettingsActions {
  update: (patch: Partial<Settings>) => void;
  updateWidget: (patch: Partial<WidgetPrefs>) => void;
  updateReader: (patch: Partial<ReaderPrefs>) => void;
  setOffset: (key: PrayerKey, minutes: number) => void;
  toggleMute: (key: PrayerKey) => void;
}

export type SettingsState = Settings & SettingsActions;

// Each window is its own webview with its own store instance. Every write is
// persisted to localStorage (shared by both windows) and then announced, so the
// other window rehydrates. The announcement carries the writing window's label:
// the writer must not rehydrate mid-edit — that race was blanking the open
// settings dialog. Rehydrating never re-announces, so there is no echo loop.
function announce() {
  const from = inTauri ? currentLabel() : "browser";
  void emitEvent(SETTINGS_EVENT, { from });
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      update: (patch) => {
        set(patch);
        announce();
      },
      updateWidget: (patch) => {
        set((s) => ({ widget: { ...s.widget, ...patch } }));
        announce();
      },
      updateReader: (patch) => {
        set((s) => ({ reader: { ...s.reader, ...patch } }));
        announce();
      },
      setOffset: (key, minutes) => {
        const clamped = Math.max(-30, Math.min(30, Math.round(minutes)));
        set((s) => ({ offsets: { ...s.offsets, [key]: clamped } }));
        announce();
      },
      toggleMute: (key) => {
        set((s) => ({ muted: { ...s.muted, [key]: !s.muted[key] } }));
        announce();
      },
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ update, updateWidget, updateReader, setOffset, toggleMute, ...settings }) => settings,
      // Nested objects are merged with defaults so a newly added field never arrives undefined.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<Settings>;
        // A method key saved by an older version may no longer exist — reset it.
        const method = saved.method && METHOD_KEYS.includes(saved.method) ? saved.method : current.method;
        // Anyone with saved settings already set the app up; only fresh installs see onboarding.
        const onboarded = saved.onboarded ?? Object.keys(saved).length > 0;
        return {
          ...current,
          ...saved,
          onboarded,
          method,
          offsets: { ...current.offsets, ...saved.offsets },
          muted: { ...current.muted, ...saved.muted },
          widget: { ...current.widget, ...saved.widget },
          reader: { ...current.reader, ...saved.reader },
        };
      },
    },
  ),
);
