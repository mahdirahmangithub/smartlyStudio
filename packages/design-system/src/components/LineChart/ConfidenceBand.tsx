import { AreaClosed } from "@visx/shape";
import type { CurveFactory } from "d3-shape";

export interface ConfidenceBandProps<D> {
  data: D[];
  xAccessor: (d: D) => number;
  y0Accessor: (d: D) => number;
  y1Accessor: (d: D) => number;
  color: string;
  curve?: CurveFactory;
  yScale: any;
}

export function ConfidenceBandArea<D>({
  data,
  xAccessor,
  y0Accessor,
  y1Accessor,
  color,
  curve,
  yScale,
}: ConfidenceBandProps<D>) {
  return (
    <AreaClosed
      data={data}
      x={xAccessor}
      y0={y0Accessor}
      y1={y1Accessor}
      yScale={yScale}
      curve={curve}
      fill={color}
      fillOpacity={0.12}
      strokeWidth={0}
    />
  );
}
