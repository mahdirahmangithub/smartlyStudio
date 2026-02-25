import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { useFieldContext } from "../Fieldset/FieldContext";
import { InputClear, type InputClearSize } from "../InputClear";
import { Expander } from "../Expander";
import { Dropdown } from "../Dropdown";
import { useScrollFade } from "../ScrollFade";
import styles from "./SelectInput.module.css";

export type SelectInputSize = "md" | "lg" | "xl";

export interface SelectInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "children"> {
  size?: SelectInputSize;
  error?: boolean;
  leadingIcon?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  expanded?: boolean;
  onClose?: () => void;
  children?: ReactNode;
}

const CLEAR_SIZE: Record<SelectInputSize, InputClearSize> = {
  md: "sm",
  lg: "md",
  xl: "lg",
};

const EXPANDER_SIZE: Record<SelectInputSize, "sm" | "lg"> = {
  md: "sm",
  lg: "sm",
  xl: "lg",
};

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export const SelectInput = forwardRef<HTMLInputElement, SelectInputProps>(
  (
    {
      size = "lg",
      error = false,
      leadingIcon,
      clearable = false,
      onClear,
      expanded = false,
      onClose,
      children,
      disabled = false,
      readOnly = false,
      value,
      defaultValue,
      onChange,
      onClick,
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
    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownId = useId();

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

      const events = [
        "scroll",
        "select",
        "focus",
        "blur",
        "input",
        "keydown",
        "keyup",
      ];
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
      onClick?.({ target: innerRef.current } as React.MouseEvent<HTMLInputElement>);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if ((e.key === "ArrowDown" || e.key === "Enter") && children) {
        if (expanded) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            const panel = document.getElementById(dropdownId);
            if (panel) {
              const first = panel.querySelector<HTMLElement>(
                '[role="option"]:not([aria-disabled="true"])'
              );
              first?.focus({ focusVisible: true } as FocusOptions);
            }
          }
        } else {
          e.preventDefault();
          onClick?.({ target: innerRef.current } as React.MouseEvent<HTMLInputElement>);
        }
      }
      onKeyDown?.(e);
    };

    return (
      <>
        <div
          ref={wrapperRef}
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
                role="combobox"
                aria-describedby={ariaDescribedby}
                aria-expanded={expanded}
                aria-haspopup="listbox"
                aria-controls={expanded ? dropdownId : undefined}
                aria-autocomplete="list"
                disabled={disabled}
                readOnly={readOnly}
                value={isControlled ? value : undefined}
                defaultValue={isControlled ? undefined : defaultValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
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

          {clearable && hasValue && !disabled && !readOnly && (
            <span className={styles.clearSlot}>
              <InputClear
                size={CLEAR_SIZE[size]}
                variant="neutral"
                round
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                aria-label="Clear input"
              />
            </span>
          )}

          <Expander
            size={EXPANDER_SIZE[size]}
            expanded={expanded}
            emphasis="low"
            disabled={disabled || readOnly}
          />
        </div>

        {children && (
          <Dropdown
            id={dropdownId}
            open={expanded}
            onClose={onClose ?? (() => {})}
            anchorRef={wrapperRef}
            matchAnchorWidth
            autoFocus={false}
            returnFocusRef={innerRef}
          >
            {children}
          </Dropdown>
        )}
      </>
    );
  }
);

SelectInput.displayName = "SelectInput";
