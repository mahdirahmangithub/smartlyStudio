import { type CSSProperties, useMemo, useState } from "react";
import { LineChart } from "../components/LineChart";
import { BarChart } from "../components/BarChart";
import type { Series } from "../components/LineChart";
import type { LegendLayout } from "../components/ChartPrimitives";
import { curveMonotoneX } from "@visx/curve";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

interface DataPoint {
  date: Date;
  value: number;
}

function generateData(points: number, base: number, volatility: number): DataPoint[] {
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

function DashStylesDemo() {
  const sharedColor = "var(--data-viz-categorical-1-default)";
  const series = useMemo<Series<DataPoint>[]>(
    () => [
      { id: "solid", label: "Solid", data: generateData(30, 70, 8), color: sharedColor },
      { id: "dotted", label: "Dotted", data: generateData(30, 55, 9), color: sharedColor, dash: "dotted" },
      { id: "dashed", label: "Dashed", data: generateData(30, 85, 7), color: sharedColor, dash: "dashed" },
      { id: "dash-dot", label: "Dash-Dot", data: generateData(30, 40, 10), color: sharedColor, dash: "dash-dot" },
    ],
    [],
  );

  return (
    <LineChart
      series={series}
      xAccessor={xAccessor}
      yAccessor={yAccessor}
      curve={curveMonotoneX}
      height={350}
      edgeFade
    />
  );
}

interface BarDataPoint {
  category: string;
  value: number;
}

const barCategories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
function generateBarData(): BarDataPoint[] {
  return barCategories.map((category) => ({
    category,
    value: Math.round(20 + Math.random() * 80),
  }));
}
const barCategoryAccessor = (d: BarDataPoint) => d.category;
const barYAccessor = (d: BarDataPoint) => d.value;

function GroupedFillPatternsDemo() {
  const sharedColor = "var(--data-viz-categorical-2-default)";
  const series = useMemo<Series<BarDataPoint>[]>(
    () => [
      { id: "solid", label: "Solid", data: generateBarData(), color: sharedColor },
      { id: "dotted", label: "Dotted", data: generateBarData(), color: sharedColor, fillPattern: "dotted" },
      { id: "hatch-right", label: "Hatch /", data: generateBarData(), color: sharedColor, fillPattern: "hatch-right" },
      { id: "hatch-left", label: "Hatch \\", data: generateBarData(), color: sharedColor, fillPattern: "hatch-left" },
    ],
    [],
  );

  return (
    <BarChart
      series={series}
      categoryAccessor={barCategoryAccessor}
      yAccessor={barYAccessor}
      variant="grouped"
      height={350}
      showGrid
    />
  );
}

function StackedFillPatternsDemo() {
  const sharedColor = "var(--data-viz-categorical-3-default)";
  const series = useMemo<Series<BarDataPoint>[]>(
    () => [
      { id: "solid", label: "Solid", data: generateBarData(), color: sharedColor },
      { id: "dotted", label: "Dotted", data: generateBarData(), color: sharedColor, fillPattern: "dotted" },
      { id: "hatch-right", label: "Hatch /", data: generateBarData(), color: sharedColor, fillPattern: "hatch-right" },
      { id: "hatch-left", label: "Hatch \\", data: generateBarData(), color: sharedColor, fillPattern: "hatch-left" },
    ],
    [],
  );

  return (
    <BarChart
      series={series}
      categoryAccessor={barCategoryAccessor}
      yAccessor={barYAccessor}
      variant="stacked"
      height={350}
      showGrid
    />
  );
}

function LegendLayoutDemo({ layout }: { layout: LegendLayout }) {
  const series = useMemo<Series<DataPoint>[]>(
    () => [
      { id: "s1", label: "Campaign Alpha", data: generateData(30, 80, 8) },
      { id: "s2", label: "Campaign Beta", data: generateData(30, 60, 12) },
      { id: "s3", label: "Campaign Gamma", data: generateData(30, 100, 6) },
      { id: "s4", label: "Campaign Delta", data: generateData(30, 45, 10) },
      { id: "s5", label: "Campaign Epsilon", data: generateData(30, 70, 9) },
      { id: "s6", label: "Campaign Zeta", data: generateData(30, 55, 7) },
      { id: "s7", label: "Campaign Eta", data: generateData(30, 90, 11) },
      { id: "s8", label: "Campaign Theta", data: generateData(30, 35, 7) },
    ],
    [],
  );

  return (
    <LineChart
      series={series}
      xAccessor={xAccessor}
      yAccessor={yAccessor}
      curve={curveMonotoneX}
      height={400}
      edgeFade
      legendLayout={layout}
    />
  );
}

export default function ChartLegendPlayground() {
  const [layout, setLayout] = useState<LegendLayout>("wrap");

  return (
    <>
      <h1>Chart Legend</h1>

      <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 13 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={layout === "scroll"}
            onChange={(e) => setLayout(e.target.checked ? "scroll" : "wrap")}
            style={{ width: 16, height: 16 }}
          />
          Scrollable legend
        </label>
      </div>

      <section style={sectionStyle}>
        <h2>Dash Styles</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Four lines with the same color but different stroke dash styles — solid, dotted, dashed, and dash-dot.
        </p>
        <div style={cardStyle}>
          <DashStylesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Fill Patterns — Grouped</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Four grouped bar series with the same color but different fill patterns — solid, dotted, hatch /, and hatch \.
        </p>
        <div style={cardStyle}>
          <GroupedFillPatternsDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Fill Patterns — Stacked</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Four stacked bar series with the same color but different fill patterns — solid, dotted, hatch /, and hatch \.
        </p>
        <div style={cardStyle}>
          <StackedFillPatternsDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>8 Series — Legend layout: {layout}</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          {layout === "wrap"
            ? "Legend chips wrap to multiple rows when they overflow."
            : "Legend chips stay on one line with horizontal scroll and edge fade."}
        </p>
        <div style={cardStyle}>
          <LegendLayoutDemo layout={layout} />
        </div>
      </section>
    </>
  );
}
