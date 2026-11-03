import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { useWindowSync } from "../hooks/useWindowSync";
import { t } from "../lib/i18n";
import { inTauri, onEvent } from "../lib/tauri";
import { useSettingsStore } from "../store/useSettingsStore";
import { IconCheck } from "../components/Icons";
import { ProgressBand } from "../components/ProgressBand";

interface QuranSurah {
  id: number;
  name: string;
  latin: string;
  verses: number;
  ayahs: string[];
}

/** The basmala, from Al-Fatiha 1:1 — shown before the first ayah of every surah but 1 and 9. */
const BASMALA_FALLBACK = "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ";

/**
 * The Quran focus lock: a fullscreen, always-dark mushaf page that reveals the
 * surah ayah by ayah and stays until the last one is read. The Rust side
 * refuses every close request until `set_reader_finished` has been called.
 */
export function ReaderWindow() {
  useWindowSync("reader");
  const lang = useSettingsStore((s) => s.lang);
  const [surahId, setSurahId] = useState<number | null>(null);
  const [surah, setSurah] = useState<QuranSurah | null>(null);
  const [basmala, setBasmala] = useState(BASMALA_FALLBACK);
  const [revealed, setRevealed] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Fullscreen above everything the moment the window shows.
  useEffect(() => {
    if (!inTauri) return;
    const win = getCurrentWindow();
    void (async () => {
      try {
        await win.setFullscreen(true);
        await win.setAlwaysOnTop(true);
      } catch (err) {
        console.error("reader window setup failed", err);
      }
    })();
  }, []);

  // The main window picks the surah and announces it, then shows this window.
  useEffect(() => onEvent<{ surah: number }>("reader-open", ({ surah }) => {
    setSurahId(surah);
    setRevealed(0);
    // A fresh session starts locked: clear any finished flag left from the last one.
    if (inTauri) invoke("set_reader_finished", { finished: false }).catch(() => {});
  }), []);

  // Browser preview (/?reader): load a sample surah so the flow is visible.
  useEffect(() => {
    if (inTauri) return;
    const id = window.setTimeout(() => setSurahId(108), 600);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (surahId == null) return;
    let cancelled = false;
    void import("../data/quran.json").then((mod) => {
      if (cancelled) return;
      const data = mod.default as { surahs: QuranSurah[] };
      setSurah(data.surahs.find((s) => s.id === surahId) ?? null);
      // The basmala is Al-Fatiha's first ayah in the bundled text.
      setBasmala(data.surahs[0]?.ayahs[0] ?? BASMALA_FALLBACK);
    });
    return () => {
      cancelled = true;
    };
  }, [surahId]);

  // Keep the newest revealed ayah in view.
  useEffect(() => {
    if (listRef.current && revealed > 0) {
      listRef.current.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [revealed]);

  const total = surah?.ayahs.length ?? 0;
  const finished = surah != null && revealed >= surah.ayahs.length;
  // Every surah opens with the basmala except Al-Fatiha (its ayah 1 is the basmala) and At-Tawbah.
  const showBasmala = surah != null && surah.id !== 1 && surah.id !== 9;

  const finish = async () => {
    if (inTauri) {
      try {
        await invoke("set_reader_finished", { finished: true });
        const win = getCurrentWindow();
        await win.hide();
        await win.setFullscreen(false);
        await win.setAlwaysOnTop(false);
      } catch (err) {
        console.error("closing reader failed", err);
      }
    } else {
      // Browser preview: just reset.
      setSurahId(null);
      setSurah(null);
      setRevealed(0);
    }
  };

  return (
    <div
      className="flex h-full flex-col text-[#f2eede]"
      style={{ background: "radial-gradient(ellipse at 50% -10%, #232c52 0%, #131a30 48%, #090d16 100%)" }}
    >
      {/* Header: surah name on a deep band, reading progress as a gold line. */}
      <header className="shrink-0 bg-[#1a2140]/90 px-8 pb-4 pt-5 shadow-[0_4px_24px_rgb(0_0_0/0.4)] backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-end justify-between gap-6">
          <div className="min-w-0">
            <p className="text-xs tracking-wide text-[#8f9bc0]">{t(lang, "readerTitle")}</p>
            <h1 className="truncate text-2xl font-bold text-[#f0d9a0]">
              {surah ? (
                <>
                  <span lang="ar">{surah.name}</span>
                  <span className="text-base font-semibold text-[#8f9bc0]"> · {surah.latin}</span>
                </>
              ) : (
                "…"
              )}
            </h1>
          </div>
          {surah && (
            <p dir="ltr" className="tabular shrink-0 text-sm text-[#8f9bc0]">
              {Math.min(revealed, total)} / {total}
            </p>
          )}
        </div>
        {surah && (
          <div className="mx-auto mt-3 max-w-4xl">
            <ProgressBand
              progress={total ? Math.min(revealed, total) / total : 0}
              height={8}
              rtl={false}
              colors={{ track: "rgb(255 255 255 / 0.12)", fillFrom: "#f0d9a0", fillTo: "#c9a05f" }}
            />
          </div>
        )}
      </header>

      {surah == null ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="max-w-xl text-center text-lg leading-relaxed text-[#aeb8d8]">{t(lang, "readerIntro")}</p>
        </div>
      ) : (
        <>
          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-[7vw] py-6">
            <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center">
              {/* Ornamental surah plate, shown until the reading begins. */}
              {revealed === 0 && (
                <div className="ayah-enter mb-10 flex flex-col items-center">
                  <div
                    className="flex items-center gap-4 rounded-2xl px-10 py-6"
                    style={{ border: "1px solid rgb(201 160 95 / 0.45)", background: "rgb(201 160 95 / 0.08)" }}
                  >
                    <span className="h-px w-10 bg-[#c9a05f]/60" />
                    <p lang="ar" className="quran-text text-4xl font-semibold text-[#f0d9a0]">
                      {surah.name}
                    </p>
                    <span className="h-px w-10 bg-[#c9a05f]/60" />
                  </div>
                  <p className="mt-6 max-w-lg text-center text-sm leading-relaxed text-[#aeb8d8]">{t(lang, "readerIntro")}</p>
                </div>
              )}

              {showBasmala && revealed > 0 && (
                <p lang="ar" dir="rtl" className="quran-text ayah-enter mb-8 text-center text-2xl text-[#f0d9a0]">
                  {basmala}
                </p>
              )}

              <ol className="flex w-full flex-col items-center gap-10 py-6">
                {surah.ayahs.slice(0, revealed).map((text, i) => (
                  <li key={i} className="ayah-enter w-full">
                    <p
                      lang="ar"
                      dir="rtl"
                      className="quran-text text-center text-[clamp(26px,3.4vw,40px)] leading-[2.15] text-[#f2eede]"
                    >
                      {text}
                      {/* Classic round ayah medallion. */}
                      <span className="relative mx-3 inline-grid h-9 w-9 place-items-center align-middle">
                        <span
                          className="absolute inset-0 rounded-full border"
                          style={{ borderColor: "rgb(201 160 95 / 0.55)", background: "rgb(201 160 95 / 0.12)" }}
                        />
                        <span
                          className="absolute inset-[5px] rounded-full border"
                          style={{ borderColor: "rgb(201 160 95 / 0.35)" }}
                        />
                        <span className="tabular relative text-sm font-bold text-[#f0d9a0]">{i + 1}</span>
                      </span>
                    </p>
                  </li>
                ))}
              </ol>

              {finished && (
                <div className="ayah-enter mt-12 flex flex-col items-center gap-3">
                  <p lang="ar" className="quran-text text-2xl text-[#f0d9a0]">صدق الله العظيم</p>
                  <p className="text-base font-semibold text-[#aeb8d8]">{t(lang, "readerFinishedMsg")}</p>
                </div>
              )}
            </div>
          </div>

          <footer className="shrink-0 border-t border-white/10 bg-[#131a30]/80 px-6 py-5 backdrop-blur">
            <div className="mx-auto flex max-w-4xl items-center justify-center gap-4">
              {finished ? (
                <button
                  type="button"
                  onClick={() => void finish()}
                  className="on-gold flex items-center gap-2.5 rounded-xl bg-gold px-12 py-3.5 text-lg font-bold text-on-gold transition-colors hover:bg-gold-bright"
                >
                  <IconCheck />
                  {t(lang, "readerFinish")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setRevealed((r) => Math.min(r + 1, surah.ayahs.length))}
                  className="on-gold rounded-xl bg-gold px-12 py-3.5 text-lg font-bold text-on-gold transition-colors hover:bg-gold-bright"
                >
                  {t(lang, "readerNext")}
                </button>
              )}
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
