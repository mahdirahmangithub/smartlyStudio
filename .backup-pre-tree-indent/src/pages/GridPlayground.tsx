import { type CSSProperties, useState } from "react";
import { Container, Grid, Col } from "../components/Grid";
import type { ContainerMaxWidth, GridGutter, GridInset } from "../components/Grid";
import { AppShell } from "../components/AppShell";
import type { PanelMode } from "../components/AppShell";
import { useBreakpoint } from "../hooks/useBreakpoint";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

const cellStyle: CSSProperties = {
  background: "var(--element-fill-brand-primary-default)",
  color: "#fff",
  borderRadius: "var(--radius-sm)",
  padding: "var(--spacing-sm) var(--spacing-md)",
  fontSize: 13,
  fontWeight: 500,
  textAlign: "center",
  minHeight: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const cellAltStyle: CSSProperties = {
  ...cellStyle,
  background: "var(--element-fill-neutral-secondary-default)",
  color: "var(--text-neutral-primary)",
};

function BreakpointIndicator() {
  const { breakpoint } = useBreakpoint();
  return (
    <div
      style={{
        padding: "var(--spacing-sm) var(--spacing-md)",
        background: "var(--element-fill-info-tertiary-default)",
        borderRadius: "var(--radius-md)",
        fontSize: 13,
        marginBottom: 16,
        display: "inline-flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <strong>Current breakpoint:</strong>
      <code style={{ fontWeight: 600 }}>{breakpoint}</code>
      <span style={{ opacity: 0.6 }}>
        ({breakpoint <= "sm" ? "8-col grid" : "12-col grid"})
      </span>
    </div>
  );
}

function BasicGridDemo() {
  const [gutter, setGutter] = useState<GridGutter>("md");

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {(["sm", "md", "lg"] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGutter(g)}
            style={{
              padding: "4px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: gutter === g ? "var(--element-fill-brand-primary-default)" : "transparent",
              color: gutter === g ? "#fff" : "inherit",
              cursor: "pointer",
            }}
          >
            {g} ({g === "sm" ? "8px" : g === "md" ? "16px" : "24px"})
          </button>
        ))}
      </div>
      <Grid gutter={gutter}>
        {Array.from({ length: 8 }, (_, i) => (
          <Col key={i} span={1}>
            <div style={cellStyle}>{i + 1}</div>
          </Col>
        ))}
      </Grid>
    </>
  );
}

function ResponsiveDemo() {
  return (
    <Grid gutter="md">
      <Col span={8} md={12}>
        <div style={cellStyle}>span=8 md=12 (full width)</div>
      </Col>
      <Col span={8} md={6}>
        <div style={cellAltStyle}>span=8 md=6</div>
      </Col>
      <Col span={8} md={6}>
        <div style={cellAltStyle}>span=8 md=6</div>
      </Col>
      <Col span={4} md={4}>
        <div style={cellStyle}>span=4 md=4</div>
      </Col>
      <Col span={4} md={4}>
        <div style={cellStyle}>span=4 md=4</div>
      </Col>
      <Col span={8} md={4}>
        <div style={cellStyle}>span=8 md=4</div>
      </Col>
      <Col span={8} md={3}>
        <div style={cellAltStyle}>span=8 md=3</div>
      </Col>
      <Col span={4} md={3}>
        <div style={cellAltStyle}>span=4 md=3</div>
      </Col>
      <Col span={4} md={3}>
        <div style={cellAltStyle}>span=4 md=3</div>
      </Col>
      <Col span={8} md={3}>
        <div style={cellAltStyle}>span=8 md=3</div>
      </Col>
    </Grid>
  );
}

function OffsetDemo() {
  return (
    <Grid gutter="md">
      <Col span={4} md={4} offset={2}>
        <div style={cellStyle}>offset=2 span=4</div>
      </Col>
      <Col span={2} md={4}>
        <div style={cellAltStyle}>span=2 / md=4</div>
      </Col>
      <Col span={6} md={8} offset={1}>
        <div style={cellStyle}>offset=1 span=6 md=8</div>
      </Col>
    </Grid>
  );
}

const insetValues: Record<GridInset, string> = {
  none: "0px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
};

function InsetDemo() {
  const [inset, setInset] = useState<GridInset>("md");

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {(["none", "sm", "md", "lg", "xl"] as const).map((i) => (
          <button
            key={i}
            onClick={() => setInset(i)}
            style={{
              padding: "4px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: inset === i ? "var(--element-fill-brand-primary-default)" : "transparent",
              color: inset === i ? "#fff" : "inherit",
              cursor: "pointer",
            }}
          >
            {i} ({insetValues[i]})
          </button>
        ))}
      </div>
      <div style={{ background: "var(--element-fill-neutral-tertiary-default)", borderRadius: "var(--radius-md)" }}>
        <Grid gutter="md" inset={inset}>
          <Col span={2} md={3}><div style={cellStyle}>1</div></Col>
          <Col span={2} md={3}><div style={cellStyle}>2</div></Col>
          <Col span={2} md={3}><div style={cellStyle}>3</div></Col>
          <Col span={2} md={3}><div style={cellStyle}>4</div></Col>
        </Grid>
      </div>
    </>
  );
}

function ContainerDemo() {
  const [maxWidth, setMaxWidth] = useState<ContainerMaxWidth | "fluid">("md");

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {(["fluid", "md", "lg"] as const).map((mw) => (
          <button
            key={mw}
            onClick={() => setMaxWidth(mw)}
            style={{
              padding: "4px 12px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: maxWidth === mw ? "var(--element-fill-brand-primary-default)" : "transparent",
              color: maxWidth === mw ? "#fff" : "inherit",
              cursor: "pointer",
            }}
          >
            {mw === "fluid" ? "fluid (no max)" : `${mw} (${mw === "md" ? "1384px" : "1728px"})`}
          </button>
        ))}
      </div>
      <div style={{ background: "var(--element-fill-neutral-tertiary-default)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
        <Container maxWidth={maxWidth === "fluid" ? undefined : maxWidth}>
          <Grid gutter="md" inset="lg">
            <Col span={2} md={3}><div style={cellStyle}>1</div></Col>
            <Col span={2} md={3}><div style={cellStyle}>2</div></Col>
            <Col span={2} md={3}><div style={cellStyle}>3</div></Col>
            <Col span={2} md={3}><div style={cellStyle}>4</div></Col>
          </Grid>
        </Container>
      </div>
    </>
  );
}

const panelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  fontSize: 12,
  fontWeight: 600,
  color: "#fff",
  writingMode: "vertical-lr",
  textAlign: "center",
};

function AppShellDemo() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMode, setSidebarMode] = useState<PanelMode>("push");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<PanelMode>("overlay");

  return (
    <>
      <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={sidebarOpen}
            onChange={(e) => setSidebarOpen(e.target.checked)}
          />
          Left sidebar
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          Sidebar mode:
          <select
            value={sidebarMode}
            onChange={(e) => setSidebarMode(e.target.value as PanelMode)}
            style={{ fontSize: 13 }}
          >
            <option value="push">push</option>
            <option value="overlay">overlay</option>
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={drawerOpen}
            onChange={(e) => setDrawerOpen(e.target.checked)}
          />
          Drawer (right)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          Drawer mode:
          <select
            value={drawerMode}
            onChange={(e) => setDrawerMode(e.target.value as PanelMode)}
            style={{ fontSize: 13 }}
          >
            <option value="push">push</option>
            <option value="overlay">overlay</option>
          </select>
        </label>
      </div>
      <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
        <AppShell style={{ minHeight: 280, height: 280 }}>
          <AppShell.Panel side="left" mode="push" width={64}>
            <div style={{ ...panelStyle, background: "#5b21b6" }}>Nav</div>
          </AppShell.Panel>

          <AppShell.Panel
            side="left"
            mode={sidebarMode}
            width={120}
            open={sidebarOpen}
          >
            <div style={{ ...panelStyle, background: "#7c3aed" }}>Sidebar</div>
          </AppShell.Panel>

          <AppShell.Content>
            <div style={{ padding: "var(--spacing-md)" }}>
              <Container maxWidth="md">
                <Grid gutter="sm">
                  {Array.from({ length: 12 }, (_, i) => (
                    <Col key={i} span={1}>
                      <div style={{ ...cellStyle, fontSize: 11, padding: "var(--spacing-xs)", minHeight: 32 }}>
                        {i + 1}
                      </div>
                    </Col>
                  ))}
                </Grid>
              </Container>
              <p style={{ fontSize: 12, opacity: 0.5, marginTop: 12, textAlign: "center" }}>
                Content area — Container + Grid centered here
              </p>
            </div>
          </AppShell.Content>

          <AppShell.Panel
            side="right"
            mode={drawerMode}
            width={180}
            open={drawerOpen}
          >
            <div style={{ ...panelStyle, background: "#4338ca" }}>Drawer</div>
          </AppShell.Panel>
        </AppShell>
      </div>
    </>
  );
}

function GutterComparisonDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {(["sm", "md", "lg"] as const).map((g) => (
        <div key={g}>
          <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
            gutter=&quot;{g}&quot; ({g === "sm" ? "8px" : g === "md" ? "16px" : "24px"})
          </p>
          <Grid gutter={g}>
            <Col span={2} md={3}><div style={cellStyle}>1</div></Col>
            <Col span={2} md={3}><div style={cellStyle}>2</div></Col>
            <Col span={2} md={3}><div style={cellStyle}>3</div></Col>
            <Col span={2} md={3}><div style={cellStyle}>4</div></Col>
          </Grid>
        </div>
      ))}
    </div>
  );
}

export default function GridPlayground() {
  return (
    <>
      <h1>Grid</h1>
      <BreakpointIndicator />

      <section style={sectionStyle}>
        <h2>AppShell</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Manages layout slots with push (shrinks content) and overlay (floats
          above) modes. The Grid system operates inside AppShell.Content.
        </p>
        <div style={cardStyle}>
          <AppShellDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Container</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Container constrains the grid to a max-width and centers it. Fluid
          mode has no max-width. Backed by --grid-column-width-max-width-* tokens.
        </p>
        <div style={cardStyle}>
          <ContainerDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Basic 8 / 12 Column Grid</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          8 columns below tablet (1024 px), 12 columns at tablet and above.
          Toggle gutter sizes below.
        </p>
        <div style={cardStyle}>
          <BasicGridDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Responsive Spans</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Columns adapt span at breakpoints. Resize the browser to see the
          layout shift between 8-col and 12-col grids.
        </p>
        <div style={cardStyle}>
          <ResponsiveDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Grid Inset</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Inset adds horizontal padding to both sides of the columns container.
          Backed by --grid-offset-* tokens.
        </p>
        <div style={cardStyle}>
          <InsetDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Column Offset</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Offset pushes a column's start position by N columns.
        </p>
        <div style={cardStyle}>
          <OffsetDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Gutter Comparison</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Side-by-side comparison of the three gutter token sizes.
        </p>
        <div style={cardStyle}>
          <GutterComparisonDemo />
        </div>
      </section>
    </>
  );
}
