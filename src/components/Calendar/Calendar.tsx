import { useCallback, useId, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { cx } from "../../utils/cx";
import {
  addDays,
  addMonths,
  buildMonthMatrix,
  compareDate,
  daysInMonth,
  formatDateForAria,
  formatMonthYearShort,
  getWeekdayLabels,
  isInClosedRange,
  normalizeRange,
  todayParts,
  type CalendarRange,
  type CompleteDateValue,
  type YearMonth,
} from "./calendarMath";
import { getStripLayerMeta } from "./calendarStripLayerMeta";
import { CalendarDateCell } from "./CalendarDateCell";
import { CalendarWeekdayRow } from "./CalendarWeekdayRow";
import styles from "./Calendar.module.css";

export type CalendarMode = "single" | "range" | "dual-range";

export type DualRangeCalendarValue = {
  ranges: [CalendarRange | null, CalendarRange | null];
};

type BaseCalendarProps = {
  locale?: string;
  /** 0 = Sunday … 6 = Saturday. Default 0. */
  weekStartsOn?: number;
  numberOfMonths?: 1 | 2;
  /** Animate month title + day grid when the visible month changes. */
  slideMonths?: boolean;
  /** Override “today” (e.g. tests). */
  today?: CompleteDateValue;
  isDateDisabled?: (date: CompleteDateValue) => boolean;
  getDateAttributes?: (date: CompleteDateValue) => { className?: string; title?: string };
  defaultMonth?: YearMonth;
  /** Optional footer line (e.g. timezone note — Figma caption under month). */
  caption?: ReactNode;
  className?: string;
  "aria-label"?: string;
};

export type CalendarProps = BaseCalendarProps &
  (
    | {
        mode: "single";
        value: CompleteDateValue | null;
        onChange: (value: CompleteDateValue | null) => void;
        allowDeselect?: boolean;
      }
    | {
        mode: "range";
        value: CalendarRange | null;
        onChange: (value: CalendarRange | null) => void;
      }
    | {
        mode: "dual-range";
        value: DualRangeCalendarValue;
        onChange: (value: DualRangeCalendarValue) => void;
        activeRangeIndex?: 0 | 1;
        defaultActiveRangeIndex?: 0 | 1;
        /** Notified when the active period changes (tabs or auto when starting a range from a date). */
        onActiveRangeIndexChange?: (index: 0 | 1) => void;
      }
  );

function sameDate(a: CompleteDateValue, b: CompleteDateValue): boolean {
  return compareDate(a, b) === 0;
}

function isDateVisibleInCalendar(
  date: CompleteDateValue,
  baseMonth: YearMonth,
  numberOfMonths: 1 | 2,
): boolean {
  if (date.year === baseMonth.year && date.month === baseMonth.month) return true;
  if (numberOfMonths === 2) {
    const m2 = addMonths(baseMonth, 1);
    return date.year === m2.year && date.month === m2.month;
  }
  return false;
}

function baseMonthForDate(date: CompleteDateValue, numberOfMonths: 1 | 2): YearMonth {
  if (numberOfMonths === 1) return { year: date.year, month: date.month };
  return { year: date.year, month: date.month };
}

function startOfWeek(date: CompleteDateValue, weekStartsOn: number): CompleteDateValue {
  const js = new Date(date.year, date.month - 1, date.day).getDay();
  const diff = (js - weekStartsOn + 7) % 7;
  return addDays(date, -diff);
}

function endOfWeek(date: CompleteDateValue, weekStartsOn: number): CompleteDateValue {
  return addDays(startOfWeek(date, weekStartsOn), 6);
}

function chunkWeeks<T>(cells: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

/** Serial day index for range distance (date-only, UTC). */
function daySerialUtc(d: CompleteDateValue): number {
  return Date.UTC(d.year, d.month - 1, d.day) / 86400000;
}

/** 0 if inside range; otherwise days from `date` to nearest endpoint. */
function distanceToClosedRange(date: CompleteDateValue, range: CalendarRange): number {
  const t = daySerialUtc(date);
  const a = daySerialUtc(range.start);
  const b = daySerialUtc(range.end);
  if (t >= a && t <= b) return 0;
  if (t < a) return a - t;
  return t - b;
}

/** In-range but not on start/end — user can start the *other* period from mid-selection. */
function isStrictRangeInterior(date: CompleteDateValue, range: CalendarRange): boolean {
  if (!isInClosedRange(date, range.start, range.end)) return false;
  if (sameDate(date, range.start) || sameDate(date, range.end)) return false;
  return true;
}

/**
 * When starting a new dual-range draft, pick period 0 vs 1 from click/focus intent:
 * strict interior of the *active* period only → switch to the other period;
 * inside one range only (elsewhere) → that period; both → keep current tab; empty slot → fill it;
 * outside both committed ranges → nearer range (tie → current tab).
 */
function inferActiveRangeIndexForDualDraft(
  date: CompleteDateValue,
  ranges: [CalendarRange | null, CalendarRange | null],
  currentIndex: 0 | 1,
): 0 | 1 {
  const [r0, r1] = ranges;
  const in0 = r0 ? isInClosedRange(date, r0.start, r0.end) : false;
  const in1 = r1 ? isInClosedRange(date, r1.start, r1.end) : false;

  if (currentIndex === 0 && r0 && in0 && !in1 && isStrictRangeInterior(date, r0)) return 1;
  if (currentIndex === 1 && r1 && in1 && !in0 && isStrictRangeInterior(date, r1)) return 0;

  if (in0 && !in1) return 0;
  if (in1 && !in0) return 1;
  if (in0 && in1) return currentIndex;

  if (!r0 && !r1) return currentIndex;
  if (!r0 && r1) return 0;
  if (r0 && !r1) return 1;

  if (r0 && r1) {
    const d0 = distanceToClosedRange(date, r0);
    const d1 = distanceToClosedRange(date, r1);
    if (d0 < d1) return 0;
    if (d1 < d0) return 1;
  }
  return currentIndex;
}

/** Fade only on calendar day 1 / last day of month when range crosses month edge — not every week row. */
type MonthBoundaryFade = {
  leading: boolean;
  trailing: boolean;
  tone: "brand" | "neutral" | "both";
  preview: boolean;
};

function monthBoundaryFadeForRange(
  date: CompleteDateValue,
  range: CalendarRange,
): Pick<MonthBoundaryFade, "leading" | "trailing"> | null {
  if (!isInClosedRange(date, range.start, range.end)) return null;
  const lastDay = daysInMonth(date.year, date.month);
  const atMonthStart = date.day === 1;
  const atMonthEnd = date.day === lastDay;
  if (!atMonthStart && !atMonthEnd) return null;
  const leading = atMonthStart && compareDate(range.start, date) < 0;
  const trailing = atMonthEnd && compareDate(range.end, date) > 0;
  if (!leading && !trailing) return null;
  return { leading, trailing };
}

function resolveMonthBoundaryFade(
  date: CompleteDateValue,
  props: CalendarProps,
  previewRange: CalendarRange | null,
  draftAnchor: CompleteDateValue | null,
  activeRangeIndex: 0 | 1,
): MonthBoundaryFade | null {
  if (props.mode === "range") {
    if (previewRange && draftAnchor) {
      const p = monthBoundaryFadeForRange(date, previewRange);
      if (p && (p.leading || p.trailing)) {
        return { leading: p.leading, trailing: p.trailing, tone: "brand", preview: true };
      }
    }
    if (props.value && !draftAnchor) {
      const v = monthBoundaryFadeForRange(date, props.value);
      if (v && (v.leading || v.trailing)) {
        return { leading: v.leading, trailing: v.trailing, tone: "brand", preview: false };
      }
    }
    return null;
  }

  if (props.mode === "dual-range") {
    const [r0, r1] = props.value.ranges;
    const src0 =
      draftAnchor && activeRangeIndex === 0 && previewRange ? previewRange : r0;
    const src1 =
      draftAnchor && activeRangeIndex === 1 && previewRange ? previewRange : r1;

    const b0 = src0 ? monthBoundaryFadeForRange(date, src0) : null;
    const b1 = src1 ? monthBoundaryFadeForRange(date, src1) : null;
    if (!b0 && !b1) return null;
    const leading = !!(b0?.leading || b1?.leading);
    const trailing = !!(b0?.trailing || b1?.trailing);
    if (!leading && !trailing) return null;
    const r0hit = !!(b0?.leading || b0?.trailing);
    const r1hit = !!(b1?.leading || b1?.trailing);
    const tone: "brand" | "neutral" | "both" =
      r0hit && r1hit ? "both" : r0hit ? "brand" : "neutral";
    const preview = !!(draftAnchor && previewRange);
    return { leading, trailing, tone, preview };
  }

  return null;
}

function buildDayAriaLabel(
  locale: string,
  date: CompleteDateValue,
  extras: string[],
): string {
  const base = formatDateForAria(locale, date);
  if (extras.length === 0) return base;
  return `${base}, ${extras.join(", ")}`;
}

export function Calendar(props: CalendarProps) {
  const {
    locale = undefined,
    weekStartsOn = 0,
    numberOfMonths = 1,
    slideMonths = true,
    today: todayProp,
    isDateDisabled: isDateDisabledProp,
    getDateAttributes,
    defaultMonth,
    caption,
    className,
    "aria-label": ariaLabel = "Calendar",
  } = props;

  const resolvedLocale = locale ?? undefined;
  const localeForIntl = resolvedLocale ?? "en-US";

  const today = todayProp ?? todayParts();
  const neverDisabled = useCallback(() => false, []);
  const isDateDisabled = isDateDisabledProp ?? neverDisabled;

  const initialBase = defaultMonth ?? { year: today.year, month: today.month };
  const [baseMonth, setBaseMonth] = useState<YearMonth>(initialBase);
  const [focusedDate, setFocusedDate] = useState<CompleteDateValue>(() => today);
  const [draftAnchor, setDraftAnchor] = useState<CompleteDateValue | null>(null);
  /** While choosing range end, mouse target for live preview (keyboard uses focusedDate). */
  const [rangePreviewHoverDate, setRangePreviewHoverDate] = useState<CompleteDateValue | null>(null);
  const [slideDir, setSlideDir] = useState<"next" | "prev" | null>(null);

  const [internalActiveRange, setInternalActiveRange] = useState<0 | 1>(() =>
    props.mode === "dual-range" ? (props.defaultActiveRangeIndex ?? 0) : 0,
  );

  const activeRangeIndex: 0 | 1 =
    props.mode === "dual-range"
      ? (props.activeRangeIndex ?? internalActiveRange)
      : 0;

  const setActiveRangeIndex = useCallback(
    (i: 0 | 1) => {
      if (props.mode === "dual-range") {
        props.onActiveRangeIndexChange?.(i);
        if (props.activeRangeIndex === undefined) setInternalActiveRange(i);
      }
    },
    [props],
  );

  const uid = useId();
  const titleId0 = `${uid}-title-0`;
  const titleId1 = `${uid}-title-1`;
  const weekdayDecorativeId = `${uid}-weekday-decorative`;

  const weekdayLabels = useMemo(
    () => getWeekdayLabels(localeForIntl, weekStartsOn),
    [localeForIntl, weekStartsOn],
  );

  const monthsToRender = useMemo((): YearMonth[] => {
    const m0 = baseMonth;
    if (numberOfMonths === 1) return [m0];
    return [m0, addMonths(m0, 1)];
  }, [baseMonth, numberOfMonths]);

  const matrices = useMemo(
    () =>
      monthsToRender.map((ym) => ({
        ym,
        cells: buildMonthMatrix(ym.year, ym.month, weekStartsOn),
      })),
    [monthsToRender, weekStartsOn],
  );

  const endDraftAnchor = useCallback(() => {
    setDraftAnchor(null);
    setRangePreviewHoverDate(null);
  }, []);

  const beginDraftAnchor = useCallback(
    (date: CompleteDateValue) => {
      if (props.mode === "dual-range") {
        const next = inferActiveRangeIndexForDualDraft(date, props.value.ranges, activeRangeIndex);
        if (next !== activeRangeIndex) setActiveRangeIndex(next);
      }
      setDraftAnchor(date);
      setRangePreviewHoverDate(null);
    },
    [props, activeRangeIndex, setActiveRangeIndex],
  );

  const liveMonthText = useMemo(() => {
    return monthsToRender
      .map((ym) => formatMonthYearShort(localeForIntl, ym.year, ym.month))
      .join(", ");
  }, [monthsToRender, localeForIntl]);

  const bumpMonth = useCallback(
    (delta: number) => {
      setSlideDir(delta > 0 ? "next" : "prev");
      setBaseMonth((m) => addMonths(m, delta));
    },
    [],
  );

  const ensureVisible = useCallback(
    (date: CompleteDateValue) => {
      if (isDateVisibleInCalendar(date, baseMonth, numberOfMonths)) return;
      setBaseMonth(baseMonthForDate(date, numberOfMonths));
    },
    [baseMonth, numberOfMonths],
  );

  const moveFocus = useCallback(
    (next: CompleteDateValue) => {
      setFocusedDate(next);
      ensureVisible(next);
    },
    [ensureVisible],
  );

  const clearRangeHoverForKeyboard = useCallback(() => {
    if (draftAnchor) setRangePreviewHoverDate(null);
  }, [draftAnchor]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const { key } = e;
      if (key === "ArrowRight") {
        e.preventDefault();
        clearRangeHoverForKeyboard();
        moveFocus(addDays(focusedDate, 1));
        return;
      }
      if (key === "ArrowLeft") {
        e.preventDefault();
        clearRangeHoverForKeyboard();
        moveFocus(addDays(focusedDate, -1));
        return;
      }
      if (key === "ArrowDown") {
        e.preventDefault();
        clearRangeHoverForKeyboard();
        moveFocus(addDays(focusedDate, 7));
        return;
      }
      if (key === "ArrowUp") {
        e.preventDefault();
        clearRangeHoverForKeyboard();
        moveFocus(addDays(focusedDate, -7));
        return;
      }
      if (key === "Home") {
        e.preventDefault();
        clearRangeHoverForKeyboard();
        moveFocus(startOfWeek(focusedDate, weekStartsOn));
        return;
      }
      if (key === "End") {
        e.preventDefault();
        clearRangeHoverForKeyboard();
        moveFocus(endOfWeek(focusedDate, weekStartsOn));
        return;
      }
      if (key === "PageDown") {
        e.preventDefault();
        clearRangeHoverForKeyboard();
        bumpMonth(1);
        return;
      }
      if (key === "PageUp") {
        e.preventDefault();
        clearRangeHoverForKeyboard();
        bumpMonth(-1);
        return;
      }

      if (key === "Escape") {
        if (props.mode !== "single" && draftAnchor) {
          e.preventDefault();
          endDraftAnchor();
        }
        return;
      }

      if (key === "Enter" || key === " ") {
        if (isDateDisabled(focusedDate)) return;
        e.preventDefault();
        const d = focusedDate;

        if (props.mode === "single") {
          const allow = props.allowDeselect ?? false;
          if (allow && props.value && sameDate(props.value, d)) {
            props.onChange(null);
          } else {
            props.onChange(d);
          }
          return;
        }

        if (props.mode === "range") {
          if (!draftAnchor) {
            beginDraftAnchor(d);
          } else {
            props.onChange(normalizeRange(draftAnchor, d));
            endDraftAnchor();
          }
          return;
        }

        if (!draftAnchor) {
          beginDraftAnchor(d);
        } else {
          const nextRange = normalizeRange(draftAnchor, d);
          const ranges: [CalendarRange | null, CalendarRange | null] = [
            props.value.ranges[0],
            props.value.ranges[1],
          ];
          ranges[activeRangeIndex] = nextRange;
          props.onChange({ ranges });
          endDraftAnchor();
        }
      }
    },
    [
      focusedDate,
      moveFocus,
      weekStartsOn,
      bumpMonth,
      draftAnchor,
      props,
      isDateDisabled,
      activeRangeIndex,
      clearRangeHoverForKeyboard,
      beginDraftAnchor,
      endDraftAnchor,
    ],
  );

  const handleDayClick = useCallback(
    (date: CompleteDateValue) => {
      if (isDateDisabled(date)) return;
      setFocusedDate(date);
      ensureVisible(date);
      // Preview end uses hover ?? focus; stale hover (e.g. mouse on another day while focus
      // or click targets this cell) would wrong-foot overlap until the next mouseEnter.
      if (
        draftAnchor &&
        (props.mode === "range" || props.mode === "dual-range")
      ) {
        setRangePreviewHoverDate(date);
      }

      if (props.mode === "single") {
        const allow = props.allowDeselect ?? false;
        if (allow && props.value && sameDate(props.value, date)) {
          props.onChange(null);
        } else {
          props.onChange(date);
        }
        return;
      }

      if (props.mode === "range") {
        if (!draftAnchor) {
          beginDraftAnchor(date);
        } else {
          props.onChange(normalizeRange(draftAnchor, date));
          endDraftAnchor();
        }
        return;
      }

      if (!draftAnchor) {
        beginDraftAnchor(date);
      } else {
        const nextRange = normalizeRange(draftAnchor, date);
        const ranges: [CalendarRange | null, CalendarRange | null] = [
          props.value.ranges[0],
          props.value.ranges[1],
        ];
        ranges[activeRangeIndex] = nextRange;
        props.onChange({ ranges });
        endDraftAnchor();
      }
    },
    [draftAnchor, ensureVisible, isDateDisabled, props, activeRangeIndex, beginDraftAnchor, endDraftAnchor],
  );

  const previewRangeEndDate = rangePreviewHoverDate ?? focusedDate;
  const previewRange =
    draftAnchor && (props.mode === "range" || props.mode === "dual-range")
      ? normalizeRange(draftAnchor, previewRangeEndDate)
      : null;

  const getCellFlags = useCallback(
    (date: CompleteDateValue) => {
      const flags: {
        selected: boolean;
        inRange: boolean;
        rangeStart: boolean;
        rangeEnd: boolean;
        inRange0: boolean;
        range0Start: boolean;
        range0End: boolean;
        inRange1: boolean;
        range1Start: boolean;
        range1End: boolean;
        bothRanges: boolean;
        overlapSplitLeading: boolean;
        overlapSplitTrailing: boolean;
        overlapSplitLeftTone: "brand" | "neutral" | null;
        overlapSplitRightTone: "brand" | "neutral" | null;
        inPreview: boolean;
        previewStart: boolean;
        previewEnd: boolean;
        ariaSelected: boolean;
      } = {
        selected: false,
        inRange: false,
        rangeStart: false,
        rangeEnd: false,
        inRange0: false,
        range0Start: false,
        range0End: false,
        inRange1: false,
        range1Start: false,
        range1End: false,
        bothRanges: false,
        overlapSplitLeading: false,
        overlapSplitTrailing: false,
        overlapSplitLeftTone: null,
        overlapSplitRightTone: null,
        inPreview: false,
        previewStart: false,
        previewEnd: false,
        ariaSelected: false,
      };

      if (props.mode === "single") {
        flags.selected = !!(props.value && sameDate(props.value, date));
        flags.ariaSelected = flags.selected;
        return flags;
      }

      if (props.mode === "range") {
        const r = props.value;
        if (r && !draftAnchor) {
          const inside = isInClosedRange(date, r.start, r.end);
          flags.rangeStart = sameDate(date, r.start);
          flags.rangeEnd = sameDate(date, r.end);
          flags.inRange = inside && !flags.rangeStart && !flags.rangeEnd;
          flags.ariaSelected = flags.rangeStart || flags.rangeEnd;
        }
        if (previewRange) {
          const inside = isInClosedRange(date, previewRange.start, previewRange.end);
          flags.inPreview = inside;
          flags.previewStart = sameDate(date, previewRange.start);
          flags.previewEnd = sameDate(date, previewRange.end);
          flags.ariaSelected =
            flags.ariaSelected || flags.previewStart || flags.previewEnd;
        }
        return flags;
      }

      const [r0, r1] = props.value.ranges;
      const hideR0WhileDraft = draftAnchor && activeRangeIndex === 0;
      const hideR1WhileDraft = draftAnchor && activeRangeIndex === 1;

      // During dual-range draft, use live preview as the edited period so overlap, split
      // transitions, and strip tints match before commit (not only after onChange).
      const src0 =
        props.mode === "dual-range" && hideR0WhileDraft && previewRange ? previewRange : r0;
      const src1 =
        props.mode === "dual-range" && hideR1WhileDraft && previewRange ? previewRange : r1;

      let in0 = false;
      let s0 = false;
      let e0 = false;
      if (src0) {
        in0 = isInClosedRange(date, src0.start, src0.end);
        s0 = sameDate(date, src0.start);
        e0 = sameDate(date, src0.end);
      }
      let in1 = false;
      let s1 = false;
      let e1 = false;
      if (src1) {
        in1 = isInClosedRange(date, src1.start, src1.end);
        s1 = sameDate(date, src1.start);
        e1 = sameDate(date, src1.end);
      }
      flags.inRange0 = in0 && !s0 && !e0;
      flags.range0Start = s0;
      flags.range0End = e0;
      flags.inRange1 = in1 && !s1 && !e1;
      flags.range1Start = s1;
      flags.range1End = e1;
      flags.bothRanges = in0 && in1;
      flags.ariaSelected = s0 || e0 || s1 || e1;

      if (flags.bothRanges && src0 && src1) {
        const prev = addDays(date, -1);
        const next = addDays(date, 1);
        const p0 = isInClosedRange(prev, src0.start, src0.end);
        const p1 = isInClosedRange(prev, src1.start, src1.end);
        const n0 = isInClosedRange(next, src0.start, src0.end);
        const n1 = isInClosedRange(next, src1.start, src1.end);
        const prevBoth = p0 && p1;
        const nextBoth = n0 && n1;
        let leading = !prevBoth;
        let trailing = !nextBoth;
        if (leading && trailing) {
          leading = false;
          trailing = false;
        }
        flags.overlapSplitLeading = leading;
        flags.overlapSplitTrailing = trailing;
        if (leading) {
          if (p0 && !p1) flags.overlapSplitLeftTone = "brand";
          else if (p1 && !p0) flags.overlapSplitLeftTone = "neutral";
          else flags.overlapSplitLeftTone = "brand";
        }
        if (trailing) {
          if (n0 && !n1) flags.overlapSplitRightTone = "brand";
          else if (n1 && !n0) flags.overlapSplitRightTone = "neutral";
          else flags.overlapSplitRightTone = "brand";
        }
      }

      if (previewRange) {
        const inside = isInClosedRange(date, previewRange.start, previewRange.end);
        flags.inPreview = inside;
        flags.previewStart = sameDate(date, previewRange.start);
        flags.previewEnd = sameDate(date, previewRange.end);
        flags.ariaSelected =
          flags.ariaSelected || flags.previewStart || flags.previewEnd;
      }

      return flags;
    },
    [props, previewRange, draftAnchor, activeRangeIndex],
  );

  const buildExtras = useCallback(
    (date: CompleteDateValue): string[] => {
      const extras: string[] = [];
      if (sameDate(date, today)) extras.push("today");
      if (isDateDisabled(date)) extras.push("unavailable");

      if (props.mode === "single") {
        if (props.value && sameDate(props.value, date)) extras.push("selected");
        return extras;
      }

      if (props.mode === "range") {
        const r = props.value;
        if (r && !draftAnchor) {
          if (sameDate(date, r.start) && sameDate(date, r.end)) extras.push("selected range");
          else if (sameDate(date, r.start)) extras.push("range start");
          else if (sameDate(date, r.end)) extras.push("range end");
          else if (isInClosedRange(date, r.start, r.end)) extras.push("in range");
        }
        if (previewRange && isInClosedRange(date, previewRange.start, previewRange.end)) {
          extras.push("preview");
        }
        return extras;
      }

      const [r0, r1] = props.value.ranges;
      const hideR0 = draftAnchor && activeRangeIndex === 0;
      const hideR1 = draftAnchor && activeRangeIndex === 1;
      const in0 =
        r0 && !hideR0 ? isInClosedRange(date, r0.start, r0.end) : false;
      const in1 =
        r1 && !hideR1 ? isInClosedRange(date, r1.start, r1.end) : false;
      if (in0 && in1) extras.push("in period 1 and period 2");
      else if (in0) extras.push("in period 1");
      else if (in1) extras.push("in period 2");
      if (r0 && !hideR0 && sameDate(date, r0.start)) extras.push("period 1 start");
      if (r0 && !hideR0 && sameDate(date, r0.end)) extras.push("period 1 end");
      if (r1 && !hideR1 && sameDate(date, r1.start)) extras.push("period 2 start");
      if (r1 && !hideR1 && sameDate(date, r1.end)) extras.push("period 2 end");

      return extras;
    },
    [isDateDisabled, previewRange, props, today, draftAnchor, activeRangeIndex],
  );

  const renderMonthColumn = (matrixIndex: number) => {
    const { ym, cells } = matrices[matrixIndex]!;
    const titleId = matrixIndex === 0 ? titleId0 : titleId1;
    const weeks = chunkWeeks(cells);

    const bodyClass = cx(
      styles.dayBody,
      slideMonths && slideDir === "next" && styles.monthBodyEnterNext,
      slideMonths && slideDir === "prev" && styles.monthBodyEnterPrev,
    );

    const onMonthBodyAnimationEnd = () => {
      setSlideDir(null);
    };

    const previewEndpointsNeutral = props.mode === "dual-range" && activeRangeIndex === 1;
    const stripLayerOptions = { mode: props.mode, previewEndpointsNeutral };

    const inMonthCells = cells.filter((c) => c.inCurrentMonth);
    const flagsByDay = new Map<number, ReturnType<typeof getCellFlags>>();
    const metaByDay = new Map<number, ReturnType<typeof getStripLayerMeta>>();
    for (const c of inMonthCells) {
      const f = getCellFlags(c.date);
      flagsByDay.set(c.date.day, f);
      metaByDay.set(c.date.day, getStripLayerMeta(f, stripLayerOptions));
    }

    return (
      <div
        key={`${ym.year}-${ym.month}-${matrixIndex}`}
        className={styles.monthColumn}
        role="grid"
        aria-colcount={7}
        aria-rowcount={7}
        aria-labelledby={titleId}
      >
        <CalendarWeekdayRow labels={weekdayLabels} />
        <div className={styles.gridSurface}>
          <div
            className={bodyClass}
            role="rowgroup"
            onAnimationEnd={slideMonths ? onMonthBodyAnimationEnd : undefined}
          >
            {weeks.map((week, wi) => (
              <div key={wi} className={styles.dayRow} role="row">
                {week.map((cell) => {
                  const { date } = cell;
                  if (!cell.inCurrentMonth) {
                    return (
                      <div
                        key={`empty-${date.year}-${date.month}-${date.day}`}
                        className={styles.emptyDayCell}
                        role="gridcell"
                      />
                    );
                  }

                  const disabled = isDateDisabled(date);
                  const focused = sameDate(date, focusedDate);
                  const extra = getDateAttributes?.(date);
                  const flags = flagsByDay.get(date.day)!;
                  const extras = buildExtras(date);
                  const label = buildDayAriaLabel(localeForIntl, date, extras);
                  const monthFade = resolveMonthBoundaryFade(
                    date,
                    props,
                    previewRange,
                    draftAnchor,
                    activeRangeIndex,
                  );

                  const meta = metaByDay.get(date.day)!;
                  const prevMeta =
                    metaByDay.get(date.day - 1) ??
                    getStripLayerMeta(getCellFlags(addDays(date, -1)), stripLayerOptions);
                  const nextMeta =
                    metaByDay.get(date.day + 1) ??
                    getStripLayerMeta(getCellFlags(addDays(date, 1)), stripLayerOptions);

                  const stripSeamJoinPrev =
                    props.mode !== "single" &&
                    meta.startBridge &&
                    prevMeta.endBridge &&
                    meta.tintNeutral === prevMeta.tintNeutral &&
                    (meta.tintBrand || meta.tintNeutral) &&
                    (prevMeta.tintBrand || prevMeta.tintNeutral) &&
                    !flags.overlapSplitLeading &&
                    !monthFade?.leading;

                  const stripSeamJoinNext =
                    props.mode !== "single" &&
                    meta.endBridge &&
                    nextMeta.startBridge &&
                    meta.tintNeutral === nextMeta.tintNeutral &&
                    (meta.tintBrand || meta.tintNeutral) &&
                    (nextMeta.tintBrand || nextMeta.tintNeutral) &&
                    !flags.overlapSplitTrailing &&
                    !monthFade?.trailing;

                  return (
                    <CalendarDateCell
                      key={`${date.year}-${date.month}-${date.day}`}
                      date={date}
                      label={label}
                      dayNumber={date.day}
                      outside={false}
                      today={sameDate(date, today)}
                      disabled={disabled}
                      tabIndex={focused ? 0 : -1}
                      className={extra?.className}
                      title={extra?.title}
                      onClick={() => handleDayClick(date)}
                      onFocus={() => {
                        setFocusedDate(date);
                        // Always drop hover on focus moves so focusedDate isn't overridden by
                        // a stale hovered cell (keyboard + mouse mix, or click without mouseEnter).
                        setRangePreviewHoverDate(null);
                      }}
                      onMouseEnter={() => {
                        if (
                          draftAnchor &&
                          (props.mode === "range" || props.mode === "dual-range") &&
                          !isDateDisabled(date)
                        ) {
                          setRangePreviewHoverDate(date);
                        }
                      }}
                      selected={flags.selected}
                      inRange={flags.inRange}
                      rangeStart={flags.rangeStart}
                      rangeEnd={flags.rangeEnd}
                      inRange0={flags.inRange0}
                      range0Start={flags.range0Start}
                      range0End={flags.range0End}
                      inRange1={flags.inRange1}
                      range1Start={flags.range1Start}
                      range1End={flags.range1End}
                      bothRanges={flags.bothRanges}
                      overlapSplitLeading={flags.overlapSplitLeading}
                      overlapSplitTrailing={flags.overlapSplitTrailing}
                      overlapSplitLeftTone={flags.overlapSplitLeftTone ?? undefined}
                      overlapSplitRightTone={flags.overlapSplitRightTone ?? undefined}
                      inPreview={flags.inPreview}
                      previewStart={flags.previewStart}
                      previewEnd={flags.previewEnd}
                      mix={!!flags.bothRanges}
                      ariaSelected={flags.ariaSelected}
                      monthFadeLeading={monthFade?.leading}
                      monthFadeTrailing={monthFade?.trailing}
                      monthFadeTone={monthFade?.tone}
                      monthFadePreview={monthFade?.preview}
                      previewEndpointsNeutral={previewEndpointsNeutral}
                      calendarMode={props.mode}
                      stripSeamJoinPrev={stripSeamJoinPrev}
                      stripSeamJoinNext={stripSeamJoinNext}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      className={cx(styles.root, numberOfMonths === 2 && styles.rootDual, className)}
      aria-label={ariaLabel}
      onKeyDownCapture={onKeyDown}
    >
      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {liveMonthText}
      </div>

      {props.mode === "dual-range" && (
        <div className={styles.dualRangeToolbar} role="group" aria-label="Active period">
          <button
            type="button"
            className={cx(styles.rangeTab, activeRangeIndex === 0 && styles.rangeTabActive)}
            onClick={() => setActiveRangeIndex(0)}
            aria-pressed={activeRangeIndex === 0}
          >
            Period 1
          </button>
          <button
            type="button"
            className={cx(styles.rangeTab, activeRangeIndex === 1 && styles.rangeTabActive)}
            onClick={() => setActiveRangeIndex(1)}
            aria-pressed={activeRangeIndex === 1}
          >
            Period 2
          </button>
        </div>
      )}

      <div className={styles.calendarShell}>
        <div className={styles.titleRow}>
          <IconButton
            className={styles.navPrev}
            size="md"
            variant="neutral"
            emphasis="low"
            aria-label="Previous month"
            icon={<Icon name="chevron_left" size={16} />}
            hideTooltip
            onClick={() => bumpMonth(-1)}
          />
          <IconButton
            className={styles.navNext}
            size="md"
            variant="neutral"
            emphasis="low"
            aria-label="Next month"
            icon={<Icon name="chevron_right" size={16} />}
            hideTooltip
            onClick={() => bumpMonth(1)}
          />
          <div className={styles.titleRowInner}>
            {monthsToRender.map((ym, i) => (
              <div key={`title-${ym.year}-${ym.month}`} className={styles.shellTitleSlot}>
                <h2 id={i === 0 ? titleId0 : titleId1} className={styles.monthTitle}>
                  {formatMonthYearShort(localeForIntl, ym.year, ym.month)}
                </h2>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.monthsHost}>
          <div className={styles.slideViewport}>
            <div className={cx(styles.slideTrack, slideMonths && styles.slideTrackAnimated)}>
              <div className={styles.slidePanel}>
                <div
                  className={styles.monthsRow}
                  id={numberOfMonths === 2 ? weekdayDecorativeId : undefined}
                >
                  {matrices.map((_, i) => renderMonthColumn(i))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {caption != null && <div className={styles.caption}>{caption}</div>}
    </section>
  );
}

Calendar.displayName = "Calendar";
