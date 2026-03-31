import { useState, useCallback, useMemo, useId, useEffect } from "react";
import { ParentSize } from "@visx/responsive";
import { Group } from "@visx/group";
import { curveMonotoneX } from "@visx/curve";
import { scaleLinear } from "@visx/scale";
import type { CurveFactory } from "d3-shape";
import { AnimatedLine } from "../LineChart/AnimatedLine";
import { ChartAxes } from "../ChartPrimitives/ChartAxes";
import { ChartGrid } from "../ChartPrimitives/ChartGrid";
import { ChartLegend } from "../ChartPrimitives/ChartLegend";
import { CrosshairDots, type CrosshairPoint } from "../ChartPrimitives/Crosshair";
import { ChartTooltipContent, type TooltipEntry } from "../ChartPrimitives/ChartTooltip";
import { Tooltip } from "../Tooltip";
import {
  buildBandScale,
  getSeriesColor,
  type Series,
  type Margin,
  DEFAULT_MARGIN,
} from "../ChartPrimitives";
import { useSeriesAnimation, type DomainTarget } from "../../hooks/useSeriesAnimation";
import { cx } from "../../utils/cx";
import styles from "../ChartPrimitives/ChartContainer.module.css";

function computeGroupLayout(
  bandStart: number,
  bandWidth: number,
  weights: number[],
  padding: number,
): { pos: number; size: number }[] {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0) return weights.map(() => ({ pos: bandStart, size: 0 }));
  const result: { pos: number; size: number }[] = [];
  let cursor = bandStart;
  for (let i = 0; i < weights.length; i++) {
    const slotWidth = (weights[i] / total) * bandWidth;
    const barSize = slotWidth * (1 - padding);
    const pad = slotWidth * padding / 2;
    result.push({ pos: cursor + pad, size: barSize });
    cursor += slotWidth;
  }
  return result;
}

function roundedRectPath(
  x: number, y: number, w: number, h: number, r: number,
  corners: { tl?: boolean; tr?: boolean; bl?: boolean; br?: boolean }
): string {
  const clamp = Math.min(r, w / 2, h / 2);
  const tl = corners.tl ? clamp : 0;
  const tr = corners.tr ? clamp : 0;
  const br = corners.br ? clamp : 0;
  const bl = corners.bl ? clamp : 0;
  return [
    `M${x + tl},${y}`,
    `H${x + w - tr}`,
    tr ? `A${tr},${tr} 0 0 1 ${x + w},${y + tr}` : `L${x + w},${y}`,
    `V${y + h - br}`,
    br ? `A${br},${br} 0 0 1 ${x + w - br},${y + h}` : `L${x + w},${y + h}`,
    `H${x + bl}`,
    bl ? `A${bl},${bl} 0 0 1 ${x},${y + h - bl}` : `L${x},${y + h}`,
    `V${y + tl}`,
    tl ? `A${tl},${tl} 0 0 1 ${x + tl},${y}` : `L${x},${y}`,
    "Z",
  ].join("");
}

export type ComboSeriesType = "bar" | "line";

export interface ComboSeries<D = any> extends Series<D> {
  /** Render type: bars or line. */
  type: ComboSeriesType;
}

export interface ComboChartProps<D = any> {
  series: ComboSeries<D>[];
  categoryAccessor: (d: D) => string;
  yAccessor: (d: D) => number;
  /** Bar variant for bar-type series. */
  barVariant?: "simple" | "grouped" | "stacked";
  barPadding?: number;
  groupPadding?: number;
  barRadius?: number;
  /** Curve factory for line-type series. */
  curve?: CurveFactory;
  lineStrokeWidth?: number;
  animate?: boolean;
  showGrid?: boolean;
  showYGrid?: boolean;
  showXGrid?: boolean;
  showAxes?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  margin?: Margin;
  height?: number;
  numCategoryTicks?: number;
  numValueTicks?: number;
  categoryTickFormat?: (value: any) => string;
  /** Tick format for left (bar) Y-axis. */
  valueTickFormat?: (value: any) => string;
  /** Tick format for right Y-axis (when line series use yAxis: "right"). */
  yRightTickFormat?: (value: any) => string;
  tooltipCategoryFormat?: (value: string) => string;
  tooltipValueFormat?: (value: number) => string;
  /** Tooltip value format for right-axis series. */
  tooltipYRightFormat?: (value: number) => string;
  yLeftTitle?: string;
  yRightTitle?: string;
  className?: string;
}

interface CategoryLookup<D> {
  map: Map<string, D>;
}

function ComboChartInner<D>({
  series,
  categoryAccessor,
  yAccessor,
  barVariant = "grouped",
  barPadding = 0.2,
  groupPadding = 0.1,
  barRadius = 4,
  curve = curveMonotoneX,
  lineStrokeWidth = 2,
  animate = true,
  showGrid = true,
  showYGrid,
  showXGrid,
  showAxes = true,
  showLegend = true,
  showTooltip = true,
  margin = DEFAULT_MARGIN,
  width,
  height,
  numCategoryTicks,
  numValueTicks = 5,
  categoryTickFormat,
  valueTickFormat,
  yRightTickFormat,
  tooltipCategoryFormat,
  tooltipValueFormat,
  tooltipYRightFormat,
  yLeftTitle,
  yRightTitle,
  className,
}: ComboChartProps<D> & { width: number; height: number }) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [hoverCategory, setHoverCategory] = useState<string | null>(null);
  const [hoverSeriesId, setHoverSeriesId] = useState<string | null>(null);
  const clipId = useId().replace(/:/g, "");
  const [animateIn, setAnimateIn] = useState(!animate);

  useEffect(() => {
    if (!animate) { setAnimateIn(true); return; }
    const raf = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  const toggleSeries = useCallback((id: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const hasRightAxis = useMemo(() => series.some((s) => s.yAxis === "right"), [series]);

  const categories = useMemo(
    () => (series[0]?.data.map(categoryAccessor) ?? []),
    [series, categoryAccessor]
  );

  const computeDomainValues = useCallback(
    (targetVisible: ComboSeries<D>[], axis: "left" | "right"): DomainTarget | null => {
      const filtered = targetVisible.filter((s) =>
        axis === "right" ? s.yAxis === "right" : s.yAxis !== "right",
      );
      if (axis === "right" && !hasRightAxis) return null;
      const bars = filtered.filter((s) => s.type === "bar");
      const lines = filtered.filter((s) => s.type === "line");
      const barVals: number[] = [];
      if (barVariant === "stacked") {
        const lookups = bars.map((s) => {
          const m = new Map<string, D>();
          s.data.forEach((d) => m.set(categoryAccessor(d), d));
          return m;
        });
        categories.forEach((cat) => {
          let sum = 0;
          lookups.forEach((m) => { const d = m.get(cat); if (d) sum += yAccessor(d); });
          barVals.push(sum);
        });
      } else {
        bars.forEach((s) => s.data.forEach((d) => barVals.push(yAccessor(d))));
      }
      const lineVals = lines.flatMap((s) => s.data.map(yAccessor));
      return { values: [...barVals, ...lineVals], includeZero: true };
    },
    [hasRightAxis, barVariant, categories, categoryAccessor, yAccessor],
  );

  const { getWeight, visibleSeries, renderTick, leftDomain, rightDomain } =
    useSeriesAnimation<D, ComboSeries<D>>({
      series,
      hiddenSeries,
      computeDomainValues,
    });

  const barSeries = useMemo(() => visibleSeries.filter((s) => s.type === "bar"), [visibleSeries]);
  const lineSeries = useMemo(() => visibleSeries.filter((s) => s.type === "line"), [visibleSeries]);

  const barLookups = useMemo<CategoryLookup<D>[]>(
    () =>
      barSeries.map((s) => {
        const map = new Map<string, D>();
        s.data.forEach((d) => map.set(categoryAccessor(d), d));
        return { map };
      }),
    [barSeries, categoryAccessor]
  );

  const lineLookups = useMemo<CategoryLookup<D>[]>(
    () =>
      lineSeries.map((s) => {
        const map = new Map<string, D>();
        s.data.forEach((d) => map.set(categoryAccessor(d), d));
        return { map };
      }),
    [lineSeries, categoryAccessor]
  );

  const innerHeight = height - margin.top - margin.bottom;

  const rightMargin = useMemo(
    () => hasRightAxis ? Math.max(margin.right, 48) : margin.right,
    [hasRightAxis, margin.right]
  );
  const effectiveInnerWidth = width - margin.left - rightMargin;

  const categoryScale = useMemo(
    () => buildBandScale(categories, effectiveInnerWidth, barPadding),
    [categories, effectiveInnerWidth, barPadding]
  );

  const leftScale = useMemo(() => {
    const [lo, hi] = leftDomain ?? [0, 1];
    return scaleLinear<number>({ domain: [lo, hi], range: [innerHeight, 0] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerHeight, renderTick]);

  const rightScale = useMemo(() => {
    if (!hasRightAxis || !rightDomain) return null;
    const [lo, hi] = rightDomain;
    return scaleLinear<number>({ domain: [lo, hi], range: [innerHeight, 0] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRightAxis, innerHeight, renderTick]);

  const getGroupWeights = useCallback(() => {
    return barSeries.map((s) => getWeight(s));
  }, [barSeries, getWeight]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const step = categoryScale.step();
      const paddingOuter = step * (categoryScale.paddingOuter?.() ?? barPadding / 2);
      const idx = Math.floor((mx - paddingOuter) / step);
      const cat = categories[Math.max(0, Math.min(idx, categories.length - 1))];

      if (cat !== undefined) {
        const bandStart = categoryScale(cat) ?? 0;
        const bandEnd = bandStart + categoryScale.bandwidth();
        if (mx >= bandStart && mx <= bandEnd) {
          setHoverCategory(cat);

          let foundSeries: string | null = null;

          if (barVariant === "grouped" && barSeries.length > 1) {
            const layout = computeGroupLayout(bandStart, categoryScale.bandwidth(), getGroupWeights(), groupPadding);
            for (let bi = 0; bi < barSeries.length; bi++) {
              const s = barSeries[bi];
              const lookup = barLookups[bi];
              const d = lookup?.map.get(cat);
              if (!d) continue;
              const val = yAccessor(d);
              const { pos: barStart2, size: barSize } = layout[bi];
              const barEnd2 = barStart2 + barSize;
              const barTop = Math.min(leftScale(val) ?? 0, leftScale(0) ?? 0);
              const barBottom = Math.max(leftScale(val) ?? 0, leftScale(0) ?? 0);
              if (mx >= barStart2 && mx <= barEnd2 && my >= barTop && my <= barBottom) {
                foundSeries = s.id;
                break;
              }
            }
          } else if (barVariant === "stacked") {
            let cumulative = 0;
            for (const s of barSeries) {
              const lookup = barLookups[barSeries.indexOf(s)];
              const d = lookup?.map.get(cat);
              if (!d) continue;
              const val = yAccessor(d);
              const y0 = cumulative;
              const y1 = cumulative + val;
              cumulative = y1;
              const barTop = leftScale(y1) ?? 0;
              const barBottom = leftScale(y0) ?? 0;
              if (my >= barTop && my <= barBottom) {
                foundSeries = s.id;
                break;
              }
            }
          }

          setHoverSeriesId(foundSeries);
        } else {
          setHoverCategory(null);
          setHoverSeriesId(null);
        }
      } else {
        setHoverCategory(null);
        setHoverSeriesId(null);
      }
    },
    [categoryScale, categories, barPadding, barVariant, barSeries, barLookups, yAccessor, leftScale, getGroupWeights, groupPadding]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverCategory(null);
    setHoverSeriesId(null);
  }, []);

  const tooltipData = useMemo(() => {
    if (!hoverCategory || !showTooltip) return null;
    const entries: TooltipEntry[] = [];

    visibleSeries.forEach((s) => {
      const globalIdx = series.indexOf(s);
      const color = getSeriesColor(globalIdx, s.color);

      let lookup: CategoryLookup<D> | undefined;
      if (s.type === "bar") {
        lookup = barLookups[barSeries.indexOf(s)];
      } else {
        lookup = lineLookups[lineSeries.indexOf(s)];
      }

      const d = lookup?.map.get(hoverCategory);
      if (!d) return;
      const val = yAccessor(d);

      const isRight = s.yAxis === "right";
      const fmt = isRight && tooltipYRightFormat
        ? tooltipYRightFormat(val)
        : tooltipValueFormat
          ? tooltipValueFormat(val)
          : val.toLocaleString();

      entries.push({ label: s.label, value: fmt, color, axis: isRight ? "right" : "left" });
    });

    const header = tooltipCategoryFormat
      ? tooltipCategoryFormat(hoverCategory)
      : hoverCategory;

    return { entries, header };
  }, [hoverCategory, showTooltip, visibleSeries, series, barSeries, lineSeries, barLookups, lineLookups, yAccessor, tooltipValueFormat, tooltipYRightFormat, tooltipCategoryFormat]);

  if (effectiveInnerWidth <= 0 || innerHeight <= 0) return null;

  const zeroPos = leftScale(0) ?? innerHeight;
  const baseOnAxis = Math.abs(zeroPos - innerHeight) < 1;
  const roundBase = !showAxes || !baseOnAxis;

  const staggerMs = 40;
  const durationMs = 500;
  const easing = "cubic-bezier(0, 0, 0.2, 1)";

  const getBarStyle = (catIdx: number, isCatHovered: boolean, seriesId: string): React.CSSProperties => {
    const delay = catIdx * staggerMs;
    const scale = animateIn ? 1 : 0;

    let opacity = 1;
    if (hoverCategory) {
      if (hoverSeriesId && barSeries.length > 1) {
        opacity = seriesId === hoverSeriesId ? 1 : 0.24;
      } else {
        opacity = isCatHovered ? 1 : 0.24;
      }
    }

    return {
      transform: `scaleY(${scale})`,
      transformOrigin: `center ${zeroPos}px`,
      transition: `transform ${durationMs}ms ${easing} ${delay}ms, opacity 150ms ease`,
      opacity,
    };
  };

  const bars: React.ReactNode[] = [];

  categories.forEach((cat, catIdx) => {
    const isCatHovered = hoverCategory === cat;

    if (barVariant === "stacked") {
      let cumValue = 0;
      barSeries.forEach((s, si) => {
        const globalIdx = series.indexOf(s);
        const color = getSeriesColor(globalIdx, s.color);
        const lookup = barLookups[si];
        const d = lookup.map.get(cat);
        if (!d) return;
        const val = yAccessor(d) * getWeight(s);
        const y0 = cumValue;
        const y1 = cumValue + val;
        cumValue = y1;

        const isFirst = si === 0;
        const isLast = si === barSeries.length - 1;
        const rEnd = isLast ? barRadius : 0;
        const rBase = (isFirst && roundBase) ? barRadius : 0;
        const style = getBarStyle(catIdx, isCatHovered, s.id);

        const x = categoryScale(cat) ?? 0;
        const bw = categoryScale.bandwidth();
        const top = leftScale(y1) ?? 0;
        const bottom = leftScale(y0) ?? 0;
        const h = Math.max(0, bottom - top);
        bars.push(
          <path
            key={`${s.id}-${cat}`}
            d={roundedRectPath(x, top, bw, h, barRadius, { tl: rEnd > 0, tr: rEnd > 0, bl: rBase > 0, br: rBase > 0 })}
            fill={color}
            stroke="var(--element-surface-default)"
            strokeWidth={4}
            paintOrder="stroke"
            style={style}
          />
        );
      });
    } else if (barVariant === "grouped" && barSeries.length > 1) {
      const bandX = categoryScale(cat) ?? 0;
      const layout = computeGroupLayout(bandX, categoryScale.bandwidth(), getGroupWeights(), groupPadding);
      barSeries.forEach((s, bi) => {
        const globalIdx = series.indexOf(s);
        const color = getSeriesColor(globalIdx, s.color);
        const lookup = barLookups[bi];
        const d = lookup.map.get(cat);
        if (!d) return;
        const val = yAccessor(d) * getWeight(s);
        const style = getBarStyle(catIdx, isCatHovered, s.id);
        const allCorners = roundBase;

        const { pos: x, size: bw } = layout[bi];
        const barY = val >= 0 ? (leftScale(val) ?? 0) : zeroPos;
        const barH = Math.abs((leftScale(val) ?? 0) - zeroPos);
        bars.push(
          <path
            key={`${s.id}-${cat}`}
            d={roundedRectPath(x, barY, bw, barH, barRadius, { tl: true, tr: true, bl: allCorners, br: allCorners })}
            fill={color}
            style={style}
          />
        );
      });
    } else {
      const s = barSeries[0];
      if (!s) return;
      const globalIdx = series.indexOf(s);
      const color = getSeriesColor(globalIdx, s.color);
      const lookup = barLookups[0];
      const d = lookup?.map.get(cat);
      if (!d) return;
      const val = yAccessor(d) * getWeight(s);
      const style = getBarStyle(catIdx, isCatHovered, s.id);
      const allCorners = roundBase;

      const x = categoryScale(cat) ?? 0;
      const bw = categoryScale.bandwidth();
      const barY = val >= 0 ? (leftScale(val) ?? 0) : zeroPos;
      const barH = Math.abs((leftScale(val) ?? 0) - zeroPos);
      bars.push(
        <path
          key={`${s.id}-${cat}`}
          d={roundedRectPath(x, barY, bw, barH, barRadius, { tl: true, tr: true, bl: allCorners, br: allCorners })}
          fill={color}
          style={style}
        />
      );
    }
  });

  const highlightX = hoverCategory ? (categoryScale(hoverCategory) ?? 0) : 0;

  const crosshairPoints = useMemo<CrosshairPoint[]>(() => {
    if (!hoverCategory) return [];
    const count = categories.length;
    const catIdx = categories.indexOf(hoverCategory);
    if (catIdx < 0) return [];
    const dotX = count > 1 ? (catIdx / (count - 1)) * effectiveInnerWidth : effectiveInnerWidth / 2;
    const points: CrosshairPoint[] = [];
    lineSeries.forEach((s) => {
      const globalIdx = series.indexOf(s);
      const color = getSeriesColor(globalIdx, s.color);
      const isRight = s.yAxis === "right";
      const scale = isRight && rightScale ? rightScale : leftScale;
      const lookup = lineLookups[lineSeries.indexOf(s)];
      const d = lookup?.map.get(hoverCategory);
      if (!d) return;
      points.push({
        x: dotX,
        y: scale(yAccessor(d)) ?? 0,
        color,
        icon: s.icon,
      });
    });
    return points;
  }, [hoverCategory, categories, effectiveInnerWidth, lineSeries, series, lineLookups, leftScale, rightScale, yAccessor]);

  const tooltipContent = tooltipData ? (
    <ChartTooltipContent
      header={tooltipData.header}
      entries={tooltipData.entries}
      yLeftTitle={yLeftTitle}
      yRightTitle={yRightTitle}
    />
  ) : undefined;

  return (
    <Tooltip
      anchor="cursor"
      placement="right"
      offsetPx={16}
      showTail={false}
      showDelay={0}
      hideDelay={0}
      open={!!tooltipData && showTooltip}
      content={tooltipContent}
      type="neutral"
      className={styles.tooltipWrapper}
    >
      <div className={cx(styles.container, className)} style={{ position: "relative" }}>
        <svg
          width={width}
          height={height}
          overflow="visible"
          className={styles.chartSvg}
          role="img"
          aria-label="Combo chart"
        >
          <Group left={margin.left} top={margin.top}>
            <ChartGrid
              xScale={categoryScale}
              yScale={leftScale}
              innerWidth={effectiveInnerWidth}
              innerHeight={innerHeight}
              numXTicks={numCategoryTicks ?? categories.length}
              numYTicks={numValueTicks}
              showYGrid={showYGrid ?? showGrid}
              showXGrid={showXGrid ?? showGrid}
            />

            <defs>
              <clipPath id={clipId}>
                <rect x={0} y={0} width={effectiveInnerWidth} height={innerHeight} />
              </clipPath>
            </defs>

            <g clipPath={`url(#${clipId})`}>
              {hoverCategory && (
                <rect
                  x={highlightX}
                  y={0}
                  width={categoryScale.bandwidth()}
                  height={innerHeight}
                  fill="currentColor"
                  opacity={0.04}
                  style={{ transition: "x 100ms ease" }}
                />
              )}
              {bars}

              {lineSeries.map((s, li) => {
                const globalIdx = series.indexOf(s);
                const color = getSeriesColor(globalIdx, s.color);
                const isRight = s.yAxis === "right";
                const scale = isRight && rightScale ? rightScale : leftScale;
                const lookup = lineLookups[li];

                const count = categories.length;
                const lineData = categories
                  .map((cat, ci) => {
                    const d = lookup.map.get(cat);
                    if (!d) return null;
                    return {
                      x: count > 1 ? (ci / (count - 1)) * effectiveInnerWidth : effectiveInnerWidth / 2,
                      y: scale(yAccessor(d)) ?? 0,
                    };
                  })
                  .filter((p): p is { x: number; y: number } => p !== null);

                const weight = getWeight(s);
                const hoverOpacity = hoverCategory ? (hoverSeriesId && hoverSeriesId !== s.id ? 0.24 : 1) : 1;
                const lineOpacity = hoverOpacity * weight;

                return (
                  <g
                    key={`line-${s.id}`}
                    filter="drop-shadow(0 0.5px 1px rgba(0,0,0,0.24))"
                    style={{ transition: "opacity 200ms ease" }}
                  >
                    <AnimatedLine
                      data={lineData}
                      xAccessor={(d) => d.x}
                      yAccessor={(d) => d.y}
                      color={color}
                      strokeWidth={lineStrokeWidth}
                      opacity={lineOpacity}
                      curve={curve}
                      animate={animate}
                      delay={li * 150}
                      dashStyle={s.dash}
                    />
                  </g>
                );
              })}
            </g>

            {showAxes && (
              <ChartAxes
                xScale={categoryScale}
                yScale={leftScale}
                innerWidth={effectiveInnerWidth}
                innerHeight={innerHeight}
                numXTicks={numCategoryTicks ?? categories.length}
                numYTicks={numValueTicks}
                xTickFormat={categoryTickFormat}
                yTickFormat={valueTickFormat}
                yRightScale={rightScale ?? undefined}
                yRightTickFormat={yRightTickFormat}
              />
            )}

            <rect
              x={0}
              y={0}
              width={effectiveInnerWidth}
              height={innerHeight}
              fill="transparent"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
          </Group>
        </svg>

        {crosshairPoints.length > 0 && (
          <CrosshairDots
            points={crosshairPoints}
            offsetLeft={margin.left}
            offsetTop={margin.top}
          />
        )}

        {showLegend && series.length > 1 && (
          <ChartLegend
            series={series}
            hiddenSeries={hiddenSeries}
            onToggle={toggleSeries}
          />
        )}
      </div>
    </Tooltip>
  );
}

export function ComboChart<D = any>(props: ComboChartProps<D>) {
  const { height = 400, ...rest } = props;
  return (
    <ParentSize>
      {({ width }) =>
        width > 0 ? (
          <ComboChartInner<D> {...rest} width={width} height={height} />
        ) : null
      }
    </ParentSize>
  );
}
