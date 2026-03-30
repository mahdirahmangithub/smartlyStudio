import { useRef, useCallback, useEffect } from "react";

export type MorphKeyframe = { offset: number; path: string };

const NUM_RE = /-?\d+\.?\d*/g;

function parseNumbers(d: string): number[] {
  return (d.match(NUM_RE) || []).map(Number);
}

function buildTemplate(d: string): string[] {
  return d.split(NUM_RE);
}

function reconstruct(tpl: string[], vals: number[]): string {
  let out = "";
  for (let i = 0; i < vals.length; i++) {
    out += tpl[i] + vals[i].toFixed(5);
  }
  return out + tpl[tpl.length - 1];
}

function lerp(a: number[], b: number[], t: number, out: number[]): number[] {
  for (let i = 0; i < a.length; i++) out[i] = a[i] + (b[i] - a[i]) * t;
  return out;
}

function sampleKeyframes(
  kfs: { offset: number; values: number[] }[],
  t: number,
  buf: number[],
): number[] {
  const c = Math.max(0, Math.min(1, t));
  for (let i = 0; i < kfs.length - 1; i++) {
    const cur = kfs[i];
    const nxt = kfs[i + 1];
    if (c >= cur.offset && c <= nxt.offset) {
      const local = (c - cur.offset) / (nxt.offset - cur.offset);
      return lerp(cur.values, nxt.values, local, buf);
    }
  }
  return kfs[kfs.length - 1].values;
}

/**
 * Attempt to solve x(t)=target using Newton's method for a cubic bezier.
 * Falls back to bisection after a few iterations.
 */
function solveCubicBezierX(p1x: number, p2x: number, target: number): number {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;

  const xAt = (t: number) => ((ax * t + bx) * t + cx) * t;
  const dxAt = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  let t = target;
  for (let i = 0; i < 8; i++) {
    const err = xAt(t) - target;
    if (Math.abs(err) < 1e-6) return t;
    const d = dxAt(t);
    if (Math.abs(d) < 1e-6) break;
    t -= err / d;
  }
  let lo = 0, hi = 1;
  t = target;
  for (let i = 0; i < 20; i++) {
    const x = xAt(t);
    if (Math.abs(x - target) < 1e-6) return t;
    if (x < target) lo = t; else hi = t;
    t = (lo + hi) / 2;
  }
  return t;
}

export function cubicBezier(
  x1: number, y1: number, x2: number, y2: number,
): (t: number) => number {
  if (x1 === y1 && x2 === y2) return (t) => t;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const t = solveCubicBezierX(x1, x2, x);
    return ((ay * t + by) * t + cy) * t;
  };
}

/**
 * Drives a multi-keyframe SVG path morph via requestAnimationFrame.
 * Works cross-browser (Safari, Firefox) because it writes `d` via setAttribute.
 *
 * @param keyframes  Ordered morph keyframes with offsets in [0, 1]
 * @param duration   Animation duration in ms
 * @param easing     Optional easing function (maps [0,1] → [0,1])
 */
export function usePathMorph(
  keyframes: MorphKeyframe[],
  duration: number,
  easing: (t: number) => number = (t) => t,
) {
  const rafRef = useRef(0);
  const templateRef = useRef<string[]>(buildTemplate(keyframes[0].path));
  const parsedRef = useRef(
    keyframes.map((kf) => ({ offset: kf.offset, values: parseNumbers(kf.path) })),
  );
  const bufRef = useRef<number[]>(new Array(parsedRef.current[0].values.length));

  useEffect(() => {
    templateRef.current = buildTemplate(keyframes[0].path);
    parsedRef.current = keyframes.map((kf) => ({
      offset: kf.offset,
      values: parseNumbers(kf.path),
    }));
    bufRef.current = new Array(parsedRef.current[0].values.length);
  }, [keyframes]);

  const animate = useCallback(
    (pathEl: SVGPathElement, onDone?: () => void) => {
      cancelAnimationFrame(rafRef.current);
      const start = performance.now();
      const tpl = templateRef.current;
      const kfs = parsedRef.current;
      const buf = bufRef.current;

      const tick = (now: number) => {
        const raw = Math.min((now - start) / duration, 1);
        const t = easing(raw);
        const vals = sampleKeyframes(kfs, t, buf);
        pathEl.setAttribute("d", reconstruct(tpl, vals));
        if (raw < 1) rafRef.current = requestAnimationFrame(tick);
        else onDone?.();
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [duration, easing],
  );

  const cancel = useCallback(() => cancelAnimationFrame(rafRef.current), []);

  return { animate, cancel };
}
