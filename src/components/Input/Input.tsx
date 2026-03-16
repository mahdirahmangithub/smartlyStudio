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
import { useScrollFade } from "../ScrollFade";
import { useFieldContext } from "../Fieldset/FieldContext";
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
}

const CLEAR_SIZE: Record<InputSize, InputClearSize> = {
  md: "sm",
  lg: "md",
  xl: "lg",
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
      disabled = false,
      readOnly = false,
      value,
      defaultValue,
      onChange,
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

    useEffect(() => {
      requestAnimationFrame(refreshFades);
    }, [currentValue, refreshFades]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue("");
        if (innerRef.current) innerRef.current.value = "";
      }
      onClear?.();
      innerRef.current?.focus();
    };

    const handleWrapperClick = () => {
      innerRef.current?.focus();
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
            <input
              ref={setRef}
              className={styles.nativeInput}
              id={id}
              aria-describedby={ariaDescribedby}
              disabled={disabled}
              readOnly={readOnly}
              value={isControlled ? value : undefined}
              defaultValue={isControlled ? undefined : defaultValue}
              onChange={handleChange}
              {...rest}
            />
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

        {clearable && hasValue && !disabled && !readOnly && (
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
      </div>
    );
  }
);

Input.displayName = "Input";
