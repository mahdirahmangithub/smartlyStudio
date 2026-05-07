import { useState, type CSSProperties } from "react";
import { InlineTextarea } from "@sds/components/InlineTextarea";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid var(--element-outline-neutral-default)",
  borderRadius: 8,
  padding: 24,
  marginTop: 12,
};
const row: CSSProperties = { display: "flex", gap: 32, flexWrap: "wrap" };
const col: CSSProperties = { flex: 1, minWidth: 220 };

function SizeDemo() {
  return (
    <div style={row}>
      <div style={col}>
        <h3>sm (14 px)</h3>
        <InlineTextarea size="sm" placeholder="Small inline textarea" />
      </div>
      <div style={col}>
        <h3>lg (16 px)</h3>
        <InlineTextarea size="lg" placeholder="Large inline textarea" />
      </div>
    </div>
  );
}

function FocusIndicatorDemo() {
  return (
    <div style={row}>
      <div style={col}>
        <h3>focusIndicator off (default)</h3>
        <InlineTextarea placeholder="Click to focus — no ring" />
      </div>
      <div style={col}>
        <h3>focusIndicator on</h3>
        <InlineTextarea focusIndicator placeholder="Click to focus — ring appears" />
      </div>
    </div>
  );
}

function HoverIndicatorDemo() {
  return (
    <div style={row}>
      <div style={col}>
        <h3>hoverIndicator off (default)</h3>
        <InlineTextarea placeholder="Hover me — no icon" />
      </div>
      <div style={col}>
        <h3>hoverIndicator on</h3>
        <InlineTextarea hoverIndicator placeholder="Hover me — edit icon" />
      </div>
    </div>
  );
}

function AutoExpandDemo() {
  const [value, setValue] = useState("");

  return (
    <div style={{ maxWidth: 400 }}>
      <InlineTextarea
        size="lg"
        autoExpand
        maxHeight={160}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type multiple lines — auto-expands up to 160 px"
      />
      <p style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
        Characters: {value.length}
      </p>
    </div>
  );
}

function ScrollFadeDemo() {
  const longText = Array.from({ length: 20 }, (_, i) => `Line ${i + 1}: sample content`).join("\n");

  return (
    <div style={row}>
      <div style={col}>
        <h3>maxHeight 120 px (pre-filled)</h3>
        <InlineTextarea
          size="lg"
          autoExpand
          maxHeight={120}
          defaultValue={longText}
        />
      </div>
      <div style={col}>
        <h3>Fixed height 100 px (no autoExpand)</h3>
        <InlineTextarea
          size="sm"
          maxHeight={100}
          minHeight={100}
          defaultValue={longText}
        />
      </div>
    </div>
  );
}

function CombinedDemo() {
  return (
    <div style={{ maxWidth: 400 }}>
      <InlineTextarea
        size="lg"
        focusIndicator
        hoverIndicator
        autoExpand
        placeholder="All indicators enabled"
      />
    </div>
  );
}

function DisabledDemo() {
  return (
    <div style={row}>
      <div style={col}>
        <InlineTextarea disabled placeholder="Disabled state" />
      </div>
      <div style={col}>
        <InlineTextarea disabled value="Disabled with value" readOnly />
      </div>
    </div>
  );
}

export default function InlineTextareaPlayground() {
  return (
    <>
      <h1>Inline Textarea</h1>

      <section style={sectionStyle}>
        <h2>Size</h2>
        <div style={cardStyle}>
          <SizeDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Focus Indicator</h2>
        <div style={cardStyle}>
          <FocusIndicatorDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Hover Indicator</h2>
        <div style={cardStyle}>
          <HoverIndicatorDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Auto-Expand</h2>
        <div style={cardStyle}>
          <AutoExpandDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Scroll Fades (maxHeight)</h2>
        <div style={cardStyle}>
          <ScrollFadeDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Combined (Focus + Hover + AutoExpand)</h2>
        <div style={cardStyle}>
          <CombinedDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Disabled</h2>
        <div style={cardStyle}>
          <DisabledDemo />
        </div>
      </section>
    </>
  );
}
