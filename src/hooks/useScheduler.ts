import { invoke } from "@tauri-apps/api/core";
import { enable as enableAutostart, isEnabled as autostartEnabled } from "@tauri-apps/plugin-autostart";
import { isPermissionGranted, requestPermission } from "@tauri-apps/plugin-notification";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { onPlayingChange, playSound, stopSound } from "../lib/audio";
import { buildSchedule, computeDay, ymdInTz } from "../lib/prayer";
import { emitEvent, inTauri, onEvent } from "../lib/tauri";
import type { ScheduledEvent } from "../lib/types";
import { useSettingsStore } from "../store/useSettingsStore";
import { checkForUpdate, openReleases, type UpdateInfo } from "../lib/updates";

const REFRESH_MS = 30 * 60_000;
const UPDATE_CHECK_MS = 24 * 60 * 60_000;

/** Picks the surah a reading session will show, honouring the fixed/random setting. */
function pickSurah(): number {
  const { reader } = useSettingsStore.getState();
  if (reader.mode === "fixed") return reader.surah;
  const pool = reader.pool.filter((n) => n >= 1 && n <= 114);
  const source = pool.length > 0 ? pool : [112];
  return source[Math.floor(Math.random() * source.length)]!;
}

/** Shows the pre-created reader window fullscreen and tells it which surah to open. */
async function openReader() {
  const reader = await WebviewWindow.getByLabel("reader");
  if (!reader) return;
  await emitEvent("reader-open", { surah: pickSurah() });
  await reader.show();
  await reader.setFullscreen(true);
  await reader.setAlwaysOnTop(true);
  await reader.setFocus();
}

/**
 * Main window only. Hands the next ~48h of prayer times to the Rust scheduler
 * (which fires on time even while this window is hidden), plays the sound when
 * Rust reports a prayer is due, and opens the Quran reader on reader events.
 */
export function useScheduler(): { update: UpdateInfo | null; openReleases: (url: string) => void } {
  const deps = useSettingsStore(
    useShallow((s) => [s.place, s.method, s.madhab, s.offsets, s.muted, s.reminderMin, s.lang, s.clock, s.reader]),
  );
  const updateCheck = useSettingsStore((s) => s.updateCheck);
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!inTauri) return;
    let events: ScheduledEvent[] = [];
    try {
      events = buildSchedule(useSettingsStore.getState(), Date.now());
    } catch (err) {
      console.error("could not build the notification schedule", err);
    }
    invoke("set_schedule", { events }).catch((err) => console.error("set_schedule failed", err));
  }, [...deps, refresh]);

  useEffect(() => {
    const id = window.setInterval(() => setRefresh((n) => n + 1), REFRESH_MS);
    const offDue = onEvent<ScheduledEvent>("prayer-due", (event) => {
      setRefresh((n) => n + 1);
      if (event.kind === "reader") {
        if (useSettingsStore.getState().reader.enabled) void openReader();
        return;
      }
      if (event.kind !== "prayer") return;
      const { sound, volume, adhanFile } = useSettingsStore.getState();
      // Sunrise marks the end of Fajr time; it gets the chime, never the adhan.
      const mode = event.prayer === "sunrise" && sound === "adhan" ? "chime" : sound;
      void playSound(mode, volume, adhanFile);
    });
    const offStop = onEvent("stop-sound", stopSound);
    const offPlaying = onPlayingChange((playing) => void emitEvent("audio-state", playing));
    return () => {
      window.clearInterval(id);
      offDue();
      offStop();
      offPlaying();
    };
  }, []);

  // Opt-out update notice: at most one check on startup and one per day after.
  useEffect(() => {
    if (!updateCheck) {
      setUpdate(null);
      return;
    }
    let cancelled = false;
    const run = () =>
      void checkForUpdate()
        .then((info) => !cancelled && setUpdate(info))
        .catch(() => {});
    run();
    const id = window.setInterval(run, UPDATE_CHECK_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [updateCheck]);

  useEffect(() => {
    if (!inTauri) return;
    (async () => {
      if (!(await isPermissionGranted())) await requestPermission();
    })().catch((err) => console.error("notification permission failed", err));
  }, []);

  // First launch: start with the computer, once. Settings → General keeps control afterwards.
  useEffect(() => {
    if (!inTauri) return;
    const FLAG = "sajda-autostart-default";
    if (localStorage.getItem(FLAG)) return;
    localStorage.setItem(FLAG, "1");
    (async () => {
      try {
        if (!(await autostartEnabled())) await enableAutostart();
      } catch (err) {
        console.error("default autostart failed", err);
      }
    })();
  }, []);

  return { update, openReleases: (url: string) => void openReleases(url) };
}

/** Kept for tests/tools that need a raw day computation. */
export { computeDay, ymdInTz };
