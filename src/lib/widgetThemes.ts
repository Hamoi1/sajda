import type { WidgetSize, WidgetTheme } from "./types";

/**
 * Widget themes. Two families:
 * - Fixed palettes (indigoGold, glass, kilim, midnight): constant on the desktop.
 * - App-following palettes (classic, minimal): CSS variables from the app theme,
 *   so the widget matches whatever light/dark look the app has.
 * Every theme paints one background layer whose opacity follows the user's
 * opacity setting; text sits above it and stays fully opaque.
 */
export interface WidgetThemeStyle {
  id: WidgetTheme;
  /** CSS background for the card's background layer. */
  bg: string;
  border: string;
  text: string;
  textSoft: string;
  /** Countdown and next-prayer highlight. */
  accent: string;
  /** Fill for the next-prayer tile; text on it uses `onAccent`. */
  accentFill?: string;
  onAccent?: string;
  /** Progress line colours. */
  band: { track: string; fillFrom: string; fillTo: string };
  hover: string;
  /** Extra shadow/glow for the card. */
  shadow?: string;
}

export const WIDGET_THEMES: Record<WidgetTheme, WidgetThemeStyle> = {
  // The app icon's own gradient and gold.
  indigoGold: {
    id: "indigoGold",
    bg: "linear-gradient(135deg, #6f8fc6 0%, #4a5a9e 45%, #303a7c 100%)",
    border: "1px solid rgb(244 228 196 / 0.35)",
    text: "#f4f1e8",
    textSoft: "rgb(244 241 232 / 0.75)",
    accent: "#f4e4c4",
    accentFill: "#c9a05f",
    onAccent: "#201807",
    band: { track: "rgb(24 30 62 / 0.5)", fillFrom: "#f4e4c4", fillTo: "#e9c98b" },
    hover: "rgb(255 255 255 / 0.12)",
    shadow: "0 6px 24px rgb(12 16 40 / 0.45)",
  },
  // Frosted night glass.
  glass: {
    id: "glass",
    bg: "linear-gradient(160deg, rgb(64 74 128 / 0.72) 0%, rgb(24 30 62 / 0.82) 100%)",
    border: "1px solid rgb(255 255 255 / 0.18)",
    text: "#f2f4fc",
    textSoft: "rgb(226 231 248 / 0.72)",
    accent: "#cbd7ff",
    accentFill: "rgb(203 215 255 / 0.22)",
    onAccent: "#f2f4fc",
    band: { track: "rgb(255 255 255 / 0.16)", fillFrom: "rgb(255 255 255 / 0.9)", fillTo: "rgb(255 255 255 / 0.7)" },
    hover: "rgb(255 255 255 / 0.14)",
    shadow: "0 6px 24px rgb(8 10 24 / 0.4)",
  },
  // Follows the app's light/dark theme.
  classic: {
    id: "classic",
    bg: "var(--surface)",
    border: "1px solid var(--line)",
    text: "var(--ink)",
    textSoft: "var(--ink-soft)",
    accent: "var(--accent-text)",
    accentFill: "var(--gold)",
    onAccent: "var(--on-gold)",
    band: { track: "var(--tile-2)", fillFrom: "var(--gold-bright)", fillTo: "var(--gold)" },
    hover: "var(--surface-2)",
  },
  // Woven diamonds on deep indigo, gold thread.
  kilim: {
    id: "kilim",
    bg:
      `url("data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26'><polygon points='13,2 24,13 13,24 2,13' fill='none' stroke='%23c9a05f' stroke-width='1.2' opacity='0.5'/><polygon points='13,9.5 16.5,13 13,16.5 9.5,13' fill='%23c9a05f' opacity='0.35'/></svg>`,
      )}"), linear-gradient(160deg, #262f57 0%, #1c2444 100%)`,
    border: "1px solid rgb(201 160 95 / 0.4)",
    text: "#f4e4c4",
    textSoft: "rgb(244 228 196 / 0.7)",
    accent: "#f0d9a0",
    accentFill: "#c9a05f",
    onAccent: "#201807",
    band: { track: "rgb(15 19 40 / 0.6)", fillFrom: "#e9c98b", fillTo: "#c9a05f" },
    hover: "rgb(201 160 95 / 0.18)",
  },
  // Flat, quiet, follows the app theme; a thin gold rule carries the accent.
  minimal: {
    id: "minimal",
    bg: "color-mix(in srgb, var(--surface) 94%, transparent)",
    border: "1px solid color-mix(in srgb, var(--gold) 45%, transparent)",
    text: "var(--ink)",
    textSoft: "var(--ink-soft)",
    accent: "var(--accent-text)",
    accentFill: "transparent",
    onAccent: "var(--accent-text)",
    band: { track: "var(--tile-2)", fillFrom: "var(--gold)", fillTo: "var(--gold)" },
    hover: "var(--surface-2)",
  },
  // Near-black with gold — the icon's palette after sunset.
  midnight: {
    id: "midnight",
    bg: "linear-gradient(180deg, rgb(16 19 34 / 0.94) 0%, rgb(24 28 54 / 0.94) 100%)",
    border: "1px solid rgb(201 160 95 / 0.35)",
    text: "#edf0fb",
    textSoft: "rgb(237 240 251 / 0.66)",
    accent: "#f0d9a0",
    accentFill: "rgb(201 160 95 / 0.25)",
    onAccent: "#f0d9a0",
    band: { track: "rgb(255 255 255 / 0.12)", fillFrom: "#f0d9a0", fillTo: "#c9a05f" },
    hover: "rgb(255 255 255 / 0.1)",
    shadow: "0 6px 20px rgb(0 0 0 / 0.5)",
  },
};

/** Native window sizes (logical px) per widget size preset. */
export const WIDGET_SIZES: Record<WidgetSize, { width: number; height: number }> = {
  small: { width: 224, height: 92 },
  standard: { width: 300, height: 116 },
  large: { width: 380, height: 224 },
  huge: { width: 480, height: 304 },
};
