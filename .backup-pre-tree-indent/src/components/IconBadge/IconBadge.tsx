import { type HTMLAttributes, type ReactNode } from "react";
import { Tooltip } from "../Tooltip";
import styles from "./IconBadge.module.css";
import { cx } from "../../utils/cx";

export type IconBadgeSize = "sm" | "md" | "lg";
export type IconBadgeType = "neutral" | "brand" | "info" | "success" | "warning" | "alert";
export type IconBadgeEmphasis = "low" | "medium" | "high";

export interface IconBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: IconBadgeSize;
  variant?: IconBadgeType;
  emphasis?: IconBadgeEmphasis;
  round?: boolean;
  "aria-label"?: string;
  children?: ReactNode;
}


export function IconBadge({
  size = "md",
  variant = "neutral",
  emphasis = "medium",
  round = false,
  "aria-label": ariaLabel,
  children,
  className,
  ...rest
}: IconBadgeProps) {
  const badge = (
    <span
      className={cx(
        styles.iconBadge,
        styles[size],
        styles[variant],
        styles[emphasis],
        round && styles.round,
        className
      )}
      aria-label={ariaLabel}
      {...rest}
    >
      <span className={styles.iconSlot}>{children}</span>
    </span>
  );

  if (ariaLabel) {
    return (
      <Tooltip type="inverse" showTail={false} placement="top" label={ariaLabel}>
        {badge}
      </Tooltip>
    );
  }

  return badge;
}
