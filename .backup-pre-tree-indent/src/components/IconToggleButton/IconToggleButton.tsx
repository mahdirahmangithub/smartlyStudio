import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { ButtonSize } from "../Button";
import type { ToggleButtonEmphasis } from "../ToggleButton";
import { Tooltip } from "../Tooltip";
import styles from "./IconToggleButton.module.css";
import { cx } from "../../utils/cx";

export interface IconToggleButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onChange"> {
  size?: ButtonSize;
  emphasis?: ToggleButtonEmphasis;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  icon: ReactNode;
  "aria-label": string;
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  /** Hide the built-in tooltip */
  hideTooltip?: boolean;
}


export const IconToggleButton = forwardRef<HTMLButtonElement, IconToggleButtonProps>(
  (
    {
      size = "md",
      emphasis = "medium",
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
      icon,
      className,
      disabled,
      htmlType = "button",
      hideTooltip = false,
      onClick,
      "aria-label": ariaLabel,
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
      <Tooltip type="inverse" showTail={false} placement="top" label={ariaLabel} disabled={hideTooltip}>
        <button
          ref={ref}
          type={htmlType}
          disabled={disabled}
          aria-pressed={checked}
          aria-label={ariaLabel}
          className={cx(
            styles.iconToggleButton,
            styles[size],
            styles[emphasis],
            checked && styles.checked,
            className
          )}
          onClick={handleClick}
          {...rest}
        >
          <span className={styles.iconWrap}>{icon}</span>
        </button>
      </Tooltip>
    );
  }
);

IconToggleButton.displayName = "IconToggleButton";
