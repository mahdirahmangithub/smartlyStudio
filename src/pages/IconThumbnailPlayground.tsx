import { type CSSProperties } from "react";
import { IconThumbnail } from "../components/IconThumbnail";
import type { IconName } from "../components/Icon";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const DEMO_ICONS: IconName[] = [
  "graphic_eq",
  "favorite_fill",
  "play_arrow",
  "image",
  "record_voice_over",
  "star",
];

function SizesDemo() {
  return (
    <div style={cardStyle}>
      {(["lg", "md", "sm"] as const).map((size) => (
        <div key={size} style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <span style={{ width: 32, fontSize: 13, opacity: 0.6 }}>{size}</span>
          <IconThumbnail icon="favorite_fill" size={size} />
        </div>
      ))}
    </div>
  );
}

function OutlineDemo() {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <div>
          <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.6 }}>outline=true (default)</p>
          <div style={{ display: "flex", gap: 12 }}>
            {DEMO_ICONS.slice(0, 3).map((icon) => (
              <IconThumbnail key={icon} icon={icon} size="lg" />
            ))}
          </div>
        </div>
        <div>
          <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.6 }}>outline=false</p>
          <div style={{ display: "flex", gap: 12 }}>
            {DEMO_ICONS.slice(0, 3).map((icon) => (
              <IconThumbnail key={icon} icon={icon} size="lg" outline={false} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdaptiveSurfaceDemo() {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", gap: 24 }}>
        <div
          style={{
            background: "var(--element-surface-default)",
            padding: 16,
            borderRadius: 8,
            display: "flex",
            gap: 8,
          }}
        >
          <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.6, width: "100%" }}>
            surface-default
          </p>
          <IconThumbnail icon="graphic_eq" size="lg" />
          <IconThumbnail icon="play_arrow" size="lg" />
        </div>
        <div
          style={{
            background: "var(--element-surface-over)",
            padding: 16,
            borderRadius: 8,
            display: "flex",
            gap: 8,
          }}
        >
          <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.6, width: "100%" }}>
            surface-over
          </p>
          <IconThumbnail icon="graphic_eq" size="lg" />
          <IconThumbnail icon="play_arrow" size="lg" />
        </div>
        <div
          style={{
            background: "var(--element-surface-under)",
            padding: 16,
            borderRadius: 8,
            display: "flex",
            gap: 8,
          }}
        >
          <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.6, width: "100%" }}>
            surface-under
          </p>
          <IconThumbnail icon="graphic_eq" size="lg" />
          <IconThumbnail icon="play_arrow" size="lg" />
        </div>
      </div>
    </div>
  );
}

const TOOLTIP_LABELS: Record<string, string> = {
  graphic_eq: "Equalizer",
  favorite_fill: "Favorite",
  play_arrow: "Play",
  image: "Image",
  record_voice_over: "Voice Over",
  star: "Star",
};

function TooltipDemo() {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", gap: 16 }}>
        {DEMO_ICONS.slice(0, 4).map((icon) => (
          <IconThumbnail key={icon} icon={icon} size="lg" tooltip={TOOLTIP_LABELS[icon]} />
        ))}
      </div>
    </div>
  );
}

function AllIconsDemo() {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {DEMO_ICONS.map((icon) => (
          <div key={icon} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <IconThumbnail icon={icon} size="lg" />
            <span style={{ fontSize: 11, opacity: 0.5 }}>{icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function IconThumbnailPlayground() {
  return (
    <>
      <h1>IconThumbnail</h1>

      <section style={sectionStyle}>
        <h2>Sizes</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Three size variants: lg (20px icon), md (16px), sm (12px).
        </p>
        <SizesDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Outline Prop</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          The inner border is always present. The outline prop toggles the outer ring.
        </p>
        <OutlineDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Adaptive Outline</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          The outer outline ring auto-detects the parent surface so it blends seamlessly.
        </p>
        <AdaptiveSurfaceDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Tooltip</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Pass a tooltip string to show a label on hover.
        </p>
        <TooltipDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Various Icons</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Any IconName can be rendered inside the thumbnail chip.
        </p>
        <AllIconsDemo />
      </section>
    </>
  );
}
