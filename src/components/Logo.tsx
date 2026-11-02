import type { SVGProps } from "react";

/** The Sajda mark (crescent, dome, minarets) from the app icon, drawn in currentColor. */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="268 176 464 468" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <mask id="sajda-crescent">
          <circle cx="500" cy="410" r="230" fill="#fff" />
          <circle cx="590" cy="340" r="205" fill="#000" />
        </mask>
      </defs>
      <g fill="currentColor">
        <rect x="270" y="180" width="460" height="460" mask="url(#sajda-crescent)" />
        <rect x="612" y="262" width="22" height="338" />
        <rect x="605" y="330" width="36" height="9" />
        <rect x="605" y="452" width="36" height="9" />
        <path d="M610 264 L623 222 L636 264 Z" />
        <rect x="404" y="432" width="20" height="168" />
        <rect x="398" y="480" width="32" height="8" />
        <path d="M402 434 L414 402 L426 434 Z" />
        <path d="M456 548 C456 494 498 474 520 442 C542 474 584 494 584 548 Z" />
        <path d="M440 546 H600 V602 H534 V578 a14 14 0 0 0 -28 0 V602 H440 Z" />
      </g>
    </svg>
  );
}
