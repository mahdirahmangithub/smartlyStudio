export interface MetricPoint {
  x: Date;
  y: number;
}

export interface MetricSeriesDef {
  id: string;
  label: string;
  data: MetricPoint[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const BASE_DATE = new Date(2026, 0, 1).getTime();
const dayAt = (i: number) => new Date(BASE_DATE + i * DAY_MS);

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomWalk(
  points: number,
  base: number,
  volatility: number,
  seed: number,
): MetricPoint[] {
  const rand = mulberry32(seed);
  let value = base;
  const out: MetricPoint[] = [];
  for (let i = 0; i < points; i++) {
    value += (rand() - 0.45) * volatility;
    if (value < 0.05) value = 0.05;
    out.push({ x: dayAt(i), y: Math.round(value * 100) / 100 });
  }
  return out;
}

function sumY(data: MetricPoint[]): number {
  return Math.round(data.reduce((s, p) => s + p.y, 0) * 100) / 100;
}

function lastY(data: MetricPoint[]): number {
  return Math.round((data.at(-1)?.y ?? 0) * 100) / 100;
}

function meanY(data: MetricPoint[]): number {
  if (!data.length) return 0;
  const total = data.reduce((s, p) => s + p.y, 0);
  return Math.round((total / data.length) * 100) / 100;
}

export const METRIC_SERIES: Record<string, MetricSeriesDef> = {
  spend: {
    id: "spend",
    label: "Spend",
    data: randomWalk(30, 1.0, 0.4, 11),
  },
  impressions: {
    id: "impressions",
    label: "Impressions",
    data: randomWalk(30, 0.7, 0.35, 27),
  },
  linkClicks: {
    id: "linkClicks",
    label: "Link Clicks",
    data: randomWalk(30, 0.9, 0.4, 53),
  },
  cpm: {
    id: "cpm",
    label: "CPM",
    data: randomWalk(30, 0.8, 0.35, 91),
  },
  cpc: {
    id: "cpc",
    label: "CPC",
    data: randomWalk(30, 0.6, 0.35, 137),
  },
  ctr: {
    id: "ctr",
    label: "CTR",
    data: randomWalk(30, 1.0, 0.4, 199),
  },
};

/**
 * Headline numbers derived from the chart series, so the value shown in the
 * Stat tells the same story as the chart below it.
 *  - cumulative metrics (spend, impressions, link clicks) → SUM of daily points
 *  - rate / average metrics (CPM, CPC, CTR) → MEAN of daily points
 */
export const METRIC_HEADLINE = {
  spend: sumY(METRIC_SERIES.spend.data),
  impressions: sumY(METRIC_SERIES.impressions.data),
  // Link clicks are presented as raw integer counts. The 5× factor scales
  // the normalized 0–2 chart series to a realistic click count (~150).
  linkClicks: Math.round(sumY(METRIC_SERIES.linkClicks.data) * 5),
  cpm: meanY(METRIC_SERIES.cpm.data),
  cpc: meanY(METRIC_SERIES.cpc.data),
  ctr: meanY(METRIC_SERIES.ctr.data),
  // Latest is also exposed in case a card prefers "current value" framing.
  spendLatest: lastY(METRIC_SERIES.spend.data),
  impressionsLatest: lastY(METRIC_SERIES.impressions.data),
};
