import type { Lang, SoundMode } from "./types";

/** One bundled adhan recording, all taken from the Bang (بانگ) app's own library. */
export interface AdhanVoice {
  file: string;
  label: Record<Lang, string>;
}

export const ADHAN_VOICES: AdhanVoice[] = [
  { file: "bangtawaw1.mp3", label: { ckb: "بانگی تەواو ١", ar: "الأذان الكامل ١", en: "Full adhan 1" } },
  { file: "bangtawaw2.mp3", label: { ckb: "بانگی تەواو ٢", ar: "الأذان الكامل ٢", en: "Full adhan 2" } },
  { file: "bangtawaw3.mp3", label: { ckb: "بانگی تەواو ٣", ar: "الأذان الكامل ٣", en: "Full adhan 3" } },
  { file: "bangtawaw4.mp3", label: { ckb: "بانگی تەواو ٤", ar: "الأذان الكامل ٤", en: "Full adhan 4" } },
  { file: "bangtawaw5.mp3", label: { ckb: "بانگی تەواو ٥", ar: "الأذان الكامل ٥", en: "Full adhan 5" } },
  { file: "bangtawaw6.mp3", label: { ckb: "بانگی تەواو ٦", ar: "الأذان الكامل ٦", en: "Full adhan 6" } },
  { file: "bang1.mp3", label: { ckb: "بانگ ١", ar: "أذان ١", en: "Adhan 1" } },
  { file: "bang2.mp3", label: { ckb: "بانگ ٢", ar: "أذان ٢", en: "Adhan 2" } },
  { file: "bang3.mp3", label: { ckb: "بانگ ٣", ar: "أذان ٣", en: "Adhan 3" } },
  { file: "bang4.mp3", label: { ckb: "بانگ ٤", ar: "أذان ٤", en: "Adhan 4" } },
  { file: "bang5.mp3", label: { ckb: "بانگ ٥", ar: "أذان ٥", en: "Adhan 5" } },
  { file: "bang6.mp3", label: { ckb: "بانگ ٦", ar: "أذان ٦", en: "Adhan 6" } },
  { file: "bang7.mp3", label: { ckb: "بانگ ٧", ar: "أذان ٧", en: "Adhan 7" } },
  { file: "bang8.mp3", label: { ckb: "بانگ ٨", ar: "أذان ٨", en: "Adhan 8" } },
  { file: "bang9.mp3", label: { ckb: "بانگ ٩", ar: "أذان ٩", en: "Adhan 9" } },
  { file: "bang10.mp3", label: { ckb: "بانگ ١٠", ar: "أذان ١٠", en: "Adhan 10" } },
  { file: "bang11.mp3", label: { ckb: "بانگ ١١", ar: "أذان ١١", en: "Adhan 11" } },
  { file: "bang12.mp3", label: { ckb: "بانگ ١٢", ar: "أذان ١٢", en: "Adhan 12" } },
  { file: "bang13.mp3", label: { ckb: "بانگ ١٣", ar: "أذان ١٣", en: "Adhan 13" } },
  { file: "bang14.mp3", label: { ckb: "بانگ ١٤", ar: "أذان ١٤", en: "Adhan 14" } },
  { file: "makka01.mp3", label: { ckb: "مەککە", ar: "مكة", en: "Makkah" } },
  { file: "abdulrahman01.mp3", label: { ckb: "عەبدولڕەحمان", ar: "عبد الرحمن", en: "Abdulrahman" } },
  { file: "peshawa01.mp3", label: { ckb: "پێشەوا", ar: "بيشوا", en: "Peshawa" } },
];

export const DEFAULT_ADHAN_FILE = "bangtawaw1.mp3";

export function adhanVoice(file: string): AdhanVoice {
  return ADHAN_VOICES.find((v) => v.file === file) ?? ADHAN_VOICES[0]!;
}

function adhanUrl(file: string): string {
  return `/audio/adhan/${file}`;
}

type Listener = (playing: boolean) => void;

let stopCurrent: (() => void) | null = null;
const listeners = new Set<Listener>();
const availability = new Map<string, Promise<boolean>>();

function setPlaying(playing: boolean) {
  listeners.forEach((fn) => fn(playing));
}

export function onPlayingChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Checks once per file whether the recording exists and is audio (dev servers may answer with HTML). */
export function adhanAvailable(file: string = DEFAULT_ADHAN_FILE): Promise<boolean> {
  let check = availability.get(file);
  check ??= fetch(adhanUrl(file), { method: "HEAD", cache: "no-store" })
    .then((res) => res.ok && (res.headers.get("content-type") ?? "").startsWith("audio"))
    .catch(() => false);
  availability.set(file, check);
  return check;
}

export function stopSound(): void {
  stopCurrent?.();
  stopCurrent = null;
  setPlaying(false);
}

export async function playSound(mode: SoundMode, volume: number, adhanFile: string = DEFAULT_ADHAN_FILE): Promise<void> {
  stopSound();
  if (mode === "silent") return;
  const gain = Math.max(0, Math.min(1, volume / 100));
  if (mode === "adhan" && (await adhanAvailable(adhanFile))) {
    playFile(adhanUrl(adhanFile), gain);
  } else {
    playChime(gain);
  }
}

function playFile(url: string, gain: number) {
  const audio = new Audio(url);
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
