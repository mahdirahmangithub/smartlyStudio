import { type CSSProperties } from "react";
import { IconThumbnailRow } from "../components/IconThumbnailRow";
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
  "play_arrow",
  "image",
  "record_voice_over",
  "ad_group",
  "gesture",
];

function SizesDemo() {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span style={{ width: 32, fontSize: 13, opacity: 0.6 }}>lg</span>
        <IconThumbnailRow icons={DEMO_ICONS.slice(0, 4)} size="lg" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span style={{ width: 32, fontSize: 13, opacity: 0.6 }}>md</span>
        <IconThumbnailRow icons={DEMO_ICONS.slice(0, 4)} size="md" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span style={{ width: 32, fontSize: 13, opacity: 0.6 }}>sm</span>
        <IconThumbnailRow icons={DEMO_ICONS.slice(0, 4)} size="sm" />
      </div>
    </div>
  );
}

function OverflowDemo() {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span style={{ width: 90, fontSize: 13, opacity: 0.6 }}>max=4 of 6</span>
        <IconThumbnailRow icons={DEMO_ICONS} size="lg" max={4} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span style={{ width: 90, fontSize: 13, opacity: 0.6 }}>max=3 of 6</span>
        <IconThumbnailRow icons={DEMO_ICONS} size="md" max={3} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span style={{ width: 90, fontSize: 13, opacity: 0.6 }}>max=2 of 6</span>
        <IconThumbnailRow icons={DEMO_ICONS} size="sm" max={2} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span style={{ width: 90, fontSize: 13, opacity: 0.6 }}>no max</span>
        <IconThumbnailRow icons={DEMO_ICONS} size="lg" />
      </div>
    </div>
  );
}

function SingleIconDemo() {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span style={{ width: 60, fontSize: 13, opacity: 0.6 }}>1 icon</span>
        <IconThumbnailRow icons={["favorite_fill"]} size="lg" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span style={{ width: 60, fontSize: 13, opacity: 0.6 }}>2 icons</span>
        <IconThumbnailRow icons={["favorite_fill", "star"]} size="lg" />
      </div>
    </div>
  );
}

export default function IconThumbnailRowPlayground() {
  return (
    <>
      <h1>IconThumbnailRow</h1>

      <section style={sectionStyle}>
        <h2>Sizes</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Three size variants: lg, md, sm.
        </p>
        <SizesDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Overflow</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          When icons exceed max, surplus is shown as "+N".
        </p>
        <OverflowDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Few Icons</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Works with 1 or 2 icons.
        </p>
        <SingleIconDemo />
      </section>
    </>
  );
}
