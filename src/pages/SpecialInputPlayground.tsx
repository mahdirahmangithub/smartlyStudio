import { useState, type CSSProperties } from "react";
import { DateInput, type DateInputFormat, type DateInputSize, type DateValue, type DateValidationError } from "../components/DateInput";
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

function DateInputDemo({ format, label }: { format: DateInputFormat; label: string }) {
  const [size, setSize] = useState<DateInputSize>("lg");
  const [val, setVal] = useState<DateValue>({});
  const [err, setErr] = useState<DateValidationError>(null);

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
      </div>

      <Fieldset
        label={label}
        description="Type digits to fill, arrow keys to adjust, Tab to navigate between segments"
        message={err ? VALIDATION_ERROR_MESSAGES[err] : "Try typing Feb 30 or Jun 31 to see validation"}
        messageType={err ? "alert" : "neutral"}
      >
        <DateInput
          size={size}
          format={format}
          value={val}
          onChange={setVal}
          onValidationError={setErr}
        />
      </Fieldset>
      <p style={valueStyle}>Value: {formatDateValue(val)}</p>
    </div>
  );
}

export default function SpecialInputPlayground() {
  return (
    <>
      <h1>Special Input</h1>

      <section style={sectionStyle}>
        <h2>Date Input — MM/DD/YYYY</h2>
        <p style={captionStyle}>US date format with segmented keyboard handling and built-in validation.</p>
        <div style={cardStyle}>
          <DateInputDemo format="MM/DD/YYYY" label="Date" />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Date Input — DD/MM/YYYY</h2>
        <p style={captionStyle}>European date format with the same keyboard and validation behavior.</p>
        <div style={cardStyle}>
          <DateInputDemo format="DD/MM/YYYY" label="Date" />
        </div>
      </section>
    </>
  );
}
