import { useEffect, useState } from "react";
import { dirOf } from "../lib/i18n";
import { onEvent, type WindowLabel } from "../lib/tauri";
import { SETTINGS_EVENT, SETTINGS_STORAGE_KEY, useSettingsStore } from "../store/useSettingsStore";

/** Keeps this window's store in step with the other window, and applies language and theme. */
export function useWindowSync(label: WindowLabel): void {
  useEffect(() => {
    const rehydrate = () => void useSettingsStore.persist.rehydrate();
    const offSettings = onEvent(SETTINGS_EVENT, rehydrate);
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
