import { useSyncExternalStore } from "react";
import {
  BREAKPOINT_ORDER,
  MEDIA_QUERIES,
  type BreakpointName,
} from "../tokens/breakpoints";

/**
 * Resolves the current active breakpoint by matching "only" media queries
 * from widest to narrowest, falling back to the smallest breakpoint.
 */
function getCurrentBreakpoint(): BreakpointName {
  for (let i = BREAKPOINT_ORDER.length - 1; i >= 0; i--) {
    const name = BREAKPOINT_ORDER[i];
    if (window.matchMedia(MEDIA_QUERIES[name].up).matches) return name;
  }
  return BREAKPOINT_ORDER[0];
}

let listeners: Array<() => void> = [];
let currentBp: BreakpointName = typeof window !== "undefined"
  ? getCurrentBreakpoint()
  : BREAKPOINT_ORDER[0];

function subscribe(onStoreChange: () => void) {
  listeners.push(onStoreChange);

  if (listeners.length === 1) {
    attachMediaListeners();
  }

  return () => {
    listeners = listeners.filter((l) => l !== onStoreChange);
    if (listeners.length === 0) {
      detachMediaListeners();
    }
  };
}

function getSnapshot(): BreakpointName {
  return currentBp;
}

function getServerSnapshot(): BreakpointName {
  return BREAKPOINT_ORDER[0];
}

const mqls: MediaQueryList[] = [];

function handleChange() {
  const next = getCurrentBreakpoint();
  if (next !== currentBp) {
    currentBp = next;
    for (const fn of listeners) fn();
  }
}

function attachMediaListeners() {
  for (const name of BREAKPOINT_ORDER) {
    const mql = window.matchMedia(MEDIA_QUERIES[name].up);
    mql.addEventListener("change", handleChange);
    mqls.push(mql);
  }
}

function detachMediaListeners() {
  for (const mql of mqls) {
    mql.removeEventListener("change", handleChange);
  }
  mqls.length = 0;
}

/**
 * Returns the current active breakpoint name (e.g. "sm", "md", "lg").
 * Updates reactively when the viewport crosses a breakpoint boundary.
 *
 * Also provides helper comparators for conditional rendering:
 *
 * ```tsx
 * const { breakpoint, gte, lt } = useBreakpoint();
 * if (gte("md")) return <DesktopNav />;
 * if (lt("sm")) return <MobileNav />;
 * ```
 */
export function useBreakpoint() {
  const breakpoint = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const idx = BREAKPOINT_ORDER.indexOf(breakpoint);

  return {
    breakpoint,
    /** Current breakpoint is greater than or equal to the given name */
    gte: (bp: BreakpointName) => idx >= BREAKPOINT_ORDER.indexOf(bp),
    /** Current breakpoint is greater than the given name */
    gt: (bp: BreakpointName) => idx > BREAKPOINT_ORDER.indexOf(bp),
    /** Current breakpoint is less than or equal to the given name */
    lte: (bp: BreakpointName) => idx <= BREAKPOINT_ORDER.indexOf(bp),
    /** Current breakpoint is less than the given name */
    lt: (bp: BreakpointName) => idx < BREAKPOINT_ORDER.indexOf(bp),
  };
}
