import type { ButtonHTMLAttributes } from "react";
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
  /** Selection crosses month edge: fade only on day 1 / last day of month (953:151417). */
  monthFadeLeading?: boolean;
  monthFadeTrailing?: boolean;
  monthFadeTone?: "brand" | "neutral" | "both";
  monthFadePreview?: boolean;
  /** Dual-range: preview endpoints use neutral fill when editing period 2. */
  previewEndpointsNeutral?: boolean;
  calendarMode: "single" | "range" | "dual-range";
  /** Previous calendar day is same-tint end bridge — nudge fill past center to close the seam. */
  stripSeamJoinPrev?: boolean;
  /** Next calendar day is same-tint start bridge — nudge fill past center to close the seam. */
  stripSeamJoinNext?: boolean;
}

export function CalendarDateCell({
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
  monthFadeLeading,
  monthFadeTrailing,
  monthFadeTone,
  monthFadePreview,
  previewEndpointsNeutral = false,
  calendarMode,
  stripSeamJoinPrev = false,
  stripSeamJoinNext = false,
  className,
  ...rest
}: CalendarDateCellProps) {
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

  const monthFade = !!(monthFadeLeading || monthFadeTrailing);

  const overlapVisualSplit =
    (overlapSplitLeading || overlapSplitTrailing) && !monthFade;

  /* Dual-range endpoints sit in overlap too: need both+mix + split gradients (not plain bridge). */
  const showBothOverlapLayer =
    !!bothRanges &&
    !!(isStripInterior || overlapSplitLeading || overlapSplitTrailing || startBridge || endBridge);

  const inPeriod1 =
    !!inRange0 || !!range0Start || !!range0End;

  /**
   * P1 lavender underlay when the foreground strip is a P2-style bridge with transparent halves:
   * - Neutral: committed or preview P2 endpoints (`neutralEndpoint`).
   * - Brand: draft preview for period 1 (purple endpoints) while the day is strict P1 interior
   *   (`inRange0`) — same gap as neutral; `brandEndpoint` is true so the old neutral-only check missed it.
   *
   * Skip when `bothRanges`: overlap already paints brand + halftone on the foreground layer; a second
   * solid lavender layer reads as an extra darker rectangle vs dotted neighbors.
   */
  const previewAsRangeEndpoint =
    !!inPreview && !!(previewStart || previewEnd);
  const brandPreviewEndpointOnP1Interior =
    previewAsRangeEndpoint && !previewEndpointsNeutral && !!inRange0;

  const showBrandP1StripUnderlay =
    calendarMode === "dual-range" &&
    inPeriod1 &&
    !monthFade &&
    !bothRanges &&
    (neutralEndpoint || brandPreviewEndpointOnP1Interior);

  return (
    <div className={styles.cell} role="gridcell">
      {showBrandP1StripUnderlay && (
        <div
          className={cx(
            styles.rangeLayer,
            styles.rangeLayerStripUnderlay,
            styles.rangeLayerBrand,
            styles.rangeLayerMiddle,
          )}
          aria-hidden
        />
      )}
      {showRangeLayer && (
        <div
          className={cx(
            styles.rangeLayer,
            showBrandP1StripUnderlay && styles.rangeLayerStripForeground,
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
            monthFade && monthFadeLeading && styles.rangeLayerMonthFadeLeading,
            monthFade && monthFadeTrailing && styles.rangeLayerMonthFadeTrailing,
            monthFade &&
              monthFadePreview &&
              monthFadeTone === "brand" &&
              styles.rangeLayerMonthFadePreviewBrand,
            monthFade &&
              monthFadePreview &&
              monthFadeTone === "both" &&
              styles.rangeLayerMonthFadePreviewBoth,
            monthFade &&
              monthFadePreview &&
              monthFadeTone === "neutral" &&
              styles.rangeLayerMonthFadePreviewNeutral,
            monthFade &&
              !monthFadePreview &&
              monthFadeTone === "brand" &&
              styles.rangeLayerMonthFadeCommittedBrand,
            monthFade &&
              !monthFadePreview &&
              monthFadeTone === "neutral" &&
              styles.rangeLayerMonthFadeCommittedNeutral,
            monthFade &&
              !monthFadePreview &&
              monthFadeTone === "both" &&
              styles.rangeLayerMonthFadeCommittedBoth,
            stripSeamJoinPrev && styles.rangeLayerSeamJoinPrev,
            stripSeamJoinNext && styles.rangeLayerSeamJoinNext,
          )}
          aria-hidden
        />
      )}
      <button
        type="button"
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
}
