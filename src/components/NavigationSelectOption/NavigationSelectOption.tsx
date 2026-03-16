import { type HTMLAttributes, type ReactNode } from "react";
import { OptionItemLeading } from "../OptionItemLeading";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./NavigationSelectOption.module.css";
import { cx } from "../../utils/cx";

export interface NavigationSelectOptionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  disabled?: boolean;
  labelText?: string;
  /** Content for the leading slot (e.g. an Icon) */
  leading?: ReactNode;
  onClick?: () => void;
}


export function NavigationSelectOption({
  disabled = false,
  labelText = "Label",
  leading,
  onClick,
  className,
  ...rest
}: NavigationSelectOptionProps) {
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
        className={cx(styles.content, disabled && styles.disabled)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {leading && (
          <OptionItemLeading
            type="icon"
            disabled={disabled}
            className={styles.leading}
          >
            {leading}
          </OptionItemLeading>
        )}

        <div className={styles.text}>
          <Tooltip label={labelText} disabled={!isLabelTruncated} placement="top" type="neutral" showTail={false}>
            <span ref={labelRef} className={styles.label}>{labelText}</span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
