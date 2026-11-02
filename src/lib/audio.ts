import type { SoundMode } from "./types";

/** Optional user-supplied recording. Lives in public/ so a missing file never breaks the build. */
export const ADHAN_URL = "/audio/adhan.mp3";

type Listener = (playing: boolean) => void;

let stopCurrent: (() => void) | null = null;
const listeners = new Set<Listener>();
let adhanCheck: Promise<boolean> | null = null;

function setPlaying(playing: boolean) {
  listeners.forEach((fn) => fn(playing));
}

export function onPlayingChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Checks once whether public/audio/adhan.mp3 exists and is audio (dev servers may answer with HTML). */
export function adhanAvailable(): Promise<boolean> {
  adhanCheck ??= fetch(ADHAN_URL, { method: "HEAD", cache: "no-store" })
    .then((res) => res.ok && (res.headers.get("content-type") ?? "").startsWith("audio"))
    .catch(() => false);
  return adhanCheck;
}

export function stopSound(): void {
  stopCurrent?.();
  stopCurrent = null;
  setPlaying(false);
}

export async function playSound(mode: SoundMode, volume: number): Promise<void> {
  stopSound();
  if (mode === "silent") return;
  const gain = Math.max(0, Math.min(1, volume / 100));
  if (mode === "adhan" && (await adhanAvailable())) {
    playFile(gain);
  } else {
    playChime(gain);
  }
}

function playFile(gain: number) {
  const audio = new Audio(ADHAN_URL);
  audio.volume = gain;
  const finish = () => {
    if (stopCurrent === stop) stopCurrent = null;
    setPlaying(false);
  };
  const stop = () => {
    audio.pause();
    audio.currentTime = 0;
  };
  audio.addEventListener("ended", finish);
  audio.addEventListener("error", finish);
  stopCurrent = stop;
  setPlaying(true);
  audio.play().catch(finish);
}

/** Two soft bell strikes synthesised with Web Audio, so a sound always exists without bundling a file. */
function playChime(gain: number) {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = gain * 0.5;
  master.connect(ctx.destination);

  const strike = (freq: number, start: number) => {
    for (const [ratio, level] of [[1, 1], [2.76, 0.35], [5.4, 0.12]] as const) {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * ratio;
      env.gain.setValueAtTime(0, ctx.currentTime + start);
      env.gain.linearRampToValueAtTime(level, ctx.currentTime + start + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + 2.4);
      osc.connect(env).connect(master);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 2.5);
    }
  };
  strike(659.25, 0);
  strike(523.25, 0.9);

  const timer = window.setTimeout(() => stop(), 3600);
  const stop = () => {
    window.clearTimeout(timer);
    void ctx.close();
    if (stopCurrent === stop) stopCurrent = null;
    setPlaying(false);
  };
  stopCurrent = stop;
  setPlaying(true);
}
