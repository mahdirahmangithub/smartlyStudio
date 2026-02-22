import {
  forwardRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type MouseEvent,
} from "react";
import { InputClear, type InputClearSize } from "../InputClear";
import { Tooltip } from "../Tooltip";
import styles from "./ToggleChip.module.css";

export type ToggleChipSize = "sm" | "md" | "lg";
export type ToggleChipEmphasis = "medium" | "low";

export interface ToggleChipProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  size?: ToggleChipSize;
  emphasis?: ToggleChipEmphasis;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  leadingIcon?: ReactNode;
  "aria-label"?: string;
  onRemove?: () => void;
  disabled?: boolean;
}

const INPUT_CLEAR_SIZE: Record<ToggleChipSize, InputClearSize> = {
  sm: "xs",
  md: "sm",
  lg: "md",
};

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export const ToggleChip = forwardRef<HTMLDivElement, ToggleChipProps>(
  (
    {
      size = "md",
      emphasis = "medium",
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
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
    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const checked = isControlled ? controlledChecked : internalChecked;

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (!isControlled) {
        setInternalChecked((prev) => !prev);
      }
      onChange?.(!checked);
      onClick?.(e);
    };

    const handleRemoveClick = (e: MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    const inputClearVariant = checked ? "brand" : "neutral";

    const chip = (
      <div
        ref={ref}
        role="button"
        aria-pressed={checked}
        tabIndex={disabled ? undefined : 0}
        className={cx(
          styles.toggleChip,
          styles[size],
          styles[emphasis],
          checked && styles.checked,
          disabled && styles.disabled,
          className
        )}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick(e as unknown as MouseEvent<HTMLDivElement>);
          }
        }}
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
              variant={inputClearVariant}
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

ToggleChip.displayName = "ToggleChip";
