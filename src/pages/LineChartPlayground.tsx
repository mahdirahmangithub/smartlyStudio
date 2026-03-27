import { type CSSProperties, useMemo } from "react";
import { LineChart } from "../components/LineChart";
import type { Series } from "../components/LineChart";
import { Card, CardContent, CardBody, CardTitle } from "../components/Card";
import { curveMonotoneX, curveLinear, curveCardinal } from "@visx/curve";

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

function generateData(
  points: number,
  base: number,
  volatility: number
): DataPoint[] {
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

function BasicDemo() {
  const series = useMemo<Series<DataPoint>[]>(
    () => [
      { id: "revenue", label: "Revenue", data: generateData(30, 100, 10) },
    ],
    []
  );

  return (
    <LineChart
      series={series}
      xAccessor={xAccessor}
      yAccessor={yAccessor}
      curve={curveMonotoneX}
      height={300}
    />
  );
}

function MultiLineDemo() {
  const series = useMemo<Series<DataPoint>[]>(
    () => [
      { id: "revenue", label: "Revenue", data: generateData(30, 100, 10) },
      { id: "costs", label: "Costs", data: generateData(30, 60, 8) },
      { id: "profit", label: "Profit", data: generateData(30, 40, 12), color: "var(--data-viz-success-default)" },
    ],
    []
  );

  return (
    <LineChart
      series={series}
      xAccessor={xAccessor}
      yAccessor={yAccessor}
      curve={curveMonotoneX}
      height={350}
      showAreaFill
    />
  );
}

function CurveComparisonDemo() {
  const data = useMemo(() => generateData(20, 50, 15), []);
  const series = useMemo<Series<DataPoint>[]>(
    () => [{ id: "data", label: "Data", data }],
    [data]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 4px" }}>
          monotoneX (smooth)
        </p>
        <LineChart
          series={series}
          xAccessor={xAccessor}
          yAccessor={yAccessor}
          curve={curveMonotoneX}
          height={200}
          showLegend={false}
        />
      </div>
      <div>
        <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 4px" }}>
          linear (straight segments)
        </p>
        <LineChart
          series={series}
          xAccessor={xAccessor}
          yAccessor={yAccessor}
          curve={curveLinear}
          height={200}
          showLegend={false}
        />
      </div>
      <div>
        <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 4px" }}>
          cardinal (spline)
        </p>
        <LineChart
          series={series}
          xAccessor={xAccessor}
          yAccessor={yAccessor}
          curve={curveCardinal}
          height={200}
          showLegend={false}
        />
      </div>
    </div>
  );
}

function BrushDemo() {
  const series = useMemo<Series<DataPoint>[]>(
    () => [
      { id: "impressions", label: "Impressions", data: generateData(90, 5000, 500) },
      { id: "clicks", label: "Clicks", data: generateData(90, 300, 40) },
    ],
    []
  );

  return (
    <LineChart
      series={series}
      xAccessor={xAccessor}
      yAccessor={yAccessor}
      curve={curveMonotoneX}
      height={350}
      enableBrush
    />
  );
}

function ZoomDemo() {
  const series = useMemo<Series<DataPoint>[]>(
    () => [
      { id: "metric", label: "Metric A", data: generateData(60, 200, 25) },
    ],
    []
  );

  return (
    <LineChart
      series={series}
      xAccessor={xAccessor}
      yAccessor={yAccessor}
      curve={curveMonotoneX}
      height={350}
      enableZoom
      showLegend={false}
    />
  );
}

function ManySeriesDemo() {
  const series = useMemo<Series<DataPoint>[]>(
    () => [
      { id: "s1", label: "Campaign A", data: generateData(30, 80, 8) },
      { id: "s2", label: "Campaign B", data: generateData(30, 60, 12) },
      { id: "s3", label: "Campaign C", data: generateData(30, 100, 6) },
      { id: "s4", label: "Campaign D", data: generateData(30, 45, 10) },
      { id: "s5", label: "Campaign E", data: generateData(30, 70, 9) },
      { id: "s6", label: "Campaign F", data: generateData(30, 55, 7) },
    ],
    []
  );

  return (
    <LineChart
      series={series}
      xAccessor={xAccessor}
      yAccessor={yAccessor}
      curve={curveMonotoneX}
      height={400}
    />
  );
}

function NoAnimationDemo() {
  const series = useMemo<Series<DataPoint>[]>(
    () => [
      { id: "data", label: "Instant render", data: generateData(30, 50, 10) },
    ],
    []
  );

  return (
    <LineChart
      series={series}
      xAccessor={xAccessor}
      yAccessor={yAccessor}
      curve={curveMonotoneX}
      height={250}
      animate={false}
      showLegend={false}
    />
  );
}

interface ForecastPoint {
  date: Date;
  value: number;
  upper: number;
  lower: number;
}

function generateForecastData(points: number): ForecastPoint[] {
  const now = new Date();
  const data: ForecastPoint[] = [];
  let value = 100;
  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.45) * 8;
    const t = i / (points - 1);
    const spread = t * t * 8;
    data.push({
      date: new Date(now.getTime() - (points - i) * 24 * 60 * 60 * 1000),
      value: Math.round(value * 100) / 100,
      upper: Math.round((value + spread) * 100) / 100,
      lower: Math.round((value - spread) * 100) / 100,
    });
  }
  return data;
}

function ConfidenceBandDemo() {
  const data = useMemo(() => generateForecastData(30), []);
  const series = useMemo<Series<ForecastPoint>[]>(
    () => [
      {
        id: "forecast",
        label: "Forecast",
        data,
        color: "var(--data-viz-brand-default)",
        confidenceBand: {
          upper: (d) => d.upper,
          lower: (d) => d.lower,
        },
      },
    ],
    [data]
  );

  return (
    <LineChart<ForecastPoint>
      series={series}
      xAccessor={(d) => d.date}
      yAccessor={(d) => d.value}
      curve={curveMonotoneX}
      height={350}
    />
  );
}

function SparklineCard() {
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {["Revenue", "Impressions", "Conversions"].map((label, i) => (
        <Card key={label} variant="elevated" radius="lg" isStatic style={{ width: 240 }}>
          <CardContent>
            <CardBody>
              <CardTitle size="sm" title={label} />
              <LineChart
                series={[{
                  id: label,
                  label,
                  data: generateData(30, 50 + i * 20, 6 + i * 2),
                  color: i === 0 ? "var(--data-viz-brand-default)" : i === 1 ? "var(--data-viz-info-default)" : "var(--data-viz-success-default)",
                }]}
                xAccessor={xAccessor}
                yAccessor={yAccessor}
                curve={curveMonotoneX}
                height={64}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                showGrid={false}
                showAxes={false}
                showLegend={false}
                showTooltip={false}
                showAreaFill
              />
            </CardBody>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function LineChartPlayground() {
  return (
    <>
      <h1>LineChart</h1>

      <section style={sectionStyle}>
        <h2>Sparkline Cards</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Minimal chart in a card — no axes, grid, tooltip, or legend.
        </p>
        <div style={cardStyle}>
          <SparklineCard />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Basic Single Line</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Single series with monotone curve, animated draw-in, tooltip on hover.
        </p>
        <div style={cardStyle}>
          <BasicDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Multi-Line</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Three series with legend (click to toggle). Staggered animation.
        </p>
        <div style={cardStyle}>
          <MultiLineDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>6 Series (Full Categorical Palette)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          All 6 categorical colors. Click legend items to show/hide series.
        </p>
        <div style={cardStyle}>
          <ManySeriesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Curve Comparison</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Same data rendered with different curve interpolations.
        </p>
        <div style={cardStyle}>
          <CurveComparisonDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Brush (Range Selection)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Drag the brush below the chart to filter the time range. 90 days of data.
        </p>
        <div style={cardStyle}>
          <BrushDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Zoom</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Use +/- buttons or mouse wheel to zoom. Drag to pan.
        </p>
        <div style={cardStyle}>
          <ZoomDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Confidence Band</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Forecast line with shaded upper/lower confidence band. Band widens over time.
        </p>
        <div style={cardStyle}>
          <ConfidenceBandDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>No Animation</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Instant render without draw-in animation.
        </p>
        <div style={cardStyle}>
          <NoAnimationDemo />
        </div>
      </section>
    </>
  );
}
