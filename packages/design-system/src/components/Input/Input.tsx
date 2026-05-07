import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  type InputHTMLAttributes,
  type ReactNode,
  type ChangeEvent,
} from "react";
import { InputClear, type InputClearSize } from "../InputClear";
import { Icon } from "../Icon";
import { useScrollFade } from "../ScrollFade";
import { useFieldContext } from "../Fieldset/FieldContext";
import { useNumericInput } from "../../hooks/useNumericInput";
import styles from "./Input.module.css";
import { cx } from "../../utils/cx";

export type InputSize = "md" | "lg" | "xl";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
  error?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  suffix?: string;
  clearable?: boolean;
  onClear?: () => void;
  /** Enable numeric input mode */
  numeric?: boolean;
  /** Minimum allowed value (numeric mode) */
  min?: number;
  /** Maximum allowed value (numeric mode) */
  max?: number;
  /** Increment/decrement step (numeric mode, default 1) */
  step?: number;
  /** Fixed decimal places (numeric mode) */
  precision?: number;
  /** Format with thousand grouping separators (numeric mode) */
  thousandSeparator?: boolean;
  /** Show increment/decrement stepper buttons (numeric mode) */
  stepper?: boolean;
  /** Clamp value to min/max on blur (numeric mode, default true) */
  clampOnBlur?: boolean;
  /** Allow negative numbers (numeric mode, default: inferred from min) */
  allowNegative?: boolean;
}

const CLEAR_SIZE: Record<InputSize, InputClearSize> = {
  md: "sm",
  lg: "md",
  xl: "lg",
};

const STEPPER_ICON_SIZE: Record<InputSize, number> = {
  md: 12,
  lg: 12,
  xl: 16,
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      error = false,
      leadingIcon,
      trailingIcon,
      suffix,
      clearable = false,
      onClear,
      numeric = false,
      min,
      max,
      step,
      precision,
      thousandSeparator,
      stepper = false,
      clampOnBlur,
      allowNegative,
      disabled = false,
      readOnly = false,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      onKeyDown,
      className,
      id: idProp,
      "aria-describedby": ariaDescribedbyProp,
      ...rest
    },
    externalRef
  ) => {
    const fieldCtx = useFieldContext();
    const id = idProp ?? fieldCtx.inputId;
    const ariaDescribedby = ariaDescribedbyProp ?? fieldCtx.hintId;

    const innerRef = useRef<HTMLInputElement>(null);

    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof externalRef === "function") externalRef(node);
        else if (externalRef) externalRef.current = node;
      },
      [externalRef]
    );

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(
      String(defaultValue ?? "")
    );
    const currentValue = isControlled ? String(value) : internalValue;
    const hasValue = currentValue.length > 0;

    /* ── Numeric mode ──────────────────────────────────────────────── */

    const numericHook = useNumericInput({
      min,
      max,
      step,
      precision,
      thousandSeparator,
      clampOnBlur,
      allowNegative,
      value: isControlled ? (value as string | number | undefined) : undefined,
      defaultValue: isControlled ? undefined : (defaultValue as string | number | undefined),
      disabled,
      readOnly,
      onChange,
      onBlur,
      onFocus,
      onKeyDown,
    });

    const numericRefCallback = useCallback(
      (node: HTMLInputElement | null) => {
        setRef(node);
        numericHook.setInputRef(node);
      },
      [setRef, numericHook.setInputRef],
    );

    /* ── Scroll fades ──────────────────────────────────────────────── */

    const {
      showStart: showFadeStart,
      showEnd: showFadeEnd,
      refresh: refreshFades,
    } = useScrollFade(innerRef, "horizontal");

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;

      let rafId = 0;
      const schedule = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(refreshFades);
      };

      const events = ["scroll", "select", "focus", "blur", "input", "keydown", "keyup"];
      events.forEach((e) => el.addEventListener(e, schedule));

      return () => {
        cancelAnimationFrame(rafId);
        events.forEach((e) => el.removeEventListener(e, schedule));
      };
    }, [refreshFades]);

    const effectiveValue = numeric ? numericHook.displayValue : currentValue;

    useEffect(() => {
      requestAnimationFrame(refreshFades);
    }, [effectiveValue, refreshFades]);

    /* ── Text mode handlers ────────────────────────────────────────── */

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleClear = () => {
      if (numeric) {
        numericHook.inputProps.onChange({
          target: { value: "" },
        } as ChangeEvent<HTMLInputElement>);
      } else {
        if (!isControlled) {
          setInternalValue("");
          if (innerRef.current) innerRef.current.value = "";
        }
      }
      onClear?.();
      innerRef.current?.focus();
    };

    const handleWrapperClick = () => {
      innerRef.current?.focus();
    };

    const hasAnyValue = numeric
      ? numericHook.displayValue.length > 0
      : hasValue;

    /* ── Build native input props ──────────────────────────────────── */

    const nativeInputProps = numeric
      ? {
          ref: numericRefCallback,
          className: styles.nativeInput,
          id,
          "aria-describedby": ariaDescribedby,
          disabled,
          readOnly,
          ...numericHook.inputProps,
          ...rest,
        }
      : {
          ref: setRef,
          className: styles.nativeInput,
          id,
          "aria-describedby": ariaDescribedby,
          disabled,
          readOnly,
          value: isControlled ? value : undefined,
          defaultValue: isControlled ? undefined : defaultValue,
          onChange: handleChange,
          onBlur,
          onFocus,
          onKeyDown,
          ...rest,
        };

    return (
      <div
        className={cx(
          styles.wrapper,
          styles[size],
          error && styles.error,
          disabled && styles.disabled,
          readOnly && styles.readOnly,
          className
        )}
        onClick={handleWrapperClick}
      >
        <div className={styles.inputArea}>
          {leadingIcon && (
            <span className={styles.leadingIcon}>{leadingIcon}</span>
          )}
          <div className={styles.inputScrollWrapper}>
            <input {...nativeInputProps} />
            <div
              className={cx(
                styles.inputFade,
                styles.inputFadeStart,
                showFadeStart && styles.inputFadeVisible
              )}
              aria-hidden="true"
            />
            <div
              className={cx(
                styles.inputFade,
                styles.inputFadeEnd,
                showFadeEnd && styles.inputFadeVisible
              )}
              aria-hidden="true"
            />
          </div>
        </div>

        {trailingIcon && (
          <span className={styles.trailingIcon}>{trailingIcon}</span>
        )}

        {suffix && <span className={styles.suffix}>{suffix}</span>}

        {clearable && hasAnyValue && !disabled && !readOnly && (
          <span className={styles.clearSlot}>
            <InputClear
              size={CLEAR_SIZE[size]}
              variant="neutral"
              round
              onClick={handleClear}
              aria-label="Clear input"
            />
          </span>
        )}

        {numeric && stepper && (
          <span className={styles.stepperSlot}>
            <button
              type="button"
              className={cx(
                styles.stepperButton,
                (disabled || readOnly || !numericHook.canIncrement) && styles.stepperButtonDisabled,
              )}
              tabIndex={-1}
              aria-label="Increase value"
              disabled={disabled || readOnly || !numericHook.canIncrement}
              onClick={numericHook.increment}
            >
              <Icon name="arrow_chevron_up" size={STEPPER_ICON_SIZE[size]} />
            </button>
            <button
              type="button"
              className={cx(
                styles.stepperButton,
                (disabled || readOnly || !numericHook.canDecrement) && styles.stepperButtonDisabled,
              )}
              tabIndex={-1}
              aria-label="Decrease value"
              disabled={disabled || readOnly || !numericHook.canDecrement}
              onClick={numericHook.decrement}
            >
              <Icon name="arrow_chevron_down" size={STEPPER_ICON_SIZE[size]} />
            </button>
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
