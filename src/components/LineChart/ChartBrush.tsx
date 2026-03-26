import { useMemo, useRef } from "react";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { Brush } from "@visx/brush";
import type { Bounds } from "@visx/brush/lib/types";
import type BaseBrush from "@visx/brush/lib/BaseBrush";
import {
  buildTimeScale,
  buildLinearScale,
  getSeriesColor,
  type Series,
  type Margin,
} from "./chartUtils";

const BRUSH_MARGIN: Margin = { top: 4, right: 16, bottom: 20, left: 48 };
const BRUSH_HEIGHT = 60;

export interface ChartBrushProps<D> {
  series: Series<D>[];
  xAccessor: (d: D) => Date | number;
  yAccessor: (d: D) => number;
  width: number;
  hiddenSeries?: Set<string>;
  onChange: (domain: [Date, Date] | [number, number] | null) => void;
}

export function ChartBrush<D>({
  series,
  xAccessor,
  yAccessor,
  width,
  hiddenSeries,
  onChange,
}: ChartBrushProps<D>) {
  const brushRef = useRef<BaseBrush | null>(null);

  const innerWidth = width - BRUSH_MARGIN.left - BRUSH_MARGIN.right;
  const innerHeight = BRUSH_HEIGHT - BRUSH_MARGIN.top - BRUSH_MARGIN.bottom;

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
    const isTime = allXValues.length > 0 && allXValues[0] instanceof Date;
    if (isTime) return buildTimeScale(allXValues as Date[], innerWidth);
    return buildLinearScale(allXValues as number[], innerWidth, true);
  }, [allXValues, innerWidth]);

  const yScale = useMemo(
    () => buildLinearScale(allYValues, innerHeight),
    [allYValues, innerHeight]
  );

  const handleBrushChange = (domain: Bounds | null) => {
    if (!domain) {
      onChange(null);
      return;
    }
    const { x0, x1 } = domain;
    const isTime = allXValues.length > 0 && allXValues[0] instanceof Date;
    if (isTime) {
      onChange([new Date(x0), new Date(x1)]);
    } else {
      onChange([x0, x1]);
    }
  };

  if (innerWidth <= 0 || innerHeight <= 0) return null;

  return (
    <svg width={width} height={BRUSH_HEIGHT}>
      <Group left={BRUSH_MARGIN.left} top={BRUSH_MARGIN.top}>
        {visibleSeries.map((s, i) => {
          const seriesIndex = series.indexOf(s);
          const color = getSeriesColor(seriesIndex, s.color);
          return (
            <LinePath
              key={s.id}
              data={s.data}
              x={(d) => xScale(xAccessor(d)) ?? 0}
              y={(d) => yScale(yAccessor(d)) ?? 0}
              stroke={color}
              strokeWidth={1}
              strokeOpacity={0.6}
            />
          );
        })}
        <Brush
          innerRef={brushRef}
          xScale={xScale}
          yScale={yScale}
          width={innerWidth}
          height={innerHeight}
          handleSize={8}
          resizeTriggerAreas={["left", "right"]}
          brushDirection="horizontal"
          onChange={handleBrushChange}
          selectedBoxStyle={{
            fill: "var(--element-fill-brand-tertiary-hover)",
            stroke: "var(--element-outline-brand-default)",
            strokeWidth: 1,
          }}
        />
      </Group>
    </svg>
  );
}
