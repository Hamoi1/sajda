import { useEffect, useState } from "react";
import { dirOf } from "../lib/i18n";
import { onEvent, type WindowLabel } from "../lib/tauri";
import { SETTINGS_EVENT, SETTINGS_STORAGE_KEY, useSettingsStore } from "../store/useSettingsStore";

/** Keeps this window's store in step with the other window, and applies language and theme. */
export function useWindowSync(label: WindowLabel): void {
  useEffect(() => {
    // A settings write announces itself with the writing window's label. Rehydrating
    // our own write replaces the store mid-edit and could blank the open dialog,
    // so only foreign announcements are applied. The `storage` event already only
    // fires in *other* windows, so it needs no filtering.
    const rehydrate = (from?: unknown) => {
      if (from === label) return;
      void useSettingsStore.persist.rehydrate();
    };
    const offSettings = onEvent<{ from?: string }>(SETTINGS_EVENT, (payload) => rehydrate(payload?.from));
    // Backup path: both webviews share one origin, so localStorage writes fire `storage` here too.
    const onStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY) rehydrate();
    };
    window.addEventListener("storage", onStorage);

    // The tray and the widget's own close button change visibility from outside the store.
    const offVisibility =
      label === "main"
        ? onEvent<boolean>("widget-visibility", (visible) => {
            if (useSettingsStore.getState().widget.visible !== visible) {
              useSettingsStore.getState().updateWidget({ visible });
            }
          })
        : () => {};

    return () => {
      offSettings();
      offVisibility();
      window.removeEventListener("storage", onStorage);
    };
  }, [label]);

  const lang = useSettingsStore((s) => s.lang);
  const theme = useSettingsStore((s) => s.theme);
  const systemDark = useSystemDark();

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dirOf(lang);
    root.dataset.theme = theme === "system" ? (systemDark ? "dark" : "light") : theme;
    root.dataset.window = label;
  }, [lang, theme, systemDark, label]);
}

function useSystemDark(): boolean {
  const query = "(prefers-color-scheme: dark)";
  const [dark, setDark] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setDark(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return dark;
}
