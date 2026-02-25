import type { ReactNode } from "react";
import { Icon } from "../Icon";
import styles from "./InlineMessage.module.css";

export type InlineMessageType =
  | "none"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "alert"
  | "range";

export type InlineMessageEmphasis = "low" | "high";

export interface InlineMessageProps {
  type?: InlineMessageType;
  emphasis?: InlineMessageEmphasis;
  text?: string;
  /** Show leading icon (ignored for `range` type). */
  showLeadingIcon?: boolean;
  /** Override the default icon with a custom ReactNode. */
  leadingIcon?: ReactNode;
  /** Current character count — displayed only in low emphasis. */
  charCount?: number;
  /** Maximum character limit — displayed only in low emphasis. */
  charMax?: number;
  /** Left label for `range` type. */
  startText?: string;
  /** Right label for `range` type. */
  endText?: string;
  /** HTML id — useful for aria-describedby associations. */
  id?: string;
  /**
   * When set, the message becomes a live region so screen readers announce
   * dynamic changes (e.g. validation errors appearing after user action).
   * - `"polite"` — announced when the user is idle (recommended default)
   * - `"assertive"` — interrupts immediately (use sparingly, e.g. critical errors)
   */
  "aria-live"?: "polite" | "assertive";
  /** Marks the message as belonging to a disabled/inactive field (exempt from contrast requirements). */
  disabled?: boolean;
  className?: string;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const ICON_MAP: Record<string, string> = {
  none: "chat_info",
  neutral: "chat_info",
  info: "info",
  success: "check_circle",
  warning: "warning",
  alert: "warning",
};

export function InlineMessage({
  type = "neutral",
  emphasis = "high",
  text = "",
  showLeadingIcon = true,
  leadingIcon,
  charCount,
  charMax,
  startText = "Start",
  endText = "End",
  id,
  "aria-live": ariaLive,
  disabled = false,
  className,
}: InlineMessageProps) {
  const isHigh = emphasis === "high";
  const isRange = type === "range";
  const showCounter = !isHigh && !isRange && charMax !== undefined;
  const isDecorative = !isHigh && type === "none" && !showCounter;

  if (isRange) {
    return (
      <div id={id} className={cx(styles.root, styles.range, className)} aria-live={ariaLive} role={ariaLive ? "status" : undefined} aria-disabled={disabled || undefined}>
        <span className={styles.rangeLabel}>{startText}</span>
        <span className={cx(styles.rangeLabel, styles.rangeLabelEnd)}>
          {endText}
        </span>
      </div>
    );
  }

  const iconName = ICON_MAP[type];
  const iconSize = isHigh ? 14 : 16;
  const iconNode =
    showLeadingIcon && iconName
      ? leadingIcon ?? <Icon name={iconName as never} size={iconSize} />
      : null;

  const rootClass = cx(
    styles.root,
    styles[type],
    isHigh ? styles.high : styles.low,
    className,
  );

  return (
    <div id={id} className={rootClass} aria-live={ariaLive} role={ariaLive ? (type === "alert" ? "alert" : "status") : undefined} aria-disabled={disabled || undefined} aria-hidden={isDecorative || undefined}>
      <div className={styles.content}>
        {iconNode && <span className={styles.icon}>{iconNode}</span>}
        <span className={styles.text}>{text}</span>
      </div>

      {showCounter && (
        <span className={styles.counter}>
          {charCount ?? 0}/{charMax}
        </span>
      )}
    </div>
  );
}
