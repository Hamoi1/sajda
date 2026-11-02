# Sajda design language — Indigo Night + Gold

Sajda's interface is drawn from the app icon: a gold crescent and mosque set in a
deep indigo sky. Everything in the UI is either that deep indigo, quiet ink on
it, or one accent — gold — that marks what matters right now.

## Palette

Tokens live in `src/index.css` as CSS variables, mapped to Tailwind utilities
with `@theme inline`. Both themes exist; dark is the showcase.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--surface` | warm ivory | deep indigo `#1a2140` | window background |
| `--surface-2` | darker ivory | lighter indigo | hover / pressed fills |
| `--line` | warm sand | indigo border | hairlines and borders |
| `--ink` / `--ink-soft` | indigo-black | near-white | text, secondary text |
| `--gold` | bronze `#b98a3e` | gold `#c9a05f` | the accent: next prayer, progress, active tabs |
| `--gold-bright` | pale gold | pale gold `#f0d9a0` | highlights on deep indigo (logo, countdown) |
| `--accent-text` | dark bronze | pale gold | gold as *text* on the current background |
| `--on-gold` | near-black | near-black | text on gold fills |
| `--indigo` / `--on-indigo` | logo indigo | lighter indigo | buttons and selected states |
| `--deep` / `--deep-2` | logo indigo, darker | deep indigo panels | title bar, nav, tiles |

Ambient backgrounds (`--bg-dawn/day/dusk/night`) shift the window imperceptibly
with the prayer period; in dark theme the night sky deepens, in light theme the
paper warms.

## Rules

1. **Gold is scarce.** It marks the next prayer cell, the countdown, the active
   tab, and progress. If everything is gold, nothing is.
2. **Deep indigo carries structure.** Title bar, navigation, tiles and the
   progress band are deep panels; content sits on `--surface`.
3. **The widget is its own thing.** Widget themes live in
   `src/lib/widgetThemes.ts` and may use fixed palettes (indigoGold, glass,
   kilim, midnight) or follow the app theme (classic, minimal). One background
   layer carries the user's opacity setting; text never dims.
4. **Numbers read like mosque boards.** Clock times stay Western digits; dates
   and counters use Eastern Arabic digits (`localDigits` in `src/lib/i18n.ts`).
5. **Arabic religious text is set in Noto Naskh** (`.quran-text`), generous line
   height so diacritics never collide.
6. **Motion is minimal and semantic:** 1 s linear progress band, 2 s ambient
   background shifts, and everything collapses under
   `prefers-reduced-motion: reduce`.

## Identity shapes

- `LogoMark` (`src/components/Logo.tsx`) redraws the icon's crescent, dome and
  minarets in `currentColor` — gold in the title bar.
- The stepped-diamond kilim band (`src/components/KilimBand.tsx`) is the
  progress motif: unwoven diamonds wait, gold diamonds fill as the prayer
  approaches. Icons use square caps and mitred joins to echo the same weave.
