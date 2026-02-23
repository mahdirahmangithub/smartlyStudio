import { type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "../Icon";
import { OptionItemLeading } from "../OptionItemLeading";
import {
  OptionItemTrailing,
  type OptionItemTrailingProps,
} from "../OptionItemTrailing";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./GenericSelectOption.module.css";

export interface GenericSelectOptionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  /** Destructive / danger variant */
  alert?: boolean;
  disabled?: boolean;
  labelText?: string;
  description?: boolean;
  descriptionText?: string;
  /** Content for the leading slot (e.g. an Icon) */
  leading?: ReactNode;
  /** Props forwarded to OptionItemTrailing */
  trailing?: Omit<OptionItemTrailingProps, "disabled">;
  /** Show a chevron_right icon indicating a sub-menu */
  subMenu?: boolean;
  onClick?: () => void;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function GenericSelectOption({
  alert = false,
  disabled = false,
  labelText = "Label",
  description = true,
  descriptionText = "Description",
  leading,
  trailing,
  subMenu = false,
  onClick,
  className,
  ...rest
}: GenericSelectOptionProps) {
  const [labelRef, isLabelTruncated] = useIsTruncated<HTMLSpanElement>(labelText);

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
          alert && styles.alert,
          disabled && styles.disabled
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {leading && (
          <OptionItemLeading
            type="icon"
            disabled={disabled}
            className={alert ? styles.alertLeading : undefined}
          >
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

        {subMenu && (
          <Icon name="chevron_right" size={16} className={styles.subMenuIcon} />
        )}
      </div>
    </div>
  );
}
