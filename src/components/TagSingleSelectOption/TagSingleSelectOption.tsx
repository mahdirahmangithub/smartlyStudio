import { type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "../Icon";
import { OptionItemLeading } from "../OptionItemLeading";
import {
  OptionItemTrailing,
  type OptionItemTrailingProps,
} from "../OptionItemTrailing";
import { Tag, type TagType, type TagEmphasis } from "../Tag";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./TagSingleSelectOption.module.css";
import { cx } from "../../utils/cx";

export interface TagSingleSelectOptionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  checked?: boolean;
  disabled?: boolean;
  labelText?: string;
  description?: boolean;
  descriptionText?: string;
  /** Tag variant (color) */
  tagVariant?: TagType;
  /** Tag emphasis */
  tagEmphasis?: TagEmphasis;
  /** Content for the leading slot (e.g. an Icon) */
  leading?: ReactNode;
  /** Props forwarded to OptionItemTrailing */
  trailing?: Omit<OptionItemTrailingProps, "disabled">;
  onChange?: (checked: boolean) => void;
}


export function TagSingleSelectOption({
  checked = false,
  disabled = false,
  labelText = "Label",
  description = true,
  descriptionText = "Description",
  tagVariant = "neutral",
  tagEmphasis = "low",
  leading,
  trailing,
  onChange,
  className,
  ...rest
}: TagSingleSelectOptionProps) {
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
        role="option"
        aria-selected={checked}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        className={cx(
          styles.content,
          checked && styles.checked,
          disabled && styles.disabled
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
            <span ref={labelRef} className={styles.tagWrapper}>
              <Tag
                label={labelText}
                variant={tagVariant}
                emphasis={tagEmphasis}
                size="md"
                outline
              />
            </span>
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
