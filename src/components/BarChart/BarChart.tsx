import { useState, useCallback, useMemo, useId, useEffect } from "react";
import { ParentSize } from "@visx/responsive";
import { Group } from "@visx/group";
import { scaleBand } from "@visx/scale";
import { ChartAxes } from "../ChartPrimitives/ChartAxes";
import { ChartGrid } from "../ChartPrimitives/ChartGrid";
import { ChartLegend } from "../ChartPrimitives/ChartLegend";
import { ChartTooltipContent, type TooltipEntry } from "../ChartPrimitives/ChartTooltip";
import { Tooltip } from "../Tooltip";
import {
  buildBandScale,
  buildLinearScaleForBars,
  getSeriesColor,
  type Series,
  type Margin,
  DEFAULT_MARGIN,
} from "../ChartPrimitives";
import { cx } from "../../utils/cx";
import styles from "../ChartPrimitives/ChartContainer.module.css";

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

export type BarVariant = "simple" | "grouped" | "stacked";
export type BarOrientation = "vertical" | "horizontal";

export interface BarChartProps<D = any> {
  series: Series<D>[];
  /** Extracts the category label from a datum. */
  categoryAccessor: (d: D) => string;
  /** Extracts the numeric value from a datum. */
  yAccessor: (d: D) => number;
  variant?: BarVariant;
  orientation?: BarOrientation;
  /** Band padding between categories (0–1). */
  barPadding?: number;
  /** Padding between bars in a group (0–1). Only used for "grouped" variant. */
  groupPadding?: number;
  /** Border radius on the value-end of each bar (px). */
  barRadius?: number;
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
  valueTickFormat?: (value: any) => string;
  tooltipCategoryFormat?: (value: string) => string;
  tooltipValueFormat?: (value: number) => string;
  className?: string;
}

interface CategoryLookup<D> {
  map: Map<string, D>;
}

function BarChartInner<D>({
  series,
  categoryAccessor,
  yAccessor,
  variant = "grouped",
  orientation = "vertical",
  barPadding = 0.2,
  groupPadding = 0.1,
  barRadius = 4,
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
  tooltipCategoryFormat,
  tooltipValueFormat,
  className,
}: BarChartProps<D> & { width: number; height: number }) {
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

  const isVertical = orientation === "vertical";

  const toggleSeries = useCallback((id: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const visibleSeries = useMemo(
    () => series.filter((s) => !hiddenSeries.has(s.id)),
    [series, hiddenSeries]
  );

  const categories = useMemo(
    () => (series[0]?.data.map(categoryAccessor) ?? []),
    [series, categoryAccessor]
  );

  const seriesLookups = useMemo<CategoryLookup<D>[]>(
    () =>
      visibleSeries.map((s) => {
        const map = new Map<string, D>();
        s.data.forEach((d) => map.set(categoryAccessor(d), d));
        return { map };
      }),
    [visibleSeries, categoryAccessor]
  );

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const categoryScale = useMemo(
    () => buildBandScale(categories, isVertical ? innerWidth : innerHeight, barPadding),
    [categories, isVertical ? innerWidth : innerHeight, barPadding]
  );

  const allValues = useMemo(() => {
    if (variant === "stacked") {
      return categories.map((cat) => {
        let sum = 0;
        seriesLookups.forEach((lookup) => {
          const d = lookup.map.get(cat);
          if (d) sum += yAccessor(d);
        });
        return sum;
      });
    }
    return visibleSeries.flatMap((s) => s.data.map(yAccessor));
  }, [variant, categories, seriesLookups, visibleSeries, yAccessor]);

  const valueScale = useMemo(
    () => buildLinearScaleForBars(allValues, isVertical ? innerHeight : innerWidth, true, isVertical),
    [allValues, isVertical, innerHeight, innerWidth]
  );

  const groupScale = useMemo(() => {
    if (variant !== "grouped" || visibleSeries.length <= 1) return null;
    return scaleBand<string>({
      domain: visibleSeries.map((s) => s.id),
      range: [0, categoryScale.bandwidth()],
      padding: groupPadding,
    });
  }, [variant, visibleSeries, categoryScale, groupPadding]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const catPos = isVertical ? mx : my;
      const step = categoryScale.step();
      const paddingOuter = step * (categoryScale.paddingOuter?.() ?? barPadding / 2);
      const idx = Math.floor((catPos - paddingOuter) / step);
      const cat = categories[Math.max(0, Math.min(idx, categories.length - 1))];

      if (cat !== undefined) {
        const bandStart = categoryScale(cat) ?? 0;
        const bandEnd = bandStart + categoryScale.bandwidth();
        if (catPos >= bandStart && catPos <= bandEnd) {
          setHoverCategory(cat);

          const crossPos = isVertical ? my : mx;
          let foundSeries: string | null = null;

          if (variant === "grouped" && groupScale) {
            for (const s of visibleSeries) {
              const lookup = seriesLookups[visibleSeries.indexOf(s)];
              const d = lookup?.map.get(cat);
              if (!d) continue;
              const val = yAccessor(d);
              const barStart = bandStart + (groupScale(s.id) ?? 0);
              const barEnd = barStart + groupScale.bandwidth();
              if (isVertical) {
                const barTop = Math.min(valueScale(val) ?? 0, valueScale(0) ?? 0);
                const barBottom = Math.max(valueScale(val) ?? 0, valueScale(0) ?? 0);
                if (mx >= barStart && mx <= barEnd && my >= barTop && my <= barBottom) {
                  foundSeries = s.id;
                  break;
                }
              } else {
                const barLeft = Math.min(valueScale(val) ?? 0, valueScale(0) ?? 0);
                const barRight = Math.max(valueScale(val) ?? 0, valueScale(0) ?? 0);
                if (my >= barStart && my <= barEnd && mx >= barLeft && mx <= barRight) {
                  foundSeries = s.id;
                  break;
                }
              }
            }
          } else if (variant === "stacked") {
            let cumulative = 0;
            for (const s of visibleSeries) {
              const lookup = seriesLookups[visibleSeries.indexOf(s)];
              const d = lookup?.map.get(cat);
              if (!d) continue;
              const val = yAccessor(d);
              const y0 = cumulative;
              const y1 = cumulative + val;
              cumulative = y1;
              if (isVertical) {
                const barTop = valueScale(y1) ?? 0;
                const barBottom = valueScale(y0) ?? 0;
                if (crossPos >= barTop && crossPos <= barBottom) {
                  foundSeries = s.id;
                  break;
                }
              } else {
                const barLeft = valueScale(y0) ?? 0;
                const barRight = valueScale(y1) ?? 0;
                if (crossPos >= barLeft && crossPos <= barRight) {
                  foundSeries = s.id;
                  break;
                }
              }
            }
          } else {
            if (visibleSeries.length === 1) {
              const s = visibleSeries[0];
              const lookup = seriesLookups[0];
              const d = lookup?.map.get(cat);
              if (d) {
                const val = yAccessor(d);
                if (isVertical) {
                  const barTop = Math.min(valueScale(val) ?? 0, valueScale(0) ?? 0);
                  const barBottom = Math.max(valueScale(val) ?? 0, valueScale(0) ?? 0);
                  if (crossPos >= barTop && crossPos <= barBottom) {
                    foundSeries = s.id;
                  }
                } else {
                  const barLeft = Math.min(valueScale(val) ?? 0, valueScale(0) ?? 0);
                  const barRight = Math.max(valueScale(val) ?? 0, valueScale(0) ?? 0);
                  if (crossPos >= barLeft && crossPos <= barRight) {
                    foundSeries = s.id;
                  }
                }
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
    [isVertical, categoryScale, categories, barPadding, variant, groupScale, visibleSeries, seriesLookups, yAccessor, valueScale]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverCategory(null);
    setHoverSeriesId(null);
  }, []);

  const tooltipData = useMemo(() => {
    if (!hoverCategory || !showTooltip) return null;
    const entries: TooltipEntry[] = [];

    visibleSeries.forEach((s, i) => {
      const globalIdx = series.indexOf(s);
      const color = getSeriesColor(globalIdx, s.color);
      const lookup = seriesLookups[i];
      const d = lookup.map.get(hoverCategory);
      if (!d) return;
      const val = yAccessor(d);
      const fmt = tooltipValueFormat ? tooltipValueFormat(val) : val.toLocaleString();
      entries.push({ label: s.label, value: fmt, color });
    });

    const header = tooltipCategoryFormat
      ? tooltipCategoryFormat(hoverCategory)
      : hoverCategory;

    return { entries, header };
  }, [hoverCategory, showTooltip, visibleSeries, series, seriesLookups, yAccessor, tooltipValueFormat, tooltipCategoryFormat]);

  if (innerWidth <= 0 || innerHeight <= 0) return null;

  const xScale = isVertical ? categoryScale : valueScale;
  const yScale = isVertical ? valueScale : categoryScale;
  const zeroPos = isVertical ? (valueScale(0) ?? innerHeight) : (valueScale(0) ?? 0);
  const baseOnAxis = isVertical
    ? Math.abs(zeroPos - innerHeight) < 1
    : Math.abs(zeroPos) < 1;
  const roundBase = !showAxes || !baseOnAxis;

  const staggerMs = 40;
  const durationMs = 500;
  const easing = "cubic-bezier(0, 0, 0.2, 1)";

  const getBarStyle = (catIdx: number, isCategoryHovered: boolean, seriesId: string): React.CSSProperties => {
    const delay = catIdx * staggerMs;
    const scale = animateIn ? 1 : 0;

    let opacity = 1;
    if (hoverCategory) {
      if (hoverSeriesId && variant !== "simple" && visibleSeries.length > 1) {
        opacity = seriesId === hoverSeriesId ? 1 : 0.24;
      } else {
        opacity = isCategoryHovered ? 1 : 0.24;
      }
    }

    if (isVertical) {
      return {
        transform: `scaleY(${scale})`,
        transformOrigin: `center ${zeroPos}px`,
        transition: `transform ${durationMs}ms ${easing} ${delay}ms, opacity 150ms ease`,
        opacity,
      };
    }
    return {
      transform: `scaleX(${scale})`,
      transformOrigin: `${zeroPos}px center`,
      transition: `transform ${durationMs}ms ${easing} ${delay}ms, opacity 150ms ease`,
      opacity,
    };
  };

  const bars: React.ReactNode[] = [];

  categories.forEach((cat, catIdx) => {
    const isCatHovered = hoverCategory === cat;

    if (variant === "stacked") {
      let cumValue = 0;
      visibleSeries.forEach((s, si) => {
        const globalIdx = series.indexOf(s);
        const color = getSeriesColor(globalIdx, s.color);
        const lookup = seriesLookups[si];
        const d = lookup.map.get(cat);
        if (!d) return;
        const val = yAccessor(d);
        const y0 = cumValue;
        const y1 = cumValue + val;
        cumValue = y1;

        const isFirst = si === 0;
        const isLast = si === visibleSeries.length - 1;
        const rEnd = isLast ? barRadius : 0;
        const rBase = (isFirst && roundBase) ? barRadius : 0;
        const style = getBarStyle(catIdx, isCatHovered, s.id);

        if (isVertical) {
          const x = categoryScale(cat) ?? 0;
          const bw = categoryScale.bandwidth();
          const top = valueScale(y1) ?? 0;
          const bottom = valueScale(y0) ?? 0;
          const h = Math.max(0, bottom - top);
          bars.push(
            <path
              key={`${s.id}-${cat}`}
              d={roundedRectPath(x, top, bw, h, barRadius, { tl: rEnd > 0, tr: rEnd > 0, bl: rBase > 0, br: rBase > 0 })}
              fill={color}
              style={style}
            />
          );
        } else {
          const y = categoryScale(cat) ?? 0;
          const bw = categoryScale.bandwidth();
          const x0 = valueScale(y0) ?? 0;
          const x1 = valueScale(y1) ?? 0;
          const w = Math.max(0, x1 - x0);
          bars.push(
            <path
              key={`${s.id}-${cat}`}
              d={roundedRectPath(x0, y, w, bw, barRadius, { tr: rEnd > 0, br: rEnd > 0, tl: rBase > 0, bl: rBase > 0 })}
              fill={color}
              style={style}
            />
          );
        }
      });
    } else if (variant === "grouped" && groupScale) {
      visibleSeries.forEach((s, si) => {
        const globalIdx = series.indexOf(s);
        const color = getSeriesColor(globalIdx, s.color);
        const lookup = seriesLookups[si];
        const d = lookup.map.get(cat);
        if (!d) return;
        const val = yAccessor(d);
        const style = getBarStyle(catIdx, isCatHovered, s.id);
        const allCorners = roundBase;

        if (isVertical) {
          const x = (categoryScale(cat) ?? 0) + (groupScale(s.id) ?? 0);
          const bw = groupScale.bandwidth();
          const barY = val >= 0 ? (valueScale(val) ?? 0) : zeroPos;
          const barH = Math.abs((valueScale(val) ?? 0) - zeroPos);
          bars.push(
            <path
              key={`${s.id}-${cat}`}
              d={roundedRectPath(x, barY, bw, barH, barRadius, { tl: true, tr: true, bl: allCorners, br: allCorners })}
              fill={color}
              style={style}
            />
          );
        } else {
          const y = (categoryScale(cat) ?? 0) + (groupScale(s.id) ?? 0);
          const bw = groupScale.bandwidth();
          const barX = val >= 0 ? zeroPos : (valueScale(val) ?? 0);
          const barW = Math.abs((valueScale(val) ?? 0) - zeroPos);
          bars.push(
            <path
              key={`${s.id}-${cat}`}
              d={roundedRectPath(barX, y, barW, bw, barRadius, { tr: true, br: true, tl: allCorners, bl: allCorners })}
              fill={color}
              style={style}
            />
          );
        }
      });
    } else {
      const s = visibleSeries[0];
      if (!s) return;
      const globalIdx = series.indexOf(s);
      const color = getSeriesColor(globalIdx, s.color);
      const lookup = seriesLookups[0];
      const d = lookup?.map.get(cat);
      if (!d) return;
      const val = yAccessor(d);
      const style = getBarStyle(catIdx, isCatHovered, s.id);
      const allCorners = roundBase;

      if (isVertical) {
        const x = categoryScale(cat) ?? 0;
        const bw = categoryScale.bandwidth();
        const barY = val >= 0 ? (valueScale(val) ?? 0) : zeroPos;
        const barH = Math.abs((valueScale(val) ?? 0) - zeroPos);
        bars.push(
          <path
            key={`${s.id}-${cat}`}
            d={roundedRectPath(x, barY, bw, barH, barRadius, { tl: true, tr: true, bl: allCorners, br: allCorners })}
            fill={color}
            style={style}
          />
        );
      } else {
        const y = categoryScale(cat) ?? 0;
        const bw = categoryScale.bandwidth();
        const barX = val >= 0 ? zeroPos : (valueScale(val) ?? 0);
        const barW = Math.abs((valueScale(val) ?? 0) - zeroPos);
        bars.push(
          <path
            key={`${s.id}-${cat}`}
            d={roundedRectPath(barX, y, barW, bw, barRadius, { tr: true, br: true, tl: allCorners, bl: allCorners })}
            fill={color}
            style={style}
          />
        );
      }
    }
  });

  const highlightX = isVertical && hoverCategory ? (categoryScale(hoverCategory) ?? 0) : 0;
  const highlightY = !isVertical && hoverCategory ? (categoryScale(hoverCategory) ?? 0) : 0;

  const tooltipContent = tooltipData ? (
    <ChartTooltipContent header={tooltipData.header} entries={tooltipData.entries} />
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
          aria-label="Bar chart"
        >
          <Group left={margin.left} top={margin.top}>
            <ChartGrid
              xScale={xScale}
              yScale={yScale}
              innerWidth={innerWidth}
              innerHeight={innerHeight}
              numXTicks={isVertical ? (numCategoryTicks ?? categories.length) : numValueTicks}
              numYTicks={isVertical ? numValueTicks : (numCategoryTicks ?? categories.length)}
              showYGrid={showYGrid ?? showGrid}
              showXGrid={showXGrid ?? showGrid}
            />

            <defs>
              <clipPath id={clipId}>
                <rect x={0} y={0} width={innerWidth} height={innerHeight} />
              </clipPath>
            </defs>

            <g clipPath={`url(#${clipId})`}>
              {hoverCategory && (
                <rect
                  x={isVertical ? highlightX : 0}
                  y={isVertical ? 0 : highlightY}
                  width={isVertical ? categoryScale.bandwidth() : innerWidth}
                  height={isVertical ? innerHeight : categoryScale.bandwidth()}
                  fill="currentColor"
                  opacity={0.04}
                  style={{ transition: "x 100ms ease, y 100ms ease" }}
                />
              )}
              {bars}
            </g>

            {showAxes && (
              <ChartAxes
                xScale={xScale}
                yScale={yScale}
                innerWidth={innerWidth}
                innerHeight={innerHeight}
                numXTicks={isVertical ? (numCategoryTicks ?? categories.length) : numValueTicks}
                numYTicks={isVertical ? numValueTicks : (numCategoryTicks ?? categories.length)}
                xTickFormat={isVertical ? categoryTickFormat : valueTickFormat}
                yTickFormat={isVertical ? valueTickFormat : categoryTickFormat}
              />
            )}

            <rect
              x={0}
              y={0}
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
          </Group>
        </svg>

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

export function BarChart<D = any>(props: BarChartProps<D>) {
  const { height = 400, ...rest } = props;
  return (
    <ParentSize>
      {({ width }) =>
        width > 0 ? (
          <BarChartInner<D> {...rest} width={width} height={height} />
        ) : null
      }
    </ParentSize>
  );
}
