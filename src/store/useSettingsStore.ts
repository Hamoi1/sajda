import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DEFAULT_PLACE } from "../lib/location";
import { emitEvent } from "../lib/tauri";
import type { PrayerKey, Settings, WidgetPrefs } from "../lib/types";

export const SETTINGS_STORAGE_KEY = "sajda-settings";
export const SETTINGS_EVENT = "settings-updated";

const zeroes: Record<PrayerKey, number> = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };

export const DEFAULT_SETTINGS: Settings = {
  place: DEFAULT_PLACE,
  method: "MuslimWorldLeague",
  madhab: "shafi",
  offsets: zeroes,
  // Sunrise ends Fajr time; there is no adhan for it, so it starts silent.
  muted: { fajr: false, sunrise: true, dhuhr: false, asr: false, maghrib: false, isha: false },
  sound: "adhan",
  volume: 80,
  reminderMin: 0,
  lang: "ckb",
  theme: "system",
  clock: "12",
  widget: { visible: true, alwaysOnTop: true, opacity: 92, locked: false },
};

interface SettingsActions {
  update: (patch: Partial<Settings>) => void;
  updateWidget: (patch: Partial<WidgetPrefs>) => void;
  setOffset: (key: PrayerKey, minutes: number) => void;
  toggleMute: (key: PrayerKey) => void;
}

export type SettingsState = Settings & SettingsActions;

// Each window is its own webview with its own store instance. Every write is
// persisted to localStorage (shared by both windows) and then announced, so the
// other window rehydrates. Rehydrating never re-announces, so there is no echo loop.
function announce() {
  void emitEvent(SETTINGS_EVENT);
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
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ update, updateWidget, setOffset, toggleMute, ...settings }) => settings,
      // Nested objects are merged with defaults so a newly added field never arrives undefined.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<Settings>;
        return {
          ...current,
          ...saved,
          offsets: { ...current.offsets, ...saved.offsets },
          muted: { ...current.muted, ...saved.muted },
          widget: { ...current.widget, ...saved.widget },
        };
      },
    },
  ),
);
