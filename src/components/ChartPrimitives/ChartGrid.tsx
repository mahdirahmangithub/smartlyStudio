import { GridRows, GridColumns } from "@visx/grid";

export interface ChartGridProps {
  xScale: any;
  yScale: any;
  innerWidth: number;
  innerHeight: number;
  numXTicks?: number;
  numYTicks?: number;
  showYGrid?: boolean;
  showXGrid?: boolean;
}

export function ChartGrid({
  xScale,
  yScale,
  innerWidth,
  innerHeight,
  numXTicks = 6,
  numYTicks = 5,
  showYGrid = true,
  showXGrid = true,
}: ChartGridProps) {
  return (
    <>
      {showYGrid && (
        <GridRows
          scale={yScale}
          left={0.5}
          width={innerWidth - 1}
          numTicks={numYTicks}
          stroke="var(--element-divider-neutral-weak)"
          strokeWidth={1}
          strokeLinecap="round"
        />
      )}
      {showXGrid && (
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
      )}
    </>
  );
}
