import { forwardRef, type HTMLAttributes, type ReactNode, type MouseEvent, type KeyboardEvent } from "react";
import { Icon } from "../Icon";
import { InputClear, type InputClearSize } from "../InputClear";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./SelectChip.module.css";
import { cx } from "../../utils/cx";

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

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (onClick && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onClick(e as unknown as MouseEvent<HTMLDivElement>);
      }
    };

    const isInteractive = !!onClick && !disabled;
    const labelText = typeof children === "string" ? children : "";
    const [labelRef, isLabelTruncated] = useIsTruncated<HTMLSpanElement>(labelText);

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
        role={onClick ? "button" : undefined}
        onClick={disabled ? undefined : onClick}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        tabIndex={disabled ? undefined : 0}
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
        {...rest}
      >
        {leadingIcon && (
          <span className={styles.leadingIcon}>{leadingIcon}</span>
        )}

        <span className={styles.labelChevron}>
          {children && <span ref={labelRef} className={styles.label}>{children}</span>}
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

    const showTooltip = (!children && !!ariaLabel) || isLabelTruncated;
    const tooltipText = !children && ariaLabel ? ariaLabel : labelText;

    if (showTooltip) {
      return (
        <Tooltip type="inverse" showTail={false} placement="top" label={tooltipText}>
          {chip}
        </Tooltip>
      );
    }

    return chip;
  }
);

SelectChip.displayName = "SelectChip";
