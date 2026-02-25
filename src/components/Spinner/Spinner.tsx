import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import styles from "./Spinner.module.css";

export type SpinnerSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
export type SpinnerType = "brand" | "neutral" | "inverse";

export interface SpinnerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Predefined size token. Ignored when `diameter` is set. */
  size?: SpinnerSize;
  /** Custom diameter in px — overrides `size`. */
  diameter?: number;
  /** Indeterminate spins continuously; determinate shows progress arc. */
  mode?: "indeterminate" | "determinate";
  /** Progress value 0–100 (only used in determinate mode). */
  value?: number;
  /** Color type — controls track and bar colors. */
  type?: SpinnerType;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const SIZE_CLASS: Record<SpinnerSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
  "2xl": styles.xxl,
  "3xl": styles.xxxl,
  "4xl": styles.xxxxl,
};

const TYPE_CLASS: Record<SpinnerType, string> = {
  brand: styles.brand,
  neutral: styles.neutral,
  inverse: styles.inverse,
};

const VIEWBOX = 50;
const RADIUS = 20;
const STROKE = 4;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC_LENGTH = CIRCUMFERENCE * 0.25;

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = "lg",
      diameter,
      mode = "indeterminate",
      value = 0,
      type = "neutral",
      className,
      style,
      ...rest
    },
    ref
  ) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    const dashOffset =
      mode === "determinate"
        ? CIRCUMFERENCE - (CIRCUMFERENCE * clampedValue) / 100
        : CIRCUMFERENCE - ARC_LENGTH;

    const mergedStyle: CSSProperties | undefined = diameter
      ? { ...style, width: diameter, height: diameter }
      : style;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label="Loading"
        aria-valuenow={mode === "determinate" ? clampedValue : undefined}
        aria-valuemin={mode === "determinate" ? 0 : undefined}
        aria-valuemax={mode === "determinate" ? 100 : undefined}
        className={cx(
          styles.spinner,
          !diameter && SIZE_CLASS[size],
          TYPE_CLASS[type],
          mode === "indeterminate" ? styles.indeterminate : styles.determinate,
          className
        )}
        style={mergedStyle}
        {...rest}
      >
        <svg className={styles.svg} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
          <circle
            className={styles.track}
            cx={VIEWBOX / 2}
            cy={VIEWBOX / 2}
            r={RADIUS}
            strokeWidth={STROKE}
          />
          <circle
            className={styles.bar}
            cx={VIEWBOX / 2}
            cy={VIEWBOX / 2}
            r={RADIUS}
            strokeWidth={STROKE}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";
