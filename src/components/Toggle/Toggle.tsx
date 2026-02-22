import { useEffect, useRef } from "react";
import styles from "./Toggle.module.css";

export type ToggleSize = "sm" | "lg";

export interface ToggleProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  size?: ToggleSize;
  onChange?: (checked: boolean) => void;
  className?: string;
  name?: string;
  id?: string;
  "aria-label"?: string;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Toggle({
  checked = false,
  indeterminate = false,
  disabled = false,
  size = "sm",
  onChange,
  className,
  name,
  id,
  "aria-label": ariaLabel,
}: ToggleProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const isActive = checked || indeterminate;

  return (
    <span
      className={cx(
        styles.toggle,
        styles[size],
        isActive && styles.active,
        checked && !indeterminate && styles.checked,
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
        id={id}
        aria-label={ariaLabel}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className={styles.track} aria-hidden="true">
        {!indeterminate && <span className={styles.knob} />}
        {indeterminate && <span className={styles.dash} />}
      </span>
    </span>
  );
}
