import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import styles from "./Dimmer.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export type DimmerEmphasis = "low" | "md" | "high";

export interface DimmerProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the dimmer is visible */
  open: boolean;
  /** Visual emphasis — controls overlay opacity (default "md") */
  emphasis?: DimmerEmphasis;
  /** Applies backdrop blur behind the overlay */
  blur?: boolean;
  /** Positioning — "fixed" for viewport overlays, "absolute" for contained (default "fixed") */
  position?: "fixed" | "absolute";
  /** Enter animation duration token (default `--animation-state-change-duration`) */
  enterDuration?: string;
  /** Enter animation easing token (default `--animation-state-change-easing`) */
  enterEasing?: string;
  /** Exit animation duration token (default matches enterDuration) */
  exitDuration?: string;
  /** Exit animation easing token (default matches enterEasing) */
  exitEasing?: string;
}

export const Dimmer = forwardRef<HTMLDivElement, DimmerProps>(
  function Dimmer(
    {
      open,
      emphasis = "md",
      blur = false,
      position = "fixed",
      enterDuration = "var(--animation-state-change-duration)",
      enterEasing = "var(--animation-state-change-easing)",
      exitDuration,
      exitEasing,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const vars = {
      "--_dimmer-position": position,
      "--_dimmer-enter-duration": enterDuration,
      "--_dimmer-enter-easing": enterEasing,
      "--_dimmer-exit-duration": exitDuration ?? enterDuration,
      "--_dimmer-exit-easing": exitEasing ?? enterEasing,
    } as CSSProperties;

    return (
      <div
        ref={ref}
        className={cx(
          styles.dimmer,
          emphasis === "low" && styles.low,
          emphasis === "high" && styles.high,
          blur && styles.blur,
          className,
        )}
        style={{ ...vars, ...style }}
        data-open={open ? "" : undefined}
        aria-hidden="true"
        {...rest}
      />
    );
  },
);

Dimmer.displayName = "Dimmer";
