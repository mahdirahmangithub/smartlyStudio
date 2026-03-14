import { type CSSProperties, useState } from "react";
import { Dimmer, type DimmerEmphasis } from "../components/Dimmer";
import { Button } from "../components/Button";
import { BodyText } from "../components/BodyText";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

const containerStyle: CSSProperties = {
  position: "relative",
  height: 300,
  borderRadius: 8,
  background: "var(--element-surface-default)",
  border: "1px solid var(--element-divider-neutral-default)",
  overflow: "hidden",
};

const placeholderRows = Array.from({ length: 4 }, (_, i) => (
  <div
    key={i}
    style={{
      height: 40,
      borderRadius: 8,
      background: "var(--element-fill-neutral-tertiary-default)",
    }}
  />
));

function EmphasisDemo() {
  const [openKey, setOpenKey] = useState<DimmerEmphasis | null>(null);

  return (
    <div style={{ display: "flex", gap: 16 }}>
      {(["low", "md", "high"] as const).map((emphasis) => (
        <div key={emphasis} style={{ flex: 1 }}>
          <Button
            variant="brand"
            emphasis="high"
            size="md"
            onClick={() =>
              setOpenKey(openKey === emphasis ? null : emphasis)
            }
          >
            {openKey === emphasis ? "Hide" : "Show"} {emphasis}
          </Button>

          <div style={{ ...containerStyle, marginTop: 12 }}>
            <div
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <BodyText size="lg">{emphasis} emphasis</BodyText>
              {placeholderRows}
            </div>

            <Dimmer
              open={openKey === emphasis}
              emphasis={emphasis}
              position="absolute"
              enterDuration="var(--animation-drawer-enter-duration)"
              enterEasing="var(--animation-drawer-enter-easing)"
              exitDuration="var(--animation-drawer-exit-duration)"
              exitEasing="var(--animation-drawer-exit-easing)"
              onClick={() => setOpenKey(null)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function BlurDemo() {
  const [openKey, setOpenKey] = useState<DimmerEmphasis | null>(null);

  return (
    <div style={{ display: "flex", gap: 16 }}>
      {(["low", "md", "high"] as const).map((emphasis) => (
        <div key={emphasis} style={{ flex: 1 }}>
          <Button
            variant="brand"
            emphasis="high"
            size="md"
            onClick={() =>
              setOpenKey(openKey === emphasis ? null : emphasis)
            }
          >
            {openKey === emphasis ? "Hide" : "Show"} {emphasis}
          </Button>

          <div style={{ ...containerStyle, marginTop: 12 }}>
            <div
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <BodyText size="lg">
                {emphasis} emphasis + blur
              </BodyText>
              {placeholderRows}
            </div>

            <Dimmer
              open={openKey === emphasis}
              emphasis={emphasis}
              blur
              position="absolute"
              enterDuration="var(--animation-drawer-enter-duration)"
              enterEasing="var(--animation-drawer-enter-easing)"
              exitDuration="var(--animation-drawer-exit-duration)"
              exitEasing="var(--animation-drawer-exit-easing)"
              onClick={() => setOpenKey(null)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DimmerPlayground() {
  return (
    <>
      <h1>Dimmer</h1>

      <section style={sectionStyle}>
        <h2>Emphasis</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Three emphasis levels: low (weak), md (default), and high (strong).
          Click the dimmer to dismiss.
        </p>
        <div style={cardStyle}>
          <EmphasisDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Backdrop blur</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Each emphasis with backdrop blur enabled. Low uses blur-md (8px),
          md and high use blur-lg (16px).
        </p>
        <div style={cardStyle}>
          <BlurDemo />
        </div>
      </section>
    </>
  );
}
