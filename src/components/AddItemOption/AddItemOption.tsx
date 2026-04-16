import { type HTMLAttributes } from "react";
import { Icon } from "../Icon";
import styles from "./AddItemOption.module.css";
import { cx } from "../../utils/cx";

export interface AddItemOptionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  disabled?: boolean;
  /** The prefix label shown before the item text */
  labelText?: string;
  /** Raw user-entered value from the select input — displayed wrapped in curly quotes */
  itemText?: string;
  /** Adjusts left padding to align with multi-select option rows that have a checkbox */
  multiSelect?: boolean;
  /** When true, omits the focus-visible ring (hover/press backgrounds unchanged). */
  hideFocusRing?: boolean;
  onClick?: () => void;
}


export function AddItemOption({
  disabled = false,
  labelText = "Add",
  itemText = "Item",
  multiSelect = false,
  hideFocusRing = true,
  onClick,
  className,
  ...rest
}: AddItemOptionProps) {
  const handleClick = () => {
    if (!disabled) onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div className={cx(styles.option, className)} {...rest}>
      <div
        role="option"
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        className={cx(
          styles.content,
          multiSelect && styles.multiSelect,
          disabled && styles.disabled,
          hideFocusRing && styles.noFocusRing
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <Icon
          name="add_circle_fill"
          size={24}
          className={styles.leadingIcon}
        />

        <div className={styles.text}>
          <div className={styles.label}>
            <span className={styles.labelPrefix}>{labelText}</span>
            <span className={styles.itemText}>{`\u201C${itemText}\u201D`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
