import { useEffect, useRef } from "react";
import { useFieldContext } from "../Fieldset/FieldContext";
import styles from "./Checkbox.module.css";
import { cx } from "../../utils/cx";

export type CheckboxSize = "sm" | "lg";

export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  error?: boolean;
  disabled?: boolean;
  size?: CheckboxSize;
  onChange?: (checked: boolean) => void;
  className?: string;
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}


export function Checkbox({
  checked = false,
  indeterminate = false,
  error = false,
  disabled = false,
  size = "sm",
  onChange,
  className,
  name,
  id,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedbyProp,
}: CheckboxProps) {
  const fieldCtx = useFieldContext();
  const resolvedId = id ?? fieldCtx.inputId;
  const ariaDescribedby = ariaDescribedbyProp ?? fieldCtx.hintId;

  const inputRef = useRef<HTMLInputElement>(null);
  const prevStateRef = useRef({ checked: false, indeterminate: false });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const isActive = checked || indeterminate;

  const prev = prevStateRef.current;
  const wasCheckedOnly = prev.checked && !prev.indeterminate;
  const wasIndeterminate = prev.indeterminate;

  let checkAnim: string | undefined;
  let dashAnim: string | undefined;

  if (wasCheckedOnly && indeterminate) {
    checkAnim = styles.checkPathRotateOut;
    dashAnim = styles.dashPathRotateIn;
  } else if (wasIndeterminate && checked && !indeterminate) {
    checkAnim = styles.checkPathRotateIn;
    dashAnim = styles.dashPathRotateOut;
  } else if (checked && !indeterminate) {
    checkAnim = styles.checkPathDrawIn;
  } else if (indeterminate) {
    dashAnim = styles.dashPathDrawIn;
  }

  useEffect(() => {
    prevStateRef.current = { checked, indeterminate };
  }, [checked, indeterminate]);

  return (
    <span
      className={cx(
        styles.checkbox,
        styles[size],
        isActive && styles.active,
        error && styles.error,
        disabled && styles.disabled,
        className
      )}
    >
      <input
        ref={inputRef}
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        name={name}
        id={resolvedId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className={styles.box} aria-hidden="true">
        {isActive && (
          <svg
            className={styles.icon}
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden="true"
          >
            <path
              className={cx(styles.checkPath, checkAnim)}
              d="M1.2 5.6L3.35 7.75L8.85 2.25"
              stroke="currentColor"
              strokeWidth="1.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className={cx(styles.dashPath, dashAnim)}
              d="M1.5 5H8.5"
              stroke="currentColor"
              strokeWidth="1.67"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </span>
  );
}

