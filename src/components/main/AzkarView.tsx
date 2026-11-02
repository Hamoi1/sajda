import { useEffect, useState } from "react";
import { t, type StringKey } from "../../lib/i18n";
import { useSettingsStore } from "../../store/useSettingsStore";
import { IconCheck } from "../Icons";
import azkarData from "../../data/azkar.json";

interface Zikr {
  ar: string;
  ckb: string;
  repeat: number;
  ref: string;
}

type AzkarCategory = "morning" | "evening" | "general";

const DATA = azkarData as Record<AzkarCategory, Zikr[]>;

const CATEGORIES: AzkarCategory[] = ["morning", "evening", "general"];
const CAT_LABEL: Record<AzkarCategory, StringKey> = {
  morning: "azkarMorning",
  evening: "azkarEvening",
  general: "azkarGeneral",
};

const PROGRESS_KEY = "sajda-azkar-progress";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Progress is stored per calendar day, so it resets by itself every midnight. */
function loadCounts(category: AzkarCategory, len: number): number[] {
  try {
    const raw = localStorage.getItem(`${PROGRESS_KEY}-${todayKey()}-${category}`);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.from({ length: len }, (_, i) => (Array.isArray(parsed) && typeof parsed[i] === "number" ? parsed[i] : 0));
  } catch {
    return Array.from({ length: len }, () => 0);
  }
}

/** Yesterday's keys (and older) have no value once the day has passed. */
function pruneOldDays(): void {
  try {
    const today = todayKey();
    const stale: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PROGRESS_KEY) && !key.includes(today)) stale.push(key);
    }
    for (const key of stale) localStorage.removeItem(key);
  } catch {
    // Pruning is housekeeping; counting works without it.
  }
}

/** Daily azkar: morning, evening, and general everyday remembrances. */
export function AzkarView() {
  const lang = useSettingsStore((s) => s.lang);
  const [category, setCategory] = useState<AzkarCategory>("morning");
  const items = DATA[category];
  const [, setDay] = useState(todayKey);
  const [counts, setCounts] = useState<number[]>(() => loadCounts(category, items.length));

  useEffect(() => {
    pruneOldDays();
    // Loading the new category's progress replaces the whole array, so a render
    // between switching and loading never sees a length mismatch (that race
    // crashed the view whenever the new list was shorter than the old one).
    setCounts(loadCounts(category, DATA[category].length));
  }, [category]);

  // The app can stay open past midnight: watch for the day rolling over and
  // start fresh when it does (checked on focus and once a minute).
  useEffect(() => {
    const check = () => {
      const today = todayKey();
      setDay((prev) => {
        if (prev === today) return prev;
        setCounts(loadCounts(category, DATA[category].length));
        return today;
      });
    };
    const id = window.setInterval(check, 60_000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [category]);

  // Derived per-render so counts can never outrun the item list.
  const safeCounts = items.map((_, i) => counts[i] ?? 0);

  const bump = (index: number) => {
    setCounts((prev) => {
      const repeat = items[index].repeat;
      const current = prev[index] ?? 0;
      const next = [...items.map((_, i) => prev[i] ?? 0)];
      next[index] = current >= repeat ? 0 : current + 1;
      try {
        localStorage.setItem(`${PROGRESS_KEY}-${todayKey()}-${category}`, JSON.stringify(next));
      } catch {
        // Progress memory is a convenience; counting still works without it.
      }
      return next;
    });
  };

  const doneCount = safeCounts.filter((c, i) => c >= items[i].repeat).length;
  const doneAll = doneCount === items.length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 px-6 pt-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            aria-pressed={category === cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm transition-all ${
              category === cat ? "font-bold text-on-gold" : "bg-tile text-ink-soft hover:text-ink"
            }`}
            style={category === cat ? { background: "var(--accent-gradient)", boxShadow: "var(--accent-glow)" } : undefined}
          >
            {t(lang, CAT_LABEL[cat])}
          </button>
        ))}
        <span className="ms-auto text-sm text-ink-soft">
          {doneAll ? (
            <span className="font-semibold text-accent">{t(lang, "azkarDone")}</span>
          ) : (
            t(lang, "azkarRemaining", { n: items.length - doneCount })
          )}
        </span>
      </div>

      <div className="mx-6 mt-3 h-1 shrink-0 overflow-hidden rounded bg-tile-2">
        <div
          className="h-full rounded bg-gold transition-[width] duration-500"
          style={{ width: `${items.length ? (doneCount / items.length) * 100 : 0}%` }}
        />
      </div>

      <ul className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-5">
        {items.map((zikr, i) => {
          const count = safeCounts[i];
          const done = count >= zikr.repeat;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => bump(i)}
                aria-label={t(lang, "azkarTapToCount")}
                className={`w-full rounded-[14px] border px-[26px] py-[20px] text-start transition-all active:scale-[0.992] ${
                  done ? "border-gold" : "border-line bg-tile hover:bg-tile-2"
                }`}
                style={
                  done
                    ? {
                        background: "linear-gradient(180deg, var(--surface) 0%, var(--accent-muted) 160%)",
                        boxShadow: "var(--accent-glow)",
                      }
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <p lang="ar" dir="rtl" className="quran-text flex-1 text-end text-xl text-ink">
                    {zikr.ar}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-ink-muted">{zikr.ref}</p>
                  <span
                    className={`tabular flex shrink-0 items-center gap-1 rounded-full px-4 py-1 text-xs font-bold transition-colors ${
                      done ? "text-on-gold" : "border border-line bg-surface-2 text-ink-soft"
                    }`}
                    style={done ? { background: "var(--accent-gradient)" } : undefined}
                  >
                    {done ? <IconCheck width={12} height={12} /> : null}
                    {done ? t(lang, "azkarDone") : t(lang, "azkarRepeatN", { n: zikr.repeat - count })}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
