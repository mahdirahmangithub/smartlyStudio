import { useRef, useEffect, useState, useId } from "react";
import { LinePath } from "@visx/shape";
import { useSpring, animated } from "@react-spring/web";
import type { CurveFactory } from "d3-shape";
import { DASH_PATTERNS, type LineDash } from "../ChartPrimitives/chartUtils";

/** Matches --motion-easing-enter: cubic-bezier(0, 0, 0.2, 1) */
const EASING_ENTER = cubicBezier(0, 0, 0.2, 1);

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return (t: number): number => {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    const sampleX = (s: number) => ((ax * s + bx) * s + cx) * s;
    const sampleY = (s: number) => ((ay * s + by) * s + cy) * s;
    let guess = t;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(guess) - t;
      if (Math.abs(err) < 1e-6) break;
      const d = (3 * ax * guess + 2 * bx) * guess + cx;
      if (Math.abs(d) < 1e-6) break;
      guess -= err / d;
    }
    return sampleY(guess);
  };
}


export interface AnimatedLineProps<D> {
  data: D[];
  xAccessor: (d: D) => number;
  yAccessor: (d: D) => number;
  color: string;
  strokeWidth?: number;
  opacity?: number;
  curve?: CurveFactory;
  animate?: boolean;
  delay?: number;
  dashStyle?: LineDash;
}

export function AnimatedLine<D>({
  data,
  xAccessor,
  yAccessor,
  color,
  strokeWidth = 2,
  opacity = 1,
  curve,
  animate = true,
  delay = 0,
  dashStyle,
}: AnimatedLineProps<D>) {
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);
  const [ready, setReady] = useState(false);
  const maskId = useId();

  useEffect(() => {
    if (pathRef.current) {
      const total = pathRef.current.getTotalLength();
      setLength(total);
      requestAnimationFrame(() => setReady(true));
    }
  }, [data, xAccessor, yAccessor]);

  const spring = useSpring({
    from: { progress: 0 },
    to: { progress: ready ? 1 : 0 },
    delay: ready ? delay : 0,
    config: { duration: 1000, easing: EASING_ENTER },
    immediate: !animate || !ready,
  });

  const dashPattern = dashStyle ? DASH_PATTERNS[dashStyle] : undefined;
  const useDrawAnimation = animate && length > 0;
  const useMask = useDrawAnimation && !!dashPattern;

  const transitionStyle = {
    transition:
      "stroke 200ms var(--animation-state-change-easing), opacity 200ms var(--animation-state-change-easing), stroke-width 200ms var(--animation-state-change-easing)",
  };

  return (
    <LinePath data={data} x={xAccessor} y={yAccessor} curve={curve}>
      {({ path }) => {
        const d = path(data) ?? "";
        return (
          <>
            {useMask && (
              <defs>
                <mask id={maskId}>
                  <animated.path
                    d={d}
                    fill="none"
                    stroke="white"
                    strokeWidth={strokeWidth + 8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={length}
                    strokeDashoffset={spring.progress.to(
                      (p) => length * (1 - p),
                    )}
                  />
                </mask>
              </defs>
            )}
            <animated.path
              ref={pathRef}
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={transitionStyle}
              strokeDasharray={
                useMask
                  ? dashPattern
                  : useDrawAnimation
                    ? length
                    : dashPattern
              }
              strokeDashoffset={
                useDrawAnimation && !useMask
                  ? spring.progress.to((p) => length * (1 - p))
                  : undefined
              }
              mask={useMask ? `url(#${maskId})` : undefined}
            />
          </>
        );
      }}
    </LinePath>
  );
}
