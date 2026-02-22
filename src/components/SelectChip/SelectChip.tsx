import { forwardRef, type HTMLAttributes, type ReactNode, type MouseEvent } from "react";
import { Icon } from "../Icon";
import { InputClear, type InputClearSize } from "../InputClear";
import { Tooltip } from "../Tooltip";
import styles from "./SelectChip.module.css";

export type SelectChipSize = "sm" | "md" | "lg";
export type SelectChipType = "neutral" | "brand" | "info" | "success" | "warning" | "alert";
export type SelectChipEmphasis = "medium" | "low";

export interface SelectChipProps extends HTMLAttributes<HTMLDivElement> {
  size?: SelectChipSize;
  variant?: SelectChipType;
  emphasis?: SelectChipEmphasis;
  leadingIcon?: ReactNode;
  "aria-label"?: string;
  open?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
}

const INPUT_CLEAR_SIZE: Record<SelectChipSize, InputClearSize> = {
  sm: "xs",
  md: "sm",
  lg: "md",
};

const ICON_SIZE: Record<SelectChipSize, number> = {
  sm: 16,
  md: 16,
  lg: 20,
};

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export const SelectChip = forwardRef<HTMLDivElement, SelectChipProps>(
  (
    {
      size = "md",
      variant = "neutral",
      emphasis = "medium",
      leadingIcon,
      "aria-label": ariaLabel,
      open = false,
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
          styles.selectChip,
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

        <span className={styles.labelChevron}>
          {children && <span className={styles.label}>{children}</span>}
          <span className={cx(styles.expander, open && styles.open)}>
            <Icon name="arrow_chevron_down" size={ICON_SIZE[size]} />
          </span>
        </span>

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

SelectChip.displayName = "SelectChip";
