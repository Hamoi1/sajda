import { useId } from "react";

interface KilimBandProps {
  /** 0-1: share of the band woven in full colour. */
  progress: number;
  height?: number;
  rtl: boolean;
  label?: string;
}

/**
 * The identity motif: a stepped-diamond kilim row. The filled part is the time
 * elapsed toward the next prayer, woven from the reading-start edge.
 */
export function KilimBand({ progress, height = 22, rtl, label }: KilimBandProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const filled = Math.min(1, Math.max(0, progress)) * 100;
  const h = height;
  const half = h / 2;
  const inner = h * 0.18;

  return (
    <svg
      width="100%"
      height={h}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ display: "block" }}
    >
      <defs>
        <pattern id={`open${id}`} width={h} height={h} patternUnits="userSpaceOnUse">
          <polygon
            points={`${half},2 ${h - 2},${half} ${half},${h - 2} 2,${half}`}
            style={{ fill: "none", stroke: "var(--madder)", strokeWidth: 1.5 }}
          />
          <polygon
            points={`${half},${half - inner} ${half + inner},${half} ${half},${half + inner} ${half - inner},${half}`}
            style={{ fill: "var(--weave-ground)" }}
          />
        </pattern>
        <pattern id={`woven${id}`} width={h} height={h} patternUnits="userSpaceOnUse">
          <rect width={h} height={h} style={{ fill: "var(--weave-ground)" }} />
          <polygon points={`${half},1 ${h - 1},${half} ${half},${h - 1} 1,${half}`} style={{ fill: "var(--madder)" }} />
          <polygon
            points={`${half},${half - inner} ${half + inner},${half} ${half},${half + inner} ${half - inner},${half}`}
            style={{ fill: "var(--wool)" }}
          />
        </pattern>
      </defs>
      <rect width="100%" height={h} fill={`url(#open${id})`} opacity={0.4} />
      <rect
        x={rtl ? `${100 - filled}%` : 0}
        width={`${filled}%`}
        height={h}
        fill={`url(#woven${id})`}
        style={{ transition: "x 1s linear, width 1s linear" }}
      />
    </svg>
  );
}
