import { type CSSProperties, useMemo, useState, useCallback, createContext, useContext } from "react";
import { LineChart as LineChartBase } from "../components/LineChart";
import type { Series, LineChartProps } from "../components/LineChart";
import { setOklchEnhancement, isOklchEnhanced } from "../components/ChartPrimitives";
import { Icon } from "../components/Icon";
import { Card, CardContent, CardBody, CardTitle } from "../components/Card";
import { curveMonotoneX, curveLinear, curveCardinal } from "@visx/curve";

const ChartOptsCtx = createContext({ edgeFade: false, showXGrid: true, showYGrid: true });
function LineChart<D = any>(props: LineChartProps<D>) {
  const opts = useContext(ChartOptsCtx);
  return <LineChartBase<D> edgeFade={opts.edgeFade} showXGrid={opts.showXGrid} showYGrid={opts.showYGrid} {...props} />;
}

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
      { id: "impressions", label: "Impressions", data: generateData(90, 20, 4) },
      { id: "clicks", label: "Clicks", data: generateData(90, 15, 5) },
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

function IconIndicatorDemo() {
  const series = useMemo<Series<DataPoint>[]>(
    () => [
      { id: "meta", label: "Meta", data: generateData(30, 80, 8), icon: <Icon name="Meta_color" size={8} /> },
      { id: "reddit", label: "Reddit", data: generateData(30, 60, 10), icon: <Icon name="Reddit_color" size={8} /> },
      { id: "tiktok", label: "TikTok", data: generateData(30, 45, 6), icon: <Icon name="TikTok_color" size={8} /> },
      { id: "snapchat", label: "Snapchat", data: generateData(30, 70, 9), icon: <Icon name="Snapchat_color" size={8} /> },
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

function ManySeriesDemo() {
  const series = useMemo<Series<DataPoint>[]>(
    () => [
      { id: "s1", label: "Campaign A", data: generateData(30, 80, 8), areaFill: true },
      { id: "s2", label: "Campaign B", data: generateData(30, 60, 12), areaFill: true },
      { id: "s3", label: "Campaign C", data: generateData(30, 100, 6) },
      { id: "s4", label: "Campaign D", data: generateData(30, 45, 10) },
      { id: "s5", label: "Campaign E", data: generateData(30, 70, 9) },
      { id: "s6", label: "Campaign F", data: generateData(30, 55, 7) },
      { id: "s7", label: "Campaign G", data: generateData(30, 90, 11) },
      { id: "s8", label: "Campaign H", data: generateData(30, 35, 7) },
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

function DualAxisDemo() {
  const series = useMemo<Series<DataPoint>[]>(
    () => [
      { id: "spend", label: "Spend ($)", data: generateData(30, 5000, 600) },
      { id: "ctr", label: "CTR (%)", data: generateData(30, 3, 0.5), yAxis: "right" },
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
      tooltipYFormat={(v) => `$${v.toLocaleString()}`}
      tooltipYRightFormat={(v) => `${v.toFixed(2)}%`}
      yTickFormat={(v) => `$${(v / 1000).toFixed(0)}k`}
      yRightTickFormat={(v) => `${v.toFixed(1)}%`}
      yLeftTitle="Spend"
      yRightTitle="Click-through rate"
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
              <LineChartBase
                edgeFade={useContext(ChartOptsCtx).edgeFade}
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
  const [edgeFade, setEdgeFade] = useState(false);
  const [showXGrid, setShowXGrid] = useState(true);
  const [showYGrid, setShowYGrid] = useState(true);
  const [oklch, setOklch] = useState(isOklchEnhanced);
  const [, rerender] = useState(0);
  const toggleOklch = useCallback(() => {
    const next = !oklch;
    setOklchEnhancement(next);
    setOklch(next);
    rerender((n) => n + 1);
  }, [oklch]);

  return (
    <ChartOptsCtx.Provider value={{ edgeFade, showXGrid, showYGrid }}>
    <>
      <h1>LineChart</h1>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 13 }}>
        <label style={{ fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, background: oklch ? "rgba(80,180,80,0.1)" : "rgba(0,0,0,0.04)" }}>
          <input type="checkbox" checked={oklch} onChange={toggleOklch} style={{ width: 16, height: 16 }} />
          OKLCH Enhanced Colors
        </label>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 13 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={edgeFade} onChange={(e) => setEdgeFade(e.target.checked)} />
          Edge Fade
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={showXGrid} onChange={(e) => setShowXGrid(e.target.checked)} />
          X Grid (dashed)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={showYGrid} onChange={(e) => setShowYGrid(e.target.checked)} />
          Y Grid (solid)
        </label>
      </div>

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
        <h2>8 Series (Full Categorical Palette)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          All 8 categorical colors. Click legend items to show/hide series.
        </p>
        <div style={cardStyle}>
          <ManySeriesDemo />
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
        <h2>Icon Indicators</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Each series has a custom icon in the crosshair indicator instead of a color dot.
        </p>
        <div style={cardStyle}>
          <IconIndicatorDemo />
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
        <h2>Dual Y-Axis</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Spend on the left axis ($), CTR on the right axis (%). Each series scales independently.
        </p>
        <div style={cardStyle}>
          <DualAxisDemo />
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
    </ChartOptsCtx.Provider>
  );
}
