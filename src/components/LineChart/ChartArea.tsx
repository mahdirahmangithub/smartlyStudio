import { useMemo } from "react";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { AnimatedLine } from "./AnimatedLine";
import {
  buildTimeScale,
  buildLinearScale,
  getSeriesColor,
  type Series,
  type Margin,
} from "../ChartPrimitives/chartUtils";
import styles from "../ChartPrimitives/ChartContainer.module.css";
import type { CurveFactory } from "d3-shape";

export interface ChartAreaProps<D> {
  series: Series<D>[];
  xAccessor: (d: D) => Date | number;
  yAccessor: (d: D) => number;
  width: number;
  height: number;
  margin: Margin;
  curve?: CurveFactory;
  animate?: boolean;
  showGrid?: boolean;
  hiddenSeries?: Set<string>;
  xDomain?: [Date, Date] | [number, number];
  numXTicks?: number;
  numYTicks?: number;
  xTickFormat?: (value: any) => string;
  yTickFormat?: (value: any) => string;
  children?: React.ReactNode;
}

export function ChartArea<D>({
  series,
  xAccessor,
  yAccessor,
  width,
  height,
  margin,
  curve,
  animate = true,
  showGrid = true,
  hiddenSeries,
  xDomain,
  numXTicks = 6,
  numYTicks = 5,
  xTickFormat,
  yTickFormat,
  children,
}: ChartAreaProps<D>) {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const visibleSeries = useMemo(
    () => series.filter((s) => !hiddenSeries?.has(s.id)),
    [series, hiddenSeries]
  );

  const allXValues = useMemo(
    () => visibleSeries.flatMap((s) => s.data.map(xAccessor)),
    [visibleSeries, xAccessor]
  );

  const allYValues = useMemo(
    () => visibleSeries.flatMap((s) => s.data.map(yAccessor)),
    [visibleSeries, yAccessor]
  );

  const xScale = useMemo(() => {
    if (xDomain) {
      const isTime = xDomain[0] instanceof Date;
      if (isTime) {
        return buildTimeScale(xDomain as [Date, Date] as any as Date[], innerWidth);
      }
    }
    const isTime = allXValues.length > 0 && allXValues[0] instanceof Date;
    if (isTime) {
      return buildTimeScale(allXValues as Date[], innerWidth);
    }
    return buildLinearScale(allXValues as number[], innerWidth, true);
  }, [allXValues, innerWidth, xDomain]);

  const yScale = useMemo(
    () => buildLinearScale(allYValues, innerHeight),
    [allYValues, innerHeight]
  );

  if (innerWidth <= 0 || innerHeight <= 0) return null;

  return (
    <svg
      width={width}
      height={height}
      className={styles.chartSvg}
      role="img"
      aria-label="Line chart"
    >
      <Group left={margin.left} top={margin.top}>
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

        {children}
      </Group>
    </svg>
  );
}
