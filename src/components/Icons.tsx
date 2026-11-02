import type { SVGProps } from "react";

// Square caps and mitred joins echo the stepped weave, instead of a rounded icon-library look.
function Base({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

export const IconBell = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 14V9a5 5 0 0 1 10 0v5l1.5 1.5h-13Z" />
    <path d="M8.5 17.5h3" />
  </Base>
);

export const IconBellOff = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 5.2A5 5 0 0 1 15 9v4" />
    <path d="M5 9v5l-1.5 1.5h10" />
    <path d="M8.5 17.5h3" />
    <path d="M3 3l14 14" />
  </Base>
);

export const IconSliders = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 5h8M15 5h2M3 10h2M9 10h8M3 15h9M16 15h1" />
    <path d="M11 3v4M5 8v4M12 13v4" />
  </Base>
);

export const IconMinimize = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 10h10" />
  </Base>
);

export const IconClose = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 5l10 10M15 5L5 15" />
  </Base>
);

/** A small framed band: the widget. */
export const IconWidget = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="6" width="14" height="8" />
    <path d="M3 11.5h14" />
  </Base>
);

export const IconLock = (p: IconProps) => (
  <Base {...p}>
    <rect x="4.5" y="9" width="11" height="8" />
    <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
  </Base>
);

export const IconUnlock = (p: IconProps) => (
  <Base {...p}>
    <rect x="4.5" y="9" width="11" height="8" />
    <path d="M7 9V6.5a3 3 0 0 1 5.8-1" />
  </Base>
);

export const IconPlay = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 4.5v11l9-5.5Z" />
  </Base>
);

export const IconStop = (p: IconProps) => (
  <Base {...p}>
    <rect x="5.5" y="5.5" width="9" height="9" />
  </Base>
);

export const IconSearch = (p: IconProps) => (
  <Base {...p}>
    <path d="M8.5 3.5l5 5-5 5-5-5Z" />
    <path d="M12 12l4.5 4.5" />
  </Base>
);

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 10.5l4 4 8-9" />
  </Base>
);
