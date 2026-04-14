import type { DateValue } from "../DateInput/DateInput";

/** Calendar date with all parts defined and valid on the Gregorian calendar. */
export type CompleteDateValue = Required<Pick<DateValue, "year" | "month" | "day">> & {
  year: number;
  month: number;
  day: number;
};

export interface YearMonth {
  year: number;
  /** 1–12 */
  month: number;
}

export interface CalendarDayModel {
  date: CompleteDateValue;
  inCurrentMonth: boolean;
}

export type CalendarRange = { start: CompleteDateValue; end: CompleteDateValue };

export function isCompleteDateValue(dv: DateValue): dv is CompleteDateValue {
  return dv.year != null && dv.month != null && dv.day != null;
}

export function isValidCalendarDate(month: number, day: number, year: number): boolean {
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export function toCompleteDate(dv: DateValue): CompleteDateValue | null {
  if (!isCompleteDateValue(dv)) return null;
  if (!isValidCalendarDate(dv.month, dv.day, dv.year)) return null;
  return { year: dv.year, month: dv.month, day: dv.day };
}

export function compareDate(a: CompleteDateValue, b: CompleteDateValue): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function addMonths(ym: YearMonth, delta: number): YearMonth {
  const d = new Date(ym.year, ym.month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function addDays(date: CompleteDateValue, delta: number): CompleteDateValue {
  const d = new Date(date.year, date.month - 1, date.day + delta);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

/**
 * 42 cells (6×7) covering the month and leading/trailing days from adjacent months.
 * `weekStartsOn`: 0 = Sunday, 1 = Monday, …
 */
export function buildMonthMatrix(
  year: number,
  month: number,
  weekStartsOn: number,
): CalendarDayModel[] {
  const first = new Date(year, month - 1, 1);
  const firstJsDow = first.getDay();
  const lead = (firstJsDow - weekStartsOn + 7) % 7;
  const cells: CalendarDayModel[] = [];
  const cursor = new Date(year, month - 1, 1 - lead);
  for (let i = 0; i < 42; i++) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth() + 1;
    const da = cursor.getDate();
    cells.push({
      date: { year: y, month: m, day: da },
      inCurrentMonth: m === month && y === year,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}

export function todayParts(): CompleteDateValue {
  const n = new Date();
  return { year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate() };
}

export function normalizeRange(
  a: CompleteDateValue,
  b: CompleteDateValue,
): CalendarRange {
  return compareDate(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };
}

export function isInClosedRange(
  date: CompleteDateValue,
  start: CompleteDateValue,
  end: CompleteDateValue,
): boolean {
  return compareDate(date, start) >= 0 && compareDate(date, end) <= 0;
}

export function dateToIsoDateString(d: CompleteDateValue): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.year}-${pad(d.month)}-${pad(d.day)}`;
}

/** Weekday abbreviations in display order starting at `weekStartsOn`. */
export function getWeekdayLabels(locale: string, weekStartsOn: number): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const refSunday = new Date(2023, 8, 3);
  const start = new Date(refSunday);
  start.setDate(refSunday.getDate() + weekStartsOn);
  const labels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    labels.push(fmt.format(d));
  }
  return labels;
}

export function formatMonthYear(locale: string, year: number, month: number): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
}

/** Short month + year (e.g. "Jan 2025") — matches SDS calendar / month-header spec. */
export function formatMonthYearShort(locale: string, year: number, month: number): string {
  return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
}

export function formatDateForAria(locale: string, date: CompleteDateValue): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date.year, date.month - 1, date.day));
}
