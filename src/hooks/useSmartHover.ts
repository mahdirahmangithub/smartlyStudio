import { useRef, useCallback, type MouseEvent } from "react";

export interface SmartHoverOptions {
  /** Called when hover intent is confirmed */
  onEnter: () => void;
  /** Called when the pointer genuinely leaves */
  onLeave: () => void;

  /** Layer 1 — ms the cursor must dwell before triggering (0 = disabled) */
  dwellDelay?: number;
  /** Layer 2 — px/ms velocity threshold; faster crossings are ignored (0 = disabled) */
  velocityThreshold?: number;
  /** Layer 3 — ms grace period before collapsing on leave (0 = disabled) */
  exitGrace?: number;
}

/**
 * Smart hover detection that filters accidental mouse-overs.
 *
 * Returns `onMouseEnter`, `onMouseMove`, and `onMouseLeave` handlers
 * to spread onto the target element.
 */
export function useSmartHover({
  onEnter,
  onLeave,
  dwellDelay = 0,
  velocityThreshold = 0,
  exitGrace = 0,
}: SmartHoverOptions) {
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isExpanded = useRef(false);

  const lastMove = useRef<{ x: number; y: number; t: number } | null>(null);
  const velocity = useRef(0);

  const clearDwell = () => {
    if (dwellTimer.current != null) {
      clearTimeout(dwellTimer.current);
      dwellTimer.current = null;
    }
  };

  const clearExit = () => {
    if (exitTimer.current != null) {
      clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }
  };

  const expand = useCallback(() => {
    if (isExpanded.current) return;
    isExpanded.current = true;
    onEnter();
  }, [onEnter]);

  const collapse = useCallback(() => {
    if (!isExpanded.current) return;
    isExpanded.current = false;
    onLeave();
  }, [onLeave]);

  const tryExpand = useCallback(() => {
    if (velocityThreshold > 0 && velocity.current > velocityThreshold) return;
    expand();
  }, [velocityThreshold, expand]);

  const handleMouseEnter = useCallback(
    (_e: MouseEvent) => {
      clearExit();
      lastMove.current = null;
      velocity.current = 0;

      if (dwellDelay > 0) {
        clearDwell();
        dwellTimer.current = setTimeout(tryExpand, dwellDelay);
      } else {
        tryExpand();
      }
    },
    [dwellDelay, tryExpand],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const now = performance.now();
      const prev = lastMove.current;

      if (prev) {
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        const dt = now - prev.t;
        if (dt > 0) {
          velocity.current = Math.sqrt(dx * dx + dy * dy) / dt;
        }
      }

      lastMove.current = { x: e.clientX, y: e.clientY, t: now };

      if (
        velocityThreshold > 0 &&
        !isExpanded.current &&
        dwellDelay > 0 &&
        velocity.current > velocityThreshold
      ) {
        clearDwell();
        dwellTimer.current = setTimeout(tryExpand, dwellDelay);
      }
    },
    [velocityThreshold, dwellDelay, tryExpand],
  );

  const handleMouseLeave = useCallback(
    (_e: MouseEvent) => {
      clearDwell();
      lastMove.current = null;
      velocity.current = 0;

      if (exitGrace > 0 && isExpanded.current) {
        clearExit();
        exitTimer.current = setTimeout(collapse, exitGrace);
      } else {
        collapse();
      }
    },
    [exitGrace, collapse],
  );

  return {
    onMouseEnter: handleMouseEnter,
    onMouseMove: velocityThreshold > 0 ? handleMouseMove : undefined,
    onMouseLeave: handleMouseLeave,
  };
}
