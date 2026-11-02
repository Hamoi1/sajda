# Contributing to Sajda · سەجدە

Thank you for wanting to make Sajda better! This guide explains how the app is organised and how to contribute the things that help most.

## Getting started

```bash
git clone https://github.com/Hamoi1/sajda.git
cd sajda
npm install
npm run tauri dev      # runs the desktop app with live reload
```

Requirements: Node.js 20+, Rust stable, and on Windows the VS 2022 Build Tools with *Desktop development with C++* (macOS: `xcode-select --install`). Details in the [README](README.md).

Before opening a pull request, make sure both of these pass:

```bash
npm run build        # TypeScript check + frontend build
cargo check          # in src-tauri/
```

## Where things live

```
src/
  index.css                   # design tokens (dark + light), scrollbars, animations
  lib/
    i18n.ts                   # ALL user-facing strings in کوردی / العربية / English
    prayer.ts                 # calculation + official timetable lookup + schedule builder
    bang-times.json           # official timetables (generated — see "Data pipeline")
    widgetThemes.ts           # the 6 widget themes + the 4 widget sizes
    audio.ts                  # adhan voice list and playback
    quran.json, azkar.json    # bundled Quran and azkar texts
  data/cities.json            # hand-curated cities with Kurdish/Arabic names
  components/main/            # dashboard, azkar, tasbih, settings sections
  components/widget/          # the widget card (all themes and sizes)
  windows/                    # MainWindow, WidgetWindow, ReaderWindow
src-tauri/src/lib.rs          # tray, notification scheduler, reading lock
```

## Ideas that help most

### 1. Verify and improve prayer-time correctness

Times are calculated in `src/lib/prayer.ts` with the adhan library. Helpful contributions:

- Compare Sajda's output for your city against your mosque's published times across seasons and open an issue (or a PR with a default-offset suggestion) if something drifts
- Improve edge cases: high-latitude handling, unusual time zones, DST transitions
- The code is deliberately defensive: a sun event that cannot happen (polar day/night) becomes `null` and the UI shows `--:--` instead of an error — keep that invariant


### 2. Improve the translations

All strings live in `src/lib/i18n.ts` in three dictionaries (`ckb`, `ar`, `en`). Kurdish is the primary language — if a phrasing feels off, or an Arabic/English string reads unnaturally, a one-line PR is welcome. Keep the `{placeholders}` intact.

### 3. Review the azkar

`src/data/azkar.json` holds the azkar with Arabic text, repeat counts and sources. The Quran quotes are machine-verified against the bundled Tanzil text; the hadith texts follow Hisn al-Muslim and the authentic collections. If you spot a wording or attribution problem, cite the collection when you open the PR.

### 4. Add a widget theme or size

Themes are plain objects in `src/lib/widgetThemes.ts` — background, border, text colours, accent and the progress-line colours. Add one to `WIDGET_THEME_KEYS` in `src/lib/types.ts` and a label row in `METHOD_LABELS`-style i18n (`wTheme*` keys). Sizes live in the same file (`WIDGET_SIZES`).

### 5. Design polish

The design language is documented in [DESIGN.md](DESIGN.md) — deep indigo surfaces, gold as the single accent, quiet motion. PRs that refine spacing, contrast or animations in that spirit are welcome.

## Verifying your changes

```bash
npm run build     # TypeScript + frontend build
cargo check       # in src-tauri/
```

For prayer-time changes, compare a few dates across seasons and years for several cities before and after your change — the values should differ only where you intended.
