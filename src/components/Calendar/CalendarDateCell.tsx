import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import { getStripLayerMeta } from "./calendarStripLayerMeta";
import type { CompleteDateValue } from "./calendarMath";
import { dateToIsoDateString } from "./calendarMath";
import styles from "./CalendarDateCell.module.css";

export interface CalendarDateCellProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  date: CompleteDateValue;
  label: string;
  /** Visible day number */
  dayNumber: number;
  outside: boolean;
  today: boolean;
  disabled: boolean;
  tabIndex?: number;
  selected?: boolean;
  inRange?: boolean;
  rangeStart?: boolean;
  rangeEnd?: boolean;
  inRange0?: boolean;
  range0Start?: boolean;
  range0End?: boolean;
  inRange1?: boolean;
  range1Start?: boolean;
  range1End?: boolean;
  bothRanges?: boolean;
  /** First calendar day in overlap: left = single-period strip, right = dotted overlap. */
  overlapSplitLeading?: boolean;
  /** Last calendar day in overlap: left = dotted overlap, right = single-period strip. */
  overlapSplitTrailing?: boolean;
  overlapSplitLeftTone?: "brand" | "neutral";
  overlapSplitRightTone?: "brand" | "neutral";
  inPreview?: boolean;
  previewStart?: boolean;
  previewEnd?: boolean;
  /** Dual-range overlap pattern (Figma `mix`) */
  mix?: boolean;
  /** Explicit selection state for range endpoints (overrides `selected` for aria-selected). */
  ariaSelected?: boolean;
  /** Dual-range: preview endpoints use neutral fill when editing period 2. */
  previewEndpointsNeutral?: boolean;
  calendarMode: "single" | "range" | "dual-range";
  /** Previous calendar day is same-tint end bridge — nudge fill past center to close the seam. */
  stripSeamJoinPrev?: boolean;
  /** Next calendar day is same-tint start bridge — nudge fill past center to close the seam. */
  stripSeamJoinNext?: boolean;
}

export const CalendarDateCell = forwardRef<HTMLDivElement, CalendarDateCellProps>(function CalendarDateCell({
  date,
  label,
  dayNumber,
  outside,
  today,
  disabled,
  tabIndex = -1,
  selected,
  inRange,
  rangeStart,
  rangeEnd,
  inRange0,
  range0Start,
  range0End,
  inRange1,
  range1Start,
  range1End,
  bothRanges,
  overlapSplitLeading = false,
  overlapSplitTrailing = false,
  overlapSplitLeftTone = "brand",
  overlapSplitRightTone = "brand",
  inPreview,
  previewStart,
  previewEnd,
  mix,
  ariaSelected,
  previewEndpointsNeutral = false,
  calendarMode,
  stripSeamJoinPrev = false,
  stripSeamJoinNext = false,
  className,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  ...rest
}: CalendarDateCellProps, ref) {
  const iso = dateToIsoDateString(date);

  const {
    brandEndpoint,
    neutralEndpoint,
    isStripInterior,
    startBridge,
    endBridge,
    showRangeLayer,
    tintNeutral,
    tintBrand,
  } = getStripLayerMeta(
    {
      selected,
      inRange,
      rangeStart,
      rangeEnd,
      inRange0,
      range0Start,
      range0End,
      inRange1,
      range1Start,
      range1End,
      bothRanges,
      inPreview,
      previewStart,
      previewEnd,
    },
    { mode: calendarMode, previewEndpointsNeutral },
  );

  /** Figma: today inside a range keeps the brand ring + brand text on the strip tint (6663:78805). */
  const showTodayRing =
    today &&
    !disabled &&
    !outside &&
    !brandEndpoint &&
    !neutralEndpoint;

  const onTint =
    isStripInterior ||
    (startBridge && !brandEndpoint && !neutralEndpoint) ||
    (endBridge && !brandEndpoint && !neutralEndpoint);

  const overlapVisualSplit = overlapSplitLeading || overlapSplitTrailing;

  /* Dual-range endpoints sit in overlap too: need both+mix + split gradients (not plain bridge). */
  const showBothOverlapLayer =
    !!bothRanges &&
    !!(isStripInterior || overlapSplitLeading || overlapSplitTrailing || startBridge || endBridge);

  /**
   * Underlay strip behind endpoints that sit on the other period's interior.
   * Blocked when the overlap layer already renders (showBothOverlapLayer) to avoid double-paint.
   */
  const stripUnderlayTone: "brand" | "neutral" | null = (() => {
    if (calendarMode !== "dual-range") return null;
    if (!(brandEndpoint || neutralEndpoint)) return null;
    if (showBothOverlapLayer) return null;
    if (inRange0) return "brand";
    if (inRange1) return "neutral";
    return null;
  })();

  return (
    <div
      ref={ref}
      className={styles.cell}
      role="gridcell"
      onMouseEnter={onMouseEnter as unknown as React.MouseEventHandler<HTMLDivElement>}
      onMouseLeave={onMouseLeave as unknown as React.MouseEventHandler<HTMLDivElement>}
      onMouseMove={onMouseMove as unknown as React.MouseEventHandler<HTMLDivElement>}
    >
      {stripUnderlayTone && (
        <div
          className={cx(
            styles.rangeLayer,
            stripUnderlayTone === "brand"
              ? styles.rangeLayerBrand
              : styles.rangeLayerNeutral,
            styles.rangeLayerMiddle,
          )}
          aria-hidden
        />
      )}
      {showRangeLayer && (
        <div
          className={cx(
            styles.rangeLayer,
            stripUnderlayTone && styles.rangeLayerStripForeground,
            isStripInterior && styles.rangeLayerMiddle,
            startBridge && styles.rangeLayerStart,
            endBridge && styles.rangeLayerEnd,
            tintBrand && styles.rangeLayerBrand,
            tintNeutral && styles.rangeLayerNeutral,
            bothRanges && showBothOverlapLayer && styles.rangeLayerBoth,
            mix && showBothOverlapLayer && styles.rangeLayerMix,
            overlapVisualSplit && overlapSplitLeading && styles.rangeLayerOverlapSplitLeading,
            overlapVisualSplit && overlapSplitTrailing && styles.rangeLayerOverlapSplitTrailing,
            overlapVisualSplit &&
              overlapSplitLeading &&
              overlapSplitLeftTone === "brand" &&
              styles.rangeLayerOverlapSplitLeadingLeftBrand,
            overlapVisualSplit &&
              overlapSplitLeading &&
              overlapSplitLeftTone === "neutral" &&
              styles.rangeLayerOverlapSplitLeadingLeftNeutral,
            overlapVisualSplit &&
              overlapSplitTrailing &&
              overlapSplitRightTone === "brand" &&
              styles.rangeLayerOverlapSplitTrailingRightBrand,
            overlapVisualSplit &&
              overlapSplitTrailing &&
              overlapSplitRightTone === "neutral" &&
              styles.rangeLayerOverlapSplitTrailingRightNeutral,
            inPreview &&
              (isStripInterior || startBridge || endBridge) &&
              !previewEndpointsNeutral &&
              styles.rangeLayerPreview,
            inPreview &&
              (isStripInterior || startBridge || endBridge) &&
              previewEndpointsNeutral &&
              styles.rangeLayerPreview,
            inPreview &&
              (isStripInterior || startBridge || endBridge) &&
              previewEndpointsNeutral &&
              styles.rangeLayerPreviewNeutralStrip,
            stripSeamJoinPrev && styles.rangeLayerSeamJoinPrev,
            stripSeamJoinNext && styles.rangeLayerSeamJoinNext,
          )}
          aria-hidden
        />
      )}
      <button
        type="button"
        data-date={iso}
        className={cx(
          styles.dayButton,
          outside && styles.outside,
          showTodayRing && styles.todayRing,
          disabled && styles.disabled,
          brandEndpoint && styles.endpoint,
          neutralEndpoint && styles.endpointNeutral,
          onTint && (tintNeutral ? styles.onTintNeutral : styles.onTint),
          isStripInterior && inPreview && !previewEndpointsNeutral && styles.onTintPreview,
          className,
        )}
        disabled={disabled}
        tabIndex={tabIndex}
        aria-label={label}
        aria-current={today ? "date" : undefined}
        aria-selected={
          ariaSelected !== undefined ? (ariaSelected ? true : undefined) : selected ? true : undefined
        }
        {...rest}
      >
        <time className={styles.inner} dateTime={iso}>
          {dayNumber}
        </time>
      </button>
    </div>
  );
});
