import { type CSSProperties, useState } from "react";
import { FeedbackBoolean, type FeedbackValue } from "../components/FeedbackBoolean";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const rowStyle: CSSProperties = {
  display: "flex",
  gap: 24,
  flexWrap: "wrap",
  alignItems: "center",
};

function SizesDemo() {
  return (
    <div style={rowStyle}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>sm</p>
        <FeedbackBoolean size="sm" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>md</p>
        <FeedbackBoolean size="md" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>lg</p>
        <FeedbackBoolean size="lg" />
      </div>
    </div>
  );
}

function ControlledDemo() {
  const [value, setValue] = useState<FeedbackValue>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <FeedbackBoolean value={value} onChange={setValue} />
      <span style={{ fontSize: 13, opacity: 0.6 }}>
        Feedback: {value ?? "none"}
      </span>
    </div>
  );
}

function DensityDemo() {
  return (
    <div style={rowStyle}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>none</p>
        <FeedbackBoolean density="none" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>xs</p>
        <FeedbackBoolean density="xs" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>sm</p>
        <FeedbackBoolean density="sm" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>md</p>
        <FeedbackBoolean density="md" />
      </div>
    </div>
  );
}

function PreselectedDemo() {
  return (
    <div style={rowStyle}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>Thumbs up</p>
        <FeedbackBoolean defaultValue="up" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>Thumbs down</p>
        <FeedbackBoolean defaultValue="down" />
      </div>
      <div>
        <p style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>Disabled</p>
        <FeedbackBoolean defaultValue="up" disabled />
      </div>
    </div>
  );
}

export default function FeedbackBooleanPlayground() {
  return (
    <>
      <h1>FeedbackBoolean</h1>

      <section style={sectionStyle}>
        <h2>Sizes</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          sm, md, and lg icon button sizes.
        </p>
        <div style={cardStyle}>
          <SizesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Density</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Row container density controls spacing between buttons.
        </p>
        <div style={cardStyle}>
          <DensityDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Controlled</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Controlled value with onChange callback. Click toggles on/off.
        </p>
        <div style={cardStyle}>
          <ControlledDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Pre-selected & Disabled</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Default values and disabled state.
        </p>
        <div style={cardStyle}>
          <PreselectedDemo />
        </div>
      </section>
    </>
  );
}
