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
import type { ChartAnnotation } from "../ChartPrimitives/chartUtils";
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

  const htmlOverlay = useCallback(
    (ctx: ChartRenderContext<D>) => {
      if (!annotations?.length) return null;
      return (
        <AnnotationLayer
          annotations={annotations}
          ctx={ctx}
          marginLeft={containerProps.margin?.left ?? 48}
          marginTop={containerProps.margin?.top ?? 16}
        />
      );
    },
    [annotations, containerProps.margin],
  );

  return (
    <ChartContainer<D>
      {...containerProps}
      ariaLabel="Line chart"
      htmlOverlay={annotations?.length ? htmlOverlay : undefined}
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
            return (
              <g key={`area-${s.id}`} style={{ opacity: w }}>
                <AreaClosed
                  data={s.data}
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

        return (
          <AnimatedLine
            key={s.id}
            data={s.data}
            xAccessor={(d) => xScale(xAccessor(d)) ?? 0}
            yAccessor={(d) => scale(yAccessor(d)) ?? 0}
            color={baseColor}
            strokeWidth={isThisHovered ? 2.5 : 2}
            opacity={hoverOpacity * w}
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
