import { useState, useEffect, useMemo, useCallback } from "react";
import { AreaClosed } from "@visx/shape";
import { AnimatedLine } from "./AnimatedLine";
import { ConfidenceBandArea } from "./ConfidenceBand";
import {
  ChartContainer,
  type ChartContainerProps,
  type ChartRenderContext,
  getSeriesColor,
} from "../ChartPrimitives";
import {
  splitSeriesAtForecast,
  type ChartAnnotation,
  type ReferenceLine,
} from "../ChartPrimitives/chartUtils";
import { Tooltip } from "../Tooltip";
import containerStyles from "../ChartPrimitives/ChartContainer.module.css";
import type { CurveFactory } from "d3-shape";

export interface LineChartProps<D = any>
  extends Omit<ChartContainerProps<D>, "children" | "ariaLabel" | "htmlOverlay"> {
  curve?: CurveFactory;
  showAreaFill?: boolean;
  /** Persistent data-point annotations with always-visible tooltips. */
  annotations?: ChartAnnotation[];
}

export function LineChart<D = any>(props: LineChartProps<D>) {
  const { curve, showAreaFill = false, annotations, ...containerProps } = props;
  const referenceLines = containerProps.referenceLines;
  const hasReferenceLabels = referenceLines?.some((rl) => rl.label);

  const htmlOverlay = useCallback(
    (ctx: ChartRenderContext<D>) => {
      const marginLeft = containerProps.margin?.left ?? 48;
      const marginTop = containerProps.margin?.top ?? 16;
      return (
        <>
          {annotations?.length ? (
            <AnnotationLayer
              annotations={annotations}
              ctx={ctx}
              marginLeft={marginLeft}
              marginTop={marginTop}
            />
          ) : null}
          {referenceLines?.length ? (
            <ReferenceLineLabels
              referenceLines={referenceLines}
              ctx={ctx}
              marginLeft={marginLeft}
              marginTop={marginTop}
            />
          ) : null}
        </>
      );
    },
    [annotations, referenceLines, containerProps.margin],
  );

  const overlayActive = !!(annotations?.length || hasReferenceLabels);

  return (
    <ChartContainer<D>
      {...containerProps}
      ariaLabel="Line chart"
      htmlOverlay={overlayActive ? htmlOverlay : undefined}
    >
      {(ctx) => (
        <LineChartContent<D>
          ctx={ctx}
          curve={curve}
          showAreaFill={showAreaFill}
        />
      )}
    </ChartContainer>
  );
}

function AnnotationLayer<D>({
  annotations,
  ctx,
  marginLeft,
  marginTop,
}: {
  annotations: ChartAnnotation[];
  ctx: ChartRenderContext<D>;
  marginLeft: number;
  marginTop: number;
}) {
  const { xScale, yScale, yRightScale, allSeries } = ctx;

  const seriesIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    allSeries.forEach((s, i) => map.set(s.id, i));
    return map;
  }, [allSeries]);

  return (
    <>
      {annotations.map((a, i) => {
        const matchedSeries = a.seriesId
          ? allSeries.find((s) => s.id === a.seriesId)
          : allSeries[0];
        const seriesIdx = matchedSeries
          ? (seriesIndexMap.get(matchedSeries.id) ?? 0)
          : 0;
        const useRightAxis =
          matchedSeries?.yAxis === "right" && yRightScale;
        const scale = useRightAxis ? yRightScale : yScale;

        const px = (xScale(a.x) ?? 0) + marginLeft;
        const py = (scale(a.y) ?? 0) + marginTop;
        const color =
          a.color ?? getSeriesColor(seriesIdx, matchedSeries?.color);

        return (
          <Tooltip
            key={i}
            open
            label={a.label}
            description={a.description}
            placement={a.placement ?? "top"}
            showTail
            offsetPx={4}
            type="inverse"
          >
            <div
              className={containerStyles.annotationAnchor}
              style={{ left: px, top: py }}
            >
              <div className={containerStyles.indicatorBase}>
                <div className={containerStyles.indicatorBg} />
                <div
                  className={containerStyles.indicatorDot}
                  style={{ background: color }}
                />
              </div>
            </div>
          </Tooltip>
        );
      })}
    </>
  );
}

function ReferenceLineLabels<D>({
  referenceLines,
  ctx,
  marginLeft,
  marginTop,
}: {
  referenceLines: ReferenceLine[];
  ctx: ChartRenderContext<D>;
  marginLeft: number;
  marginTop: number;
}) {
  const { xScale } = ctx;
  return (
    <>
      {referenceLines.map((rl, i) => {
        if (!rl.label) return null;
        const px = (xScale(rl.x) ?? 0) + marginLeft;
        // Anchor at the chart's inner-top — Tooltip's placement="top" lifts
        // the label into the chart's top margin area.
        return (
          <Tooltip
            key={`ref-label-${i}`}
            open
            label={rl.label}
            placement="top"
            showTail
            type="neutral"
            offsetPx={4}
            lockPlacement
            /* Sit within the page stack instead of the default very-high
             * tooltip layer, so a sticky nav (--z-index-navigation: 1100)
             * still covers the chart's reference-line label. */
            zIndex="var(--z-index-above)"
          >
            <div
              className={containerStyles.annotationAnchor}
              style={{
                left: px,
                top: marginTop,
                width: 1,
                height: 1,
                pointerEvents: "none",
              }}
            />
          </Tooltip>
        );
      })}
    </>
  );
}

interface LineChartContentProps<D> {
  ctx: ChartRenderContext<D>;
  curve?: CurveFactory;
  showAreaFill: boolean;
}

function LineChartContent<D>({
  ctx,
  curve,
  showAreaFill,
}: LineChartContentProps<D>) {
  const {
    xScale,
    yScale,
    yRightScale,
    xAccessor,
    yAccessor,
    visibleSeries,
    allSeries,
    getWeight,
    tooltipData,
    legendHoveredId,
    clipId,
    animate,
    isZoomed,
  } = ctx;

  const seriesIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    allSeries.forEach((s, i) => map.set(s.id, i));
    return map;
  }, [allSeries]);

  const getIdx = (s: (typeof allSeries)[number]) =>
    seriesIndexMap.get(s.id) ?? 0;

  const areaFillSeries = useMemo(
    () => visibleSeries.filter((s) => showAreaFill || s.areaFill),
    [visibleSeries, showAreaFill],
  );

  const [drawComplete, setDrawComplete] = useState(!animate);

  useEffect(() => {
    if (!animate) {
      setDrawComplete(true);
      return;
    }
    setDrawComplete(false);
    const totalMs = (visibleSeries.length - 1) * 150 + 1000 + 100;
    const timer = setTimeout(() => setDrawComplete(true), totalMs);
    return () => clearTimeout(timer);
  }, [animate, visibleSeries.length]);

  return (
    <>
      {areaFillSeries.length > 0 && (
        <defs>
          {areaFillSeries.map((s) => {
            const idx = getIdx(s);
            const color = getSeriesColor(idx, s.color);
            const gradientId = `${clipId}-grad-${idx}`;
            return (
              <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
      )}

      {areaFillSeries.length > 0 && (
        <g
          style={{
            opacity: drawComplete ? 0.24 : 0,
            transition: "opacity 600ms var(--motion-easing-enter)",
          }}
        >
          {areaFillSeries.map((s) => {
            const idx = getIdx(s);
            const gradientId = `${clipId}-grad-${idx}`;
            const scale = s.yAxis === "right" && yRightScale ? yRightScale : yScale;
            const w = getWeight(s);
            // Only fill the actual (pre-forecast) portion so the projection
            // doesn't read as an "actual" volume.
            const split = splitSeriesAtForecast(s, xAccessor);
            const fillData = split ? split.actual : s.data;
            return (
              <g key={`area-${s.id}`} style={{ opacity: w }}>
                <AreaClosed
                  data={fillData}
                  x={(d) => xScale(xAccessor(d)) ?? 0}
                  y={(d) => scale(yAccessor(d)) ?? 0}
                  yScale={scale}
                  curve={curve}
                  fill={`url(#${gradientId})`}
                  strokeWidth={0}
                />
              </g>
            );
          })}
        </g>
      )}

      {visibleSeries.map((s) => {
        const band = s.confidenceBand;
        if (!band) return null;
        const idx = getIdx(s);
        const color = getSeriesColor(idx, s.color);
        const scale = s.yAxis === "right" && yRightScale ? yRightScale : yScale;
        const w = getWeight(s);
        return (
          <g key={`band-${s.id}`} style={{ opacity: w }}>
            <ConfidenceBandArea
              data={s.data}
              xAccessor={(d) => xScale(xAccessor(d)) ?? 0}
              y0Accessor={(d) => scale(band.lower(d)) ?? 0}
              y1Accessor={(d) => scale(band.upper(d)) ?? 0}
              color={color}
              curve={curve}
              yScale={scale}
            />
          </g>
        );
      })}

      {visibleSeries.map((s, i) => {
        const idx = getIdx(s);
        const baseColor = getSeriesColor(idx, s.color);
        const tooltipHovering =
          visibleSeries.length > 1 &&
          tooltipData &&
          tooltipData.hoveredSeriesIndex >= 0;
        const tooltipThisHovered =
          tooltipHovering && tooltipData!.hoveredSeriesIndex === i;

        const legendHovering =
          visibleSeries.length > 1 && legendHoveredId !== null;
        const legendThisHovered = legendHovering && legendHoveredId === s.id;

        const isHovering = tooltipHovering || legendHovering;
        const isThisHovered = tooltipThisHovered || legendThisHovered;
        const hoverOpacity = isHovering && !isThisHovered ? 0.24 : 1;
        const w = getWeight(s);
        const scale = s.yAxis === "right" && yRightScale ? yRightScale : yScale;
        const stroke = isThisHovered ? 2.5 : 2;
        const lineOpacity = hoverOpacity * w;

        const split = splitSeriesAtForecast(s, xAccessor);
        if (split) {
          // Lighter shade derived from the series color, mixed against the
          // chart's surface so it adapts to light / dark theme.
          const forecastColor = `color-mix(in oklch, ${baseColor} 50%, var(--element-surface-default))`;
          return (
            <g key={s.id}>
              <AnimatedLine
                data={split.actual}
                xAccessor={(d) => xScale(xAccessor(d)) ?? 0}
                yAccessor={(d) => scale(yAccessor(d)) ?? 0}
                color={baseColor}
                strokeWidth={stroke}
                opacity={lineOpacity}
                curve={curve}
                animate={animate && !isZoomed}
                delay={i * 150}
                dashStyle={s.dash}
              />
              <AnimatedLine
                data={split.forecast}
                xAccessor={(d) => xScale(xAccessor(d)) ?? 0}
                yAccessor={(d) => scale(yAccessor(d)) ?? 0}
                color={forecastColor}
                strokeWidth={stroke}
                opacity={lineOpacity}
                curve={curve}
                animate={animate && !isZoomed}
                /* Hold the dashed forecast invisible until the actual segment
                 * finishes drawing (AnimatedLine's spring runs for 1000 ms). */
                delay={i * 150 + 1000}
                dashStyle="dashed"
              />
            </g>
          );
        }

        return (
          <AnimatedLine
            key={s.id}
            data={s.data}
            xAccessor={(d) => xScale(xAccessor(d)) ?? 0}
            yAccessor={(d) => scale(yAccessor(d)) ?? 0}
            color={baseColor}
            strokeWidth={stroke}
            opacity={lineOpacity}
            curve={curve}
            animate={animate && !isZoomed}
            delay={i * 150}
            dashStyle={s.dash}
          />
        );
      })}
    </>
  );
}
