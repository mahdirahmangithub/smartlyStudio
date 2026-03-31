import { useState, useCallback, useMemo, useRef, useId, useEffect } from "react";
import { ParentSize } from "@visx/responsive";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { ChartAxes } from "./ChartAxes";
import { ChartGrid } from "./ChartGrid";
import { HoverOverlay } from "./HoverOverlay";
import { CrosshairLine, CrosshairDots, type CrosshairPoint } from "./Crosshair";
import { ChartTooltipContent, type TooltipEntry } from "./ChartTooltip";
import { Tooltip } from "../Tooltip";
import { ChartLegend, type LegendLayout } from "./ChartLegend";
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
import { useSeriesAnimation, type DomainTarget } from "../../hooks/useSeriesAnimation";
import { cx } from "../../utils/cx";
import styles from "./ChartContainer.module.css";

export interface TooltipState {
  entries: TooltipEntry[];
  points: CrosshairPoint[];
  header: string;
  x: number;
  hoveredSeriesIndex: number;
}

export interface ChartRenderContext<D = any> {
  xScale: any;
  yScale: any;
  /** Scale for right-axis series. null when no series use yAxis: "right". */
  yRightScale: any | null;
  xAccessor: (d: D) => Date | number;
  yAccessor: (d: D) => number;
  innerWidth: number;
  innerHeight: number;
  visibleSeries: Series<D>[];
  allSeries: Series<D>[];
  hiddenSeries: Set<string>;
  /** Spring weight (0..1) for a series — use for opacity fading during hide/show. */
  getWeight: (s: Series<D>) => number;
  tooltipData: TooltipState | null;
  clipId: string;
  animate: boolean;
  isZoomed: boolean;
}

export interface ChartContainerProps<D = any> {
  series: Series<D>[];
  xAccessor: (d: D) => Date | number;
  yAccessor: (d: D) => number;
  animate?: boolean;
  showGrid?: boolean;
  showYGrid?: boolean;
  showXGrid?: boolean;
  showAxes?: boolean;
  edgeFade?: boolean;
  edgeFadeWidth?: number;
  showLegend?: boolean;
  legendLayout?: LegendLayout;
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
  numYRightTicks?: number;
  yRightTickFormat?: (value: any) => string;
  tooltipYRightFormat?: (value: number) => string;
  yLeftTitle?: string;
  yRightTitle?: string;
  className?: string;
  ariaLabel?: string;
  children: (ctx: ChartRenderContext<D>) => React.ReactNode;
}

function ChartContainerInner<D>({
  series,
  xAccessor,
  yAccessor,
  animate = true,
  showGrid = true,
  showYGrid,
  showXGrid,
  showAxes = true,
  edgeFade = false,
  edgeFadeWidth = 40,
  showLegend = true,
  legendLayout,
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
  numYRightTicks = 5,
  yRightTickFormat,
  tooltipYRightFormat,
  yLeftTitle,
  yRightTitle,
  className,
  ariaLabel = "Chart",
  children,
}: ChartContainerProps<D> & { width: number; height: number }) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const hoverX = hoverPos?.x ?? null;
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

  const hasRightAxis = useMemo(
    () => series.some((s) => s.yAxis === "right"),
    [series]
  );

  const computeDomainValues = useCallback(
    (targetVisible: Series<D>[], axis: "left" | "right"): DomainTarget | null => {
      const filtered = targetVisible.filter((s) =>
        axis === "right" ? s.yAxis === "right" : s.yAxis !== "right",
      );
      if (axis === "right" && !hasRightAxis) return null;
      if (filtered.length === 0 && axis === "right") return null;
      const values = filtered.flatMap((s) => s.data.map(yAccessor));
      return { values, includeZero: false, padding: 0.1 };
    },
    [hasRightAxis, yAccessor],
  );

  const { getWeight, visibleSeries, renderTick, leftDomain, rightDomain } =
    useSeriesAnimation<D, Series<D>>({
      series,
      hiddenSeries,
      computeDomainValues,
    });

  const effectiveMargin = useMemo(() => {
    if (!hasRightAxis || margin.right >= 48) return margin;
    return { ...margin, right: 48 };
  }, [margin, hasRightAxis]);

  const innerWidth = width - effectiveMargin.left - effectiveMargin.right;
  const innerHeight = height - effectiveMargin.top - effectiveMargin.bottom;

  const allXValues = useMemo(
    () => visibleSeries.flatMap((s) => s.data.map(xAccessor)),
    [visibleSeries, xAccessor]
  );

  const fullXExtent = useMemo(() => {
    if (allXValues.length === 0) return null;
    const isTime = allXValues[0] instanceof Date;
    if (isTime) {
      const times = (allXValues as Date[]).map((d) => d.getTime());
      return { min: Math.min(...times), max: Math.max(...times), isTime: true };
    }
    const nums = allXValues as number[];
    return { min: Math.min(...nums), max: Math.max(...nums), isTime: false };
  }, [allXValues]);

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

  const baseYScale = useMemo(() => {
    const dom = leftDomain ?? rightDomain ?? [0, 1];
    return scaleLinear<number>({ domain: dom, range: [innerHeight, 0] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerHeight, renderTick]);

  const baseYRightScale = useMemo(() => {
    if (!rightDomain) return null;
    return scaleLinear<number>({ domain: rightDomain, range: [innerHeight, 0] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerHeight, renderTick]);

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

  const visibleXTickPositions = useMemo(
    () => (xScale.ticks(numXTicks) as (Date | number)[]).map(
      (tick) => xScale(tick) ?? 0
    ),
    [xScale, numXTicks]
  );

  const yScale = useMemo(() => {
    if (!zoomState) return baseYScale;
    const { k, ty } = zoomState;
    const y0 = baseYScale.invert(-ty / k) as number;
    const y1 = baseYScale.invert((innerHeight - ty) / k) as number;
    return buildLinearScale([Math.min(y0, y1), Math.max(y0, y1)], innerHeight, false);
  }, [baseYScale, zoomState, innerHeight]);

  const yRightScale = useMemo(() => {
    if (!baseYRightScale) return null;
    if (!zoomState) return baseYRightScale;
    const { k, ty } = zoomState;
    const y0 = baseYRightScale.invert(-ty / k) as number;
    const y1 = baseYRightScale.invert((innerHeight - ty) / k) as number;
    return buildLinearScale([Math.min(y0, y1), Math.max(y0, y1)], innerHeight, false);
  }, [baseYRightScale, zoomState, innerHeight]);

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
      const scale = s.yAxis === "right" && yRightScale ? yRightScale : yScale;
      const yPos = scale(yVal) ?? 0;
      const fmt = s.yAxis === "right" && tooltipYRightFormat ? tooltipYRightFormat : tooltipYFormat;
      const fmtY = fmt ? fmt(yVal) : yVal.toLocaleString();
      entries.push({ label: s.label, value: fmtY, color, axis: s.yAxis ?? "left", dash: s.dash });
      points.push({ x: xPos, y: yPos, color, icon: s.icon });
    }

    const header = tooltipXFormat
      ? tooltipXFormat(xValue)
      : xValue instanceof Date
        ? xValue.toLocaleDateString()
        : String(Math.round(xValue as number));

    const snappedX = points.length > 0 ? points[0].x : hoverX;

    let hoveredSeriesIndex = -1;
    if (hoverPos && points.length > 0) {
      let minDist = Infinity;
      for (let j = 0; j < points.length; j++) {
        const dist = Math.abs(points[j].y - hoverPos.y);
        if (dist < minDist) {
          minDist = dist;
          hoveredSeriesIndex = j;
        }
      }
    }

    return { entries, points, header, x: snappedX, hoveredSeriesIndex };
  }, [
    hoverX,
    showTooltip,
    series,
    hiddenSeries,
    xAccessor,
    yAccessor,
    xScale,
    yScale,
    yRightScale,
    bisectorFn,
    tooltipXFormat,
    tooltipYFormat,
    tooltipYRightFormat,
    hoverPos,
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
        const mx = e.clientX - (rect?.left ?? 0) - effectiveMargin.left;
        const my = e.clientY - (rect?.top ?? 0) - effectiveMargin.top;
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
  }, [enableZoom, effectiveMargin.left, effectiveMargin.top]);

  if (innerWidth <= 0 || innerHeight <= 0) return null;

  const ctx: ChartRenderContext<D> = {
    xScale,
    yScale,
    yRightScale,
    xAccessor,
    yAccessor,
    innerWidth,
    innerHeight,
    visibleSeries,
    allSeries: series,
    hiddenSeries,
    getWeight,
    tooltipData,
    clipId,
    animate,
    isZoomed: !!zoomState,
  };

  const chartContent = () => (
    <svg
      width={width}
      height={height}
      overflow="visible"
      className={styles.chartSvg}
      role="img"
      aria-label={ariaLabel}
    >
      <Group left={effectiveMargin.left} top={effectiveMargin.top}>
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={innerWidth} height={innerHeight} />
          </clipPath>
          {edgeFade && (
            <linearGradient id={`${clipId}-fade`} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={innerWidth} y2={0}>
              <stop offset="0" stopColor="white" stopOpacity={0} />
              <stop offset={edgeFadeWidth / innerWidth} stopColor="white" stopOpacity={1} />
              <stop offset={1 - edgeFadeWidth / innerWidth} stopColor="white" stopOpacity={1} />
              <stop offset="1" stopColor="white" stopOpacity={0} />
            </linearGradient>
          )}
          {edgeFade && (
            <mask id={`${clipId}-mask`}>
              <rect x={0} y={0} width={innerWidth} height={innerHeight} fill={`url(#${clipId}-fade)`} />
            </mask>
          )}
        </defs>

        <ChartGrid
          xScale={xScale}
          yScale={yScale}
          innerWidth={innerWidth}
          innerHeight={innerHeight}
          numXTicks={numXTicks}
          numYTicks={numYTicks}
          showYGrid={showYGrid ?? showGrid}
          showXGrid={showXGrid ?? showGrid}
        />

        <g
          clipPath={`url(#${clipId})`}
          mask={edgeFade ? `url(#${clipId}-mask)` : undefined}
        >
          {children(ctx)}
        </g>

        {showAxes && (
          <ChartAxes
            xScale={xScale}
            yScale={yScale}
            innerWidth={innerWidth}
            innerHeight={innerHeight}
            numXTicks={numXTicks}
            numYTicks={numYTicks}
            xTickFormat={xTickFormat}
            yTickFormat={yTickFormat}
            yRightScale={yRightScale}
            numYRightTicks={numYRightTicks}
            yRightTickFormat={yRightTickFormat}
          />
        )}

        {showTooltip && tooltipData && (
          <CrosshairLine x={tooltipData.x} height={innerHeight} />
        )}

        {showTooltip && (
          <HoverOverlay
            width={innerWidth}
            height={innerHeight}
            marginLeft={effectiveMargin.left}
            marginTop={effectiveMargin.top}
            onHover={setHoverPos}
            panEnabled={enableBrush && !!brushDomain}
            onPan={(dx) => {
              setBrushDomain((prev) => {
                if (!prev) return prev;
                const scale = xScale;
                const d0 = scale.invert(0);
                const d1 = scale.invert(-dx);
                const isTime = d0 instanceof Date;
                const shift = isTime
                  ? (d1 as Date).getTime() - (d0 as Date).getTime()
                  : (d1 as number) - (d0 as number);
                const prevMin = isTime ? (prev[0] as Date).getTime() : (prev[0] as number);
                const prevMax = isTime ? (prev[1] as Date).getTime() : (prev[1] as number);
                const span = prevMax - prevMin;
                let newMin = prevMin + shift;
                let newMax = prevMax + shift;

                if (fullXExtent) {
                  if (newMin < fullXExtent.min) { newMin = fullXExtent.min; newMax = fullXExtent.min + span; }
                  if (newMax > fullXExtent.max) { newMax = fullXExtent.max; newMin = fullXExtent.max - span; }
                }

                if (isTime) {
                  return [new Date(newMin), new Date(newMax)];
                }
                return [newMin, newMax];
              });
            }}
          />
        )}
      </Group>
    </svg>
  );

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
            offsetLeft={effectiveMargin.left}
            offsetTop={effectiveMargin.top}
          />
        )}

        {enableBrush && (
          <ChartBrush
            series={series}
            xAccessor={xAccessor}
            yAccessor={yAccessor}
            width={width}
            marginLeft={effectiveMargin.left}
            marginRight={effectiveMargin.right}
            hiddenSeries={hiddenSeries}
            domain={brushDomain}
            onChange={setBrushDomain}
            majorTickPositions={visibleXTickPositions}
          />
        )}

        {showLegend && (
          <ChartLegend
            series={series}
            hiddenSeries={hiddenSeries}
            onToggle={toggleSeries}
            layout={legendLayout}
          />
        )}
      </div>
    </Tooltip>
  );
}

export function ChartContainer<D = any>(props: ChartContainerProps<D>) {
  const { height = 400, ...rest } = props;
  return (
    <ParentSize>
      {({ width }) =>
        width > 0 ? (
          <ChartContainerInner<D> {...rest} width={width} height={height} />
        ) : null
      }
    </ParentSize>
  );
}
