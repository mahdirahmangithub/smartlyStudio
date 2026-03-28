import { scaleLinear, scaleTime } from "@visx/scale";
import { bisector, extent } from "d3-array";

export interface ConfidenceBand<D = any> {
  upper: (d: D) => number;
  lower: (d: D) => number;
}

export interface Series<D = any> {
  id: string;
  label: string;
  data: D[];
  color?: string;
  icon?: React.ReactNode;
  confidenceBand?: ConfidenceBand<D>;
  /** Which Y axis this series binds to. Defaults to "left". */
  yAxis?: "left" | "right";
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const DEFAULT_MARGIN: Margin = { top: 16, right: 16, bottom: 40, left: 48 };

export const CATEGORICAL_TOKENS = [
  "--data-viz-categorical-1-default",
  "--data-viz-categorical-2-default",
  "--data-viz-categorical-3-default",
  "--data-viz-categorical-4-default",
  "--data-viz-categorical-5-default",
  "--data-viz-categorical-6-default",
] as const;

export const CATEGORICAL_HOVER_TOKENS = [
  "--data-viz-categorical-1-hover",
  "--data-viz-categorical-2-hover",
  "--data-viz-categorical-3-hover",
  "--data-viz-categorical-4-hover",
  "--data-viz-categorical-5-hover",
  "--data-viz-categorical-6-hover",
] as const;

export const CATEGORICAL_DISABLE_TOKENS = [
  "--data-viz-categorical-1-disable",
  "--data-viz-categorical-2-disable",
  "--data-viz-categorical-3-disable",
  "--data-viz-categorical-4-disable",
  "--data-viz-categorical-5-disable",
  "--data-viz-categorical-6-disable",
] as const;

export const CATEGORICAL_WEAK_TOKENS = [
  "--data-viz-categorical-1-weak",
  "--data-viz-categorical-2-weak",
  "--data-viz-categorical-3-weak",
  "--data-viz-categorical-4-weak",
  "--data-viz-categorical-5-weak",
  "--data-viz-categorical-6-weak",
] as const;

let _resolvedColors: string[] | null = null;

export function getCategoricalColors(): string[] {
  if (_resolvedColors) return _resolvedColors;
  const root = document.documentElement;
  const computed = getComputedStyle(root);
  _resolvedColors = CATEGORICAL_TOKENS.map(
    (token) => computed.getPropertyValue(token).trim() || "#888"
  );
  return _resolvedColors;
}

export function invalidateColorCache() {
  _resolvedColors = null;
}

export function getSeriesColor(index: number, override?: string): string {
  if (override) return override;
  const colors = getCategoricalColors();
  return colors[index % colors.length];
}

export function isCategoricalColor(override?: string): boolean {
  return !override;
}

export function getSeriesHoverColor(index: number, override?: string): string {
  if (override) return override;
  return `var(${CATEGORICAL_HOVER_TOKENS[index % CATEGORICAL_HOVER_TOKENS.length]})`;
}

export function getSeriesWeakColor(index: number, override?: string): string {
  if (override) return override;
  return `var(${CATEGORICAL_WEAK_TOKENS[index % CATEGORICAL_WEAK_TOKENS.length]})`;
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
