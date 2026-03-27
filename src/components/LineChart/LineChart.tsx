import { useState, useCallback, useMemo, useRef, useId, useEffect } from "react";
import { ParentSize } from "@visx/responsive";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { AnimatedLine } from "./AnimatedLine";
import { AreaClosed } from "@visx/shape";
import { ConfidenceBandArea } from "./ConfidenceBand";
import { HoverOverlay } from "./HoverOverlay";
import { CrosshairLine, CrosshairDots, type CrosshairPoint } from "./Crosshair";
import { ChartTooltipContent, type TooltipEntry } from "./ChartTooltip";
import { Tooltip } from "../Tooltip";
import { ChartLegend } from "./ChartLegend";
import { ChartBrush } from "./ChartBrush";
import { ChartZoomControls } from "./ChartZoom";
import {
  buildTimeScale,
  buildLinearScale,
  getSeriesColor,
  createBisector,
  findNearestDatum,
  type Series,
  type Margin,
  DEFAULT_MARGIN,
} from "./chartUtils";
import { cx } from "../../utils/cx";
import styles from "./LineChart.module.css";
import type { CurveFactory } from "d3-shape";

export interface LineChartProps<D = any> {
  series: Series<D>[];
  xAccessor: (d: D) => Date | number;
  yAccessor: (d: D) => number;
  curve?: CurveFactory;
  animate?: boolean;
  showGrid?: boolean;
  showAxes?: boolean;
  showAreaFill?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  enableZoom?: boolean;
  enableBrush?: boolean;
  margin?: Margin;
  height?: number;
  numXTicks?: number;
  numYTicks?: number;
  xTickFormat?: (value: any) => string;
  yTickFormat?: (value: any) => string;
  tooltipXFormat?: (value: Date | number) => string;
  tooltipYFormat?: (value: number) => string;
  className?: string;
}

function LineChartInner<D>({
  series,
  xAccessor,
  yAccessor,
  curve,
  animate = true,
  showGrid = true,
  showAxes = true,
  showAreaFill = false,
  showLegend = true,
  showTooltip = true,
  enableZoom = false,
  enableBrush = false,
  margin = DEFAULT_MARGIN,
  width,
  height,
  numXTicks = 6,
  numYTicks = 5,
  xTickFormat,
  yTickFormat,
  tooltipXFormat,
  tooltipYFormat,
  className,
}: LineChartProps<D> & { width: number; height: number }) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [drawComplete, setDrawComplete] = useState(!animate);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [brushDomain, setBrushDomain] = useState<
    [Date, Date] | [number, number] | null
  >(null);
  const [zoomState, setZoomState] = useState<{
    k: number;
    tx: number;
    ty: number;
  } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startTx: number; startTy: number } | null>(null);
  const zoomDivRef = useRef<HTMLDivElement>(null);
  const zoomStateRef = useRef(zoomState);
  zoomStateRef.current = zoomState;
  const containerRef = useRef<HTMLDivElement>(null);
  const clipId = useId().replace(/:/g, "");

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

  useEffect(() => {
    if (!animate || drawComplete) return;
    const totalMs = (visibleSeries.length - 1) * 150 + 1000 + 100;
    const timer = setTimeout(() => setDrawComplete(true), totalMs);
    return () => clearTimeout(timer);
  }, [animate, drawComplete, visibleSeries.length]);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const allXValues = useMemo(
    () => visibleSeries.flatMap((s) => s.data.map(xAccessor)),
    [visibleSeries, xAccessor]
  );
  const allYValues = useMemo(
    () => visibleSeries.flatMap((s) => s.data.map(yAccessor)),
    [visibleSeries, yAccessor]
  );

  const baseXScale = useMemo(() => {
    if (brushDomain) {
      const isTime = brushDomain[0] instanceof Date;
      if (isTime) {
        return buildTimeScale(brushDomain as Date[], innerWidth);
      }
      return buildLinearScale(brushDomain as number[], innerWidth, false);
    }
    const isTime = allXValues.length > 0 && allXValues[0] instanceof Date;
    if (isTime) return buildTimeScale(allXValues as Date[], innerWidth);
    return buildLinearScale(allXValues as number[], innerWidth, true);
  }, [allXValues, innerWidth, brushDomain]);

  const baseYScale = useMemo(
    () => buildLinearScale(allYValues, innerHeight),
    [allYValues, innerHeight]
  );

  const xScale = useMemo(() => {
    if (!zoomState) return baseXScale;
    const { k, tx } = zoomState;
    const x0 = baseXScale.invert(-tx / k);
    const x1 = baseXScale.invert((innerWidth - tx) / k);
    const isTime = x0 instanceof Date;
    if (isTime) {
      return buildTimeScale([x0 as Date, x1 as Date], innerWidth);
    }
    return buildLinearScale([x0 as number, x1 as number], innerWidth, false);
  }, [baseXScale, zoomState, innerWidth]);

  const yScale = useMemo(() => {
    if (!zoomState) return baseYScale;
    const { k, ty } = zoomState;
    const y0 = baseYScale.invert(-ty / k) as number;
    const y1 = baseYScale.invert((innerHeight - ty) / k) as number;
    return buildLinearScale([Math.min(y0, y1), Math.max(y0, y1)], innerHeight, false);
  }, [baseYScale, zoomState, innerHeight]);

  const bisectorFn = useMemo(() => createBisector(xAccessor), [xAccessor]);

  const tooltipData = useMemo(() => {
    if (hoverX === null || !showTooltip) return null;
    const xValue = xScale.invert(hoverX);
    const entries: TooltipEntry[] = [];
    const points: CrosshairPoint[] = [];

    for (let i = 0; i < series.length; i++) {
      const s = series[i];
      if (hiddenSeries.has(s.id)) continue;
      const nearest = findNearestDatum(s.data, xAccessor, xValue, bisectorFn);
      if (!nearest) continue;
      const color = getSeriesColor(i, s.color);
      const yVal = yAccessor(nearest);
      const xPos = xScale(xAccessor(nearest)) ?? 0;
      const yPos = yScale(yVal) ?? 0;
      const fmtY = tooltipYFormat
        ? tooltipYFormat(yVal)
        : yVal.toLocaleString();
      entries.push({ label: s.label, value: fmtY, color });
      points.push({ x: xPos, y: yPos, color });
    }

    const xVal = xScale.invert(hoverX);
    const header = tooltipXFormat
      ? tooltipXFormat(xVal)
      : xVal instanceof Date
        ? xVal.toLocaleDateString()
        : String(Math.round(xVal as number));

    const snappedX = points.length > 0 ? points[0].x : hoverX;
    return { entries, points, header, x: snappedX };
  }, [
    hoverX,
    showTooltip,
    series,
    hiddenSeries,
    xAccessor,
    yAccessor,
    xScale,
    yScale,
    bisectorFn,
    tooltipXFormat,
    tooltipYFormat,
  ]);

  useEffect(() => {
    const el = zoomDivRef.current;
    if (!el || !enableZoom) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      setZoomState((prev) => {
        const k = Math.min(8, Math.max(0.25, (prev?.k ?? 1) * (1 + delta)));
        const rect = containerRef.current?.getBoundingClientRect();
        const mx = e.clientX - (rect?.left ?? 0) - margin.left;
        const my = e.clientY - (rect?.top ?? 0) - margin.top;
        const prevK = prev?.k ?? 1;
        const prevTx = prev?.tx ?? 0;
        const prevTy = prev?.ty ?? 0;
        const tx = mx - (mx - prevTx) * (k / prevK);
        const ty = my - (my - prevTy) * (k / prevK);
        return { k, tx, ty };
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [enableZoom, margin.left, margin.top]);

  if (innerWidth <= 0 || innerHeight <= 0) return null;

  const chartContent = () => (
    <svg
      width={width}
      height={height}
      className={styles.chartSvg}
      role="img"
      aria-label="Line chart"
    >
      <Group left={margin.left} top={margin.top}>
        <defs>
          <clipPath id={clipId}>
            <rect width={innerWidth} height={innerHeight} />
          </clipPath>
          {showAreaFill && visibleSeries.map((s) => {
            const seriesIndex = series.indexOf(s);
            const color = getSeriesColor(seriesIndex, s.color);
            const gradientId = `${clipId}-grad-${seriesIndex}`;
            return (
              <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color} stopOpacity={0.08} />
              </linearGradient>
            );
          })}
        </defs>

        {showGrid && (
          <>
            <GridRows
              scale={yScale}
              left={0.5}
              width={innerWidth - 1}
              numTicks={numYTicks}
              stroke="var(--element-divider-neutral-weak)"
              strokeWidth={1}
              strokeLinecap="round"
            />
            <GridColumns
              scale={xScale}
              top={0.5}
              height={innerHeight - 1}
              numTicks={numXTicks}
              stroke="var(--element-divider-neutral-weak)"
              strokeWidth={1}
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          </>
        )}

        <g clipPath={`url(#${clipId})`}>
          {showAreaFill && (
            <g
              style={{
                opacity: drawComplete ? 0.08 : 0,
                transition: "opacity 600ms var(--motion-easing-enter)",
              }}
            >
              {visibleSeries.map((s) => {
                const seriesIndex = series.indexOf(s);
                const gradientId = `${clipId}-grad-${seriesIndex}`;
                return (
                  <AreaClosed
                    key={`area-${s.id}`}
                    data={s.data}
                    x={(d) => xScale(xAccessor(d)) ?? 0}
                    y={(d) => yScale(yAccessor(d)) ?? 0}
                    yScale={yScale}
                    curve={curve}
                    fill={`url(#${gradientId})`}
                    strokeWidth={0}
                  />
                );
              })}
            </g>
          )}
          {visibleSeries.map((s) => {
            if (!s.confidenceBand) return null;
            const seriesIndex = series.indexOf(s);
            const color = getSeriesColor(seriesIndex, s.color);
            return (
              <ConfidenceBandArea
                key={`band-${s.id}`}
                data={s.data}
                xAccessor={(d) => xScale(xAccessor(d)) ?? 0}
                y0Accessor={(d) => yScale(s.confidenceBand!.lower(d)) ?? 0}
                y1Accessor={(d) => yScale(s.confidenceBand!.upper(d)) ?? 0}
                color={color}
                curve={curve}
                yScale={yScale}
              />
            );
          })}
          {visibleSeries.map((s, i) => {
            const seriesIndex = series.indexOf(s);
            const color = getSeriesColor(seriesIndex, s.color);
            return (
              <AnimatedLine
                key={s.id}
                data={s.data}
                xAccessor={(d) => xScale(xAccessor(d)) ?? 0}
                yAccessor={(d) => yScale(yAccessor(d)) ?? 0}
                color={color}
                curve={curve}
                animate={animate && !zoomState}
                delay={i * 150}
              />
            );
          })}
        </g>

        {showAxes && (
          <>
            <line
              x1={0.5}
              x2={innerWidth - 0.5}
              y1={innerHeight}
              y2={innerHeight}
              stroke="var(--element-divider-neutral-default)"
              strokeWidth={1}
              strokeLinecap="round"
            />
            <AxisBottom
              top={innerHeight}
              scale={xScale}
              numTicks={numXTicks}
              tickFormat={xTickFormat}
              stroke="transparent"
              strokeWidth={0}
              tickStroke="transparent"
              tickLength={0}
              tickLabelProps={{
                className: styles.axisTick,
                textAnchor: "middle",
                dy: "1em",
              }}
            />
            <AxisLeft
              scale={yScale}
              numTicks={numYTicks}
              tickFormat={yTickFormat}
              stroke="transparent"
              tickStroke="transparent"
              tickLength={0}
              tickLabelProps={{
                className: styles.axisTick,
                textAnchor: "end",
                dx: "-0.5em",
                dy: "0.33em",
              }}
            />
          </>
        )}

        {showTooltip && tooltipData && (
          <CrosshairLine
            x={tooltipData.x}
            height={innerHeight}
          />
        )}

        {showTooltip && (
          <HoverOverlay
            width={innerWidth}
            height={innerHeight}
            marginLeft={margin.left}
            onHover={setHoverX}
          />
        )}
      </Group>
    </svg>
  );

  const tooltipContent = tooltipData ? (
    <ChartTooltipContent
      header={tooltipData.header}
      entries={tooltipData.entries}
    />
  ) : undefined;

  return (
    <Tooltip
      anchor="cursor"
      placement="right"
      showTail={false}
      showDelay={0}
      hideDelay={0}
      open={!!tooltipData && showTooltip}
      content={tooltipContent}
      type="neutral"
      className={styles.tooltipWrapper}
    >
      <div
        ref={containerRef}
        className={cx(styles.container, className)}
        style={{ position: "relative" }}
      >
        {enableZoom ? (
          <div
            ref={zoomDivRef}
            style={{ position: "relative" }}
            onMouseDown={(e) => {
              if (!zoomState) return;
              dragRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                startTx: zoomState.tx,
                startTy: zoomState.ty,
              };
            }}
            onMouseMove={(e) => {
              const drag = dragRef.current;
              if (!drag) return;
              const tx = drag.startTx + e.clientX - drag.startX;
              const ty = drag.startTy + e.clientY - drag.startY;
              setZoomState((prev) => prev ? { ...prev, tx, ty } : null);
            }}
            onMouseUp={() => { dragRef.current = null; }}
            onMouseLeave={() => { dragRef.current = null; }}
          >
            {chartContent()}
            <ChartZoomControls
              onZoomIn={() => {
                setZoomState((prev) => {
                  const k = Math.min(8, (prev?.k ?? 1) * 1.3);
                  const prevK = prev?.k ?? 1;
                  const prevTx = prev?.tx ?? 0;
                  const prevTy = prev?.ty ?? 0;
                  const cx = innerWidth / 2;
                  const cy = innerHeight / 2;
                  return { k, tx: cx - (cx - prevTx) * (k / prevK), ty: cy - (cy - prevTy) * (k / prevK) };
                });
              }}
              onZoomOut={() => {
                setZoomState((prev) => {
                  const k = Math.max(0.25, (prev?.k ?? 1) / 1.3);
                  const prevK = prev?.k ?? 1;
                  const prevTx = prev?.tx ?? 0;
                  const prevTy = prev?.ty ?? 0;
                  const cx = innerWidth / 2;
                  const cy = innerHeight / 2;
                  return { k, tx: cx - (cx - prevTx) * (k / prevK), ty: cy - (cy - prevTy) * (k / prevK) };
                });
              }}
              onReset={() => setZoomState(null)}
            />
          </div>
        ) : (
          chartContent()
        )}

        {tooltipData && (
          <CrosshairDots
            points={tooltipData.points}
            offsetLeft={margin.left}
            offsetTop={margin.top}
          />
        )}

        {showLegend && (
          <ChartLegend
            series={series}
            hiddenSeries={hiddenSeries}
            onToggle={toggleSeries}
          />
        )}

        {enableBrush && (
          <ChartBrush
            series={series}
            xAccessor={xAccessor}
            yAccessor={yAccessor}
            width={width}
            hiddenSeries={hiddenSeries}
            onChange={setBrushDomain}
          />
        )}
      </div>
    </Tooltip>
  );
}

export function LineChart<D = any>(props: LineChartProps<D>) {
  const { height = 400, ...rest } = props;
  return (
    <ParentSize>
      {({ width }) =>
        width > 0 ? (
          <LineChartInner<D> {...rest} width={width} height={height} />
        ) : null
      }
    </ParentSize>
  );
}
