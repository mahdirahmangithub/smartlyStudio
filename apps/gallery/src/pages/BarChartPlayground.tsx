import { type CSSProperties, useMemo, useState, useCallback, createContext, useContext } from "react";
import { BarChart as BarChartBase, type BarChartProps } from "@sds/components/BarChart";
import { ComboChart } from "@sds/components/ComboChart";
import type { ComboSeries } from "@sds/components/ComboChart";
import type { Series } from "@sds/components/ChartPrimitives";
import { setOklchEnhancement, isOklchEnhanced } from "@sds/components/ChartPrimitives";

const ChartOptsCtx = createContext({ showXGrid: true, showYGrid: true, showAxes: true });
function BarChart<D = any>(props: BarChartProps<D>) {
  const opts = useContext(ChartOptsCtx);
  return <BarChartBase<D> {...props} showXGrid={opts.showXGrid} showYGrid={opts.showYGrid} showAxes={opts.showAxes} />;
}

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

interface BarDataPoint {
  category: string;
  value: number;
}

const categoryAccessor = (d: BarDataPoint) => d.category;
const yAccessor = (d: BarDataPoint) => d.value;

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const quarters = ["Q1", "Q2", "Q3", "Q4"];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function SimpleDemo() {
  const series = useMemo<Series<BarDataPoint>[]>(
    () => [
      {
        id: "revenue",
        label: "Revenue",
        data: months.map((m) => ({ category: m, value: randomInt(20, 100) })),
      },
    ],
    []
  );

  return (
    <BarChart
      series={series}
      categoryAccessor={categoryAccessor}
      yAccessor={yAccessor}
      variant="simple"
      height={300}
      tooltipValueFormat={(v) => `$${v}k`}
      valueTickFormat={(v) => `$${v}k`}
    />
  );
}

function GroupedDemo() {
  const series = useMemo<Series<BarDataPoint>[]>(
    () => [
      {
        id: "desktop",
        label: "Desktop",
        data: quarters.map((q) => ({ category: q, value: randomInt(40, 120) })),
      },
      {
        id: "mobile",
        label: "Mobile",
        data: quarters.map((q) => ({ category: q, value: randomInt(30, 90) })),
      },
      {
        id: "tablet",
        label: "Tablet",
        data: quarters.map((q) => ({ category: q, value: randomInt(10, 50) })),
      },
    ],
    []
  );

  return (
    <BarChart
      series={series}
      categoryAccessor={categoryAccessor}
      yAccessor={yAccessor}
      variant="grouped"
      height={350}
      tooltipValueFormat={(v) => `${v} sessions`}
    />
  );
}

function StackedDemo() {
  const series = useMemo<Series<BarDataPoint>[]>(
    () => [
      {
        id: "organic",
        label: "Organic",
        data: months.slice(0, 6).map((m) => ({ category: m, value: randomInt(30, 80) })),
      },
      {
        id: "paid",
        label: "Paid",
        data: months.slice(0, 6).map((m) => ({ category: m, value: randomInt(20, 60) })),
      },
      {
        id: "referral",
        label: "Referral",
        data: months.slice(0, 6).map((m) => ({ category: m, value: randomInt(10, 30) })),
      },
    ],
    []
  );

  return (
    <BarChart
      series={series}
      categoryAccessor={categoryAccessor}
      yAccessor={yAccessor}
      variant="stacked"
      height={350}
      tooltipValueFormat={(v) => `${v} visits`}
    />
  );
}

function HorizontalSimpleDemo() {
  const series = useMemo<Series<BarDataPoint>[]>(
    () => [
      {
        id: "score",
        label: "Score",
        data: ["Engineering", "Design", "Marketing", "Sales", "Support", "Product"].map(
          (dept) => ({ category: dept, value: randomInt(50, 100) })
        ),
      },
    ],
    []
  );

  return (
    <BarChart
      series={series}
      categoryAccessor={categoryAccessor}
      yAccessor={yAccessor}
      variant="simple"
      orientation="horizontal"
      height={300}
      margin={{ top: 16, right: 16, bottom: 40, left: 90 }}
      tooltipValueFormat={(v) => `${v}%`}
      valueTickFormat={(v) => `${v}%`}
    />
  );
}

function HorizontalGroupedDemo() {
  const series = useMemo<Series<BarDataPoint>[]>(
    () => [
      {
        id: "2024",
        label: "2024",
        data: quarters.map((q) => ({ category: q, value: randomInt(200, 600) })),
      },
      {
        id: "2025",
        label: "2025",
        data: quarters.map((q) => ({ category: q, value: randomInt(300, 800) })),
      },
    ],
    []
  );

  return (
    <BarChart
      series={series}
      categoryAccessor={categoryAccessor}
      yAccessor={yAccessor}
      variant="grouped"
      orientation="horizontal"
      height={300}
      margin={{ top: 16, right: 16, bottom: 40, left: 48 }}
      tooltipValueFormat={(v) => `$${v}k`}
      valueTickFormat={(v) => `${v}`}
    />
  );
}

function HorizontalStackedDemo() {
  const series = useMemo<Series<BarDataPoint>[]>(
    () => [
      {
        id: "completed",
        label: "Completed",
        data: ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"].map((s) => ({
          category: s,
          value: randomInt(8, 20),
        })),
      },
      {
        id: "in-progress",
        label: "In Progress",
        data: ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"].map((s) => ({
          category: s,
          value: randomInt(3, 10),
        })),
      },
      {
        id: "blocked",
        label: "Blocked",
        data: ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"].map((s) => ({
          category: s,
          value: randomInt(0, 5),
        })),
      },
    ],
    []
  );

  return (
    <BarChart
      series={series}
      categoryAccessor={categoryAccessor}
      yAccessor={yAccessor}
      variant="stacked"
      orientation="horizontal"
      height={280}
      margin={{ top: 16, right: 16, bottom: 40, left: 72 }}
      tooltipValueFormat={(v) => `${v} stories`}
    />
  );
}

interface ComboDataPoint {
  category: string;
  value: number;
}

function ComboDemo() {
  const series = useMemo<ComboSeries<ComboDataPoint>[]>(
    () => [
      {
        id: "revenue",
        type: "bar",
        label: "Revenue",
        data: quarters.map((q) => ({ category: q, value: randomInt(200, 600) })),
      },
      {
        id: "costs",
        type: "bar",
        label: "Costs",
        data: quarters.map((q) => ({ category: q, value: randomInt(100, 400) })),
      },
      {
        id: "margin",
        type: "line",
        label: "Margin %",
        data: quarters.map((q) => ({ category: q, value: randomInt(10, 60) })),
        yAxis: "right",
      },
      {
        id: "growth",
        type: "line",
        label: "Growth %",
        data: quarters.map((q) => ({ category: q, value: randomInt(5, 40) })),
        yAxis: "right",
      },
      {
        id: "roi",
        type: "line",
        label: "ROI %",
        data: quarters.map((q) => ({ category: q, value: randomInt(15, 55) })),
        yAxis: "right",
      },
    ],
    []
  );

  return (
    <ComboChart
      series={series}
      categoryAccessor={categoryAccessor}
      yAccessor={yAccessor}
      barVariant="grouped"
      height={400}
      tooltipValueFormat={(v) => `$${v}k`}
      tooltipYRightFormat={(v) => `${v}%`}
      valueTickFormat={(v) => `$${v}k`}
      yRightTickFormat={(v) => `${v}%`}
      yLeftTitle="Revenue"
      yRightTitle="Rates"
    />
  );
}

function ComboStackedDemo() {
  const series = useMemo<ComboSeries<ComboDataPoint>[]>(
    () => [
      {
        id: "organic",
        type: "bar",
        label: "Organic",
        data: months.slice(0, 6).map((m) => ({ category: m, value: randomInt(30, 80) })),
      },
      {
        id: "paid",
        type: "bar",
        label: "Paid",
        data: months.slice(0, 6).map((m) => ({ category: m, value: randomInt(20, 60) })),
      },
      {
        id: "referral",
        type: "bar",
        label: "Referral",
        data: months.slice(0, 6).map((m) => ({ category: m, value: randomInt(10, 30) })),
      },
      {
        id: "conversion",
        type: "line",
        label: "Conversion %",
        data: months.slice(0, 6).map((m) => ({ category: m, value: randomInt(5, 25) })),
        yAxis: "right",
      },
      {
        id: "bounce",
        type: "line",
        label: "Bounce Rate %",
        data: months.slice(0, 6).map((m) => ({ category: m, value: randomInt(20, 50) })),
        yAxis: "right",
      },
      {
        id: "engagement",
        type: "line",
        label: "Engagement %",
        data: months.slice(0, 6).map((m) => ({ category: m, value: randomInt(30, 70) })),
        yAxis: "right",
      },
    ],
    []
  );

  return (
    <ComboChart
      series={series}
      categoryAccessor={categoryAccessor}
      yAccessor={yAccessor}
      barVariant="stacked"
      height={400}
      tooltipValueFormat={(v) => `${v} visits`}
      tooltipYRightFormat={(v) => `${v}%`}
      valueTickFormat={(v) => `${v}`}
      yRightTickFormat={(v) => `${v}%`}
      yLeftTitle="Traffic"
      yRightTitle="Rates"
    />
  );
}

export default function BarChartPlayground() {
  const [showXGrid, setShowXGrid] = useState(true);
  const [showYGrid, setShowYGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [oklch, setOklch] = useState(isOklchEnhanced);
  const [, rerender] = useState(0);
  const toggleOklch = useCallback(() => {
    const next = !oklch;
    setOklchEnhancement(next);
    setOklch(next);
    rerender((n) => n + 1);
  }, [oklch]);

  return (
    <ChartOptsCtx.Provider value={{ showXGrid, showYGrid, showAxes }}>
    <>
      <h1>BarChart</h1>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 13 }}>
        <label style={{ fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, background: oklch ? "rgba(80,180,80,0.1)" : "rgba(0,0,0,0.04)" }}>
          <input type="checkbox" checked={oklch} onChange={toggleOklch} style={{ width: 16, height: 16 }} />
          OKLCH Enhanced Colors
        </label>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 13 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={showXGrid} onChange={(e) => setShowXGrid(e.target.checked)} />
          X Grid
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={showYGrid} onChange={(e) => setShowYGrid(e.target.checked)} />
          Y Grid
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="checkbox" checked={showAxes} onChange={(e) => setShowAxes(e.target.checked)} />
          Axes
        </label>
      </div>

      <section style={sectionStyle}>
        <h2>Simple (Single Series)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          One bar per category. Hover highlights the band and shows a tooltip.
        </p>
        <div style={cardStyle}>
          <SimpleDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Grouped (Multi-Series)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Multiple series side by side within each category. Legend toggles visibility.
        </p>
        <div style={cardStyle}>
          <GroupedDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Stacked</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Series stacked on top of each other. Y axis reflects cumulative totals.
        </p>
        <div style={cardStyle}>
          <StackedDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Horizontal — Simple</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Bars grow from left to right. Categories on the Y axis.
        </p>
        <div style={cardStyle}>
          <HorizontalSimpleDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Horizontal — Grouped</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Grouped bars in horizontal orientation. Year-over-year comparison.
        </p>
        <div style={cardStyle}>
          <HorizontalGroupedDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Horizontal — Stacked</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Stacked horizontal bars for part-to-whole comparisons.
        </p>
        <div style={cardStyle}>
          <HorizontalStackedDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Combo — Grouped Bars + Line</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Revenue and Costs as grouped bars (left axis), Margin % as a line (right axis).
        </p>
        <div style={cardStyle}>
          <ComboDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Combo — Stacked Bars + Line</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Stacked traffic sources with conversion rate trend line on the right axis.
        </p>
        <div style={cardStyle}>
          <ComboStackedDemo />
        </div>
      </section>
    </>
    </ChartOptsCtx.Provider>
  );
}
