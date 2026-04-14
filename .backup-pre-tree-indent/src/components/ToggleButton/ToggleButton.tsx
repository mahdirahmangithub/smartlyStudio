import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { ButtonSize } from "../Button";
import styles from "./ToggleButton.module.css";
import { cx } from "../../utils/cx";

export type ToggleButtonEmphasis = "medium" | "low";

export interface ToggleButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onChange"> {
  size?: ButtonSize;
  emphasis?: ToggleButtonEmphasis;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}


export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    {
      size = "md",
      emphasis = "medium",
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
      leadingIcon,
      trailingIcon,
      children,
      className,
      disabled,
      htmlType = "button",
      onClick,
      ...rest
    },
    ref
  ) => {
    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const checked = isControlled ? controlledChecked : internalChecked;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isControlled) {
        setInternalChecked((prev) => !prev);
      }
      onChange?.(!checked);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type={htmlType}
        disabled={disabled}
        aria-pressed={checked}
        className={cx(
          styles.toggleButton,
          styles[size],
          styles[emphasis],
          checked && styles.checked,
          className
        )}
        onClick={handleClick}
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

ToggleButton.displayName = "ToggleButton";
