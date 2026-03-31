import { useState, useEffect, useRef, useMemo } from "react";
import { useSpring, useSprings } from "@react-spring/web";
import { scaleLinear } from "@visx/scale";
import { extent } from "d3-array";

export interface SeriesLike<D = any> {
  id: string;
  data: D[];
  yAxis?: "left" | "right";
}

export interface DomainTarget {
  values: number[];
  includeZero?: boolean;
  /** Fraction of the niced range to add as padding on both ends (e.g. 0.1 = 10%). */
  padding?: number;
}

export interface UseSeriesAnimationOptions<D, S extends SeriesLike<D> = SeriesLike<D>> {
  series: S[];
  hiddenSeries: Set<string>;
  /**
   * Compute the niced target Y-domain for a given axis from the target-visible
   * (unhidden) series. Return the raw values; the hook applies extent + nice.
   * When omitted the hook skips domain animation entirely.
   */
  computeDomainValues?: (
    targetVisible: S[],
    axis: "left" | "right",
  ) => DomainTarget | null;
  weightConfig?: { tension: number; friction: number };
  domainConfig?: { tension: number; friction: number };
}

export interface SeriesAnimationResult<D, S extends SeriesLike<D> = SeriesLike<D>> {
  /** Current spring weight (0..1) for a series. */
  getWeight: (s: S) => number;
  /** Series that are either visible or still animating out (weight > 0.01). */
  visibleSeries: S[];
  /** An incrementing counter that changes every animation frame — use as useMemo dep. */
  renderTick: number;
  /** Animated left-axis domain [lo, hi], or null if no computeDomainValues was given. */
  leftDomain: [number, number] | null;
  /** Animated right-axis domain [lo, hi], or null. */
  rightDomain: [number, number] | null;
}

const DEFAULT_WEIGHT_CONFIG = { tension: 120, friction: 20 };
const DEFAULT_DOMAIN_CONFIG = { tension: 60, friction: 18 };

function nicedDomain(values: number[], includeZero: boolean, padding = 0): [number, number] {
  if (values.length === 0) return [0, 1];
  const [min = 0, max = 0] = extent(values) as [number, number];
  const lo = includeZero ? Math.min(0, min) : min;
  const hi = includeZero ? Math.max(0, max) : max;
  const niced = scaleLinear<number>({ domain: [lo, hi], range: [0, 1] }).nice();
  const [nLo, nHi] = niced.domain() as [number, number];
  if (padding > 0) {
    const span = (nHi - nLo) * padding || 1;
    return [nLo - span, nHi + span];
  }
  return [nLo, nHi];
}

export function useSeriesAnimation<D, S extends SeriesLike<D> = SeriesLike<D>>(
  opts: UseSeriesAnimationOptions<D, S>,
): SeriesAnimationResult<D, S> {
  const {
    series,
    hiddenSeries,
    computeDomainValues,
    weightConfig = DEFAULT_WEIGHT_CONFIG,
    domainConfig = DEFAULT_DOMAIN_CONFIG,
  } = opts;

  // ── Shared RAF-batched render tick ──

  const [renderTick, forceRender] = useState(0);
  const rafPending = useRef(false);

  const scheduleRender = () => {
    if (!rafPending.current) {
      rafPending.current = true;
      requestAnimationFrame(() => {
        rafPending.current = false;
        forceRender((n) => n + 1);
      });
    }
  };

  // ── Weight springs ──

  const targetWeights = useMemo(
    () => series.map((s) => (hiddenSeries.has(s.id) ? 0 : 1)),
    [series, hiddenSeries],
  );

  const weightsRef = useRef<number[]>(targetWeights);

  useEffect(() => {
    if (weightsRef.current.length !== series.length) {
      weightsRef.current = targetWeights;
    }
  }, [series.length, targetWeights]);

  useSprings(
    series.length,
    series.map((_, i) => ({
      w: targetWeights[i],
      config: weightConfig,
      onChange: ({ value }: { value: Record<string, number> }) => {
        weightsRef.current[i] = Math.max(0, Math.min(1, value.w));
        scheduleRender();
      },
    })),
  );

  const getWeight = (s: S): number => {
    const idx = series.indexOf(s);
    return idx >= 0 ? (weightsRef.current[idx] ?? 1) : 1;
  };

  const visibleSeries = useMemo(
    () =>
      series.filter(
        (s, i) => !hiddenSeries.has(s.id) || (weightsRef.current[i] ?? 0) > 0.01,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, hiddenSeries, renderTick],
  );

  // ── Domain springs ──

  const targetVisible = useMemo(
    () => series.filter((s) => !hiddenSeries.has(s.id)),
    [series, hiddenSeries],
  );

  const targetLeftDomain = useMemo(() => {
    if (!computeDomainValues) return null;
    const result = computeDomainValues(targetVisible, "left");
    if (!result) return null;
    return nicedDomain(result.values, result.includeZero ?? true, result.padding);
  }, [computeDomainValues, targetVisible]);

  const targetRightDomain = useMemo(() => {
    if (!computeDomainValues) return null;
    const result = computeDomainValues(targetVisible, "right");
    if (!result) return null;
    return nicedDomain(result.values, result.includeZero ?? true, result.padding);
  }, [computeDomainValues, targetVisible]);

  const leftDomainRef = useRef<[number, number] | null>(targetLeftDomain);
  const rightDomainRef = useRef<[number, number] | null>(targetRightDomain);

  useSpring({
    lo: targetLeftDomain?.[0] ?? 0,
    hi: targetLeftDomain?.[1] ?? 1,
    config: domainConfig,
    onChange: ({ value }: { value: Record<string, number> }) => {
      if (targetLeftDomain) {
        leftDomainRef.current = [value.lo, value.hi];
        scheduleRender();
      }
    },
  });

  useSpring({
    lo: targetRightDomain?.[0] ?? 0,
    hi: targetRightDomain?.[1] ?? 1,
    config: domainConfig,
    onChange: ({ value }: { value: Record<string, number> }) => {
      if (targetRightDomain) {
        rightDomainRef.current = [value.lo, value.hi];
        scheduleRender();
      }
    },
  });

  return {
    getWeight,
    visibleSeries,
    renderTick,
    leftDomain: leftDomainRef.current,
    rightDomain: rightDomainRef.current,
  };
}
