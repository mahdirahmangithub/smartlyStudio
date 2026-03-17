import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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
import styles from "./TimeInput.module.css";
import { cx } from "../../utils/cx";

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */

export type TimeInputSize = "md" | "lg" | "xl";
export type TimeInputFormat = "HH:mm" | "hh:mm aa";
export type Meridiem = "AM" | "PM";

export interface TimeValue {
  hours?: number | null;
  minutes?: number | null;
}

export type TimeValidationError =
  | "invalidTime"
  | "incomplete"
  | "minTime"
  | "maxTime"
  | null;

export interface TimeInputProps {
  size?: TimeInputSize;
  format?: TimeInputFormat;
  error?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  suffix?: string;
  clearable?: boolean;
  onClear?: () => void;
  value?: TimeValue;
  defaultValue?: TimeValue;
  onChange?: (value: TimeValue) => void;
  minTime?: TimeValue;
  maxTime?: TimeValue;
  onValidationError?: (error: TimeValidationError) => void;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   Segment definitions
   ═══════════════════════════════════════════════════════════════════════ */

const HOURS_24: SegmentDef = {
  kind: "numeric",
  sectionType: "hours",
  placeholder: "HH",
  label: "Hours",
  min: 0,
  max: 23,
  length: 2,
};

const HOURS_12: SegmentDef = {
  kind: "numeric",
  sectionType: "hours",
  placeholder: "hh",
  label: "Hours",
  min: 1,
  max: 12,
  length: 2,
};

const MINUTES_DEF: SegmentDef = {
  kind: "numeric",
  sectionType: "minutes",
  placeholder: "mm",
  label: "Minutes",
  min: 0,
  max: 59,
  length: 2,
};

const COLON: SegmentDef = { kind: "literal", value: ":" };

function buildSegments(format: TimeInputFormat): SegmentDef[] {
  if (format === "hh:mm aa") {
    return [HOURS_12, COLON, MINUTES_DEF];
  }
  return [HOURS_24, COLON, MINUTES_DEF];
}

/* ═══════════════════════════════════════════════════════════════════════
   12h ↔ 24h conversion
   ═══════════════════════════════════════════════════════════════════════ */

function to12h(hours24: number): { display: number; meridiem: Meridiem } {
  if (hours24 === 0) return { display: 12, meridiem: "AM" };
  if (hours24 < 12) return { display: hours24, meridiem: "AM" };
  if (hours24 === 12) return { display: 12, meridiem: "PM" };
  return { display: hours24 - 12, meridiem: "PM" };
}

function to24h(display12: number, meridiem: Meridiem): number {
  if (meridiem === "AM") return display12 === 12 ? 0 : display12;
  return display12 === 12 ? 12 : display12 + 12;
}

const ICON_SIZE: Record<TimeInputSize, number> = { md: 16, lg: 16, xl: 20 };
const CLEAR_SIZE: Record<TimeInputSize, InputClearSize> = { md: "sm", lg: "md", xl: "lg" };

/* ═══════════════════════════════════════════════════════════════════════
   Validation
   ═══════════════════════════════════════════════════════════════════════ */

function isTimeComplete(tv: TimeValue): tv is { hours: number; minutes: number } {
  return tv.hours != null && tv.minutes != null;
}

function isTimePartiallyFilled(tv: TimeValue): boolean {
  const filled = [tv.hours, tv.minutes].filter((v) => v != null).length;
  return filled > 0 && filled < 2;
}

function timeToMinutes(tv: TimeValue): number {
  return (tv.hours ?? 0) * 60 + (tv.minutes ?? 0);
}

interface TimeValidationProps {
  minTime?: TimeValue;
  maxTime?: TimeValue;
}

function validateTimeValue(
  tv: TimeValue,
  isFocused: boolean,
  meridiemIncomplete: boolean,
  props: TimeValidationProps,
): TimeValidationError {
  if (!isTimeComplete(tv) || meridiemIncomplete) {
    const anyFilled = isTimePartiallyFilled(tv) || (isTimeComplete(tv) && meridiemIncomplete);
    if (anyFilled && !isFocused) return "incomplete";
    return null;
  }

  if (tv.hours < 0 || tv.hours > 23 || tv.minutes < 0 || tv.minutes > 59) {
    return "invalidTime";
  }

  const mins = timeToMinutes(tv);

  if (props.minTime && isTimeComplete(props.minTime)) {
    if (mins < timeToMinutes(props.minTime)) return "minTime";
  }

  if (props.maxTime && isTimeComplete(props.maxTime)) {
    if (mins > timeToMinutes(props.maxTime)) return "maxTime";
  }

  return null;
}

/* ═══════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════ */

export const TimeInput = forwardRef<HTMLDivElement, TimeInputProps>(
  (
    {
      size = "md",
      format = "HH:mm",
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
      minTime,
      maxTime,
      onValidationError,
      className,
      id: idProp,
      "aria-label": ariaLabel = "Time",
      "aria-describedby": ariaDescribedbyProp,
    },
    ref,
  ) => {
    const fieldCtx = useFieldContext();
    const id = idProp ?? fieldCtx.inputId;
    const ariaDescribedby = ariaDescribedbyProp ?? fieldCtx.hintId;

    const is12h = format === "hh:mm aa";
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

    /* ── Meridiem state (12h only) ───────────────────────────────── */

    const initMeridiem = (): Meridiem | null => {
      const src = isControlled ? value : defaultValue;
      if (!is12h || src?.hours == null) return null;
      return src.hours >= 12 ? "PM" : "AM";
    };

    const [meridiem, setMeridiemState] = useState<Meridiem | null>(initMeridiem);
    const meridiemRef = useRef(meridiem);
    meridiemRef.current = meridiem;
    const meridiemElRef = useRef<HTMLSpanElement>(null);
    const [meridiemFocused, setMeridiemFocused] = useState(false);

    const setMeridiem = useCallback((m: Meridiem | null) => {
      setMeridiemState(m);
      meridiemRef.current = m;
    }, []);

    // Sync meridiem from controlled value only when hours is set,
    // so user-driven AM/PM changes aren't overwritten while hours is still empty.
    if (isControlled && is12h && value?.hours != null) {
      const expectedMeridiem = value.hours >= 12 ? "PM" : "AM";
      if (expectedMeridiem !== meridiem) {
        setMeridiem(expectedMeridiem);
      }
    }

    /* ── Convert TimeValue ↔ segment strings ─────────────────────── */

    const timeToStrings = useCallback(
      (tv: TimeValue | undefined): string[] =>
        segmentDefs.map((seg) => {
          if (seg.kind !== "numeric" || !tv) return "";
          if (seg.sectionType === "hours") {
            if (tv.hours == null) return "";
            const display = is12h ? to12h(tv.hours).display : tv.hours;
            return String(display).padStart(seg.length, "0");
          }
          if (seg.sectionType === "minutes") {
            if (tv.minutes == null) return "";
            return String(tv.minutes).padStart(seg.length, "0");
          }
          return "";
        }),
      [segmentDefs, is12h],
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initialValues = useMemo(() => timeToStrings(isControlled ? value : defaultValue), []);

    const externalValues = useMemo(
      () => (isControlled ? timeToStrings(value) : undefined),
      [isControlled, value, timeToStrings],
    );

    const prevHoursStr = useRef(initialValues[typeToIdx.hours] ?? "");

    const handleSectionsChange = useCallback(
      (values: string[]) => {
        const hoursStr = values[typeToIdx.hours] ?? "";
        const minutesStr = values[typeToIdx.minutes] ?? "";

        // Auto-set meridiem when hours first becomes non-empty
        if (is12h && hoursStr !== "" && prevHoursStr.current === "" && meridiemRef.current == null) {
          const currentHour = new Date().getHours();
          setMeridiem(currentHour >= 12 ? "PM" : "AM");
        }
        prevHoursStr.current = hoursStr;

        if (!onChangeRef.current) return;

        const tv: TimeValue = {
          hours: null,
          minutes: minutesStr !== "" ? parseInt(minutesStr, 10) : null,
        };

        if (hoursStr !== "") {
          const displayHours = parseInt(hoursStr, 10);
          if (is12h && meridiemRef.current != null) {
            tv.hours = to24h(displayHours, meridiemRef.current);
          } else if (!is12h) {
            tv.hours = displayHours;
          }
        }

        onChangeRef.current(tv);
      },
      [segmentDefs, typeToIdx, is12h, setMeridiem],
    );

    const {
      segments,
      sectionValues,
      focusedIndex,
      getDisplayText,
      getSegmentProps,
      handleKeyDown: hookKeyDown,
      handleFocus,
      handleBlur,
      setRef: setSegRef,
      focusFirst,
      focusSegment,
      setAllValues,
    } = useSegmentedInput({
      segments: segmentDefs,
      separatorKeys: [":"],
      onSectionsChange: handleSectionsChange,
      initialValues,
      externalValues,
      disabled,
      readOnly,
    });

    /* ── Segment keydown wrapper (for 12h ArrowRight→meridiem) ──── */

    const minutesIdx = typeToIdx.minutes;

    const handleSegmentKeyDown = useCallback(
      (segIdx: number, e: React.KeyboardEvent) => {
        if (is12h && segIdx === minutesIdx && e.key === "ArrowRight") {
          e.preventDefault();
          meridiemElRef.current?.focus();
          return;
        }
        hookKeyDown(segIdx, e);
      },
      [is12h, minutesIdx, hookKeyDown],
    );

    /* ── Meridiem keydown handler ────────────────────────────────── */

    const fireMeridiemChange = useCallback(
      (newMeridiem: Meridiem | null) => {
        setMeridiem(newMeridiem);
        if (!onChangeRef.current) return;

        const hoursStr = sectionValues[typeToIdx.hours] ?? "";
        const minutesStr = sectionValues[typeToIdx.minutes] ?? "";
        const tv: TimeValue = {
          hours: null,
          minutes: minutesStr !== "" ? parseInt(minutesStr, 10) : null,
        };
        if (hoursStr !== "" && newMeridiem != null) {
          tv.hours = to24h(parseInt(hoursStr, 10), newMeridiem);
        }
        onChangeRef.current(tv);
      },
      [setMeridiem, sectionValues, typeToIdx],
    );

    const handleMeridiemKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            focusSegment(minutesIdx);
            break;
          case "ArrowUp":
          case "ArrowDown":
            e.preventDefault();
            if (readOnly) break;
            fireMeridiemChange(meridiem === "AM" ? "PM" : "AM");
            break;
          case "a":
          case "A":
            e.preventDefault();
            if (readOnly) break;
            fireMeridiemChange("AM");
            break;
          case "p":
          case "P":
            e.preventDefault();
            if (readOnly) break;
            fireMeridiemChange("PM");
            break;
          case "Backspace":
          case "Delete":
            e.preventDefault();
            if (readOnly) break;
            fireMeridiemChange(null);
            break;
          case "Tab":
            break;
          default:
            break;
        }
      },
      [disabled, readOnly, meridiem, minutesIdx, focusSegment, fireMeridiemChange],
    );

    /* ── Derive TimeValue for validation ─────────────────────────── */

    const derivedTimeValue = useMemo((): TimeValue => {
      const hoursStr = sectionValues[typeToIdx.hours] ?? "";
      const minutesStr = sectionValues[typeToIdx.minutes] ?? "";
      const tv: TimeValue = {
        hours: null,
        minutes: minutesStr !== "" ? parseInt(minutesStr, 10) : null,
      };
      if (hoursStr !== "") {
        const displayHours = parseInt(hoursStr, 10);
        if (is12h && meridiem != null) {
          tv.hours = to24h(displayHours, meridiem);
        } else if (!is12h) {
          tv.hours = displayHours;
        }
      }
      return tv;
    }, [sectionValues, typeToIdx, is12h, meridiem]);

    const meridiemIncomplete = is12h && sectionValues[typeToIdx.hours] !== "" && meridiem == null;
    const isFocused = focusedIndex != null || meridiemFocused;

    const validationError = useMemo(
      () => validateTimeValue(derivedTimeValue, isFocused, meridiemIncomplete, { minTime, maxTime }),
      [derivedTimeValue, isFocused, meridiemIncomplete, minTime, maxTime],
    );

    const prevValidationError = useRef(validationError);
    useEffect(() => {
      if (validationError !== prevValidationError.current) {
        prevValidationError.current = validationError;
        onValidationErrorRef.current?.(validationError);
      }
    }, [validationError]);

    const hasError = errorProp ?? (validationError != null);
    const hasValue = sectionValues.some((v) => v !== "") || meridiem != null;

    const handleClear = useCallback(() => {
      onChangeRef.current?.({ hours: null, minutes: null });
      if (is12h) setMeridiem(null);
      onClear?.();
      focusFirst();
    }, [is12h, setMeridiem, onClear, focusFirst]);

    const groupRef = useRef<HTMLDivElement>(null);

    const handleWrapperClick = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return;
        const target = e.target as HTMLElement;
        if (target.closest("[role='spinbutton'], button")) return;
        focusFirst();
      },
      [disabled, focusFirst],
    );

    const handlePaste = useCallback(
      (e: React.ClipboardEvent) => {
        e.preventDefault();
        if (disabled || readOnly) return;

        const text = e.clipboardData.getData("text/plain").trim();
        if (!text) return;

        // Detect AM/PM token
        const ampmMatch = text.match(/\b(AM|PM|am|pm|a\.m\.|p\.m\.)\s*$/i);
        const timeStr = ampmMatch ? text.slice(0, ampmMatch.index).trim() : text;

        const parts = timeStr.split(/[^0-9]+/).filter(Boolean);

        let hours: number | null = null;
        let minutes: number | null = null;

        if (parts.length >= 2) {
          hours = parseInt(parts[0], 10);
          minutes = parseInt(parts[1], 10);
        } else {
          const digits = timeStr.replace(/\D/g, "");
          if (digits.length >= 4) {
            hours = parseInt(digits.substring(0, 2), 10);
            minutes = parseInt(digits.substring(2, 4), 10);
          } else if (digits.length === 3) {
            hours = parseInt(digits.substring(0, 1), 10);
            minutes = parseInt(digits.substring(1, 3), 10);
          }
        }

        if (hours == null || minutes == null) return;
        minutes = Math.max(0, Math.min(59, minutes));

        // Resolve meridiem and convert for 12h format
        let pastedMeridiem: Meridiem | null = null;
        if (ampmMatch) {
          pastedMeridiem = ampmMatch[1].toUpperCase().startsWith("P") ? "PM" : "AM";
        }

        let displayHours: number;
        if (is12h) {
          if (pastedMeridiem) {
            // User pasted explicit AM/PM — treat hours as 12h display
            displayHours = Math.max(1, Math.min(12, hours));
          } else if (hours > 12 || hours === 0) {
            // 24h value pasted into 12h field — auto-convert
            const converted = to12h(Math.max(0, Math.min(23, hours)));
            displayHours = converted.display;
            pastedMeridiem = converted.meridiem;
          } else {
            displayHours = Math.max(1, Math.min(12, hours));
          }
          if (pastedMeridiem) setMeridiem(pastedMeridiem);
        } else {
          displayHours = Math.max(0, Math.min(23, hours));
        }

        const values = [...sectionValues];
        const hoursDef = segmentDefs[typeToIdx.hours];
        const minutesDef = segmentDefs[typeToIdx.minutes];
        if (hoursDef.kind === "numeric") {
          values[typeToIdx.hours] = String(displayHours).padStart(hoursDef.length, "0");
        }
        if (minutesDef.kind === "numeric") {
          values[typeToIdx.minutes] = String(minutes).padStart(minutesDef.length, "0");
        }

        setAllValues(values);
        if (is12h) {
          meridiemElRef.current?.focus();
        } else {
          focusSegment(typeToIdx.minutes);
        }
      },
      [disabled, readOnly, is12h, segmentDefs, typeToIdx, sectionValues, setAllValues, setMeridiem, focusSegment],
    );

    const resolvedLeading =
      leadingIcon !== undefined
        ? leadingIcon
        : <Icon name="schedule" size={ICON_SIZE[size]} />;

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
            onPaste={handlePaste}
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
                  onKeyDown={(e) => handleSegmentKeyDown(i, e)}
                  onFocus={() => handleFocus(i)}
                  onBlur={() => handleBlur(i)}
                >
                  {getDisplayText(i)}
                </span>
              );
            })}

            {is12h && (
              <span
                ref={meridiemElRef}
                className={styles.meridiem}
                role="spinbutton"
                aria-label="AM/PM"
                aria-valuetext={meridiem ?? "AM/PM"}
                tabIndex={disabled ? -1 : 0}
                data-placeholder={meridiem == null || undefined}
                onKeyDown={handleMeridiemKeyDown}
                onFocus={() => setMeridiemFocused(true)}
                onBlur={() => setMeridiemFocused(false)}
              >
                {meridiem ?? "AA"}
              </span>
            )}
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
              aria-label="Clear time"
            />
          </span>
        )}
      </div>
    );
  },
);

TimeInput.displayName = "TimeInput";
