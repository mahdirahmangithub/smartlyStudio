import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.css";
import { cx } from "../../utils/cx";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonType =
  | "brand"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "alert"
  | "inverse";
export type ButtonEmphasis = "high" | "medium" | "low";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  size?: ButtonSize;
  variant?: ButtonType;
  emphasis?: ButtonEmphasis;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}


export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      size = "md",
      variant = "brand",
      emphasis = "high",
      leadingIcon,
      trailingIcon,
      children,
      className,
      disabled,
      htmlType = "button",
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={htmlType}
        disabled={disabled}
        className={cx(
          styles.button,
          styles[size],
          styles[variant],
          styles[emphasis],
          className
        )}
        {...rest}
      >
        {leadingIcon && <span className={styles.iconWrap}>{leadingIcon}</span>}
        <span className={styles.label}>{children}</span>
        {trailingIcon && (
          <span className={styles.iconWrap}>{trailingIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
