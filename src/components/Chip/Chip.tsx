import { forwardRef, type HTMLAttributes, type ReactNode, type MouseEvent } from "react";
import { InputClear, type InputClearSize } from "../InputClear";
import { Tooltip } from "../Tooltip";
import styles from "./Chip.module.css";

export type ChipSize = "sm" | "md" | "lg";
export type ChipType = "neutral" | "brand" | "info" | "success" | "warning" | "alert";
export type ChipEmphasis = "medium" | "low";

export interface ChipProps extends HTMLAttributes<HTMLDivElement> {
  size?: ChipSize;
  variant?: ChipType;
  emphasis?: ChipEmphasis;
  leadingIcon?: ReactNode;
  "aria-label"?: string;
  onRemove?: () => void;
  disabled?: boolean;
}

const INPUT_CLEAR_SIZE: Record<ChipSize, InputClearSize> = {
  sm: "xs",
  md: "sm",
  lg: "md",
};

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      size = "md",
      variant = "neutral",
      emphasis = "medium",
      leadingIcon,
      "aria-label": ariaLabel,
      onRemove,
      disabled = false,
      children,
      className,
      onClick,
      ...rest
    },
    ref
  ) => {
    const handleRemoveClick = (e: MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    const chip = (
      <div
        ref={ref}
        className={cx(
          styles.chip,
          styles[size],
          styles[variant],
          styles[emphasis],
          disabled && styles.disabled,
          className
        )}
        onClick={disabled ? undefined : onClick}
        tabIndex={disabled ? undefined : 0}
        aria-label={ariaLabel}
        {...rest}
      >
        {leadingIcon && (
          <span className={styles.leadingIcon}>{leadingIcon}</span>
        )}

        {children && <span className={styles.label}>{children}</span>}

        {onRemove && (
          <span className={styles.clearSlot}>
            <InputClear
              size={INPUT_CLEAR_SIZE[size]}
              variant={variant}
              round
              onClick={handleRemoveClick}
              disabled={disabled}
              aria-label="Remove"
            />
          </span>
        )}
      </div>
    );

    if (!children && ariaLabel) {
      return (
        <Tooltip type="inverse" showTail={false} placement="top" label={ariaLabel}>
          {chip}
        </Tooltip>
      );
    }

    return chip;
  }
);

Chip.displayName = "Chip";
