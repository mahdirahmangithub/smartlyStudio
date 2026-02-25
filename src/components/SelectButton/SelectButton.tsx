import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Badge } from "../Badge";
import { Expander } from "../Expander";
import { useFieldContext } from "../Fieldset/FieldContext";
import styles from "./SelectButton.module.css";

export type SelectButtonSize = "sm" | "md" | "lg";
export type SelectButtonEmphasis = "medium" | "low";

export interface SelectButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  size?: SelectButtonSize;
  emphasis?: SelectButtonEmphasis;
  error?: boolean;
  expanded?: boolean;
  leadingIcon?: ReactNode;
  selectedCount?: number;
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const EXPANDER_SIZE: Record<SelectButtonSize, "sm" | "lg"> = {
  sm: "sm",
  md: "sm",
  lg: "lg",
};

const BADGE_SIZE: Record<SelectButtonSize, "sm" | "md"> = {
  sm: "sm",
  md: "md",
  lg: "md",
};

export const SelectButton = forwardRef<HTMLButtonElement, SelectButtonProps>(
  (
    {
      size = "md",
      emphasis = "medium",
      error = false,
      expanded = false,
      leadingIcon,
      selectedCount,
      children,
      className,
      disabled,
      htmlType = "button",
      id: idProp,
      "aria-describedby": ariaDescribedbyProp,
      ...rest
    },
    ref
  ) => {
    const fieldCtx = useFieldContext();
    const id = idProp ?? fieldCtx.inputId;
    const ariaDescribedby = ariaDescribedbyProp ?? fieldCtx.hintId;
    const showBadge = selectedCount !== undefined && selectedCount > 0;

    return (
      <button
        ref={ref}
        id={id}
        aria-describedby={ariaDescribedby}
        aria-expanded={expanded}
        aria-haspopup="listbox"
        type={htmlType}
        disabled={disabled}
        className={cx(
          styles.selectButton,
          styles[size],
          styles[emphasis],
          error && styles.error,
          className
        )}
        {...rest}
      >
        {leadingIcon && <span className={styles.iconWrap}>{leadingIcon}</span>}
        <span className={styles.label}>{children}</span>
        {showBadge && (
          <span className={styles.badgeSlot}>
            <Badge
              size={BADGE_SIZE[size]}
              variant={error ? "alert" : "brand"}
              emphasis="medium"
              round
            >
              {selectedCount}
            </Badge>
          </span>
        )}
        <Expander size={EXPANDER_SIZE[size]} expanded={expanded} />
      </button>
    );
  }
);

SelectButton.displayName = "SelectButton";
