import { useEffect, useMemo, useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import styles from "./Stat.module.css";

export type StatAnimationStyle = "flip" | "none";

export interface StatValueAnimatorProps {
  /** Numeric value to animate; strings are rendered statically. */
  value: number | string;
  animationStyle?: StatAnimationStyle;
  /** Animation duration in ms. */
  durationMs?: number;
  locale?: string;
  formatOptions?: Intl.NumberFormatOptions;
  /** Called once each time the visible value settles on a new target. */
  onSettle?: (formatted: string) => void;
}

const DIGITS = "0123456789";

function formatValue(
  value: number | string,
  locale: string | undefined,
  formatOptions: Intl.NumberFormatOptions | undefined,
): string {
  if (typeof value === "string") return value;
  try {
    return new Intl.NumberFormat(locale, formatOptions).format(value);
  } catch {
    return String(value);
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function StatValueAnimator({
  value,
  animationStyle = "flip",
  durationMs = 1200,
  locale,
  formatOptions,
  onSettle,
}: StatValueAnimatorProps) {
  const reduced = usePrefersReducedMotion();
  const formatted = useMemo(
    () => formatValue(value, locale, formatOptions),
    [value, locale, formatOptions],
  );

  const effectiveStyle: StatAnimationStyle =
    reduced || typeof value !== "number" ? "none" : animationStyle;

  if (effectiveStyle === "flip") {
    return (
      <FlipValue
        formatted={formatted}
        durationMs={durationMs}
        onSettle={onSettle}
      />
    );
  }

  return <NoneValue formatted={formatted} onSettle={onSettle} />;
}

/* ─────────────────────────── none ─────────────────────────── */

function NoneValue({
  formatted,
  onSettle,
}: {
  formatted: string;
  onSettle?: (s: string) => void;
}) {
  useEffect(() => {
    onSettle?.(formatted);
  }, [formatted, onSettle]);
  return <span>{formatted}</span>;
}

/* ────────────────────── slot-machine flip ────────────────────── */

function FlipValue({
  formatted,
  durationMs,
  onSettle,
}: {
  formatted: string;
  durationMs: number;
  onSettle?: (s: string) => void;
}) {
  // When the formatted string length changes, force-remount the columns by
  // including length in the key so animations don't tear across positions.
  const len = formatted.length;
  const settleRef = useRef(onSettle);
  settleRef.current = onSettle;

  useEffect(() => {
    // The longest digit-column animation finishes after `durationMs`.
    const id = window.setTimeout(() => {
      settleRef.current?.(formatted);
    }, durationMs);
    return () => window.clearTimeout(id);
  }, [formatted, durationMs]);

  return (
    <span className={styles.flipRow}>
      {[...formatted].map((char, i) => {
        const isDigit = char >= "0" && char <= "9";
        if (isDigit) {
          return (
            <DigitColumn
              key={`d-${len}-${i}`}
              digit={Number(char)}
              durationMs={durationMs}
              positionIndex={i}
            />
          );
        }
        return (
          <span key={`s-${len}-${i}`} className={styles.staticChar}>
            {char}
          </span>
        );
      })}
    </span>
  );
}

function DigitColumn({
  digit,
  durationMs,
  positionIndex,
}: {
  digit: number;
  durationMs: number;
  positionIndex: number;
}) {
  const spring = useSpring({
    from: { y: 0 },
    to: { y: digit },
    config: { duration: durationMs, easing: easeOutCubic },
    // Stagger digits left-to-right slightly for a pleasant cascade.
    delay: Math.min(positionIndex * 40, 240),
  });
  return (
    <span className={styles.digitColumn} aria-hidden="true">
      <animated.span
        className={styles.digitTrack}
        style={{
          transform: spring.y.to((v) => `translateY(calc(${-v} * 1lh))`),
        }}
      >
        {[...DIGITS].map((d) => (
          <span key={d} className={styles.digitCell}>
            {d}
          </span>
        ))}
      </animated.span>
    </span>
  );
}

/** Matches --motion-easing-enter: cubic-bezier(0, 0, 0.2, 1). */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
