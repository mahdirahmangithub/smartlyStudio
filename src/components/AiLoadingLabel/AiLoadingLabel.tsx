import { useState, useEffect, useRef, type HTMLAttributes } from "react";
import { useShimmer } from "../Shimmer";
import { cx } from "../../utils/cx";
import styles from "./AiLoadingLabel.module.css";

export interface AiLoadingLabelProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  label: string;
  size?: "sm" | "md" | "lg";
  /** Invert the shimmer mask so the sweep is a bright spotlight (default: true). */
  shimmerInverse?: boolean;
  /** Enable the opacity pulse alongside the mask sweep (default: false). */
  shimmerPulse?: boolean;
}

export function AiLoadingLabel({
  label,
  size = "md",
  shimmerInverse = true,
  shimmerPulse = false,
  className,
  ...rest
}: AiLoadingLabelProps) {
  const [curr, setCurr] = useState(label);
  const [prev, setPrev] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const currRef = useRef(label);
  const shimmer = useShimmer(true, shimmerInverse, shimmerPulse ? undefined : false);

  useEffect(() => {
    if (label === currRef.current) return;
    setPrev(currRef.current);
    setCurr(label);
    setAnimKey((k) => k + 1);
    currRef.current = label;
  }, [label]);

  const sizeClass =
    size === "sm" ? styles.sizeSm : size === "lg" ? styles.sizeLg : styles.sizeMd;

  return (
    <span className={cx(styles.root, sizeClass, className)} {...rest}>

      {/* Screen reader announcement — visually hidden, clean text only, no animation noise */}
      <span role="status" aria-atomic="true" className={styles.srOnly}>
        {curr}
      </span>

      {/* Visual animation — hidden from assistive technology */}
      <span className={styles.visual} aria-hidden="true">

        {/* Invisible placeholder — holds the one-line height */}
        <span className={styles.placeholder}>{curr}</span>

        {/* Exiting label — slides up and fades out */}
        {prev !== null && (
          <span
            key={`exit-${animKey}`}
            className={styles.labelExit}
            onAnimationEnd={() => setPrev(null)}
          >
            <span className={cx(styles.text, shimmer)}>{prev}</span>
          </span>
        )}

        {/* Entering / current label */}
        <span
          key={`enter-${animKey}`}
          className={animKey === 0 ? styles.labelIdle : styles.labelEnter}
        >
          <span className={cx(styles.text, shimmer)}>{curr}</span>
        </span>

      </span>
    </span>
  );
}

AiLoadingLabel.displayName = "AiLoadingLabel";
