import { type HTMLAttributes, type ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeSize = "sm" | "md" | "lg";
export type BadgeType = "neutral" | "brand" | "info" | "success" | "warning" | "alert";
export type BadgeEmphasis = "low" | "medium" | "high";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: BadgeSize;
  variant?: BadgeType;
  emphasis?: BadgeEmphasis;
  round?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const NUMERIC_RE = /^\d+$/;

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Badge({
  size = "md",
  variant = "neutral",
  emphasis = "medium",
  round = false,
  leadingIcon,
  trailingIcon,
  children,
  className,
  ...rest
}: BadgeProps) {
  const text = typeof children === "string" || typeof children === "number"
    ? String(children)
    : null;

  const isNumeric = text !== null && NUMERIC_RE.test(text);

  return (
    <span
      className={cx(
        styles.badge,
        styles[size],
        styles[variant],
        styles[emphasis],
        round && styles.round,
        className
      )}
      {...rest}
    >
      {leadingIcon && (
        <span className={styles.iconSlot}>{leadingIcon}</span>
      )}

      <span
        className={cx(
          styles.label,
          isNumeric ? styles.numeric : styles.text
        )}
      >
        {children}
      </span>

      {trailingIcon && (
        <span className={styles.iconSlot}>{trailingIcon}</span>
      )}
    </span>
  );
}
