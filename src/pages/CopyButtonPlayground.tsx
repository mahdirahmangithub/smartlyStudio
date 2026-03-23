import { type CSSProperties, useState } from "react";
import { CopyButton } from "../components/CopyButton";
import type { ButtonSize, ButtonType, ButtonEmphasis } from "../components/Button";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const controlRow: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 8,
};
const previewRow: CSSProperties = {
  display: "flex",
  gap: 16,
  alignItems: "center",
  marginTop: 12,
};

const SAMPLE_VALUE = "npm install @smartly/design-system";

function ConfigurableDemo() {
  const [size, setSize] = useState<ButtonSize>("md");
  const [variant, setVariant] = useState<ButtonType>("neutral");
  const [emphasis, setEmphasis] = useState<ButtonEmphasis>("low");
  const [showLabel, setShowLabel] = useState(false);
  const [label, setLabel] = useState("Copy");

  return (
    <div>
      <div style={controlRow}>
        <label>
          Size:
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as ButtonSize)}
            style={{ marginLeft: 4 }}
          >
            <option value="sm">sm</option>
            <option value="md">md</option>
            <option value="lg">lg</option>
          </select>
        </label>
        <label>
          Variant:
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as ButtonType)}
            style={{ marginLeft: 4 }}
          >
            <option value="brand">brand</option>
            <option value="neutral">neutral</option>
            <option value="info">info</option>
            <option value="success">success</option>
            <option value="warning">warning</option>
            <option value="alert">alert</option>
            <option value="inverse">inverse</option>
          </select>
        </label>
        <label>
          Emphasis:
          <select
            value={emphasis}
            onChange={(e) => setEmphasis(e.target.value as ButtonEmphasis)}
            style={{ marginLeft: 4 }}
          >
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={showLabel}
            onChange={(e) => setShowLabel(e.target.checked)}
          />
          Show label
        </label>
        {showLabel && (
          <label>
            Label:
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={{ marginLeft: 4, width: 100 }}
            />
          </label>
        )}
      </div>

      <div style={previewRow}>
        <CopyButton
          value={SAMPLE_VALUE}
          size={size}
          variant={variant}
          emphasis={emphasis}
        >
          {showLabel ? label : undefined}
        </CopyButton>
      </div>

      <p style={{ fontSize: 12, opacity: 0.5, marginTop: 8 }}>
        Copying: <code>{SAMPLE_VALUE}</code>
      </p>
    </div>
  );
}

export default function CopyButtonPlayground() {
  return (
    <>
      <h1>CopyButton</h1>

      <section style={sectionStyle}>
        <h2>Configurable</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle between icon-only and labeled mode. Adjust size, variant, and emphasis.
        </p>
        <div style={cardStyle}>
          <ConfigurableDemo />
        </div>
      </section>
    </>
  );
}
