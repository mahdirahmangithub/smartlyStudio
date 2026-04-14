import type { CSSProperties } from "react";
import { IconContainer, type IconContainerSize } from "../components/IconContainer";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = { border: "1px solid #ddd", borderRadius: 8, padding: 16, marginTop: 12 };
const rowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 16 };

const SIZES: IconContainerSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];

function SizesDemo() {
  return (
    <div style={rowStyle}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <IconContainer name="favorite" size={size} />
          <span style={{ fontSize: 11, opacity: 0.6 }}>{size}</span>
        </div>
      ))}
    </div>
  );
}

function ColorDemo() {
  return (
    <div style={rowStyle}>
      <IconContainer name="favorite_fill" size="xl" color="var(--text-brand-default)" />
      <IconContainer name="favorite_fill" size="xl" color="var(--text-negative-default)" />
      <IconContainer name="favorite_fill" size="xl" color="var(--text-positive-default)" />
      <IconContainer name="favorite_fill" size="xl" color="var(--text-warning-default)" />
      <IconContainer name="favorite_fill" size="xl" />
    </div>
  );
}

function UsagePatternsDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={rowStyle}>
        <IconContainer name="home" size="sm" />
        <IconContainer name="search" size="sm" />
        <IconContainer name="settings" size="sm" />
        <IconContainer name="star" size="sm" />
        <IconContainer name="check_circle" size="sm" />
      </div>
      <div style={rowStyle}>
        <IconContainer name="home" size="lg" />
        <IconContainer name="search" size="lg" />
        <IconContainer name="settings" size="lg" />
        <IconContainer name="star" size="lg" />
        <IconContainer name="check_circle" size="lg" />
      </div>
    </div>
  );
}

export default function IconContainerPlayground() {
  return (
    <>
      <h1>IconContainer</h1>
      <section style={sectionStyle}>
        <h2>Sizes</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Six predefined sizes from xs (12px) to 2xl (32px).
        </p>
        <div style={cardStyle}><SizesDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Color</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Pass a color prop to override the icon color.
        </p>
        <div style={cardStyle}><ColorDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Usage patterns</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Different icons at consistent sizes for layouts.
        </p>
        <div style={cardStyle}><UsagePatternsDemo /></div>
      </section>
    </>
  );
}
