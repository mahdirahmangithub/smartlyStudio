import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  type InputHTMLAttributes,
  type ChangeEvent,
} from "react";
import { Icon } from "../Icon";
import { useScrollFade } from "../ScrollFade";
import { useFieldContext } from "../Fieldset/FieldContext";
import styles from "./InlineInput.module.css";

export type InlineInputSize = "sm" | "lg";

export interface InlineInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InlineInputSize;
  /** Show the purple focus ring when focused (set false for table-cell usage) */
  focusIndicator?: boolean;
  /** Show the edit pencil icon on hover */
  hoverIndicator?: boolean;
  /** Shrink width to fit the current value (plus space for the edit indicator) */
  autoWidth?: boolean;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export const InlineInput = forwardRef<HTMLInputElement, InlineInputProps>(
  (
    {
      size = "sm",
      focusIndicator = true,
      hoverIndicator = true,
      autoWidth = false,
      disabled = false,
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
    const filled = currentValue.length > 0;
    const displayText = filled ? currentValue : (rest.placeholder ?? "");

    const {
      showStart: showFadeStart,
      showEnd: showFadeEnd,
      refresh: refreshFades,
    } = useScrollFade(innerRef, "horizontal");

    useEffect(() => {
      if (autoWidth) return;
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
    }, [autoWidth, refreshFades]);

    useEffect(() => {
      if (!autoWidth) requestAnimationFrame(refreshFades);
    }, [autoWidth, currentValue, refreshFades]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleWrapperClick = () => {
      innerRef.current?.focus();
    };

    return (
      <div
        className={cx(
          styles.wrapper,
          styles[size],
          filled && styles.filled,
          disabled && styles.disabled,
          focusIndicator && styles.withFocusIndicator,
          hoverIndicator && styles.withHoverIndicator,
          autoWidth && styles.autoWidth,
          className
        )}
        onClick={handleWrapperClick}
      >
        {autoWidth ? (
          <div className={styles.inputContainer}>
            <input
              ref={setRef}
              id={id}
              aria-describedby={ariaDescribedby}
              className={styles.nativeInput}
              disabled={disabled}
              value={isControlled ? value : undefined}
              defaultValue={isControlled ? undefined : defaultValue}
              onChange={handleChange}
              {...rest}
            />
            <span className={styles.measurer} aria-hidden="true">
              {displayText || "\u00A0"}
            </span>
          </div>
        ) : (
          <div className={styles.scrollWrapper}>
            <input
              ref={setRef}
              id={id}
              aria-describedby={ariaDescribedby}
              className={styles.nativeInput}
              disabled={disabled}
              value={isControlled ? value : undefined}
              defaultValue={isControlled ? undefined : defaultValue}
              onChange={handleChange}
              {...rest}
            />
            <div
              className={cx(
                styles.fade,
                styles.fadeStart,
                showFadeStart && styles.fadeVisible
              )}
              aria-hidden="true"
            />
            <div
              className={cx(
                styles.fade,
                styles.fadeEnd,
                showFadeEnd && styles.fadeVisible
              )}
              aria-hidden="true"
            />
          </div>
        )}

        {hoverIndicator && !disabled && (
          <div className={styles.editOverlay} aria-hidden="true">
            <Icon name="edit" size={size === "sm" ? 16 : 20} className={styles.editIcon} />
          </div>
        )}
      </div>
    );
  }
);

InlineInput.displayName = "InlineInput";
