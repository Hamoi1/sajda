import { useEffect, useRef, useState } from "react";
import { localDigits, t } from "../../lib/i18n";
import { useSettingsStore } from "../../store/useSettingsStore";

const STORE_KEY = "sajda-tasbih";
const TARGETS = [33, 99, 100, 500];

interface TasbihState {
  /** Local date the counters belong to; a new day resets them. */
  day: string;
  count: number;
  cycles: number;
  target: number;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): TasbihState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as TasbihState;
      if (saved.day === today() && typeof saved.count === "number" && typeof saved.target === "number") {
        return saved;
      }
      // Keep the target across days, reset the counters.
      return { day: today(), count: 0, cycles: 0, target: saved.target ?? 33 };
    }
  } catch {
    // Fall through to defaults.
  }
  return { day: today(), count: 0, cycles: 0, target: 33 };
}

/** Digital tasbih: tap anywhere (or press Space/Enter) to count; the ring fills to the target. */
export function TasbihView() {
  const lang = useSettingsStore((s) => s.lang);
  const volume = useSettingsStore((s) => s.volume);
  const [state, setState] = useState<TasbihState>(load);
  const audioRef = useRef<AudioContext | null>(null);
  const [pop, setPop] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      // Counting still works without persistence.
    }
  }, [state]);

  const tick = () => {
    // A short click; a fuller two-note chime on completing a cycle.
    try {
      audioRef.current ??= new AudioContext();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = state.count + 1 >= state.target ? 1046.5 : 880;
      osc.type = "sine";
      gain.gain.setValueAtTime((volume / 100) * 0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {
      // Audio is feedback, not the point; silence is fine.
    }
    setPop((n) => n + 1);
    setState((s) =>
      s.count + 1 >= s.target ? { ...s, count: 0, cycles: s.cycles + 1 } : { ...s, count: s.count + 1 },
    );
  };

  const reset = () => setState((s) => ({ ...s, count: 0, cycles: 0 }));

  const total = state.cycles * state.target + state.count;
  const progress = Math.min(1, state.count / state.target);
  const R = 88;
  const CIRC = 2 * Math.PI * R;

  return (
    <div className="flex h-full min-h-0 flex-col items-center px-6 pb-5">
      <div className="flex items-center gap-2 pt-3">
        {TARGETS.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={state.target === n}
            onClick={() => setState((s) => ({ ...s, target: n, count: 0 }))}
            className={`tabular rounded-full px-4 py-1.5 text-sm transition-all ${
              state.target === n ? "font-bold text-on-gold" : "bg-tile text-ink-soft hover:text-ink"
            }`}
            style={state.target === n ? { background: "var(--accent-gradient)", boxShadow: "var(--accent-glow)" } : undefined}
          >
            {localDigits(lang, n)}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={tick}
        aria-label={t(lang, "tasbihTapHint")}
        className="group relative mt-4 grid min-h-0 w-full flex-1 place-items-center rounded-[18px] border border-line bg-tile transition-colors hover:bg-tile-2 active:bg-gold/20"
      >
        {/* The ring fills toward the target as you count. */}
        <svg viewBox="0 0 200 200" className="pointer-events-none absolute inset-0 m-auto h-[min(72%,340px)] w-auto" aria-hidden="true">
          <circle cx="100" cy="100" r={R} fill="none" stroke="var(--tile-2)" strokeWidth="5" />
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            transform="rotate(-90 100 100)"
            style={{ transition: "stroke-dashoffset 160ms ease-out" }}
          />
        </svg>
        <div key={pop} className={`text-center ${pop > 0 ? "count-pop" : ""}`}>
          <p role="timer" dir="ltr" className="tabular text-[clamp(4.5rem,9vw,6.5rem)] leading-none font-extrabold text-accent">
            {localDigits(lang, state.count)}
          </p>
          <p className="mt-3 text-base text-ink-soft">
            {t(lang, "tasbihTarget")} {localDigits(lang, state.target)}
          </p>
          {state.count + 1 >= state.target && <p className="mt-1 text-sm font-bold text-accent">{t(lang, "tasbihTargetReached")}</p>}
        </div>
      </button>

      <div className="mt-3 flex w-full items-center justify-between text-sm text-ink-soft">
        <span>
          {t(lang, "tasbihCycles")}: <strong className="text-ink">{localDigits(lang, state.cycles)}</strong> · {t(lang, "tasbihDaily")}:{" "}
          <strong className="text-ink">{localDigits(lang, total)}</strong>
        </span>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-line bg-tile px-4 py-2 text-sm transition-colors hover:border-gold"
        >
          {t(lang, "tasbihReset")}
        </button>
      </div>
    </div>
  );
}
