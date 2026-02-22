import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { ButtonType, ButtonEmphasis, ButtonSize } from "../Button";
import { Tooltip } from "../Tooltip";
import buttonStyles from "../Button/Button.module.css";
import styles from "./IconButton.module.css";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  size?: ButtonSize;
  variant?: ButtonType;
  emphasis?: ButtonEmphasis;
  icon: ReactNode;
  "aria-label": string;
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      size = "md",
      variant = "brand",
      emphasis = "high",
      icon,
      className,
      disabled,
      htmlType = "button",
      "aria-label": ariaLabel,
      ...rest
    },
    ref
  ) => {
    return (
      <Tooltip type="inverse" showTail={false} placement="top" label={ariaLabel}>
        <button
          ref={ref}
          type={htmlType}
          disabled={disabled}
          aria-label={ariaLabel}
          className={cx(
            buttonStyles.button,
            styles[size],
            buttonStyles[variant],
            buttonStyles[emphasis],
            className
          )}
          {...rest}
        >
          <span className={styles.iconWrap}>{icon}</span>
        </button>
      </Tooltip>
    );
  }
);

IconButton.displayName = "IconButton";
