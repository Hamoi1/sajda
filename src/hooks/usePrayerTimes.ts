import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { periodOf, timeline, ymdInTz, type Period, type PrayerInstant } from "../lib/prayer";
import { PRAYER_KEYS, type PrayerKey } from "../lib/types";
import { useSettingsStore } from "../store/useSettingsStore";

/**
 * Re-renders every `intervalMs`, but the value is always read from the system
 * clock, so a throttled or hidden window never drifts: it is correct on the next tick.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [intervalMs]);
  return now;
}

export type PrayerState =
  | {
      status: "ok";
      now: number;
      /** Today's six times, or tomorrow's once today's Isha has passed (as mosque boards do). */
      row: Record<PrayerKey, Date>;
      prev: PrayerInstant;
      next: PrayerInstant;
      remainingMs: number;
      /** 0-1, time elapsed between the previous and the next prayer. */
      progress: number;
      period: Period;
    }
  | { status: "error"; now: number };

export function usePrayerTimes(): PrayerState {
  const { place, method, madhab, offsets } = useSettingsStore(
    useShallow((s) => ({ place: s.place, method: s.method, madhab: s.madhab, offsets: s.offsets })),
  );
  const now = useNow();
  const todayYmd = ymdInTz(new Date(now), place.tz);

  const line = useMemo(() => {
    try {
      return timeline({ place, method, madhab, offsets }, todayYmd);
    } catch (err) {
      console.error("prayer time calculation failed", err);
      return null;
    }
  }, [place, method, madhab, offsets, todayYmd]);

  if (!line) return { status: "error", now };

  const nextIndex = line.findIndex((p) => p.at.getTime() > now);
  // The timeline spans yesterday's Isha to tomorrow's Isha, so both neighbours exist.
  const next = line[nextIndex];
  const prev = line[nextIndex - 1];
  const span = next.at.getTime() - prev.at.getTime();
  // line[1..6] is today, line[7..12] tomorrow; line[6] is today's Isha.
  const rowStart = now >= line[6].at.getTime() ? 7 : 1;
  const row = Object.fromEntries(PRAYER_KEYS.map((key, i) => [key, line[rowStart + i].at])) as Record<PrayerKey, Date>;

  return {
    status: "ok",
    now,
    row,
    prev,
    next,
    remainingMs: next.at.getTime() - now,
    progress: span > 0 ? Math.min(1, Math.max(0, (now - prev.at.getTime()) / span)) : 0,
    period: periodOf(prev.key),
  };
}
