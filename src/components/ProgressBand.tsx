export interface BandColors {
  /** Track behind the fill. */
  track: string;
  /** Gradient of the filled part, start → end along the reading direction. */
  fillFrom: string;
  fillTo: string;
}

interface ProgressBandProps {
  /** 0-1: share of the time elapsed toward the next prayer. */
  progress: number;
  /** Total strip height; the bar itself is slimmer and centred inside it. */
  height?: number;
  /** Fill from the right when the UI is RTL. */
  rtl?: boolean;
  label?: string;
  /** Theme colours; defaults to the app's gold-on-track tokens. */
  colors?: BandColors;
}

/** The progress line: one slim gold gradient gliding along a quiet track. */
export function ProgressBand({ progress, height = 12, rtl = false, label, colors }: ProgressBandProps) {
  const filled = Math.min(1, Math.max(0, progress)) * 100;
  const bar = Math.max(3, Math.round(height * 0.4));
  const track = colors?.track ?? "var(--tile-2)";
  const gradient = `linear-gradient(to ${rtl ? "left" : "right"}, ${colors?.fillFrom ?? "var(--gold-bright)"}, ${
    colors?.fillTo ?? "var(--gold)"
  })`;

  return (
    <div
      className="relative w-full"
      style={{ height }}
      role={label ? "progressbar" : undefined}
      aria-label={label}
      aria-valuenow={label ? Math.round(filled) : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
      aria-hidden={label ? undefined : true}
    >
      <div
        className="absolute inset-x-0 rounded-full"
        style={{ height: bar, bottom: (height - bar) / 2, background: track }}
      />
      <div
        className="absolute rounded-full"
        style={{
          height: bar,
          bottom: (height - bar) / 2,
          width: `${filled}%`,
          insetInlineStart: 0,
          background: gradient,
          transition: "width 1s linear",
        }}
      />
    </div>
  );
}
