import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Pie } from "@visx/shape";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleOrdinal } from "@visx/scale";
import { useSpring, useSprings } from "@react-spring/web";
import { ChartLegend } from "../ChartPrimitives/ChartLegend";
import {
  ChartTooltipContent,
  type TooltipEntry,
} from "../ChartPrimitives/ChartTooltip";
import { Tooltip } from "../Tooltip";
import { IconContainer, type IconContainerSize } from "../IconContainer";
import type { IconName } from "../Icon";
import { getSeriesColor, isOklchEnhanced, type Series } from "../ChartPrimitives";
import { cx } from "../../utils/cx";
import styles from "./PieChart.module.css";
import chartStyles from "../ChartPrimitives/ChartContainer.module.css";

const SWEEP_SPRING = { tension: 50, friction: 12, mass: 1.2 };
const TOGGLE_SPRING = { tension: 80, friction: 14 };

export interface PieSlice {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieSlice[];
  /** Ring thickness in px. 0 = solid pie. */
  thickness?: number;
  /** Gap between slices in radians. */
  padAngle?: number;
  /** Rounded corners on arc ends (px). */
  cornerRadius?: number;
  /** Start angle in radians (for partial arcs). */
  startAngle?: number;
  /** End angle in radians (for partial arcs). */
  endAngle?: number;
  /** Show value labels at each slice centroid. */
  showSliceLabels?: boolean;
  /** Custom formatter for slice labels. */
  sliceLabelFormat?: (value: number, datum: PieSlice) => string;
  /** Minimum arc angle (radians) to show a label. */
  sliceLabelMinAngle?: number;
  /** Large value in the center. */
  centerValue?: string | number;
  /** Description text below center value. */
  centerLabel?: string;
  /** Icon above center value. */
  centerIcon?: IconName;
  /** Size of the center icon container. */
  centerIconSize?: IconContainerSize;
  /** Full override for center content. */
  centerContent?: React.ReactNode;
  showTooltip?: boolean;
  /** Custom value formatter for tooltip. */
  tooltipValueFormat?: (value: number) => string;
  showLegend?: boolean;
  /** Animate on mount. */
  animate?: boolean;
  /** Sort slices by value. */
  sortSlices?: "none" | "ascending" | "descending";
  /** Controlled active slice. */
  activeSliceId?: string | null;
  /** Callback when active slice changes. */
  onActiveSliceChange?: (id: string | null) => void;
  /** Click handler for a slice. */
  onSliceClick?: (datum: PieSlice, index: number) => void;
  /** Fixed height (ParentSize provides width). */
  height?: number;
  className?: string;
}

const MIN_LABEL_ANGLE = 0.3;

function PieChartInner({
  data,
  thickness = 30,
  padAngle = 0.02,
  cornerRadius = 3,
  startAngle = 0,
  endAngle = Math.PI * 2,
  showSliceLabels = true,
  sliceLabelFormat,
  sliceLabelMinAngle = MIN_LABEL_ANGLE,
  centerValue,
  centerLabel,
  centerIcon,
  centerIconSize = "lg",
  centerContent,
  showTooltip = true,
  tooltipValueFormat,
  showLegend = true,
  animate = true,
  sortSlices = "none",
  activeSliceId,
  onActiveSliceChange,
  onSliceClick,
  width,
  height: heightProp,
  className,
}: PieChartProps & { width: number }) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [hoverSliceId, setHoverSliceId] = useState<string | null>(null);

  const [sweepProgress, setSweepProgress] = useState(animate ? 0 : 1);

  useSpring({
    from: { progress: 0 },
    to: { progress: 1 },
    config: SWEEP_SPRING,
    immediate: !animate,
    onChange: ({ value }) =>
      setSweepProgress(Math.min(1, Math.max(0, value.progress))),
  });

  const sweepDone = sweepProgress >= 0.995;
  const animatedEnd = startAngle + (endAngle - startAngle) * sweepProgress;

  const toggleSeries = useCallback((id: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const visibleData = useMemo(
    () => data.filter((d) => !hiddenSeries.has(d.id)),
    [data, hiddenSeries]
  );

  const targetWeights = useMemo(
    () => data.map((d) => (hiddenSeries.has(d.id) ? 0 : 1)),
    [data, hiddenSeries]
  );

  const weightsRef = useRef<number[]>(targetWeights);
  const [, forceRender] = useState(0);
  const rafPending = useRef(false);

  useEffect(() => {
    if (weightsRef.current.length !== data.length) {
      weightsRef.current = targetWeights;
    }
  }, [data.length, targetWeights]);

  useSprings(
    data.length,
    data.map((_, i) => ({
      w: targetWeights[i],
      config: TOGGLE_SPRING,
      onChange: ({ value }: { value: Record<string, number> }) => {
        weightsRef.current[i] = value.w;
        if (!rafPending.current) {
          rafPending.current = true;
          requestAnimationFrame(() => {
            rafPending.current = false;
            forceRender((n) => n + 1);
          });
        }
      },
    }))
  );

  const pieData = data
    .map((d, i) => ({
      ...d,
      value: d.value * (weightsRef.current[i] ?? 1),
    }))
    .filter((d) => d.value > 0.001);

  const size = heightProp ? Math.min(width, heightProp) : width;
  const radius = size / 2;
  const innerRadius = thickness > 0 ? Math.max(0, radius - thickness) : 0;
  const CENTER_GAP = 8;
  const centerBoxSide = Math.max(0, (innerRadius - CENTER_GAP) * Math.SQRT2);

  const effectivePadAngle = thickness === 0 ? 0 : padAngle;
  const effectiveCornerRadius = thickness === 0 ? 0 : cornerRadius;

  const oklchOn = isOklchEnhanced();

  const legendSeries: Series<PieSlice>[] = useMemo(
    () =>
      data.map((d, i) => ({
        id: d.id,
        label: d.label,
        data: [d],
        color: d.color ?? getSeriesColor(i),
      })),
    [data, oklchOn]
  );

  const colorScale = useMemo(
    () =>
      scaleOrdinal<string, string>({
        domain: data.map((d) => d.id),
        range: data.map((d, i) => d.color ?? getSeriesColor(i)),
      }),
    [data, oklchOn]
  );

  const pieSortValues = useMemo(() => {
    if (sortSlices === "ascending") return (a: number, b: number) => a - b;
    if (sortSlices === "descending") return (a: number, b: number) => b - a;
    return null;
  }, [sortSlices]);

  const activeId = activeSliceId !== undefined ? activeSliceId : hoverSliceId;
  const isAnyActive = activeId !== null;

  const total = useMemo(
    () => pieData.reduce((sum, d) => sum + d.value, 0),
    [pieData]
  );

  const tooltipData = useMemo(() => {
    if (!hoverSliceId || !showTooltip) return null;
    const realDatum = data.find((d) => d.id === hoverSliceId);
    if (!realDatum || hiddenSeries.has(hoverSliceId)) return null;
    const realTotal = visibleData.reduce((s, d) => s + d.value, 0);
    const fmtVal = tooltipValueFormat
      ? tooltipValueFormat(realDatum.value)
      : realDatum.value.toLocaleString();
    const pct =
      realTotal > 0
        ? ((realDatum.value / realTotal) * 100).toFixed(1) + "%"
        : "";
    const entries: TooltipEntry[] = [
      {
        label: realDatum.label,
        value: `${fmtVal} (${pct})`,
        color: colorScale(realDatum.id),
      },
    ];
    return { header: realDatum.label, entries };
  }, [hoverSliceId, showTooltip, data, hiddenSeries, visibleData, tooltipValueFormat, colorScale]);

  const tooltipContent = tooltipData ? (
    <ChartTooltipContent header={tooltipData.header} entries={tooltipData.entries} />
  ) : undefined;

  const isEmpty = pieData.length === 0 || total === 0;

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
      className={chartStyles.tooltipWrapper}
    >
      <div
        className={cx(styles.container, className)}
        style={{ width: size }}
        onMouseLeave={() => {
          setHoverSliceId(null);
          onActiveSliceChange?.(null);
        }}
      >
        <div className={styles.chartArea}>
          <svg
            width={size}
            height={size}
            className={styles.chartSvg}
            role="img"
            aria-label="Pie chart"
          >
            <Group top={radius} left={radius}>
              {isEmpty ? (
                <circle
                  r={(radius + innerRadius) / 2}
                  className={styles.emptyRing}
                  strokeWidth={thickness || 2}
                />
              ) : (
                <Pie<PieSlice>
                  data={pieData}
                  pieValue={(d) => d.value}
                  outerRadius={radius}
                  innerRadius={innerRadius}
                padAngle={effectivePadAngle}
                cornerRadius={effectiveCornerRadius}
                  startAngle={startAngle}
                  endAngle={animatedEnd}
                  pieSortValues={pieSortValues}
                >
                  {({ arcs, path }) =>
                    arcs.map((arc, i) => {
                      const sliceId = arc.data.id;
                      const isDimmed = isAnyActive && activeId !== sliceId;
                      const [centroidX, centroidY] = path.centroid(arc);
                      const angleSpan = arc.endAngle - arc.startAngle;
                      const dataIdx = data.findIndex((d) => d.id === sliceId);
                      const weight = dataIdx >= 0 ? (weightsRef.current[dataIdx] ?? 1) : 1;
                      const isSettled = Math.abs(weight - targetWeights[dataIdx]) < 0.01;

                      return (
                        <g key={sliceId}>
                          <path
                            d={path(arc) || ""}
                            fill={colorScale(sliceId)}
                            className={cx(
                              styles.slice,
                              isDimmed && styles.sliceDimmed
                            )}
                            onMouseEnter={() => {
                              setHoverSliceId(sliceId);
                              onActiveSliceChange?.(sliceId);
                            }}
                            onClick={() => onSliceClick?.(arc.data, i)}
                            tabIndex={0}
                            role="img"
                            aria-label={`${arc.data.label}: ${arc.data.value}${
                              total > 0
                                ? ` (${((arc.data.value / total) * 100).toFixed(1)}%)`
                                : ""
                            }`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onSliceClick?.(arc.data, i);
                              }
                            }}
                          />
                          {showSliceLabels &&
                            angleSpan >= sliceLabelMinAngle &&
                            sweepDone &&
                            isSettled && (
                              <text
                                x={centroidX}
                                y={centroidY}
                                className={styles.sliceLabel}
                              >
                                {sliceLabelFormat
                                  ? sliceLabelFormat(data[dataIdx]?.value ?? arc.data.value, arc.data)
                                  : String(data[dataIdx]?.value ?? arc.data.value)}
                              </text>
                            )}
                        </g>
                      );
                    })
                  }
                </Pie>
              )}
            </Group>
          </svg>

          {innerRadius > 0 && !isEmpty && (
            <div
              className={cx(styles.centerOverlay, sweepDone && styles.centerVisible)}
              style={{ width: centerBoxSide, height: centerBoxSide }}
            >
              {centerContent ?? (
                <>
                  {centerIcon && (
                    <IconContainer
                      name={centerIcon}
                      size={centerIconSize}
                    />
                  )}
                  {centerValue != null && (
                    <span className={styles.centerValue}>{centerValue}</span>
                  )}
                  {centerLabel && (
                    <span className={styles.centerLabel}>{centerLabel}</span>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {showLegend && data.length > 1 && (
          <ChartLegend
            series={legendSeries}
            hiddenSeries={hiddenSeries}
            onToggle={toggleSeries}
          />
        )}
      </div>
    </Tooltip>
  );
}

export function PieChart(props: PieChartProps) {
  const { height, ...rest } = props;
  return (
    <ParentSize>
      {({ width }) =>
        width > 0 ? (
          <PieChartInner {...rest} width={width} height={height} />
        ) : null
      }
    </ParentSize>
  );
}
