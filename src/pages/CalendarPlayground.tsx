import { type CSSProperties, useCallback, useRef, useState } from "react";
import {
  Calendar,
  type CalendarRange,
  type CompleteDateValue,
  type DualRangeCalendarValue,
} from "../components/Calendar";
import { Popover } from "../components/Popover";
import { Button } from "../components/Button";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid var(--element-border-neutral-default)",
  borderRadius: "var(--radius-lg)",
  padding: 16,
  marginTop: 12,
};

const valueStyle: CSSProperties = {
  marginTop: 12,
  fontSize: 13,
  color: "var(--text-neutral-secondary)",
};

function formatDate(d: CompleteDateValue): string {
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

function formatRange(r: CalendarRange | null): string {
  if (!r) return "—";
  return `${formatDate(r.start)} → ${formatDate(r.end)}`;
}

function SingleDemo() {
  const [value, setValue] = useState<CompleteDateValue | null>(null);
  return (
    <div>
      <Calendar
        mode="single"
        value={value}
        onChange={setValue}
        weekStartsOn={1}
        caption="Based on Pacific Time zone."
        isDateDisabled={(d) => d.day === 15 && d.month === new Date().getMonth() + 1}
        getDateAttributes={(d) =>
          d.day === 20 ? { title: "Tooltip: special day" } : {}
        }
      />
      <p style={valueStyle}>Selected: {value ? formatDate(value) : "—"}</p>
    </div>
  );
}

function RangeDemo() {
  const [value, setValue] = useState<CalendarRange | null>(null);
  return (
    <div>
      <Calendar mode="range" value={value} onChange={setValue} numberOfMonths={1} />
      <p style={valueStyle}>Range: {formatRange(value)}</p>
    </div>
  );
}

function DualMonthDemo() {
  const [value, setValue] = useState<CompleteDateValue | null>(null);
  return (
    <div>
      <Calendar mode="single" value={value} onChange={setValue} numberOfMonths={2} weekStartsOn={1} />
      <p style={valueStyle}>Selected: {value ? formatDate(value) : "—"}</p>
    </div>
  );
}

function DualRangeDemo() {
  const [value, setValue] = useState<DualRangeCalendarValue>({
    ranges: [null, null],
  });
  return (
    <div>
      <Calendar mode="dual-range" value={value} onChange={setValue} numberOfMonths={2} weekStartsOn={1} />
      <p style={valueStyle}>
        Period 1: {formatRange(value.ranges[0])}
        <br />
        Period 2: {formatRange(value.ranges[1])}
      </p>
    </div>
  );
}

function InPopoverDemo() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<CompleteDateValue | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const onClose = useCallback(() => setOpen(false), []);

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
        {open ? "Close calendar" : "Pick a date"}
      </Button>
      <Popover
        open={open}
        onClose={onClose}
        anchorRef={btnRef}
        density="sm"
        title="Select date"
      >
        <Calendar
          mode="single"
          value={value}
          onChange={setValue}
          defaultMonth={value ? { year: value.year, month: value.month } : undefined}
        />
      </Popover>
      <p style={valueStyle}>Value: {value ? formatDate(value) : "—"}</p>
    </div>
  );
}

export default function CalendarPlayground() {
  return (
    <>
      <h1>Calendar</h1>

      <section style={sectionStyle}>
        <h2>Single date</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", color: "var(--text-neutral-secondary)" }}>
          Monday week start; day 15 disabled; day 20 with title tooltip. Keyboard: arrows, Home/End week,
          PageUp/PageDown month, Enter to select.
        </p>
        <div style={cardStyle}>
          <SingleDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Range</h2>
        <div style={cardStyle}>
          <RangeDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Two months</h2>
        <div style={cardStyle}>
          <DualMonthDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Two overlapping ranges</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", color: "var(--text-neutral-secondary)" }}>
          Use Period 1 / Period 2 to choose which range you are editing. Overlap is allowed.
        </p>
        <div style={cardStyle}>
          <DualRangeDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Inside popover</h2>
        <div style={cardStyle}>
          <InPopoverDemo />
        </div>
      </section>
    </>
  );
}
