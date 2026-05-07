import { type CSSProperties, useMemo, useState, useCallback } from "react";
import { PieChart, type PieSlice } from "@sds/components/PieChart";
import type { IconName } from "@sds/components/Icon";
import { setOklchEnhancement, isOklchEnhanced } from "@sds/components/ChartPrimitives";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

const SAMPLE_DATA: PieSlice[] = [
  { id: "facebook", label: "Facebook", value: 3200 },
  { id: "instagram", label: "Instagram", value: 2800 },
  { id: "twitter", label: "Twitter / X", value: 1400 },
  { id: "linkedin", label: "LinkedIn", value: 900 },
  { id: "tiktok", label: "TikTok", value: 2100 },
];

const SMALL_DATA: PieSlice[] = [
  { id: "completed", label: "Completed", value: 72 },
  { id: "in-progress", label: "In Progress", value: 18 },
  { id: "remaining", label: "Remaining", value: 10 },
];

const BUDGET_DATA: PieSlice[] = [
  { id: "engineering", label: "Engineering", value: 450000 },
  { id: "marketing", label: "Marketing", value: 280000 },
  { id: "sales", label: "Sales", value: 190000 },
  { id: "support", label: "Support", value: 120000 },
  { id: "operations", label: "Operations", value: 95000 },
  { id: "hr", label: "HR", value: 65000 },
];

const SLICE_POOL: PieSlice[] = [
  { id: "facebook", label: "Facebook", value: 3200 },
  { id: "instagram", label: "Instagram", value: 2800 },
  { id: "tiktok", label: "TikTok", value: 2100 },
  { id: "twitter", label: "Twitter / X", value: 1400 },
  { id: "linkedin", label: "LinkedIn", value: 900 },
  { id: "youtube", label: "YouTube", value: 1800 },
  { id: "pinterest", label: "Pinterest", value: 650 },
  { id: "snapchat", label: "Snapchat", value: 520 },
];

const ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "None" },
  { value: "check_circle", label: "check_circle" },
  { value: "star", label: "star" },
  { value: "favorite", label: "favorite" },
  { value: "trending_up", label: "trending_up" },
  { value: "bolt", label: "bolt" },
  { value: "diamond", label: "diamond" },
  { value: "shield", label: "shield" },
  { value: "circle", label: "circle" },
];

const controlRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 6,
};
const labelStyle: CSSProperties = { fontSize: 12, minWidth: 100, opacity: 0.7 };
const inputStyle: CSSProperties = { flex: 1, maxWidth: 200 };
const textInput: CSSProperties = { fontSize: 12, padding: "2px 6px", border: "1px solid #ccc", borderRadius: 4, width: 140 };

function Configurator() {
  const [sliceCount, setSliceCount] = useState(5);
  const [thickness, setThickness] = useState(40);
  const [padAngle, setPadAngle] = useState(0.02);
  const [cornerRadius, setCornerRadius] = useState(3);
  const [showIcon, setShowIcon] = useState(false);
  const [iconName, setIconName] = useState("check_circle");
  const [centerTitle, setCenterTitle] = useState("10.4k");
  const [showTitle, setShowTitle] = useState(true);
  const [centerDesc, setCenterDesc] = useState("Total followers");
  const [showDesc, setShowDesc] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [semiCircle, setSemiCircle] = useState(false);

  const data = useMemo(() => SLICE_POOL.slice(0, sliceCount), [sliceCount]);

  return (
    <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
      <div style={{ flex: "0 0 260px" }}>
        <div style={controlRow}>
          <span style={labelStyle}>Slices: {sliceCount}</span>
          <input type="range" min={1} max={8} value={sliceCount} onChange={(e) => setSliceCount(Number(e.target.value))} style={inputStyle} />
        </div>
        <div style={controlRow}>
          <span style={labelStyle}>Thickness: {thickness}px</span>
          <input type="range" min={0} max={140} value={thickness} onChange={(e) => setThickness(Number(e.target.value))} style={inputStyle} />
        </div>
        <div style={controlRow}>
          <span style={labelStyle}>Slice gap: {padAngle.toFixed(2)}</span>
          <input type="range" min={0} max={0.15} step={0.005} value={padAngle} onChange={(e) => setPadAngle(Number(e.target.value))} style={inputStyle} />
        </div>
        <div style={controlRow}>
          <span style={labelStyle}>Corner radius: {cornerRadius}px</span>
          <input type="range" min={0} max={20} value={cornerRadius} onChange={(e) => setCornerRadius(Number(e.target.value))} style={inputStyle} />
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "10px 0" }} />

        <div style={controlRow}>
          <span style={labelStyle}>Center icon</span>
          <input type="checkbox" checked={showIcon} onChange={(e) => setShowIcon(e.target.checked)} />
          {showIcon && (
            <select value={iconName} onChange={(e) => setIconName(e.target.value)} style={{ fontSize: 12 }}>
              {ICON_OPTIONS.filter((o) => o.value).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )}
        </div>
        <div style={controlRow}>
          <span style={labelStyle}>Title</span>
          <input type="checkbox" checked={showTitle} onChange={(e) => setShowTitle(e.target.checked)} />
          {showTitle && <input type="text" value={centerTitle} onChange={(e) => setCenterTitle(e.target.value)} style={textInput} />}
        </div>
        <div style={controlRow}>
          <span style={labelStyle}>Description</span>
          <input type="checkbox" checked={showDesc} onChange={(e) => setShowDesc(e.target.checked)} />
          {showDesc && <input type="text" value={centerDesc} onChange={(e) => setCenterDesc(e.target.value)} style={textInput} />}
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "10px 0" }} />

        <div style={controlRow}>
          <span style={labelStyle}>Show legend</span>
          <input type="checkbox" checked={showLegend} onChange={(e) => setShowLegend(e.target.checked)} />
        </div>
        <div style={controlRow}>
          <span style={labelStyle}>Slice labels</span>
          <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
        </div>
        <div style={controlRow}>
          <span style={labelStyle}>Semi-circle</span>
          <input type="checkbox" checked={semiCircle} onChange={(e) => setSemiCircle(e.target.checked)} />
        </div>
      </div>

      <div style={{ flex: "1 1 320px", maxWidth: 380 }}>
        <PieChart
          data={data}
          thickness={thickness}
          padAngle={padAngle}
          cornerRadius={cornerRadius}
          height={semiCircle ? 220 : 380}
          startAngle={semiCircle ? -Math.PI / 2 : undefined}
          endAngle={semiCircle ? Math.PI / 2 : undefined}
          centerIcon={showIcon ? (iconName as IconName) : undefined}
          centerIconSize="xl"
          centerValue={showTitle ? centerTitle : undefined}
          centerLabel={showDesc ? centerDesc : undefined}
          showLegend={showLegend}
          showSliceLabels={showLabels}
          tooltipValueFormat={(v) => v.toLocaleString()}
        />
      </div>
    </div>
  );
}

function BasicDoughnut() {
  return (
    <div style={{ maxWidth: 360 }}>
      <PieChart
        data={SAMPLE_DATA}
        thickness={40}
        height={360}
        centerValue="10.4k"
        centerLabel="Total followers"
        tooltipValueFormat={(v) => v.toLocaleString()}
      />
    </div>
  );
}

function SolidPie() {
  return (
    <div style={{ maxWidth: 320 }}>
      <PieChart
        data={SAMPLE_DATA}
        thickness={0}
        height={320}
        showSliceLabels
        tooltipValueFormat={(v) => v.toLocaleString()}
      />
    </div>
  );
}

function ThinRing() {
  return (
    <div style={{ maxWidth: 280 }}>
      <PieChart
        data={SMALL_DATA}
        thickness={12}
        height={280}
        centerValue="72%"
        centerLabel="Complete"
        showSliceLabels={false}
        padAngle={0.04}
      />
    </div>
  );
}


function WithCenterIcon() {
  return (
    <div style={{ maxWidth: 300 }}>
      <PieChart
        data={SMALL_DATA}
        thickness={30}
        height={300}
        centerValue="72%"
        centerIcon="check_circle"
        centerIconSize="xl"
        centerLabel="Done"
        showSliceLabels={false}
      />
    </div>
  );
}

function CenterContentOverride() {
  return (
    <div style={{ maxWidth: 300 }}>
      <PieChart
        data={SMALL_DATA}
        thickness={24}
        height={300}
        showSliceLabels={false}
        centerContent={
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>18</span>
            <span style={{ fontSize: 12, opacity: 0.6 }}>tasks left</span>
          </div>
        }
      />
    </div>
  );
}

function NoLegend() {
  return (
    <div style={{ maxWidth: 240 }}>
      <PieChart
        data={SMALL_DATA}
        thickness={20}
        height={240}
        showLegend={false}
        showSliceLabels={false}
        centerValue="72%"
      />
    </div>
  );
}

function SortedSlices() {
  return (
    <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
      <div>
        <p style={{ fontSize: 13, margin: "0 0 4px", opacity: 0.7 }}>Descending</p>
        <div style={{ maxWidth: 280 }}>
          <PieChart
            data={BUDGET_DATA}
            thickness={36}
            height={280}
            sortSlices="descending"
            showSliceLabels={false}
            tooltipValueFormat={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 13, margin: "0 0 4px", opacity: 0.7 }}>Ascending</p>
        <div style={{ maxWidth: 280 }}>
          <PieChart
            data={BUDGET_DATA}
            thickness={36}
            height={280}
            sortSlices="ascending"
            showSliceLabels={false}
            tooltipValueFormat={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
        </div>
      </div>
    </div>
  );
}

function SemiCircle() {
  return (
    <div style={{ maxWidth: 360 }}>
      <PieChart
        data={SAMPLE_DATA}
        thickness={40}
        height={200}
        startAngle={-Math.PI / 2}
        endAngle={Math.PI / 2}
        showSliceLabels={false}
        tooltipValueFormat={(v) => v.toLocaleString()}
      />
    </div>
  );
}

function InteractiveThickness() {
  const [thickness, setThickness] = useState(30);

  return (
    <div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13 }}>Thickness: {thickness}px</span>
        <input
          type="range"
          min={0}
          max={120}
          value={thickness}
          onChange={(e) => setThickness(Number(e.target.value))}
          style={{ flex: 1, maxWidth: 200 }}
        />
      </label>
      <div style={{ maxWidth: 360 }}>
        <PieChart
          data={SAMPLE_DATA}
          thickness={thickness}
          height={360}
          centerValue={thickness > 0 ? "10.4k" : undefined}
          centerLabel={thickness > 0 ? "Total" : undefined}
          tooltipValueFormat={(v) => v.toLocaleString()}
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
      <div>
        <p style={{ fontSize: 13, margin: "0 0 4px", opacity: 0.7 }}>Doughnut empty</p>
        <div style={{ maxWidth: 240 }}>
          <PieChart data={[]} thickness={30} height={240} />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 13, margin: "0 0 4px", opacity: 0.7 }}>Pie empty</p>
        <div style={{ maxWidth: 240 }}>
          <PieChart data={[]} thickness={0} height={240} />
        </div>
      </div>
    </div>
  );
}

function ControlledActive() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveId(null)}
          style={{
            padding: "4px 10px",
            borderRadius: 4,
            border: "1px solid #ccc",
            background: activeId === null ? "#eee" : "transparent",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          None
        </button>
        {SAMPLE_DATA.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveId(d.id)}
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: activeId === d.id ? "#eee" : "transparent",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div style={{ maxWidth: 340 }}>
        <PieChart
          data={SAMPLE_DATA}
          thickness={40}
          height={340}
          activeSliceId={activeId}
          onActiveSliceChange={setActiveId}
          centerValue={
            activeId
              ? SAMPLE_DATA.find((d) => d.id === activeId)?.value.toLocaleString()
              : "10.4k"
          }
          centerLabel={
            activeId
              ? SAMPLE_DATA.find((d) => d.id === activeId)?.label
              : "Total"
          }
        />
      </div>
    </div>
  );
}

function ManySlices() {
  const data = useMemo<PieSlice[]>(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: `slice-${i}`,
        label: `Category ${i + 1}`,
        value: Math.floor(Math.random() * 500) + 50,
      })),
    []
  );

  return (
    <div style={{ maxWidth: 380 }}>
      <PieChart
        data={data}
        thickness={50}
        height={380}
        showSliceLabels
        sliceLabelMinAngle={0.4}
        tooltipValueFormat={(v) => v.toLocaleString()}
      />
    </div>
  );
}

const PATTERN_DATA: PieSlice[] = [
  { id: "organic", label: "Organic", value: 4200 },
  { id: "paid", label: "Paid", value: 2800, fillPattern: "dotted" },
  { id: "referral", label: "Referral", value: 1600, fillPattern: "hatch-right" },
  { id: "direct", label: "Direct", value: 900, fillPattern: "hatch-left" },
];

function FillPatternDemo() {
  return (
    <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
      <div>
        <p style={{ fontSize: 13, margin: "0 0 4px", opacity: 0.7 }}>Doughnut with patterns</p>
        <div style={{ maxWidth: 340 }}>
          <PieChart
            data={PATTERN_DATA}
            thickness={40}
            height={340}
            centerValue="9.5k"
            centerLabel="Total traffic"
            tooltipValueFormat={(v) => v.toLocaleString()}
          />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 13, margin: "0 0 4px", opacity: 0.7 }}>Solid pie with patterns</p>
        <div style={{ maxWidth: 300 }}>
          <PieChart
            data={PATTERN_DATA}
            thickness={0}
            height={300}
            showSliceLabels
            tooltipValueFormat={(v) => v.toLocaleString()}
          />
        </div>
      </div>
    </div>
  );
}

export default function PieChartPlayground() {
  const [oklch, setOklch] = useState(isOklchEnhanced);
  const [, rerender] = useState(0);
  const toggleOklch = useCallback(() => {
    const next = !oklch;
    setOklchEnhancement(next);
    setOklch(next);
    rerender((n) => n + 1);
  }, [oklch]);

  return (
    <>
      <h1>Pie / Doughnut Chart</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "6px 12px", borderRadius: 8, background: oklch ? "rgba(80,180,80,0.1)" : "rgba(0,0,0,0.04)", fontSize: 13 }}>
        <label style={{ fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={oklch} onChange={toggleOklch} style={{ width: 16, height: 16 }} />
          OKLCH Enhanced Colors
        </label>
        <span style={{ opacity: 0.5 }}>{oklch ? "On — vivid, perceptually uniform" : "Off — raw tokens"}</span>
      </div>

      <section style={sectionStyle}>
        <h2>Configurator</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Adjust thickness, gap, radius, center content, legends, and slice count.
        </p>
        <div style={cardStyle}>
          <Configurator />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Basic Doughnut</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Default ring chart with center value, label, and tooltip.
        </p>
        <div style={cardStyle}>
          <BasicDoughnut />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Fill Patterns</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Slices can have dotted, hatch-right, or hatch-left patterns for accessibility and distinction.
        </p>
        <div style={cardStyle}>
          <FillPatternDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Solid Pie (thickness = 0)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Setting thickness to 0 renders a filled pie.
        </p>
        <div style={cardStyle}>
          <SolidPie />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Thin Ring</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Thin 12px ring with wider pad angle.
        </p>
        <div style={cardStyle}>
          <ThinRing />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Center Icon</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Icon above the center value using IconContainer.
        </p>
        <div style={cardStyle}>
          <WithCenterIcon />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Custom Center Content</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          centerContent prop overrides the default center layout.
        </p>
        <div style={cardStyle}>
          <CenterContentOverride />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>No Legend</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          showLegend=false hides the legend.
        </p>
        <div style={cardStyle}>
          <NoLegend />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Sorted Slices</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          sortSlices controls arc ordering.
        </p>
        <div style={cardStyle}>
          <SortedSlices />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Semi-circle</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          startAngle and endAngle for a half-ring gauge.
        </p>
        <div style={cardStyle}>
          <SemiCircle />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Interactive Thickness</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Drag slider to see pie ↔ doughnut transition.
        </p>
        <div style={cardStyle}>
          <InteractiveThickness />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Controlled Active Slice</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          External buttons control activeSliceId; center updates accordingly.
        </p>
        <div style={cardStyle}>
          <ControlledActive />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Many Slices</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          12 slices — labels hide when angle is too small.
        </p>
        <div style={cardStyle}>
          <ManySlices />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Empty State</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Renders a placeholder ring when data is empty.
        </p>
        <div style={cardStyle}>
          <EmptyState />
        </div>
      </section>
    </>
  );
}
