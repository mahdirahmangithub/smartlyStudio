import styles from "./Radio.module.css";

export type RadioSize = "sm" | "lg";

export interface RadioProps {
  checked?: boolean;
  error?: boolean;
  disabled?: boolean;
  size?: RadioSize;
  onChange?: (checked: boolean) => void;
  className?: string;
  name?: string;
  value?: string;
  id?: string;
  "aria-label"?: string;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Radio({
  checked = false,
  error = false,
  disabled = false,
  size = "sm",
  onChange,
  className,
  name,
  value,
  id,
  "aria-label": ariaLabel,
}: RadioProps) {
  return (
    <span
      className={cx(
        styles.radio,
        styles[size],
        checked && styles.checked,
        error && styles.error,
        disabled && styles.disabled,
        className
      )}
    >
      <input
        type="radio"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        name={name}
        value={value}
        id={id}
        aria-label={ariaLabel}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className={styles.circle} aria-hidden="true">
        {checked && <span className={styles.knob} />}
      </span>
    </span>
  );
}
