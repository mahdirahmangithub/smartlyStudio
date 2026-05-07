import { AxisBottom, AxisLeft, AxisRight } from "@visx/axis";
import styles from "./ChartContainer.module.css";

export interface ChartAxesProps {
  xScale: any;
  yScale: any;
  innerWidth: number;
  innerHeight: number;
  numXTicks?: number;
  numYTicks?: number;
  xTickFormat?: (value: any) => string;
  yTickFormat?: (value: any) => string;
  /** Optional right-axis scale for dual-axis charts */
  yRightScale?: any;
  numYRightTicks?: number;
  yRightTickFormat?: (value: any) => string;
}

export function ChartAxes({
  xScale,
  yScale,
  innerWidth,
  innerHeight,
  numXTicks = 6,
  numYTicks = 5,
  xTickFormat,
  yTickFormat,
  yRightScale,
  numYRightTicks = 5,
  yRightTickFormat,
}: ChartAxesProps) {
  return (
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
          dx: -8,
          dy: "0.33em",
        }}
      />
      {yRightScale && (
        <AxisRight
          left={innerWidth}
          scale={yRightScale}
          numTicks={numYRightTicks}
          tickFormat={yRightTickFormat}
          stroke="transparent"
          tickStroke="transparent"
          tickLength={0}
          tickLabelProps={{
            className: styles.axisTick,
            textAnchor: "start",
            dx: 8,
            dy: "0.33em",
          }}
        />
      )}
    </>
  );
}
