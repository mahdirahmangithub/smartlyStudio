import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Icon } from "../Icon";
import styles from "./InputClear.module.css";
import { cx } from "../../utils/cx";

export type InputClearSize = "2xs" | "xs" | "sm" | "md" | "lg";
export type InputClearType =
  | "neutral"
  | "brand"
  | "info"
  | "success"
  | "warning"
  | "alert"
  | "inverse";

export interface InputClearProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  size?: InputClearSize;
  variant?: InputClearType;
  round?: boolean;
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

const SIZE_CLASS: Record<InputClearSize, string> = {
  "2xs": styles.size2xs,
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};


export const InputClear = forwardRef<HTMLButtonElement, InputClearProps>(
  (
    {
      size = "md",
      variant = "neutral",
      round = true,
      className,
      disabled,
      htmlType = "button",
      "aria-label": ariaLabel = "Clear",
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={htmlType}
        disabled={disabled}
        aria-label={ariaLabel}
        className={cx(
          styles.inputClear,
          SIZE_CLASS[size],
          styles[variant],
          round ? styles.round : styles.square,
          className
        )}
        {...rest}
      >
        <Icon name="close" size={size === "2xs" || size === "xs" ? 12 : size === "lg" ? 20 : 16} className={styles.icon} />
      </button>
    );
  }
);

InputClear.displayName = "InputClear";
