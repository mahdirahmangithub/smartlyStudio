import { type CSSProperties, useMemo } from "react";
import { LineChart, type Series as LineSeries } from "../components/LineChart";
import { curveMonotoneX } from "@visx/curve";
import { BarChart } from "../components/BarChart";
import type { Series } from "../components/ChartPrimitives";
import { PieChart, type PieSlice } from "../components/PieChart";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

interface DataPoint {
  date: Date;
  value: number;
}

function generateLineData(points: number, base: number, volatility: number): DataPoint[] {
  const now = new Date();
  const data: DataPoint[] = [];
  let value = base;
  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.45) * volatility;
    value = Math.max(0, value);
    data.push({
      date: new Date(now.getTime() - (points - i) * 24 * 60 * 60 * 1000),
      value: Math.round(value * 100) / 100,
    });
  }
  return data;
}

const xAccessor = (d: DataPoint) => d.date;
const yAccessor = (d: DataPoint) => d.value;

function MonoLineDemo() {
  const series = useMemo<LineSeries<DataPoint>[]>(
    () => [
      {
        id: "metric",
        label: "Metric",
        data: generateLineData(30, 100, 10),
        color: "var(--text-neutral-primary)",
      },
    ],
    [],
  );

  return (
    <LineChart
      series={series}
      xAccessor={xAccessor}
      yAccessor={yAccessor}
      curve={curveMonotoneX}
      edgeFade
      showXGrid={false}
      height={300}
      showLegend={false}
    />
  );
}

interface BarDataPoint {
  category: string;
  value: number;
}

const categoryAccessor = (d: BarDataPoint) => d.category;
const barYAccessor = (d: BarDataPoint) => d.value;

function MonoBarDemo() {
  const series = useMemo<Series<BarDataPoint>[]>(
    () => [
      {
        id: "revenue",
        label: "Revenue",
        data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => ({
          category: m,
          value: Math.floor(Math.random() * 80) + 20,
        })),
        color: "var(--text-neutral-primary)",
      },
    ],
    [],
  );

  return (
    <BarChart
      series={series}
      categoryAccessor={categoryAccessor}
      yAccessor={barYAccessor}
      variant="simple"
      showXGrid={false}
      height={300}
      showLegend={false}
    />
  );
}

const PIE_DATA: PieSlice[] = [
  { id: "segment-a", label: "Segment A", value: 45, color: "var(--text-neutral-primary)" },
  { id: "segment-b", label: "Segment B", value: 30, color: "var(--text-neutral-placeholder)" },
  { id: "segment-c", label: "Segment C", value: 25, color: "var(--text-neutral-tertiary-default)" },
];

function MonoPieDemo() {
  return (
    <div style={{ maxWidth: 360, margin: "0 auto" }}>
      <PieChart
        data={PIE_DATA}
        thickness={40}
        height={360}
        tooltipValueFormat={(v) => `${v}%`}
        legendDefaultCollapsed
      />
    </div>
  );
}

const chartWrapper: CSSProperties = { width: 700, margin: "0 auto" };

export default function MonochromeChartsPlayground() {
  return (
    <>
      <h1>Monochrome Charts</h1>

      <section style={{ ...sectionStyle, marginTop: 100 }}>
        <div style={{ ...cardStyle, ...chartWrapper }}>
          <MonoLineDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={{ ...cardStyle, ...chartWrapper }}>
          <MonoBarDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={{ ...cardStyle, ...chartWrapper }}>
          <MonoPieDemo />
        </div>
      </section>
    </>
  );
}
