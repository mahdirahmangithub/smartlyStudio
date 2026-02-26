import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  type TextareaHTMLAttributes,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { useScrollFade } from "../ScrollFade";
import { useFieldContext } from "../Fieldset/FieldContext";
import styles from "./Textarea.module.css";

export type TextareaSize = "md" | "lg" | "xl";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  /** Visual size */
  size?: TextareaSize;
  /** Show error border */
  error?: boolean;
  /** Show the resize handle indicator */
  resize?: boolean;
  /** Auto-expand height to fit content, up to maxHeight */
  autoExpand?: boolean;
  /** Maximum height before content becomes scrollable */
  maxHeight?: number | string;
  /** Minimum height */
  minHeight?: number | string;
  /** Additional class on the root wrapper */
  className?: string;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = "md",
      error = false,
      resize = true,
      autoExpand = false,
      maxHeight,
      minHeight,
      disabled = false,
      readOnly = false,
      value,
      defaultValue,
      onChange,
      className,
      style,
      id: idProp,
      "aria-describedby": ariaDescribedbyProp,
      ...rest
    },
    externalRef,
  ) => {
    const fieldCtx = useFieldContext();
    const id = idProp ?? fieldCtx.inputId;
    const ariaDescribedby = ariaDescribedbyProp ?? fieldCtx.hintId;

    const innerRef = useRef<HTMLTextAreaElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [capped, setCapped] = useState(false);

    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        (innerRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof externalRef === "function") externalRef(node);
        else if (externalRef) (externalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [externalRef],
    );

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(String(defaultValue ?? ""));
    const currentValue = isControlled ? String(value) : internalValue;
    const hasContent = currentValue.length > 0;

    const {
      showStart: showFadeTop,
      showEnd: showFadeBottom,
      refresh: refreshFades,
    } = useScrollFade(innerRef, "vertical");

    const adjustHeight = useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoExpand) return;

      el.style.height = "auto";
      const scrollH = el.scrollHeight;

      if (maxHeight === undefined) {
        el.style.height = `${scrollH}px`;
        setCapped(false);
        return;
      }

      if (typeof maxHeight === "number") {
        const limit = maxHeight - 2;
        el.style.height = `${Math.min(scrollH, limit)}px`;
        setCapped(scrollH > limit);
      } else {
        el.style.height = `min(${scrollH}px, calc(${maxHeight} - 2px))`;
        setCapped(scrollH > el.clientHeight + 1);
      }
    }, [autoExpand, maxHeight]);

    useLayoutEffect(() => {
      adjustHeight();
    }, [currentValue, adjustHeight]);

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;

      let rafId = 0;
      const onScroll = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => refreshFades());
      };

      el.addEventListener("scroll", onScroll);
      return () => {
        cancelAnimationFrame(rafId);
        el.removeEventListener("scroll", onScroll);
      };
    }, [refreshFades]);

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;

      if (maxHeight !== undefined && el.selectionEnd === el.value.length) {
        el.scrollTop = el.scrollHeight;
      }

      refreshFades();
    }, [currentValue, maxHeight, refreshFades]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleWrapperClick = () => {
      innerRef.current?.focus();
    };

    const showResize = resize && !autoExpand && !disabled && !readOnly;
    const showFades = capped || (maxHeight !== undefined && !autoExpand);

    const wrapperStyle: CSSProperties = { ...style };
    const textareaStyle: CSSProperties = {};

    if (maxHeight !== undefined) {
      const mh = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
      wrapperStyle.maxHeight = mh;
      if (!autoExpand) textareaStyle.maxHeight = "100%";
    }
    if (minHeight !== undefined) {
      const mh = typeof minHeight === "number" ? `${minHeight}px` : minHeight;
      wrapperStyle.minHeight = mh;
    }

    return (
      <div
        ref={wrapperRef}
        className={cx(
          styles.wrapper,
          styles[size],
          error && styles.error,
          disabled && styles.disabled,
          readOnly && styles.readOnly,
          showResize && styles.resizable,
          autoExpand && styles.autoExpand,
          autoExpand && capped && styles.capped,
          className,
        )}
        style={wrapperStyle}
        onClick={handleWrapperClick}
      >
        <div className={styles.scrollWrapper}>
          <textarea
            ref={setRef}
            className={styles.nativeTextarea}
            id={id}
            aria-describedby={ariaDescribedby}
            aria-invalid={error || undefined}
            disabled={disabled}
            readOnly={readOnly}
            value={isControlled ? value : undefined}
            defaultValue={isControlled ? undefined : defaultValue}
            onChange={handleChange}
            style={textareaStyle}
            {...rest}
            rows={autoExpand ? 1 : rest.rows}
          />

          {showFades && (
            <>
              <div
                className={cx(
                  styles.fade,
                  styles.fadeTop,
                  showFadeTop && hasContent && styles.fadeVisible,
                )}
                aria-hidden="true"
              />
              <div
                className={cx(
                  styles.fade,
                  styles.fadeBottom,
                  showFadeBottom && hasContent && styles.fadeVisible,
                )}
                aria-hidden="true"
              />
            </>
          )}
        </div>

      </div>
    );
  },
);

Textarea.displayName = "Textarea";
