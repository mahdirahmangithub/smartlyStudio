import { useFieldContext } from "../Fieldset/FieldContext";
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
  "aria-describedby"?: string;
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
  "aria-describedby": ariaDescribedbyProp,
}: RadioProps) {
  const fieldCtx = useFieldContext();
  const resolvedId = id ?? fieldCtx.inputId;
  const ariaDescribedby = ariaDescribedbyProp ?? fieldCtx.hintId;

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
        id={resolvedId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className={styles.circle} aria-hidden="true">
        {checked && <span className={styles.knob} />}
      </span>
    </span>
  );
}
