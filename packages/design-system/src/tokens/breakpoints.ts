// Auto-generated from design tokens — do not edit manually.
// Run `npm run tokens` to regenerate.

export const BREAKPOINT_ORDER = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const;

export type BreakpointName = (typeof BREAKPOINT_ORDER)[number];

export interface Breakpoint {
  readonly min: number;
  readonly max: number | null;
}

export const BREAKPOINTS: Record<BreakpointName, Breakpoint> = {
  "2xs": { min: 320, max: 375 },
  "xs": { min: 376, max: 520 },
  "sm": { min: 521, max: 1024 },
  "md": { min: 1025, max: 1280 },
  "lg": { min: 1281, max: 1440 },
  "xl": { min: 1441, max: 1920 },
  "2xl": { min: 1921, max: null },
};

export interface MediaQueries {
  readonly up: string;
  readonly down: string | null;
  readonly only: string;
}

/** Pre-built media query strings for window.matchMedia() and CSS reference */
export const MEDIA_QUERIES: Record<BreakpointName, MediaQueries> = {
  "2xs": {
    up: "(min-width: 320px)",
    down: "(max-width: 375px)",
    only: "(min-width: 320px) and (max-width: 375px)",
  },
  "xs": {
    up: "(min-width: 376px)",
    down: "(max-width: 520px)",
    only: "(min-width: 376px) and (max-width: 520px)",
  },
  "sm": {
    up: "(min-width: 521px)",
    down: "(max-width: 1024px)",
    only: "(min-width: 521px) and (max-width: 1024px)",
  },
  "md": {
    up: "(min-width: 1025px)",
    down: "(max-width: 1280px)",
    only: "(min-width: 1025px) and (max-width: 1280px)",
  },
  "lg": {
    up: "(min-width: 1281px)",
    down: "(max-width: 1440px)",
    only: "(min-width: 1281px) and (max-width: 1440px)",
  },
  "xl": {
    up: "(min-width: 1441px)",
    down: "(max-width: 1920px)",
    only: "(min-width: 1441px) and (max-width: 1920px)",
  },
  "2xl": {
    up: "(min-width: 1921px)",
    down: null,
    only: "(min-width: 1921px)",
  },
};

