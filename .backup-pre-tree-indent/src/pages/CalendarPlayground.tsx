import { type CSSProperties, useCallback, useMemo, useRef, useState } from "react";
import {
  Calendar,
  type CalendarRange,
  type CompleteDateValue,
  type DualRangeCalendarValue,
  compareDate,
} from "../components/Calendar";
import { CheckboxField } from "../components/Checkbox/CheckboxField";
import { Popover } from "../components/Popover";
import { Button } from "../components/Button";

const cardStyle: CSSProperties = {
  border: "1px solid var(--element-outline-neutral-default)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--spacing-lg)",
  marginTop: "var(--spacing-md)",
};

const valueStyle: CSSProperties = {
  marginTop: "var(--spacing-md)",
  fontSize: "var(--type-caption-md-size)",
  color: "var(--text-neutral-secondary)",
};

const controlsRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--spacing-lg)",
  marginBottom: "var(--spacing-xl)",
  padding: "var(--spacing-md) var(--spacing-lg)",
  border: "1px solid var(--element-outline-neutral-default)",
  borderRadius: "var(--radius-lg)",
  background: "var(--element-fill-neutral-tertiary-default)",
};

function formatDate(d: CompleteDateValue): string {
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

function formatRange(r: CalendarRange | null): string {
  if (!r) return "\u2014";
  return `${formatDate(r.start)} \u2192 ${formatDate(r.end)}`;
}

type CalendarConfig = {
  dualMonth: boolean;
  range: boolean;
  multiRange: boolean;
  hasMinMax: boolean;
  disabledDates: boolean;
};

const MIN_DATE: CompleteDateValue = { year: 2026, month: 3, day: 10 };
const MAX_DATE: CompleteDateValue = { year: 2026, month: 6, day: 20 };

function useCalendarConfig() {
  const [config, setConfig] = useState<CalendarConfig>({
    dualMonth: false,
    range: false,
    multiRange: false,
    hasMinMax: false,
    disabledDates: false,
  });

  const toggle = useCallback((key: keyof CalendarConfig) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === "multiRange" && next.multiRange) {
        next.range = true;
      }
      if (key === "range" && !next.range) {
        next.multiRange = false;
      }
      return next;
    });
  }, []);

  return { config, toggle };
}

function resolveMode(config: CalendarConfig): "single" | "range" | "dual-range" {
  if (config.multiRange) return "dual-range";
  if (config.range) return "range";
  return "single";
}

function isDateDisabledMinMax(date: CompleteDateValue): boolean {
  return compareDate(date, MIN_DATE) < 0 || compareDate(date, MAX_DATE) > 0;
}

const DISABLED_DAYS = new Set([3, 7, 14, 21, 25]);

function isDateDisabledScattered(date: CompleteDateValue): boolean {
  return DISABLED_DAYS.has(date.day);
}

function isDateDisabledCombined(date: CompleteDateValue): boolean {
  return isDateDisabledMinMax(date) || isDateDisabledScattered(date);
}

function resolveDisabledFn(config: CalendarConfig) {
  if (config.hasMinMax && config.disabledDates) return isDateDisabledCombined;
  if (config.hasMinMax) return isDateDisabledMinMax;
  if (config.disabledDates) return isDateDisabledScattered;
  return undefined;
}

function resolveGetDateAttributes(config: CalendarConfig) {
  const disabledFn = resolveDisabledFn(config);
  if (!disabledFn) return undefined;
  return (date: CompleteDateValue) =>
    disabledFn(date) ? { tooltip: "No data" } : {};
}

function InlineDemo({ config }: { config: CalendarConfig }) {
  const mode = resolveMode(config);
  const numberOfMonths = config.dualMonth ? 2 : 1;
  const isDateDisabled = resolveDisabledFn(config);
  const getDateAttributes = resolveGetDateAttributes(config);

  const [singleValue, setSingleValue] = useState<CompleteDateValue | null>(null);
  const [rangeValue, setRangeValue] = useState<CalendarRange | null>(null);
  const [dualValue, setDualValue] = useState<DualRangeCalendarValue>({
    ranges: [null, null],
  });

  const valueDisplay = useMemo(() => {
    if (mode === "single") return `Selected: ${singleValue ? formatDate(singleValue) : "\u2014"}`;
    if (mode === "range") return `Range: ${formatRange(rangeValue)}`;
    return `Period 1: ${formatRange(dualValue.ranges[0])}\nPeriod 2: ${formatRange(dualValue.ranges[1])}`;
  }, [mode, singleValue, rangeValue, dualValue]);

  const defaultMonth = config.hasMinMax
    ? { year: MIN_DATE.year, month: MIN_DATE.month }
    : undefined;

  return (
    <div>
      {mode === "single" && (
        <Calendar
          mode="single"
          value={singleValue}
          onChange={setSingleValue}
          numberOfMonths={numberOfMonths}
          weekStartsOn={1}
          isDateDisabled={isDateDisabled}
          getDateAttributes={getDateAttributes}
          defaultMonth={defaultMonth}
        />
      )}
      {mode === "range" && (
        <Calendar
          mode="range"
          value={rangeValue}
          onChange={setRangeValue}
          numberOfMonths={numberOfMonths}
          weekStartsOn={1}
          isDateDisabled={isDateDisabled}
          getDateAttributes={getDateAttributes}
          defaultMonth={defaultMonth}
        />
      )}
      {mode === "dual-range" && (
        <Calendar
          mode="dual-range"
          value={dualValue}
          onChange={setDualValue}
          numberOfMonths={numberOfMonths}
          weekStartsOn={1}
          isDateDisabled={isDateDisabled}
          getDateAttributes={getDateAttributes}
          defaultMonth={defaultMonth}
        />
      )}
      <pre style={valueStyle}>{valueDisplay}</pre>
    </div>
  );
}

function PopoverDemo({ config }: { config: CalendarConfig }) {
  const mode = resolveMode(config);
  const numberOfMonths = config.dualMonth ? 2 : 1;
  const isDateDisabled = resolveDisabledFn(config);
  const getDateAttributes = resolveGetDateAttributes(config);

  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const onClose = useCallback(() => setOpen(false), []);

  const [singleValue, setSingleValue] = useState<CompleteDateValue | null>(null);
  const [rangeValue, setRangeValue] = useState<CalendarRange | null>(null);
  const [dualValue, setDualValue] = useState<DualRangeCalendarValue>({
    ranges: [null, null],
  });

  const buttonLabel = useMemo(() => {
    if (open) return "Close calendar";
    if (mode === "single" && singleValue) return formatDate(singleValue);
    if (mode === "range" && rangeValue) return formatRange(rangeValue);
    if (mode === "dual-range" && (dualValue.ranges[0] || dualValue.ranges[1]))
      return "Ranges selected";
    return "Pick a date";
  }, [open, mode, singleValue, rangeValue, dualValue]);

  const valueDisplay = useMemo(() => {
    if (mode === "single") return `Selected: ${singleValue ? formatDate(singleValue) : "\u2014"}`;
    if (mode === "range") return `Range: ${formatRange(rangeValue)}`;
    return `Period 1: ${formatRange(dualValue.ranges[0])}\nPeriod 2: ${formatRange(dualValue.ranges[1])}`;
  }, [mode, singleValue, rangeValue, dualValue]);

  const defaultMonth = config.hasMinMax
    ? { year: MIN_DATE.year, month: MIN_DATE.month }
    : undefined;

  return (
    <div>
      <Button
        ref={btnRef}
        variant="brand"
        emphasis="high"
        size="md"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {buttonLabel}
      </Button>
      <Popover
        open={open}
        onClose={onClose}
        anchorRef={btnRef}
        density="sm"
        title="Select date"
        width="auto"
      >
        {mode === "single" && (
          <Calendar
            mode="single"
            value={singleValue}
            onChange={setSingleValue}
            numberOfMonths={numberOfMonths}
            weekStartsOn={1}
            isDateDisabled={isDateDisabled}
            getDateAttributes={getDateAttributes}
            defaultMonth={
              singleValue
                ? { year: singleValue.year, month: singleValue.month }
                : defaultMonth
            }
          />
        )}
        {mode === "range" && (
          <Calendar
            mode="range"
            value={rangeValue}
            onChange={setRangeValue}
            numberOfMonths={numberOfMonths}
            weekStartsOn={1}
            isDateDisabled={isDateDisabled}
            getDateAttributes={getDateAttributes}
            defaultMonth={
              rangeValue
                ? { year: rangeValue.start.year, month: rangeValue.start.month }
                : defaultMonth
            }
          />
        )}
        {mode === "dual-range" && (
          <Calendar
            mode="dual-range"
            value={dualValue}
            onChange={setDualValue}
            numberOfMonths={numberOfMonths}
            weekStartsOn={1}
            isDateDisabled={isDateDisabled}
            getDateAttributes={getDateAttributes}
            defaultMonth={
              dualValue.ranges[0]
                ? { year: dualValue.ranges[0].start.year, month: dualValue.ranges[0].start.month }
                : defaultMonth
            }
          />
        )}
      </Popover>
      <pre style={valueStyle}>{valueDisplay}</pre>
    </div>
  );
}

export default function CalendarPlayground() {
  const { config, toggle } = useCalendarConfig();

  return (
    <>
      <h1>Calendar</h1>

      <div style={controlsRowStyle} role="group" aria-label="Calendar options">
        <CheckboxField
          label="Dual month"
          checked={config.dualMonth}
          onChange={() => toggle("dualMonth")}
        />
        <CheckboxField
          label="Range selection"
          checked={config.range}
          onChange={() => toggle("range")}
        />
        <CheckboxField
          label="Multi range"
          checked={config.multiRange}
          onChange={() => toggle("multiRange")}
          disabled={!config.range}
        />
        <CheckboxField
          label={`Min/max dates (${formatDate(MIN_DATE)} – ${formatDate(MAX_DATE)})`}
          checked={config.hasMinMax}
          onChange={() => toggle("hasMinMax")}
        />
        <CheckboxField
          label="Disabled dates (3rd, 7th, 14th, 21st, 25th)"
          checked={config.disabledDates}
          onChange={() => toggle("disabledDates")}
        />
      </div>

      <section style={{ marginBottom: 48 }}>
        <h2>Inline</h2>
        <div style={cardStyle}>
          <InlineDemo key={resolveMode(config)} config={config} />
        </div>
      </section>

      <section style={{ marginBottom: 48 }}>
        <h2>In popover</h2>
        <div style={cardStyle}>
          <PopoverDemo key={resolveMode(config)} config={config} />
        </div>
      </section>
    </>
  );
}
