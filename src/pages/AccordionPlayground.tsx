import { useState, type CSSProperties } from "react";
import { AccordionHeader, AccordionItem, Accordion } from "../components/Accordion";
import { Icon } from "../components/Icon";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
  overflow: "auto",
};
const rowStyle: CSSProperties = {
  display: "flex",
  gap: 24,
  flexWrap: "wrap",
};
const colStyle: CSSProperties = {
  flex: 1,
  minWidth: 300,
  maxWidth: 560,
};

function HeaderStatesDemo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={rowStyle}>
      <div style={colStyle}>
        <h4 style={{ margin: "0 0 8px" }}>Collapsed</h4>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <AccordionHeader
            title="Normal"
            leadingIcon={<Icon name="favorite_fill" size={20} />}
          />
          <AccordionHeader
            title="Hover me"
            leadingIcon={<Icon name="favorite_fill" size={20} />}
          />
          <AccordionHeader
            title="Disabled"
            leadingIcon={<Icon name="favorite_fill" size={20} />}
            disabled
          />
        </div>
      </div>

      <div style={colStyle}>
        <h4 style={{ margin: "0 0 8px" }}>Expanded</h4>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <AccordionHeader
            title="Normal"
            leadingIcon={<Icon name="favorite_fill" size={20} />}
            expanded
          />
          <AccordionHeader
            title="Hover me"
            leadingIcon={<Icon name="favorite_fill" size={20} />}
            expanded
          />
          <AccordionHeader
            title="Disabled"
            leadingIcon={<Icon name="favorite_fill" size={20} />}
            expanded
            disabled
          />
        </div>
      </div>
    </div>
  );
}

function RoundDemo() {
  return (
    <div style={rowStyle}>
      <div style={colStyle}>
        <h4 style={{ margin: "0 0 8px" }}>Collapsed (round)</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <AccordionHeader
            title="Normal"
            leadingIcon={<Icon name="favorite_fill" size={20} />}
            round
          />
          <AccordionHeader
            title="Disabled"
            leadingIcon={<Icon name="favorite_fill" size={20} />}
            round
            disabled
          />
        </div>
      </div>

      <div style={colStyle}>
        <h4 style={{ margin: "0 0 8px" }}>Expanded (round)</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <AccordionHeader
            title="Normal"
            leadingIcon={<Icon name="favorite_fill" size={20} />}
            round
            expanded
          />
          <AccordionHeader
            title="Disabled"
            leadingIcon={<Icon name="favorite_fill" size={20} />}
            round
            expanded
            disabled
          />
        </div>
      </div>
    </div>
  );
}

function InteractiveDemo() {
  const [expandedA, setExpandedA] = useState(false);
  const [expandedB, setExpandedB] = useState(true);
  const [expandedC, setExpandedC] = useState(false);

  return (
    <div style={rowStyle}>
      <div style={colStyle}>
        <h4 style={{ margin: "0 0 8px" }}>Flat (click to toggle)</h4>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <AccordionHeader
            title="Section One"
            leadingIcon={<Icon name="favorite_fill" size={20} />}
            expanded={expandedA}
            onClick={() => setExpandedA((v) => !v)}
          />
          <AccordionHeader
            title="Section Two"
            leadingIcon={<Icon name="favorite_fill" size={20} />}
            expanded={expandedB}
            onClick={() => setExpandedB((v) => !v)}
          />
          <AccordionHeader
            title="Disabled Section"
            leadingIcon={<Icon name="favorite_fill" size={20} />}
            disabled
          />
        </div>
      </div>

      <div style={colStyle}>
        <h4 style={{ margin: "0 0 8px" }}>Round (click to toggle)</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <AccordionHeader
            title="Round Section"
            leadingIcon={<Icon name="favorite_fill" size={20} />}
            round
            expanded={expandedC}
            onClick={() => setExpandedC((v) => !v)}
          />
        </div>
      </div>
    </div>
  );
}

const sampleContent = (text: string) => (
  <div style={{ padding: 12, background: "var(--element-fill-neutral-tertiary-hover)", borderRadius: 8 }}>
    <p style={{ margin: 0, fontSize: 14 }}>{text}</p>
  </div>
);

function ItemDemo() {
  return (
    <div style={{ maxWidth: 560 }}>
      <AccordionItem
        title="Getting Started"
        leadingIcon={<Icon name="favorite_fill" size={20} />}
        divider
        defaultExpanded
      >
        {sampleContent("Welcome! This section covers the basics of getting started with our platform. Follow the steps below to set up your account and begin exploring features.")}
      </AccordionItem>
      <AccordionItem
        title="Advanced Configuration"
        leadingIcon={<Icon name="favorite_fill" size={20} />}
        divider
      >
        {sampleContent("Configure advanced settings like API keys, webhook endpoints, and custom integrations. These settings are optional but recommended for power users.")}
      </AccordionItem>
      <AccordionItem
        title="Disabled Section"
        leadingIcon={<Icon name="favorite_fill" size={20} />}
        divider
        disabled
      >
        {sampleContent("This content should not be visible.")}
      </AccordionItem>
      <AccordionItem
        title="Troubleshooting"
        leadingIcon={<Icon name="favorite_fill" size={20} />}
      >
        {sampleContent("Common issues and their solutions. Check the FAQ section for quick answers to frequently asked questions.")}
      </AccordionItem>
    </div>
  );
}

function ItemRoundDemo() {
  return (
    <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 4 }}>
      <AccordionItem
        title="Round Section A"
        leadingIcon={<Icon name="favorite_fill" size={20} />}
        round
        defaultExpanded
      >
        {sampleContent("Content for the first round accordion item. The rounded corners give it a card-like appearance.")}
      </AccordionItem>
      <AccordionItem
        title="Round Section B"
        leadingIcon={<Icon name="favorite_fill" size={20} />}
        round
      >
        {sampleContent("Content for the second round accordion item.")}
      </AccordionItem>
    </div>
  );
}

function ItemControlledDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            padding: "6px 16px",
            borderRadius: 6,
            border: "1px solid var(--element-outline-neutral-default)",
            background: "var(--element-surface-over)",
            color: "var(--text-neutral-primary)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {open ? "Collapse" : "Expand"} externally
        </button>
      </div>
      <AccordionItem
        title="Controlled Item"
        leadingIcon={<Icon name="favorite_fill" size={20} />}
        expanded={open}
        onExpandedChange={setOpen}
        divider
      >
        {sampleContent("This accordion item is controlled by external state. You can toggle it via the button above or by clicking the header.")}
      </AccordionItem>
    </div>
  );
}

function ItemMaxHeightDemo() {
  return (
    <div style={{ maxWidth: 560 }}>
      <AccordionItem
        title="Long Content (max 120px)"
        leadingIcon={<Icon name="favorite_fill" size={20} />}
        divider
        defaultExpanded
        maxContentHeight={120}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ margin: 0 }}>Line 1 — Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <p style={{ margin: 0 }}>Line 2 — Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <p style={{ margin: 0 }}>Line 3 — Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p>
          <p style={{ margin: 0 }}>Line 4 — Duis aute irure dolor in reprehenderit in voluptate velit.</p>
          <p style={{ margin: 0 }}>Line 5 — Excepteur sint occaecat cupidatat non proident, sunt in culpa.</p>
          <p style={{ margin: 0 }}>Line 6 — Nemo enim ipsam voluptatem quia voluptas sit aspernatur.</p>
          <p style={{ margin: 0 }}>Line 7 — At vero eos et accusamus et iusto odio dignissimos ducimus.</p>
          <p style={{ margin: 0 }}>Line 8 — Nam libero tempore, cum soluta nobis est eligendi optio.</p>
        </div>
      </AccordionItem>
      <AccordionItem
        title="Short Content (no scroll needed)"
        leadingIcon={<Icon name="favorite_fill" size={20} />}
        maxContentHeight={120}
      >
        <p style={{ margin: 0 }}>This content fits within the max height, so no scroll fade appears.</p>
      </AccordionItem>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Accordion Group demos
   ══════════════════════════════════════════════════════════ */

function GroupBorderedMultipleDemo() {
  return (
    <div style={rowStyle}>
      <div style={colStyle}>
        <h4 style={{ margin: "0 0 8px" }}>border + multiple (default)</h4>
        <Accordion border defaultExpanded={[0]}>
          <AccordionItem title="Getting Started" leadingIcon={<Icon name="favorite_fill" size={20} />}>
            {sampleContent("Welcome! This section covers the basics of getting started with our platform.")}
          </AccordionItem>
          <AccordionItem title="Configuration" leadingIcon={<Icon name="favorite_fill" size={20} />}>
            {sampleContent("Configure advanced settings like API keys and webhook endpoints.")}
          </AccordionItem>
          <AccordionItem title="Troubleshooting" leadingIcon={<Icon name="favorite_fill" size={20} />}>
            {sampleContent("Common issues and their solutions.")}
          </AccordionItem>
        </Accordion>
      </div>
      <div style={colStyle}>
        <h4 style={{ margin: "0 0 8px" }}>border + single</h4>
        <Accordion border type="single" defaultExpanded={[1]}>
          <AccordionItem title="Getting Started" leadingIcon={<Icon name="favorite_fill" size={20} />}>
            {sampleContent("Welcome! This section covers the basics of getting started with our platform.")}
          </AccordionItem>
          <AccordionItem title="Configuration" leadingIcon={<Icon name="favorite_fill" size={20} />}>
            {sampleContent("Configure advanced settings like API keys and webhook endpoints.")}
          </AccordionItem>
          <AccordionItem title="Troubleshooting" leadingIcon={<Icon name="favorite_fill" size={20} />}>
            {sampleContent("Common issues and their solutions.")}
          </AccordionItem>
          <AccordionItem title="Disabled Section" leadingIcon={<Icon name="favorite_fill" size={20} />} disabled>
            {sampleContent("This section is disabled.")}
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

function GroupBorderlessDemo() {
  return (
    <div style={rowStyle}>
      <div style={colStyle}>
        <h4 style={{ margin: "0 0 8px" }}>no border + multiple</h4>
        <Accordion border={false} defaultExpanded={[0]}>
          <AccordionItem title="Round Section A" leadingIcon={<Icon name="favorite_fill" size={20} />}>
            {sampleContent("Content for round section A. Multiple items can be open at once.")}
          </AccordionItem>
          <AccordionItem title="Round Section B" leadingIcon={<Icon name="favorite_fill" size={20} />}>
            {sampleContent("Content for round section B.")}
          </AccordionItem>
          <AccordionItem title="Round Section C" leadingIcon={<Icon name="favorite_fill" size={20} />}>
            {sampleContent("Content for round section C.")}
          </AccordionItem>
        </Accordion>
      </div>
      <div style={colStyle}>
        <h4 style={{ margin: "0 0 8px" }}>no border + single</h4>
        <Accordion border={false} type="single" defaultExpanded={[0]}>
          <AccordionItem title="Round Section A" leadingIcon={<Icon name="favorite_fill" size={20} />}>
            {sampleContent("Only one round section can be open at a time.")}
          </AccordionItem>
          <AccordionItem title="Round Section B" leadingIcon={<Icon name="favorite_fill" size={20} />}>
            {sampleContent("Opening this will close the other.")}
          </AccordionItem>
          <AccordionItem title="Round Section C" leadingIcon={<Icon name="favorite_fill" size={20} />}>
            {sampleContent("Content for round section C.")}
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

function GroupControlledDemo() {
  const [expanded, setExpanded] = useState<number[]>([0]);

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <button
          onClick={() => setExpanded([0, 1, 2])}
          style={{
            padding: "6px 16px", borderRadius: 6,
            border: "1px solid var(--element-outline-neutral-default)",
            background: "var(--element-surface-over)",
            color: "var(--text-neutral-primary)", fontSize: 13, cursor: "pointer",
          }}
        >
          Expand All
        </button>
        <button
          onClick={() => setExpanded([])}
          style={{
            padding: "6px 16px", borderRadius: 6,
            border: "1px solid var(--element-outline-neutral-default)",
            background: "var(--element-surface-over)",
            color: "var(--text-neutral-primary)", fontSize: 13, cursor: "pointer",
          }}
        >
          Collapse All
        </button>
      </div>
      <Accordion border expanded={expanded} onExpandedChange={setExpanded}>
        <AccordionItem title="Section One" leadingIcon={<Icon name="favorite_fill" size={20} />}>
          {sampleContent("Controlled via external state.")}
        </AccordionItem>
        <AccordionItem title="Section Two" leadingIcon={<Icon name="favorite_fill" size={20} />}>
          {sampleContent("Use Expand All / Collapse All buttons or click headers.")}
        </AccordionItem>
        <AccordionItem title="Section Three" leadingIcon={<Icon name="favorite_fill" size={20} />}>
          {sampleContent("All three sections can be toggled independently.")}
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default function AccordionPlayground() {
  return (
    <div>
      <h1>Accordion</h1>
      <p style={{ opacity: 0.6, marginBottom: 16 }}>
        Accordion header — incremental build. States, round variant, divider.
      </p>

      <section style={sectionStyle}>
        <h2>Header States</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Normal, hover (move cursor over), press (click and hold), and disabled states. Left column collapsed, right column expanded.
        </p>
        <div style={cardStyle}><HeaderStatesDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Round Variant</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          With <code>round</code> prop — rounded corners and no bottom divider.
        </p>
        <div style={cardStyle}><RoundDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Interactive Headers</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Click headers to toggle expanded state. Expander animates with CSS transition.
        </p>
        <div style={cardStyle}><InteractiveDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Accordion Item (with content)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Full accordion items with animated expand/collapse content panels. Click to toggle.
        </p>
        <div style={cardStyle}><ItemDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Accordion Item (round)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Round variant with rounded corners, no divider.
        </p>
        <div style={cardStyle}><ItemRoundDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Accordion Item (controlled)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Controlled expanded state with external toggle button.
        </p>
        <div style={cardStyle}><ItemControlledDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Accordion Item (maxContentHeight + ScrollFade)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Content capped at 120px. Overflow gets a vertical ScrollFade with fade edges.
        </p>
        <div style={cardStyle}><ItemMaxHeightDemo /></div>
      </section>

      <h1 style={{ marginTop: 64 }}>Accordion Group</h1>
      <p style={{ opacity: 0.6, marginBottom: 16 }}>
        Groups multiple items with single/multiple expand mode and border variants.
      </p>

      <section style={sectionStyle}>
        <h2>Bordered (single vs multiple)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Left: multiple items can expand simultaneously. Right: only one at a time (<code>type="single"</code>).
        </p>
        <div style={cardStyle}><GroupBorderedMultipleDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Borderless / Round (single vs multiple)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          No outer border, round item headers. Left: multiple, right: single.
        </p>
        <div style={cardStyle}><GroupBorderlessDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Controlled Accordion Group</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Expanded indices managed externally. Use buttons to expand/collapse all.
        </p>
        <div style={cardStyle}><GroupControlledDemo /></div>
      </section>
    </div>
  );
}
