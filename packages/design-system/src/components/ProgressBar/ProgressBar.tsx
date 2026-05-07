import { forwardRef, useId, type HTMLAttributes } from "react";
import styles from "./ProgressBar.module.css";
import { cx } from "../../utils/cx";

export type ProgressBarType = "brand" | "neutral" | "info" | "error";

export interface ProgressBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Current progress value (0 – max). Omit for indeterminate mode. */
  value?: number;
  /** Maximum value. @default 100 */
  max?: number;
  /** Color type of the indicator. @default "brand" */
  type?: ProgressBarType;
  /** Label text shown top-left. Hidden if omitted. */
  label?: string;
  /** Whether to show the value text top-right. @default true when value is defined */
  showValue?: boolean;
  /** Custom formatter for the displayed value text. Receives the clamped value and max. */
  formatValue?: (value: number, max: number) => string;
  /** Custom accessible text for screen readers (aria-valuetext). */
  valueText?: string;
}

const TYPE_CLASS: Record<ProgressBarType, string> = {
  brand: styles.brand,
  neutral: styles.neutral,
  info: styles.info,
  error: styles.error,
};

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      type = "brand",
      label,
      showValue,
      formatValue,
      valueText,
      className,
      id,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const barId = id ? `${id}-bar` : `${autoId}-bar`;
    const labelId = id ? `${id}-label` : `${autoId}-label`;

    const isDeterminate = value !== undefined && value !== null;
    const safeMax = max > 0 ? max : 100;
    const clamped = isDeterminate
      ? Math.min(Math.max(0, value), safeMax)
      : 0;
    const pct = isDeterminate ? (clamped / safeMax) * 100 : 0;

    const shouldShowValue = showValue ?? isDeterminate;
    const displayValue = isDeterminate
      ? formatValue
        ? formatValue(clamped, safeMax)
        : `${Math.round(pct)}%`
      : undefined;

    const hasTextRow = !!label || shouldShowValue;

    const resolvedLabelledBy =
      ariaLabelledBy ?? (label ? labelId : undefined);

    const resolvedAriaLabel =
      !resolvedLabelledBy ? ariaLabel : undefined;

    if (import.meta.env.DEV) {
      if (!label && !ariaLabel && !ariaLabelledBy) {
        console.warn(
          "ProgressBar: missing accessible name. " +
            'Provide a `label`, `aria-label`, or `aria-labelledby` prop.'
        );
      }
    }

    return (
      <div
        ref={ref}
        className={cx(styles.root, TYPE_CLASS[type], className)}
        {...rest}
      >
        {hasTextRow && (
          <div className={styles.textRow}>
            {label && (
              <span id={labelId} className={styles.label}>
                {label}
              </span>
            )}
            {shouldShowValue && displayValue && (
              <span className={styles.value} aria-hidden="true">
                {displayValue}
              </span>
            )}
          </div>
        )}

        <div
          id={barId}
          className={cx(
            styles.track,
            !isDeterminate && styles.indeterminate
          )}
          role="progressbar"
          aria-valuenow={isDeterminate ? clamped : undefined}
          aria-valuemin={isDeterminate ? 0 : undefined}
          aria-valuemax={isDeterminate ? safeMax : undefined}
          aria-labelledby={resolvedLabelledBy}
          aria-label={
            resolvedAriaLabel ?? (resolvedLabelledBy ? undefined : "Progress")
          }
          aria-describedby={ariaDescribedBy}
          aria-valuetext={
            isDeterminate
              ? valueText ??
                (displayValue
                  ? formatValue
                    ? displayValue
                    : `${displayValue} complete`
                  : undefined)
              : undefined
          }
        >
          {isDeterminate && (
            <div
              className={styles.indicator}
              style={{ transform: `translateX(${pct - 100}%)` }}
            />
          )}
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";
