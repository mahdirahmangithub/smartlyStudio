import { useRef, useEffect } from "react";

export interface GlidePosition {
  x: number;
  y: number;
}

/**
 * Smooth rAF lerp that glides a DOM element toward a target position.
 * Used by Tooltip (cursor-follow) and chart tooltips.
 *
 * - Snaps to target on first enable (no lerp from 0,0)
 * - Stops the rAF loop when settled
 * - Resets when disabled
 * - Writes `transform: translate3d(...)` directly to the element for GPU compositing
 */
export function useGlidePosition(
  targetX: number,
  targetY: number,
  enabled: boolean,
  elementRef: React.RefObject<HTMLElement | null>,
  factor = 0.1,
): GlidePosition | null {
  const posRef = useRef<GlidePosition | null>(null);
  const rafRef = useRef<number>(undefined);

  useEffect(() => {
    if (!enabled) {
      cancelAnimationFrame(rafRef.current!);
      posRef.current = null;
      return;
    }
    if (!posRef.current) {
      posRef.current = { x: targetX, y: targetY };
    }
    const s = posRef.current;
    let running = true;
    const loop = () => {
      if (!running) return;
      s.x += (targetX - s.x) * factor;
      s.y += (targetY - s.y) * factor;
      const settled =
        Math.abs(targetX - s.x) < 0.5 && Math.abs(targetY - s.y) < 0.5;
      if (settled) {
        s.x = targetX;
        s.y = targetY;
      }
      const el = elementRef.current;
      if (el) {
        el.style.transform = `translate3d(${Math.round(s.x)}px, ${Math.round(s.y)}px, 0)`;
      }
      if (!settled) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current!);
    };
  }, [enabled, targetX, targetY, elementRef, factor]);

  return posRef.current;
}
