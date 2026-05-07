import { useState } from "react";
import {
  Imagery,
  type ImageryAspectRatio,
  type ImageryRadius,
  type ImageryObjectFit,
} from "@sds/components/Imagery";

const RATIOS: ImageryAspectRatio[] = [
  "1:1", "3:2", "2:3", "4:3", "3:4", "5:4", "4:5",
  "16:9", "9:16", "golden-horizontal", "golden-vertical", "free-form",
];
const RADII: ImageryRadius[] = ["none", "xs", "sm", "md", "lg", "full"];
const FITS: ImageryObjectFit[] = ["cover", "contain", "fill", "none", "scale-down"];

const SAMPLE_IMG = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop";
const BROKEN_IMG = "https://broken.invalid/image.jpg";

export default function ImageryPlayground() {
  const [ratio, setRatio] = useState<ImageryAspectRatio>("1:1");
  const [radius, setRadius] = useState<ImageryRadius>("md");
  const [fit, setFit] = useState<ImageryObjectFit>("cover");
  const [loading, setLoading] = useState<"lazy" | "eager">("lazy");

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Imagery</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <label style={labelStyle}>
              <span style={captionStyle}>Aspect Ratio</span>
              <select value={ratio} onChange={(e) => setRatio(e.target.value as ImageryAspectRatio)} style={selectStyle}>
                {RATIOS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Radius</span>
              <select value={radius} onChange={(e) => setRadius(e.target.value as ImageryRadius)} style={selectStyle}>
                {RADII.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Object Fit</span>
              <select value={fit} onChange={(e) => setFit(e.target.value as ImageryObjectFit)} style={selectStyle}>
                {FITS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Loading</span>
              <select value={loading} onChange={(e) => setLoading(e.target.value as "lazy" | "eager")} style={selectStyle}>
                <option value="lazy">lazy</option>
                <option value="eager">eager</option>
              </select>
            </label>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 32,
              background: "var(--element-surface-default)",
              borderRadius: 8,
            }}
          >
            <div style={{ width: ratio === "free-form" ? 200 : 160 , height: ratio === "free-form" ? 120 : undefined }}>
              <Imagery
                src={SAMPLE_IMG}
                alt="Mountain landscape"
                aspectRatio={ratio}
                radius={radius}
                objectFit={fit}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Aspect ratios grid ─────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Aspect Ratios</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {RATIOS.filter((r) => r !== "free-form").map((r) => (
            <div key={r} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 100 }}>
                <Imagery
                  src={SAMPLE_IMG}
                  alt={`${r} ratio example`}
                  aspectRatio={r}
                  radius="md"
                />
              </div>
              <span style={captionStyle}>{r}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Radius variants ────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Radius</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {RADII.map((r) => (
            <div key={r} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 80 }}>
                <Imagery
                  src={SAMPLE_IMG}
                  alt={`${r} radius example`}
                  aspectRatio="1:1"
                  radius={r}
                />
              </div>
              <span style={captionStyle}>{r}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Fallback demo ──────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Fallback (broken image)</h2>

        <div
          style={{
            display: "flex",
            gap: 24,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 100 }}>
              <Imagery
                src={BROKEN_IMG}
                alt="Broken image with fallback"
                aspectRatio="1:1"
                radius="md"
                fallback={<span style={{ fontSize: 24 }}>🏔</span>}
              />
            </div>
            <span style={captionStyle}>With fallback</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 100 }}>
              <Imagery
                src={BROKEN_IMG}
                alt="Broken image without fallback"
                aspectRatio="1:1"
                radius="md"
              />
            </div>
            <span style={captionStyle}>Without fallback</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 100 }}>
              <Imagery
                src={BROKEN_IMG}
                alt="Broken landscape image"
                aspectRatio="16:9"
                radius="lg"
                fallback={<span style={{ fontSize: 11 }}>Image unavailable</span>}
              />
            </div>
            <span style={captionStyle}>16:9 fallback</span>
          </div>
        </div>
      </section>

      {/* ── Object-fit comparison ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Object Fit</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {FITS.map((f) => (
            <div key={f} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 120, background: "var(--element-fill-neutral-tertiary-default)", borderRadius: 8 }}>
                <Imagery
                  src={SAMPLE_IMG}
                  alt={`${f} object-fit example`}
                  aspectRatio="16:9"
                  radius="md"
                  objectFit={f}
                />
              </div>
              <span style={captionStyle}>{f}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
