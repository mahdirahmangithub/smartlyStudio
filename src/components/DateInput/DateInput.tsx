import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  useSegmentedInput,
  type SegmentDef,
} from "../../hooks/useSegmentedInput";
import { Icon } from "../Icon";
import { InputClear, type InputClearSize } from "../InputClear";
import { useFieldContext } from "../Fieldset/FieldContext";
import inputStyles from "../Input/Input.module.css";
import styles from "./DateInput.module.css";
import { cx } from "../../utils/cx";

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */

export type DateInputSize = "md" | "lg" | "xl";
export type DateInputFormat = "MM/DD/YYYY" | "DD/MM/YYYY";

export interface DateValue {
  month?: number | null;
  day?: number | null;
  year?: number | null;
}

export type DateValidationError =
  | "invalidDate"
  | "incomplete"
  | "minDate"
  | "maxDate"
  | "disablePast"
  | "disableFuture"
  | null;

export interface DateInputProps {
  size?: DateInputSize;
  format?: DateInputFormat;
  /** External error override. When provided, forces error styling regardless of validation. */
  error?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  suffix?: string;
  clearable?: boolean;
  onClear?: () => void;
  value?: DateValue;
  defaultValue?: DateValue;
  onChange?: (value: DateValue) => void;
  minDate?: DateValue;
  maxDate?: DateValue;
  disablePast?: boolean;
  disableFuture?: boolean;
  onValidationError?: (error: DateValidationError) => void;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   Segment definitions
   ═══════════════════════════════════════════════════════════════════════ */

const MONTH_DEF: SegmentDef = {
  kind: "numeric",
  sectionType: "month",
  placeholder: "MM",
  label: "Month",
  min: 1,
  max: 12,
  length: 2,
};

const DAY_DEF: SegmentDef = {
  kind: "numeric",
  sectionType: "day",
  placeholder: "DD",
  label: "Day",
  min: 1,
  max: 31,
  length: 2,
};

const YEAR_DEF: SegmentDef = {
  kind: "numeric",
  sectionType: "year",
  placeholder: "YYYY",
  label: "Year",
  min: 0,
  max: 9999,
  length: 4,
};

const DOT: SegmentDef = { kind: "literal", value: "." };

function buildSegments(format: DateInputFormat): SegmentDef[] {
  if (format === "DD/MM/YYYY") {
    return [DAY_DEF, DOT, MONTH_DEF, DOT, YEAR_DEF];
  }
  return [MONTH_DEF, DOT, DAY_DEF, DOT, YEAR_DEF];
}

function daysInMonth(month: number | null, year: number | null): number {
  if (month == null) return 31;
  if (year == null) {
    return [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month] ?? 31;
  }
  return new Date(year, month, 0).getDate();
}

const ICON_SIZE: Record<DateInputSize, number> = { md: 16, lg: 16, xl: 20 };
const CLEAR_SIZE: Record<DateInputSize, InputClearSize> = { md: "sm", lg: "md", xl: "lg" };

/* ═══════════════════════════════════════════════════════════════════════
   Validation
   ═══════════════════════════════════════════════════════════════════════ */

function isDateComplete(dv: DateValue): dv is Required<DateValue> & { month: number; day: number; year: number } {
  return dv.month != null && dv.day != null && dv.year != null;
}

function isDatePartiallyFilled(dv: DateValue): boolean {
  const filled = [dv.month, dv.day, dv.year].filter((v) => v != null).length;
  return filled > 0 && filled < 3;
}

/** Check if a month/day/year triple represents a real calendar date. */
function isValidCalendarDate(month: number, day: number, year: number): boolean {
  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

function dateValueToDate(dv: DateValue): Date | null {
  if (!isDateComplete(dv)) return null;
  if (!isValidCalendarDate(dv.month, dv.day, dv.year)) return null;
  return new Date(dv.year, dv.month - 1, dv.day);
}

function dateValueFromRequired(dv: DateValue): Date | null {
  if (!isDateComplete(dv)) return null;
  return new Date(dv.year, dv.month - 1, dv.day);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

interface ValidationProps {
  minDate?: DateValue;
  maxDate?: DateValue;
  disablePast?: boolean;
  disableFuture?: boolean;
}

function validateDateValue(
  dv: DateValue,
  isFocused: boolean,
  props: ValidationProps,
): DateValidationError {
  if (!isDateComplete(dv)) {
    if (isDatePartiallyFilled(dv) && !isFocused) return "incomplete";
    return null;
  }

  if (!isValidCalendarDate(dv.month, dv.day, dv.year)) return "invalidDate";

  const date = dateValueToDate(dv)!;
  const today = startOfDay(new Date());

  if (props.disablePast && date < today) return "disablePast";
  if (props.disableFuture && date > today) return "disableFuture";

  if (props.minDate) {
    const min = dateValueFromRequired(props.minDate);
    if (min && date < startOfDay(min)) return "minDate";
  }

  if (props.maxDate) {
    const max = dateValueFromRequired(props.maxDate);
    if (max && date > startOfDay(max)) return "maxDate";
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════ */

export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  (
    {
      size = "md",
      format = "MM/DD/YYYY",
      error: errorProp,
      disabled = false,
      readOnly = false,
      leadingIcon,
      trailingIcon,
      suffix,
      clearable = false,
      onClear,
      value,
      defaultValue,
      onChange,
      minDate,
      maxDate,
      disablePast,
      disableFuture,
      onValidationError,
      className,
      id: idProp,
      "aria-label": ariaLabel = "Date",
      "aria-describedby": ariaDescribedbyProp,
    },
    ref,
  ) => {
    const fieldCtx = useFieldContext();
    const id = idProp ?? fieldCtx.inputId;
    const ariaDescribedby = ariaDescribedbyProp ?? fieldCtx.hintId;

    const segmentDefs = useMemo(() => buildSegments(format), [format]);

    const typeToIdx = useMemo(() => {
      const map: Record<string, number> = {};
      segmentDefs.forEach((s, i) => {
        if (s.kind === "numeric" && s.sectionType) map[s.sectionType] = i;
      });
      return map;
    }, [segmentDefs]);

    const isControlled = value !== undefined;
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const onValidationErrorRef = useRef(onValidationError);
    onValidationErrorRef.current = onValidationError;

    const dateToStrings = useCallback(
      (dv: DateValue | undefined): string[] =>
        segmentDefs.map((seg) => {
          if (seg.kind !== "numeric" || !dv) return "";
          const v = dv[seg.sectionType as keyof DateValue];
          if (v == null) return "";
          return String(v).padStart(seg.length, "0");
        }),
      [segmentDefs],
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initialValues = useMemo(() => dateToStrings(isControlled ? value : defaultValue), []);

    const externalValues = useMemo(
      () => (isControlled ? dateToStrings(value) : undefined),
      [isControlled, value, dateToStrings],
    );

    const getMax = useCallback(
      (segIdx: number, currentValues: string[]): number | undefined => {
        const def = segmentDefs[segIdx];
        if (def.kind !== "numeric" || def.sectionType !== "day") return undefined;
        const monthStr = currentValues[typeToIdx.month];
        const yearStr = currentValues[typeToIdx.year];
        const month = monthStr ? parseInt(monthStr, 10) : null;
        const year = yearStr ? parseInt(yearStr, 10) : null;
        return daysInMonth(month, year);
      },
      [segmentDefs, typeToIdx],
    );

    const handleSectionsChange = useCallback(
      (values: string[]) => {
        if (!onChangeRef.current) return;
        const dv: DateValue = {};
        segmentDefs.forEach((seg, i) => {
          if (seg.kind !== "numeric" || !seg.sectionType) return;
          const str = values[i];
          const key = seg.sectionType as keyof DateValue;
          dv[key] = str !== "" ? parseInt(str, 10) : null;
        });
        onChangeRef.current(dv);
      },
      [segmentDefs],
    );

    const {
      segments,
      sectionValues,
      focusedIndex,
      getDisplayText,
      getSegmentProps,
      handleKeyDown,
      handleFocus,
      handleBlur,
      setRef: setSegRef,
      focusFirst,
    } = useSegmentedInput({
      segments: segmentDefs,
      separatorKeys: ["."],
      onSectionsChange: handleSectionsChange,
      getMax,
      initialValues,
      externalValues,
      disabled,
      readOnly,
    });

    // Derive current DateValue from sectionValues for validation
    const derivedDateValue = useMemo((): DateValue => {
      const dv: DateValue = {};
      segmentDefs.forEach((seg, i) => {
        if (seg.kind !== "numeric" || !seg.sectionType) return;
        const str = sectionValues[i];
        const key = seg.sectionType as keyof DateValue;
        dv[key] = str !== "" ? parseInt(str, 10) : null;
      });
      return dv;
    }, [segmentDefs, sectionValues]);

    const isFocused = focusedIndex != null;

    const validationError = useMemo(
      () =>
        validateDateValue(derivedDateValue, isFocused, {
          minDate,
          maxDate,
          disablePast,
          disableFuture,
        }),
      [derivedDateValue, isFocused, minDate, maxDate, disablePast, disableFuture],
    );

    const prevValidationError = useRef(validationError);
    useEffect(() => {
      if (validationError !== prevValidationError.current) {
        prevValidationError.current = validationError;
        onValidationErrorRef.current?.(validationError);
      }
    }, [validationError]);

    const hasError = errorProp ?? (validationError != null);
    const hasValue = sectionValues.some((v) => v !== "");

    const handleClear = useCallback(() => {
      onChangeRef.current?.({ month: null, day: null, year: null });
      onClear?.();
      focusFirst();
    }, [onClear, focusFirst]);

    const groupRef = useRef<HTMLDivElement>(null);

    const handleWrapperClick = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return;
        if (groupRef.current && !groupRef.current.contains(e.target as Node)) {
          focusFirst();
        }
      },
      [disabled, focusFirst],
    );

    const resolvedLeading =
      leadingIcon !== undefined
        ? leadingIcon
        : <Icon name="date_range" size={ICON_SIZE[size]} />;

    return (
      <div
        ref={ref}
        id={id}
        className={cx(
          inputStyles.wrapper,
          inputStyles[size],
          hasError && inputStyles.error,
          disabled && inputStyles.disabled,
          readOnly && inputStyles.readOnly,
          className,
        )}
        onClick={handleWrapperClick}
        aria-describedby={ariaDescribedby || undefined}
        aria-invalid={hasError || undefined}
      >
        <div className={inputStyles.inputArea}>
          {resolvedLeading && (
            <span className={inputStyles.leadingIcon}>{resolvedLeading}</span>
          )}

          <div
            ref={groupRef}
            role="group"
            aria-label={ariaLabel}
            className={cx(
              styles.segmentGroup,
              styles[size],
              disabled && styles.disabled,
              readOnly && styles.readOnly,
            )}
          >
            {segments.map((def, i) => {
              if (def.kind === "literal") {
                return (
                  <span key={i} className={styles.literal} aria-hidden="true">
                    {def.value}
                  </span>
                );
              }

              const segProps = getSegmentProps(i);
              return (
                <span
                  key={i}
                  ref={setSegRef(i)}
                  className={styles.segment}
                  {...segProps}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onFocus={() => handleFocus(i)}
                  onBlur={() => handleBlur(i)}
                >
                  {getDisplayText(i)}
                </span>
              );
            })}
          </div>
        </div>

        {trailingIcon && (
          <span className={inputStyles.trailingIcon}>{trailingIcon}</span>
        )}

        {suffix && <span className={inputStyles.suffix}>{suffix}</span>}

        {clearable && hasValue && !disabled && !readOnly && (
          <span className={inputStyles.clearSlot}>
            <InputClear
              size={CLEAR_SIZE[size]}
              variant="neutral"
              round
              onClick={handleClear}
              aria-label="Clear date"
            />
          </span>
        )}
      </div>
    );
  },
);

DateInput.displayName = "DateInput";
