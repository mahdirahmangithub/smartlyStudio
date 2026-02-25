import type { ReactNode } from "react";
import { Hint, type HintSize } from "../Hint";
import styles from "./Label.module.css";

export type LabelSize = "sm" | "lg";
export type LabelDensity = "none" | "xs" | "sm" | "md";

export interface LabelProps {
  /** Label text content */
  label: string;
  /** Associate with an input via htmlFor */
  htmlFor?: string;
  /** Size variant */
  size?: LabelSize;
  /** Strong (medium weight) variant */
  strong?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Vertical density */
  density?: LabelDensity;
  /** Show leading icon */
  leadingIcon?: ReactNode;
  /** Show required asterisk */
  required?: boolean;
  /** Show "(Optional)" text */
  optional?: boolean;
  /** Show info Hint icon with tooltip */
  hint?: string;
  /** Description for the Hint tooltip */
  hintDescription?: string;
  /** Description text below the label */
  description?: string;
  /** Trailing action slot (e.g. an IconButton) */
  action?: ReactNode;
  /** HTML id for the <label> element — used for aria-labelledby associations. */
  id?: string;
  className?: string;
}

const DENSITY_CLASS: Record<LabelDensity, string | undefined> = {
  none: undefined,
  xs: styles.densityXs,
  sm: styles.densitySm,
  md: styles.densityMd,
};

const HINT_SIZE: Record<LabelSize, HintSize> = {
  sm: "xs",
  lg: "sm",
};

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Label({
  label,
  htmlFor,
  size = "sm",
  strong = false,
  disabled = false,
  density = "none",
  leadingIcon,
  required = false,
  optional = false,
  hint,
  hintDescription,
  description,
  action,
  id,
  className,
}: LabelProps) {
  return (
    <div
      className={cx(
        styles.label,
        styles[size],
        strong && styles.strong,
        disabled && styles.disabled,
        DENSITY_CLASS[density],
        className
      )}
    >
      <div className={styles.textArea}>
        <div className={styles.iconTextRow}>
          {leadingIcon && (
            <span className={styles.leadingIcon}>{leadingIcon}</span>
          )}

          <label id={id} htmlFor={htmlFor} className={styles.labelRow}>
            <span className={styles.labelInner}>
              <span className={styles.labelText}>{label}</span>
              {required && <span className={styles.required}>*</span>}
              {hint && (
                <span className={styles.hintInline}>
                  <Hint
                    size={HINT_SIZE[size]}
                    label={hint}
                    description={hintDescription}
                    disabled={disabled}
                  />
                </span>
              )}
              {optional && <span className={styles.optional}>(Optional)</span>}
            </span>
          </label>
        </div>

        {description && <p className={styles.description}>{description}</p>}
      </div>

      {action && !disabled && <span>{action}</span>}
    </div>
  );
}
