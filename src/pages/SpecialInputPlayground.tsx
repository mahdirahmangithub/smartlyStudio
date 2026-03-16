import { useState, type CSSProperties } from "react";
import { DateInput, type DateInputFormat, type DateInputSize, type DateValue, type DateValidationError } from "../components/DateInput";
import { TimeInput, type TimeInputFormat, type TimeInputSize, type TimeValue, type TimeValidationError } from "../components/TimeInput";
import { Icon } from "../components/Icon";
import { Fieldset } from "../components/Fieldset";

const SIZES: DateInputSize[] = ["md", "lg", "xl"];

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
  padding: 24,
  marginTop: 12,
};
const captionStyle: CSSProperties = {
  fontSize: 13,
  margin: "0 0 8px",
  opacity: 0.7,
};
const valueStyle: CSSProperties = {
  fontSize: 12,
  marginTop: 8,
  color: "var(--text-neutral-secondary-default)",
  fontFamily: "monospace",
};
const controlsBar: CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "center",
  marginBottom: 24,
};
const selectStyle: CSSProperties = {
  padding: "4px 8px",
  borderRadius: 6,
  border: "1px solid var(--element-outline-neutral-default)",
  background: "var(--element-surface-default)",
  color: "var(--text-neutral-primary)",
  fontSize: 13,
};

const VALIDATION_ERROR_MESSAGES: Record<NonNullable<DateValidationError>, string> = {
  invalidDate: "Please enter a valid date",
  incomplete: "Please complete all date fields",
  minDate: "Date is before the minimum allowed",
  maxDate: "Date is after the maximum allowed",
  disablePast: "Date must not be in the past",
  disableFuture: "Date must not be in the future",
};

function formatDateValue(dv: DateValue): string {
  const m = dv.month != null ? String(dv.month).padStart(2, "0") : "–";
  const d = dv.day != null ? String(dv.day).padStart(2, "0") : "–";
  const y = dv.year != null ? String(dv.year) : "–";
  return `${m}/${d}/${y}`;
}

type ValidationMode = "none" | "disablePast" | "disableFuture" | "disabled" | "readOnly";

const VALIDATION_MODES: { value: ValidationMode; label: string }[] = [
  { value: "none", label: "None" },
  { value: "disablePast", label: "Disable past" },
  { value: "disableFuture", label: "Disable future" },
  { value: "disabled", label: "Disabled" },
  { value: "readOnly", label: "Read-only" },
];

const HINT_BY_MODE: Record<ValidationMode, string> = {
  none: "Try typing Feb 30 or Jun 31 to see validation",
  disablePast: "Must be today or later",
  disableFuture: "Must be today or earlier",
  disabled: "",
  readOnly: "",
};

const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: 13,
  cursor: "pointer",
  color: "var(--text-neutral-primary)",
};

function DateInputDemo() {
  const [size, setSize] = useState<DateInputSize>("lg");
  const [mode, setMode] = useState<ValidationMode>("none");
  const [euFormat, setEuFormat] = useState(false);
  const [val, setVal] = useState<DateValue>({});
  const [err, setErr] = useState<DateValidationError>(null);
  const [showLeading, setShowLeading] = useState(true);
  const [showTrailing, setShowTrailing] = useState(false);
  const [showSuffix, setShowSuffix] = useState(false);
  const [showClear, setShowClear] = useState(false);

  const format: DateInputFormat = euFormat ? "DD/MM/YYYY" : "MM/DD/YYYY";
  const hint = err ? VALIDATION_ERROR_MESSAGES[err] : HINT_BY_MODE[mode];

  return (
    <div>
      <div style={controlsBar}>
        <span style={captionStyle}>Size</span>
        <select
          value={size}
          onChange={(e) => setSize(e.target.value as DateInputSize)}
          style={selectStyle}
        >
          {SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <span style={captionStyle}>State</span>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as ValidationMode)}
          style={selectStyle}
        >
          {VALIDATION_MODES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div style={{ ...controlsBar, flexWrap: "wrap" }}>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={euFormat} onChange={(e) => setEuFormat(e.target.checked)} />
          EU format (DD.MM.YYYY)
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={showLeading} onChange={(e) => setShowLeading(e.target.checked)} />
          Leading icon
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={showTrailing} onChange={(e) => setShowTrailing(e.target.checked)} />
          Trailing icon
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={showSuffix} onChange={(e) => setShowSuffix(e.target.checked)} />
          Suffix
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={showClear} onChange={(e) => setShowClear(e.target.checked)} />
          Clearable
        </label>
      </div>

      <Fieldset
        label="Date"
        description="Type digits to fill, arrow keys to adjust, Tab to navigate between segments"
        message={hint || undefined}
        messageType={err ? "alert" : "neutral"}
      >
        <DateInput
          size={size}
          format={format}
          value={val}
          onChange={setVal}
          onValidationError={setErr}
          disablePast={mode === "disablePast"}
          disableFuture={mode === "disableFuture"}
          disabled={mode === "disabled"}
          readOnly={mode === "readOnly"}
          leadingIcon={showLeading ? undefined : null}
          trailingIcon={showTrailing ? <Icon name="info" size={size === "xl" ? 20 : 16} /> : undefined}
          suffix={showSuffix ? "UTC" : undefined}
          clearable={showClear}
        />
      </Fieldset>
      <p style={valueStyle}>Value: {formatDateValue(val)}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Time Input Demo
   ═══════════════════════════════════════════════════════════════════════ */

const TIME_SIZES: TimeInputSize[] = ["md", "lg", "xl"];

const TIME_VALIDATION_ERROR_MESSAGES: Record<NonNullable<TimeValidationError>, string> = {
  invalidTime: "Please enter a valid time",
  incomplete: "Please complete all time fields",
  minTime: "Time is before the minimum allowed",
  maxTime: "Time is after the maximum allowed",
};

function formatTimeValue(tv: TimeValue): string {
  const h = tv.hours != null ? String(tv.hours).padStart(2, "0") : "–";
  const m = tv.minutes != null ? String(tv.minutes).padStart(2, "0") : "–";
  return `${h}:${m}`;
}

type TimeValidationMode = "none" | "minTime" | "maxTime" | "disabled" | "readOnly";

const TIME_VALIDATION_MODES: { value: TimeValidationMode; label: string }[] = [
  { value: "none", label: "None" },
  { value: "minTime", label: "Min time (09:00)" },
  { value: "maxTime", label: "Max time (17:00)" },
  { value: "disabled", label: "Disabled" },
  { value: "readOnly", label: "Read-only" },
];

const TIME_HINT_BY_MODE: Record<TimeValidationMode, string> = {
  none: "Type digits, arrow keys to adjust, Tab to move between segments",
  minTime: "Must be 09:00 or later",
  maxTime: "Must be 17:00 or earlier",
  disabled: "",
  readOnly: "",
};

function TimeInputDemo() {
  const [size, setSize] = useState<TimeInputSize>("lg");
  const [mode, setMode] = useState<TimeValidationMode>("none");
  const [use12h, setUse12h] = useState(false);
  const [val, setVal] = useState<TimeValue>({});
  const [err, setErr] = useState<TimeValidationError>(null);
  const [showLeading, setShowLeading] = useState(true);
  const [showTrailing, setShowTrailing] = useState(false);
  const [showSuffix, setShowSuffix] = useState(false);
  const [showClear, setShowClear] = useState(false);

  const format: TimeInputFormat = use12h ? "hh:mm aa" : "HH:mm";
  const hint = err ? TIME_VALIDATION_ERROR_MESSAGES[err] : TIME_HINT_BY_MODE[mode];

  return (
    <div>
      <div style={controlsBar}>
        <span style={captionStyle}>Size</span>
        <select
          value={size}
          onChange={(e) => setSize(e.target.value as TimeInputSize)}
          style={selectStyle}
        >
          {TIME_SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <span style={captionStyle}>State</span>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as TimeValidationMode)}
          style={selectStyle}
        >
          {TIME_VALIDATION_MODES.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div style={{ ...controlsBar, flexWrap: "wrap" }}>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={use12h} onChange={(e) => setUse12h(e.target.checked)} />
          12-hour format (AM/PM)
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={showLeading} onChange={(e) => setShowLeading(e.target.checked)} />
          Leading icon
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={showTrailing} onChange={(e) => setShowTrailing(e.target.checked)} />
          Trailing icon
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={showSuffix} onChange={(e) => setShowSuffix(e.target.checked)} />
          Suffix
        </label>
        <label style={checkboxLabelStyle}>
          <input type="checkbox" checked={showClear} onChange={(e) => setShowClear(e.target.checked)} />
          Clearable
        </label>
      </div>

      <Fieldset
        label="Time"
        description="Type digits to fill, arrow keys to adjust, Tab to navigate between segments"
        message={hint || undefined}
        messageType={err ? "alert" : "neutral"}
      >
        <TimeInput
          size={size}
          format={format}
          value={val}
          onChange={setVal}
          onValidationError={setErr}
          minTime={mode === "minTime" ? { hours: 9, minutes: 0 } : undefined}
          maxTime={mode === "maxTime" ? { hours: 17, minutes: 0 } : undefined}
          disabled={mode === "disabled"}
          readOnly={mode === "readOnly"}
          leadingIcon={showLeading ? undefined : null}
          trailingIcon={showTrailing ? <Icon name="info" size={size === "xl" ? 20 : 16} /> : undefined}
          suffix={showSuffix ? "UTC" : undefined}
          clearable={showClear}
        />
      </Fieldset>
      <p style={valueStyle}>Value: {formatTimeValue(val)}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════════════ */

export default function SpecialInputPlayground() {
  return (
    <>
      <h1>Special Input</h1>

      <section style={sectionStyle}>
        <h2>Date Input</h2>
        <p style={captionStyle}>Segmented date input with keyboard handling and built-in validation.</p>
        <div style={cardStyle}>
          <DateInputDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Time Input</h2>
        <p style={captionStyle}>Segmented time input with 24h/12h format, AM/PM toggle, and built-in validation.</p>
        <div style={cardStyle}>
          <TimeInputDemo />
        </div>
      </section>
    </>
  );
}
