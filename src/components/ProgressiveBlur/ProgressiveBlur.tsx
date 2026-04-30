import { forwardRef, useMemo, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./ProgressiveBlur.module.css";

export type ProgressiveBlurPosition = "top" | "bottom";

export interface ProgressiveBlurProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Which edge the blur anchors to */
  position?: ProgressiveBlurPosition;
  /** Number of blur layers — more layers = smoother ramp. Defaults to 8. */
  steps?: number;
  /** Maximum blur radius in px applied at the most-blurred edge. Defaults to 24. */
  maxBlur?: number;
  /** CSS color used for the gradient overlay. Defaults to
   *  `var(--color-black-opacity-32)` (matches the original look). Pass any
   *  CSS color (incl. `var(...)` tokens) to fade into a different surface. */
  gradientColor?: string;
  /** Content rendered on top of the blur */
  children?: ReactNode;
}

const DEFAULT_STEPS = 8;
const DEFAULT_BLUR_MAX = 24;
const DEFAULT_GRADIENT_COLOR = "var(--color-black-opacity-32)";

/** Eased gradient stops (axis %, color-alpha %). Matches the 12-stop curve
 *  the CSS used to hardcode so existing consumers see no visual change. */
const GRADIENT_STOPS: ReadonlyArray<[number, number]> = [
  [0, 0],
  [1.8, 0.2],
  [4.8, 0.8],
  [9, 2.1],
  [13.9, 4.2],
  [19.8, 7.5],
  [27, 12.6],
  [35, 19.4],
  [43.5, 27.8],
  [53, 38.2],
  [66, 54.1],
  [81, 73.8],
  [100, 100],
];

function buildGradient(direction: string, color: string): string {
  const stops = GRADIENT_STOPS.map(([pos, alpha]) => {
    if (alpha === 0) return `transparent ${pos}%`;
    if (alpha === 100) return `${color} ${pos}%`;
    return `color-mix(in srgb, ${color} ${alpha}%, transparent) ${pos}%`;
  });
  return `linear-gradient(${direction}, ${stops.join(", ")})`;
}

export const ProgressiveBlur = forwardRef<HTMLDivElement, ProgressiveBlurProps>(
  function ProgressiveBlur(
    {
      position = "bottom",
      steps = DEFAULT_STEPS,
      maxBlur = DEFAULT_BLUR_MAX,
      gradientColor = DEFAULT_GRADIENT_COLOR,
      children,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const layers = useMemo(() => {
      const dir = position === "bottom" ? "to bottom" : "to top";
      const items: CSSProperties[] = [];

      for (let i = 0; i < steps; i++) {
        const t = (i + 1) / steps;
        const blur = maxBlur * t * t;
        const maskStart = (i / steps) * 100;
        const maskEnd = ((i + 1) / steps) * 100;

        items.push({
          WebkitBackdropFilter: `blur(${blur}px)`,
          backdropFilter: `blur(${blur}px)`,
          WebkitMaskImage: `linear-gradient(${dir}, transparent ${maskStart}%, black ${maskEnd}%)`,
          maskImage: `linear-gradient(${dir}, transparent ${maskStart}%, black ${maskEnd}%)`,
        });
      }
      return items;
    }, [position, steps, maxBlur]);

    const gradientStyle = useMemo<CSSProperties>(() => {
      const dir = position === "bottom" ? "to bottom" : "to top";
      return { background: buildGradient(dir, gradientColor) };
    }, [position, gradientColor]);

    return (
      <div
        ref={ref}
        className={cx(styles.root, styles[position], className)}
        style={style}
        {...rest}
      >
        <div className={styles.layers} aria-hidden="true">
          {layers.map((layerStyle, i) => (
            <div key={i} className={styles.layer} style={layerStyle} />
          ))}
        </div>
        <div className={styles.gradient} style={gradientStyle} aria-hidden="true" />
        {children && <div className={styles.content}>{children}</div>}
      </div>
    );
  },
);

ProgressiveBlur.displayName = "ProgressiveBlur";
