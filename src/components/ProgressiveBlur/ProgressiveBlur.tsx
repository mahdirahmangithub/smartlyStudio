import { forwardRef, useMemo, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./ProgressiveBlur.module.css";

export type ProgressiveBlurPosition = "top" | "bottom";

export interface ProgressiveBlurProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Which edge the blur anchors to */
  position?: ProgressiveBlurPosition;
  /** Content rendered on top of the blur */
  children?: ReactNode;
}

const STEPS = 8;
const BLUR_MAX = 24;

export const ProgressiveBlur = forwardRef<HTMLDivElement, ProgressiveBlurProps>(
  function ProgressiveBlur(
    {
      position = "bottom",
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

      for (let i = 0; i < STEPS; i++) {
        const t = (i + 1) / STEPS;
        const blur = BLUR_MAX * t * t;
        const maskStart = (i / STEPS) * 100;
        const maskEnd = ((i + 1) / STEPS) * 100;

        items.push({
          WebkitBackdropFilter: `blur(${blur}px)`,
          backdropFilter: `blur(${blur}px)`,
          WebkitMaskImage: `linear-gradient(${dir}, transparent ${maskStart}%, black ${maskEnd}%)`,
          maskImage: `linear-gradient(${dir}, transparent ${maskStart}%, black ${maskEnd}%)`,
        });
      }
      return items;
    }, [position]);

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
        <div className={cx(styles.gradient, styles[`gradient-${position}`])} aria-hidden="true" />
        {children && <div className={styles.content}>{children}</div>}
      </div>
    );
  },
);

ProgressiveBlur.displayName = "ProgressiveBlur";
