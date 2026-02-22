import { type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "../Icon";
import styles from "./OptionItemTrailing.module.css";

export type OptionItemTrailingType =
  | "helper-text"
  | "button"
  | "1-action"
  | "2-action"
  | "3-action"
  | "toggle"
  | "shortcut";

export interface OptionItemTrailingProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  type?: OptionItemTrailingType;
  disabled?: boolean;
  /** Text shown when type="helper-text" */
  helperText?: string;
  /** Show trailing arrow icon when type="helper-text" (default: true) */
  helperIcon?: boolean;
  /** Content for non-helper-text types */
  children?: ReactNode;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const TYPE_CLASS: Record<OptionItemTrailingType, string> = {
  "helper-text": styles.helperText,
  button: styles.button,
  "1-action": styles.action,
  "2-action": styles.action,
  "3-action": styles.action,
  toggle: styles.toggle,
  shortcut: styles.shortcut,
};

export function OptionItemTrailing({
  type = "helper-text",
  disabled = false,
  helperText = "Helper text",
  helperIcon = true,
  children,
  className,
  ...rest
}: OptionItemTrailingProps) {
  if (type === "helper-text") {
    return (
      <div
        className={cx(
          styles.trailing,
          TYPE_CLASS[type],
          disabled && styles.disabled,
          className
        )}
        {...rest}
      >
        <span className={styles.label}>{helperText}</span>
        {helperIcon && (
          <Icon name="arrow_right" size={24} className={styles.helperIcon} />
        )}
      </div>
    );
  }

  return (
    <div
      className={cx(
        styles.trailing,
        TYPE_CLASS[type],
        disabled && styles.disabled,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
