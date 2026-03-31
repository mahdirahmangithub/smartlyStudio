import { useState, useEffect, useMemo } from "react";
import { AreaClosed } from "@visx/shape";
import { AnimatedLine } from "./AnimatedLine";
import { ConfidenceBandArea } from "./ConfidenceBand";
import {
  ChartContainer,
  type ChartContainerProps,
  type ChartRenderContext,
  getSeriesColor,
} from "../ChartPrimitives";
import type { CurveFactory } from "d3-shape";

export interface LineChartProps<D = any>
  extends Omit<ChartContainerProps<D>, "children" | "ariaLabel"> {
  curve?: CurveFactory;
  showAreaFill?: boolean;
}

export function LineChart<D = any>(props: LineChartProps<D>) {
  const { curve, showAreaFill = false, ...containerProps } = props;

  return (
    <ChartContainer<D> {...containerProps} ariaLabel="Line chart">
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
        const isHovering =
          visibleSeries.length > 1 &&
          tooltipData &&
          tooltipData.hoveredSeriesIndex >= 0;
        const isThisHovered =
          isHovering && tooltipData!.hoveredSeriesIndex === i;
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
