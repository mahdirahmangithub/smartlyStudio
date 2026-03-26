import { useState, useCallback, useMemo, useRef, useId } from "react";
import { ParentSize } from "@visx/responsive";
import { Zoom } from "@visx/zoom";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { AnimatedLine } from "./AnimatedLine";
import { HoverOverlay } from "./HoverOverlay";
import { Crosshair, type CrosshairPoint } from "./Crosshair";
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
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [brushDomain, setBrushDomain] = useState<
    [Date, Date] | [number, number] | null
  >(null);
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

  const xScale = useMemo(() => {
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

  const yScale = useMemo(
    () => buildLinearScale(allYValues, innerHeight),
    [allYValues, innerHeight]
  );

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

    return { entries, points, header, x: hoverX };
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

  if (innerWidth <= 0 || innerHeight <= 0) return null;

  const chartContent = (transform?: { scaleX: number; scaleY: number; translateX: number; translateY: number }) => (
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
        </defs>

        {showGrid && (
          <>
            <GridRows
              scale={yScale}
              width={innerWidth}
              numTicks={numYTicks}
              stroke="var(--element-divider-neutral-weak)"
              strokeWidth={1}
            />
            <GridColumns
              scale={xScale}
              height={innerHeight}
              numTicks={numXTicks}
              stroke="var(--element-divider-neutral-weak)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </>
        )}

        <g clipPath={`url(#${clipId})`}>
          <g transform={transform ? `translate(${transform.translateX},${transform.translateY}) scale(${transform.scaleX},${transform.scaleY})` : undefined}>
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
                  animate={animate}
                  delay={i * 150}
                />
              );
            })}
          </g>
        </g>

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          numTicks={numXTicks}
          tickFormat={xTickFormat}
          stroke="var(--element-divider-neutral-default)"
          strokeWidth={1}
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

        {tooltipData && (
          <Crosshair
            x={tooltipData.x}
            height={innerHeight}
            points={tooltipData.points}
          />
        )}

        <HoverOverlay
          width={innerWidth}
          height={innerHeight}
          marginLeft={margin.left}
          onHover={setHoverX}
        />
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
    >
      <div
        ref={containerRef}
        className={cx(styles.container, className)}
        style={{ position: "relative" }}
      >
        {enableZoom ? (
          <Zoom<SVGSVGElement>
            width={innerWidth}
            height={innerHeight}
            scaleXMin={0.5}
            scaleXMax={4}
            scaleYMin={0.5}
            scaleYMax={4}
          >
            {(zoom) => (
              <div style={{ position: "relative" }}>
                {chartContent({
                  scaleX: zoom.transformMatrix.scaleX,
                  scaleY: zoom.transformMatrix.scaleY,
                  translateX: zoom.transformMatrix.translateX,
                  translateY: zoom.transformMatrix.translateY,
                })}
                <ChartZoomControls
                  onZoomIn={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
                  onZoomOut={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
                  onReset={zoom.reset}
                />
              </div>
            )}
          </Zoom>
        ) : (
          chartContent()
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
