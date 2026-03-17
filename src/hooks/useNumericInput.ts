import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ClipboardEvent,
  type FocusEvent,
} from "react";

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */

export interface UseNumericInputOptions {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  thousandSeparator?: boolean;
  clampOnBlur?: boolean;
  allowNegative?: boolean;
  value?: string | number;
  defaultValue?: string | number;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export interface UseNumericInputReturn {
  displayValue: string;
  numericValue: number | null;
  inputProps: {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    onPaste: (e: ClipboardEvent<HTMLInputElement>) => void;
    onBlur: (e: FocusEvent<HTMLInputElement>) => void;
    onFocus: (e: FocusEvent<HTMLInputElement>) => void;
    inputMode: "numeric" | "decimal";
    type: "text";
  };
  canIncrement: boolean;
  canDecrement: boolean;
  increment: () => void;
  decrement: () => void;
  setInputRef: (el: HTMLInputElement | null) => void;
}

/* ═══════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════ */

function roundToPrecision(num: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
}

function formatDisplay(
  raw: string,
  precision: number | undefined,
  thousandSeparator: boolean,
): string {
  if (raw === "" || raw === "-") return raw;

  const num = parseFloat(raw);
  if (isNaN(num)) return raw;

  const opts: Intl.NumberFormatOptions = {
    useGrouping: thousandSeparator,
  };

  if (precision != null) {
    opts.minimumFractionDigits = precision;
    opts.maximumFractionDigits = precision;
  }

  return new Intl.NumberFormat("en-US", opts).format(num);
}

function stripFormatting(formatted: string): string {
  return formatted.replace(/,/g, "");
}

function clamp(value: number, min?: number, max?: number): number {
  let result = value;
  if (min != null && result < min) result = min;
  if (max != null && result > max) result = max;
  return result;
}

function buildFilterRegex(
  allowNeg: boolean,
  allowDecimal: boolean,
): RegExp {
  if (allowNeg && allowDecimal) return /^-?(\d+\.?\d*)?$/;
  if (allowNeg) return /^-?\d*$/;
  if (allowDecimal) return /^(\d+\.?\d*)?$/;
  return /^\d*$/;
}

/* ═══════════════════════════════════════════════════════════════════════
   Hook
   ═══════════════════════════════════════════════════════════════════════ */

export function useNumericInput({
  min,
  max,
  step = 1,
  precision,
  thousandSeparator = false,
  clampOnBlur = true,
  allowNegative,
  value: externalValue,
  defaultValue,
  disabled = false,
  readOnly = false,
  onChange: externalOnChange,
  onBlur: externalOnBlur,
  onFocus: externalOnFocus,
  onKeyDown: externalOnKeyDown,
}: UseNumericInputOptions): UseNumericInputReturn {
  const allowNeg = allowNegative ?? (min == null || min < 0);
  const allowDecimal = precision == null || precision > 0;
  const filterRegex = buildFilterRegex(allowNeg, allowDecimal);

  const isControlled = externalValue !== undefined;
  const initialRaw = defaultValue != null ? String(defaultValue) : "";

  const [internalRaw, setInternalRaw] = useState(initialRaw);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // The "raw" value: either from controlled prop or internal state
  const controlledRaw = isControlled ? String(externalValue) : internalRaw;
  const rawValue = focused ? controlledRaw : controlledRaw;

  const numericValue = rawValue === "" || rawValue === "-"
    ? null
    : parseFloat(stripFormatting(rawValue));

  const canIncrement = numericValue == null || max == null || numericValue < max;
  const canDecrement = numericValue == null || min == null || numericValue > min;

  // Formatted display: only when NOT focused
  const displayValue = focused
    ? stripFormatting(controlledRaw)
    : formatDisplay(stripFormatting(controlledRaw), precision, thousandSeparator);

  const externalOnChangeRef = useRef(externalOnChange);
  externalOnChangeRef.current = externalOnChange;
  const externalOnBlurRef = useRef(externalOnBlur);
  externalOnBlurRef.current = externalOnBlur;
  const externalOnFocusRef = useRef(externalOnFocus);
  externalOnFocusRef.current = externalOnFocus;
  const externalOnKeyDownRef = useRef(externalOnKeyDown);
  externalOnKeyDownRef.current = externalOnKeyDown;

  /* ── Fire synthetic change event ─────────────────────────────────── */

  const fireChange = useCallback(
    (newRaw: string) => {
      if (!isControlled) setInternalRaw(newRaw);

      const el = inputRef.current;
      if (el && externalOnChangeRef.current) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        nativeInputValueSetter?.call(el, newRaw);
        const syntheticEvent = new Event("input", { bubbles: true });
        el.dispatchEvent(syntheticEvent);
      }
    },
    [isControlled],
  );

  /* ── Adjust by delta ─────────────────────────────────────────────── */

  const adjust = useCallback(
    (delta: number) => {
      if (disabled || readOnly) return;

      const current = rawValue === "" || rawValue === "-"
        ? 0
        : parseFloat(stripFormatting(rawValue));

      if (isNaN(current)) return;

      let next = roundToPrecision(current + delta, precision ?? 10);
      next = clamp(next, min, max);

      const nextStr = precision != null
        ? next.toFixed(precision)
        : String(next);

      fireChange(nextStr);
    },
    [disabled, readOnly, rawValue, min, max, precision, fireChange],
  );

  const increment = useCallback(() => adjust(step), [adjust, step]);
  const decrement = useCallback(() => adjust(-step), [adjust, step]);

  /* ── onChange: filter input ──────────────────────────────────────── */

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = stripFormatting(e.target.value);

      if (!filterRegex.test(raw)) return;

      // Enforce precision: don't allow more decimal places than precision
      if (precision != null && raw.includes(".")) {
        const decimalPart = raw.split(".")[1];
        if (decimalPart && decimalPart.length > precision) return;
      }

      if (!isControlled) setInternalRaw(raw);
      externalOnChangeRef.current?.(e);
    },
    [filterRegex, precision, isControlled],
  );

  /* ── onKeyDown: stepping ─────────────────────────────────────────── */

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      externalOnKeyDownRef.current?.(e);
      if (e.defaultPrevented) return;

      const multiplier = e.shiftKey ? 10 : 1;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          adjust(step * multiplier);
          break;
        case "ArrowDown":
          e.preventDefault();
          adjust(-step * multiplier);
          break;
        case "PageUp":
          e.preventDefault();
          adjust(step * 10);
          break;
        case "PageDown":
          e.preventDefault();
          adjust(-step * 10);
          break;
        case "Home":
          if (min != null) {
            e.preventDefault();
            const minStr = precision != null ? min.toFixed(precision) : String(min);
            fireChange(minStr);
          }
          break;
        case "End":
          if (max != null) {
            e.preventDefault();
            const maxStr = precision != null ? max.toFixed(precision) : String(max);
            fireChange(maxStr);
          }
          break;
      }
    },
    [step, min, max, precision, adjust, fireChange],
  );

  /* ── onPaste: strip non-numeric chars ────────────────────────────── */

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (disabled || readOnly) return;

      const text = e.clipboardData.getData("text/plain").trim();
      const stripped = stripFormatting(text).replace(/[^0-9.\-]/g, "");

      if (!filterRegex.test(stripped)) return;

      if (precision != null && stripped.includes(".")) {
        const parts = stripped.split(".");
        const truncated = parts[0] + "." + parts[1].slice(0, precision);
        fireChange(truncated);
      } else {
        fireChange(stripped);
      }
    },
    [disabled, readOnly, filterRegex, precision, fireChange],
  );

  /* ── onBlur: format + clamp ──────────────────────────────────────── */

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setFocused(false);

      const raw = stripFormatting(controlledRaw);
      if (raw !== "" && raw !== "-") {
        let num = parseFloat(raw);
        if (!isNaN(num)) {
          if (clampOnBlur) num = clamp(num, min, max);
          if (precision != null) num = roundToPrecision(num, precision);

          const clamped = precision != null ? num.toFixed(precision) : String(num);
          if (clamped !== raw) {
            fireChange(clamped);
          }
        }
      }

      externalOnBlurRef.current?.(e);
    },
    [controlledRaw, clampOnBlur, min, max, precision, fireChange],
  );

  /* ── onFocus: show raw value for editing ─────────────────────────── */

  const handleFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      externalOnFocusRef.current?.(e);
    },
    [],
  );

  /* ── Ref callback to capture input element ───────────────────────── */

  const setInputRef = useCallback((el: HTMLInputElement | null) => {
    inputRef.current = el;
  }, []);

  return {
    displayValue,
    numericValue,
    inputProps: {
      value: displayValue,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onPaste: handlePaste,
      onBlur: handleBlur,
      onFocus: handleFocus,
      inputMode: allowDecimal ? "decimal" : "numeric",
      type: "text" as const,
    },
    canIncrement,
    canDecrement,
    increment,
    decrement,
    setInputRef,
  };
}
