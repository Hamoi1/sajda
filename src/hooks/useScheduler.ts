import { invoke } from "@tauri-apps/api/core";
import { isPermissionGranted, requestPermission } from "@tauri-apps/plugin-notification";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { onPlayingChange, playSound, stopSound } from "../lib/audio";
import { buildSchedule } from "../lib/prayer";
import { emitEvent, inTauri, onEvent } from "../lib/tauri";
import type { ScheduledEvent } from "../lib/types";
import { useSettingsStore } from "../store/useSettingsStore";

const REFRESH_MS = 30 * 60_000;

/**
 * Main window only. Hands the next ~48h of prayer times to the Rust scheduler
 * (which fires on time even while this window is hidden) and plays the sound
 * when Rust reports a prayer is due.
 */
export function useScheduler(): void {
  const deps = useSettingsStore(
    useShallow((s) => [s.place, s.method, s.madhab, s.offsets, s.muted, s.reminderMin, s.lang, s.clock]),
  );
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
      if (event.kind !== "prayer") return;
      const { sound, volume } = useSettingsStore.getState();
      // Sunrise marks the end of Fajr time; it gets the chime, never the adhan.
      const mode = event.prayer === "sunrise" && sound === "adhan" ? "chime" : sound;
      void playSound(mode, volume);
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

  useEffect(() => {
    if (!inTauri) return;
    (async () => {
      if (!(await isPermissionGranted())) await requestPermission();
    })().catch((err) => console.error("notification permission failed", err));
  }, []);
}
