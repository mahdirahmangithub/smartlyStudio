import { useState, type CSSProperties } from "react";
import { Container, type ContainerDensity } from "../components/Container";
import type { HeaderSize } from "../components/Header";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { Tag } from "../components/Tag";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const rowStyle: CSSProperties = { display: "flex", gap: 24, flexWrap: "wrap" };
const contentPlaceholder: CSSProperties = {
  background: "var(--element-fill-neutral-tertiary-default)",
  borderRadius: 8,
  padding: 24,
  minHeight: 120,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--text-neutral-secondary-default)",
  fontSize: 13,
};

function SampleContent({ label }: { label?: string }) {
  return (
    <div style={contentPlaceholder}>
      {label ?? "Content area"}
    </div>
  );
}

const selectStyle: CSSProperties = { padding: "4px 8px", borderRadius: 6, fontSize: 13 };
const labelStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 4, fontSize: 13 };

/* ── Configurable Demo ────────────────────────────────────────────── */

function ConfigurableDemo() {
  const [elevated, setElevated] = useState(true);
  const [collapsible, setCollapsible] = useState(true);
  const [density, setDensity] = useState<ContainerDensity>("sm");
  const [headerSize, setHeaderSize] = useState<HeaderSize>("lg");
  const [description, setDescription] = useState("Optional description text");
  const [showDescription, setShowDescription] = useState(true);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <label style={labelStyle}>
          <input
            type="checkbox"
            checked={elevated}
            onChange={(e) => setElevated(e.target.checked)}
          />
          Elevated
        </label>
        <label style={labelStyle}>
          <input
            type="checkbox"
            checked={collapsible}
            onChange={(e) => setCollapsible(e.target.checked)}
          />
          Collapsible
        </label>
        <label style={labelStyle}>
          <input
            type="checkbox"
            checked={showDescription}
            onChange={(e) => setShowDescription(e.target.checked)}
          />
          Description
        </label>
        <select
          value={density}
          onChange={(e) => setDensity(e.target.value as ContainerDensity)}
          style={selectStyle}
        >
          <option value="none">density: none</option>
          <option value="sm">density: sm</option>
          <option value="lg">density: lg</option>
        </select>
        <select
          value={headerSize}
          onChange={(e) => setHeaderSize(e.target.value as HeaderSize)}
          style={selectStyle}
        >
          <option value="sm">header: sm</option>
          <option value="md">header: md</option>
          <option value="lg">header: lg</option>
          <option value="xl">header: xl</option>
          <option value="2xl">header: 2xl</option>
        </select>
      </div>

      {showDescription && (
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description text"
            style={{ padding: "4px 8px", borderRadius: 6, fontSize: 13, width: 280 }}
          />
        </div>
      )}

      <div style={{ maxWidth: 527 }}>
        <Container
          title="Container Title"
          description={showDescription ? description : undefined}
          elevated={elevated}
          collapsible={collapsible}
          density={density}
          headerSize={headerSize}
          defaultExpanded
        >
          <SampleContent />
        </Container>
      </div>
    </div>
  );
}

/* ── Density Variants ──────────────────────────────────────────────── */

function DensityDemo() {
  const densities: ContainerDensity[] = ["none", "sm", "lg"];
  return (
    <div style={rowStyle}>
      {densities.map((d) => (
        <div key={d} style={{ flex: "1 1 300px", maxWidth: 400 }}>
          <p style={{ fontSize: 12, marginBottom: 4, opacity: 0.6 }}>density="{d}"</p>
          <Container
            title="Section Title"
            description="Description text"
            density={d}
          >
            <SampleContent label={`density="${d}" content`} />
          </Container>
        </div>
      ))}
    </div>
  );
}

/* ── Elevated vs Outlined ──────────────────────────────────────────── */

function ElevationDemo() {
  return (
    <div style={rowStyle}>
      <div style={{ flex: "1 1 300px", maxWidth: 400 }}>
        <p style={{ fontSize: 12, marginBottom: 4, opacity: 0.6 }}>elevated=true</p>
        <Container title="Elevated Container" elevated>
          <SampleContent label="With shadow" />
        </Container>
      </div>
      <div style={{ flex: "1 1 300px", maxWidth: 400 }}>
        <p style={{ fontSize: 12, marginBottom: 4, opacity: 0.6 }}>elevated=false</p>
        <Container title="Outlined Container" elevated={false}>
          <SampleContent label="With border" />
        </Container>
      </div>
    </div>
  );
}

/* ── Collapsible ───────────────────────────────────────────────────── */

function CollapsibleDemo() {
  const densities: ContainerDensity[] = ["none", "sm", "lg"];
  return (
    <div style={rowStyle}>
      {densities.map((d) => (
        <div key={d} style={{ flex: "1 1 300px", maxWidth: 400 }}>
          <p style={{ fontSize: 12, marginBottom: 4, opacity: 0.6 }}>collapsible, density="{d}"</p>
          <Container
            title="Collapsible"
            description="Click chevron to toggle"
            density={d}
            collapsible
            defaultExpanded
          >
            <SampleContent label={`density="${d}" content`} />
          </Container>
        </div>
      ))}
    </div>
  );
}

/* ── Collapsible + Outlined ────────────────────────────────────────── */

function CollapsibleOutlinedDemo() {
  return (
    <div style={rowStyle}>
      <div style={{ flex: "1 1 300px", maxWidth: 400 }}>
        <Container
          title="Outlined Collapsible"
          description="Non-elevated"
          collapsible
          elevated={false}
          defaultExpanded
        >
          <SampleContent />
        </Container>
      </div>
      <div style={{ flex: "1 1 300px", maxWidth: 400 }}>
        <Container
          title="Starts Collapsed"
          description="defaultExpanded=false"
          collapsible
          elevated={false}
          defaultExpanded={false}
        >
          <SampleContent />
        </Container>
      </div>
    </div>
  );
}

/* ── Controlled ────────────────────────────────────────────────────── */

function ControlledDemo() {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ maxWidth: 400 }}>
      <p style={{ fontSize: 12, marginBottom: 8, opacity: 0.6 }}>
        Controlled: expanded={String(expanded)}
        <button
          style={{ marginLeft: 8, fontSize: 12 }}
          onClick={() => setExpanded((e) => !e)}
        >
          Toggle externally
        </button>
      </p>
      <Container
        title="Controlled Container"
        description="State managed externally"
        collapsible
        expanded={expanded}
        onExpandedChange={setExpanded}
      >
        <SampleContent label="Controlled content" />
      </Container>
    </div>
  );
}

/* ── With Header Slot and Actions ──────────────────────────────────── */

function HeaderSlotsDemo() {
  return (
    <div style={rowStyle}>
      <div style={{ flex: "1 1 300px", maxWidth: 400 }}>
        <Container
          title="With Slot & Actions"
          description="Full header features"
          collapsible
          headerSlot={<Tag size="md" label="New" />}
          headerActions={
            <IconButton
              icon={<Icon name="more_horiz" size={16} />}
              aria-label="More options"
              size="sm"
              variant="neutral"
              emphasis="low"
            />
          }
        >
          <SampleContent label="Rich header features" />
        </Container>
      </div>
    </div>
  );
}

/* ── Main Playground ───────────────────────────────────────────────── */

export default function ContainerPlayground() {
  return (
    <>
      <h1>Container</h1>

      <section style={sectionStyle}>
        <h2>Configurable</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle props to explore all combinations.
        </p>
        <div style={cardStyle}>
          <ConfigurableDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Density Variants</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Three density levels affecting header density and content padding.
        </p>
        <div style={cardStyle}>
          <DensityDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Elevated vs Outlined</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Elevated uses box-shadow; outlined uses a border.
        </p>
        <div style={cardStyle}>
          <ElevationDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Collapsible</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Animated expand/collapse with Expander in header actions.
        </p>
        <div style={cardStyle}>
          <CollapsibleDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Collapsible + Outlined</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Non-elevated collapsible containers, including starts-collapsed.
        </p>
        <div style={cardStyle}>
          <CollapsibleOutlinedDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Controlled Expand</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Expanded state managed externally via props.
        </p>
        <div style={cardStyle}>
          <ControlledDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Header Slot &amp; Actions</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Combining headerSlot, headerActions, and thumbnail with collapsible.
        </p>
        <div style={cardStyle}>
          <HeaderSlotsDemo />
        </div>
      </section>
    </>
  );
}
