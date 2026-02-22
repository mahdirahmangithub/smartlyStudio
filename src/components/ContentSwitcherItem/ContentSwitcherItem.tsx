import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./ContentSwitcherItem.module.css";

export type ContentSwitcherItemSize = "sm" | "md" | "lg";
export type ContentSwitcherItemEmphasis = "high" | "low";

export interface ContentSwitcherItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "value"> {
  value?: string;
  size?: ContentSwitcherItemSize;
  emphasis?: ContentSwitcherItemEmphasis;
  checked?: boolean;
  leadingIcon?: ReactNode;
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const ICON_SIZE: Record<ContentSwitcherItemSize, number> = {
  sm: 16,
  md: 16,
  lg: 20,
};

export const ContentSwitcherItem = forwardRef<
  HTMLButtonElement,
  ContentSwitcherItemProps
>(
  (
    {
      size = "md",
      emphasis = "high",
      checked = false,
      leadingIcon,
      children,
      className,
      disabled,
      htmlType = "button",
      ...rest
    },
    ref
  ) => {
    const iconSize = ICON_SIZE[size];

    return (
      <button
        ref={ref}
        type={htmlType}
        role="radio"
        aria-checked={checked}
        disabled={disabled}
        className={cx(
          styles.item,
          styles[size],
          styles[emphasis],
          checked && styles.checked,
          className
        )}
        {...rest}
      >
        {leadingIcon && (
          <span
            className={styles.iconSlot}
            style={{ width: iconSize, height: iconSize }}
          >
            {leadingIcon}
          </span>
        )}

        {children && <span className={styles.label}>{children}</span>}
      </button>
    );
  }
);

ContentSwitcherItem.displayName = "ContentSwitcherItem";
