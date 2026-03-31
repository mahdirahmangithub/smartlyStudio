import { scaleBand, scaleLinear, scaleTime } from "@visx/scale";
import { bisector, extent } from "d3-array";

export interface ConfidenceBand<D = any> {
  upper: (d: D) => number;
  lower: (d: D) => number;
}

export type LineDash = "dotted" | "dashed" | "dash-dot";
export type BarFillPattern = "dotted" | "hatch-right" | "hatch-left";

export interface Series<D = any> {
  id: string;
  label: string;
  data: D[];
  color?: string;
  icon?: React.ReactNode;
  confidenceBand?: ConfidenceBand<D>;
  /** Which Y axis this series binds to. Defaults to "left". */
  yAxis?: "left" | "right";
  /** Show area gradient fill under this series line. */
  areaFill?: boolean;
  /** Stroke dash style for line charts. Omit for solid. */
  dash?: LineDash;
  /** Fill pattern overlay for bar charts. Omit for solid fill. */
  fillPattern?: BarFillPattern;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const DEFAULT_MARGIN: Margin = { top: 16, right: 16, bottom: 40, left: 48 };

import {
  getCategoricalPalette,
  getCategoricalColor,
  invalidateDataVizCache,
} from "./dataVizPalette";

export const CATEGORICAL_TOKENS = [
  "--data-viz-categorical-1-default",
  "--data-viz-categorical-2-default",
  "--data-viz-categorical-3-default",
  "--data-viz-categorical-4-default",
  "--data-viz-categorical-5-default",
  "--data-viz-categorical-6-default",
  "--data-viz-categorical-7-default",
  "--data-viz-categorical-8-default",
] as const;

/** @deprecated Use `getCategoricalPalette()` from `dataVizPalette` directly. */
export function getCategoricalColors(): string[] {
  return getCategoricalPalette();
}

/** @deprecated Use `invalidateDataVizCache()` from `dataVizPalette` directly. */
export function invalidateColorCache() {
  invalidateDataVizCache();
}

export function getSeriesColor(index: number, override?: string): string {
  return getCategoricalColor(index, override);
}

export function isCategoricalColor(override?: string): boolean {
  return !override;
}

export function buildTimeScale(
  data: Date[],
  width: number
) {
  const [min, max] = extent(data) as [Date, Date];
  return scaleTime<number>({
    domain: [min, max],
    range: [0, width],
  });
}

export function buildLinearScale(
  data: number[],
  height: number,
  nice = true
) {
  const [min = 0, max = 0] = extent(data) as [number, number];
  let lo = min;
  let hi = max;
  if (nice) {
    const niced = scaleLinear<number>({ domain: [lo, hi], range: [height, 0] }).nice();
    [lo, hi] = niced.domain() as [number, number];
  }
  const padding = (hi - lo) * 0.1 || 1;
  return scaleLinear<number>({
    domain: [lo - padding, hi + padding],
    range: [height, 0],
  });
}

export function buildBandScale(
  domain: string[],
  size: number,
  padding = 0.2
) {
  return scaleBand<string>({
    domain,
    range: [0, size],
    padding,
  });
}

export function buildLinearScaleForBars(
  data: number[],
  size: number,
  includeZero = true,
  invert = true
) {
  const [min = 0, max = 0] = extent(data) as [number, number];
  const lo = includeZero ? Math.min(0, min) : min;
  const hi = includeZero ? Math.max(0, max) : max;
  const range: [number, number] = invert ? [size, 0] : [0, size];
  const niced = scaleLinear<number>({ domain: [lo, hi], range }).nice();
  return niced;
}

export function createBisector<D>(accessor: (d: D) => Date | number) {
  return bisector<D, Date | number>(accessor).left;
}

export function findNearestDatum<D>(
  data: D[],
  accessor: (d: D) => Date | number,
  xValue: Date | number,
  bisectorFn: ReturnType<typeof createBisector<D>>
): D | undefined {
  const index = bisectorFn(data, xValue, 1);
  const d0 = data[index - 1];
  const d1 = data[index];
  if (!d0) return d1;
  if (!d1) return d0;
  const v = xValue instanceof Date ? xValue.getTime() : xValue;
  const v0 = accessor(d0);
  const v1 = accessor(d1);
  const t0 = v0 instanceof Date ? v0.getTime() : v0;
  const t1 = v1 instanceof Date ? v1.getTime() : v1;
  return v - t0 > t1 - v ? d1 : d0;
}
