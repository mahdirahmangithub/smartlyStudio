import { type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "../Icon";
import { OptionItemLeading } from "../OptionItemLeading";
import {
  OptionItemTrailing,
  type OptionItemTrailingProps,
} from "../OptionItemTrailing";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./SingleSelectOption.module.css";
import { cx } from "../../utils/cx";

export interface SingleSelectOptionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  checked?: boolean;
  disabled?: boolean;
  labelText?: string;
  description?: boolean;
  descriptionText?: string;
  /** Content for the leading slot (e.g. an Icon) */
  leading?: ReactNode;
  /** Props forwarded to OptionItemTrailing */
  trailing?: Omit<OptionItemTrailingProps, "disabled">;
  /** When true, omits the focus-visible ring (hover/press backgrounds unchanged). */
  hideFocusRing?: boolean;
  /** `id` on the interactive row (e.g. `aria-activedescendant` target). */
  optionId?: string;
  /** Highlights the row (combobox / listbox active descendant). */
  isActive?: boolean;
  /**
   * When true, row is not in the tab order (`tabIndex={-1}`) — host keeps
   * focus (e.g. combobox input owns keystrokes; this option is highlighted
   * via `aria-activedescendant` only).
   */
  unmanagedFocus?: boolean;
  onChange?: (checked: boolean) => void;
}


export function SingleSelectOption({
  checked = false,
  disabled = false,
  labelText = "Label",
  description = true,
  descriptionText = "Description",
  leading,
  trailing,
  hideFocusRing = true,
  optionId,
  isActive = false,
  unmanagedFocus = false,
  onChange,
  className,
  ...rest
}: SingleSelectOptionProps) {
  const handleClick = () => {
    if (!disabled) onChange?.(!checked);
  };

  const [labelRef, isLabelTruncated] = useIsTruncated<HTMLSpanElement>(labelText);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange?.(!checked);
    }
  };

  return (
    <div className={cx(styles.option, className)} {...rest}>
      <div
        id={optionId}
        role="option"
        aria-selected={checked}
        aria-disabled={disabled || undefined}
        tabIndex={disabled || unmanagedFocus ? -1 : 0}
        className={cx(
          styles.content,
          checked && styles.checked,
          disabled && styles.disabled,
          hideFocusRing && styles.noFocusRing,
          isActive && styles.active
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {leading && (
          <OptionItemLeading type="icon" disabled={disabled}>
            {leading}
          </OptionItemLeading>
        )}

        <div className={styles.text}>
          <Tooltip label={labelText} disabled={!isLabelTruncated} placement="top" type="neutral" showTail={false}>
            <span ref={labelRef} className={styles.label}>{labelText}</span>
          </Tooltip>
          {description && (
            <span className={styles.description}>{descriptionText}</span>
          )}
        </div>

        {trailing && <OptionItemTrailing {...trailing} disabled={disabled} />}

        {checked && (
          <Icon name="check" size={20} className={styles.checkIcon} />
        )}
      </div>
    </div>
  );
}
