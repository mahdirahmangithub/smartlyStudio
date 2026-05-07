import { useState, type ElementType } from "react";
import { BodyText, type BodyTextSize, type BodyTextEmphasis } from "@sds/components/BodyText";
import type { SpacingSize } from "@sds/utils/spacing";

const SIZES: BodyTextSize[] = ["lg", "md", "sm"];
const EMPHASES: BodyTextEmphasis[] = ["high", "medium", "low"];

const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;
const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
const labelCtrlStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
const sectionCard = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
} as const;

const SAMPLE =
  "Easily manage and launch high performing campaigns across platforms with just a few clicks. Smartly helps streamline workflows, automate repetitive tasks, and maintain consistent brand messaging at scale.";

const SPACING_OPTIONS: { label: string; value: SpacingSize | "" }[] = [
  { label: "none", value: "" },
  { label: "2xs", value: "2xs" },
  { label: "xs", value: "xs" },
  { label: "sm", value: "sm" },
  { label: "sm-extra", value: "sm-extra" },
  { label: "md", value: "md" },
  { label: "lg", value: "lg" },
  { label: "xl", value: "xl" },
];

export default function BodyTextPlayground() {
  const [size, setSize] = useState<BodyTextSize>("lg");
  const [emphasis, setEmphasis] = useState<BodyTextEmphasis>("high");
  const [strong, setStrong] = useState(false);
  const [padTop, setPadTop] = useState<SpacingSize | "">("");
  const [padBottom, setPadBottom] = useState<SpacingSize | "">("");
  const [tag, setTag] = useState<ElementType>("p");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ─────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>BodyText</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as BodyTextSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Emphasis</span>
              <select value={emphasis} onChange={(e) => setEmphasis(e.target.value as BodyTextEmphasis)} style={selectStyle}>
                {EMPHASES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>

            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Tag</span>
              <select value={tag as string} onChange={(e) => setTag(e.target.value as ElementType)} style={selectStyle}>
                {["p", "span", "div", "blockquote", "li"].map((t) => <option key={t} value={t}>{`<${t}>`}</option>)}
              </select>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={strong} onChange={(e) => setStrong(e.target.checked)} />
              <span style={captionStyle}>Strong</span>
            </label>

            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Pad top</span>
              <select value={padTop} onChange={(e) => setPadTop(e.target.value as SpacingSize | "")} style={selectStyle}>
                {SPACING_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
              </select>
            </label>

            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Pad bottom</span>
              <select value={padBottom} onChange={(e) => setPadBottom(e.target.value as SpacingSize | "")} style={selectStyle}>
                {SPACING_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>

          <div style={{ maxWidth: 560, background: padTop || padBottom ? "var(--element-fill-neutral-primary-inverse-default)" : undefined, borderRadius: 8, border: padTop || padBottom ? "1px dashed var(--element-outline-neutral-subtlest)" : undefined }}>
            <BodyText
              size={size}
              emphasis={emphasis}
              strong={strong}
              paddingTop={padTop || undefined}
              paddingBottom={padBottom || undefined}
              as={tag}
            >
              {SAMPLE}
            </BodyText>
          </div>
        </div>
      </section>

      {/* ── Size × emphasis matrix ────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Size &times; Emphasis</h2>

        <div style={{ ...sectionCard, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {SIZES.map((s) =>
            EMPHASES.map((em) => (
              <div key={`${s}-${em}`} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={captionStyle}>{s} / {em}</span>
                <BodyText size={s} emphasis={em}>{SAMPLE}</BodyText>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Strong variants ───────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Strong Weight</h2>

        <div style={{ ...sectionCard, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={captionStyle}>{s} / strong</span>
              <BodyText size={s} strong>{SAMPLE}</BodyText>
            </div>
          ))}
        </div>
      </section>

      {/* ── Padding demo ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Spacing (various tokens)</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--element-fill-neutral-primary-inverse-default)", borderRadius: 8, border: "1px dashed var(--element-outline-neutral-subtlest)" }}>
            <BodyText size="lg" paddingTop="md" paddingBottom="md">
              paddingTop="md" paddingBottom="md"
            </BodyText>
          </div>
          <div style={{ background: "var(--element-fill-neutral-primary-inverse-default)", borderRadius: 8, border: "1px dashed var(--element-outline-neutral-subtlest)" }}>
            <BodyText size="md" paddingTop="sm" paddingBottom="xs">
              paddingTop="sm" paddingBottom="xs"
            </BodyText>
          </div>
          <div style={{ background: "var(--element-fill-neutral-primary-inverse-default)", borderRadius: 8, border: "1px dashed var(--element-outline-neutral-subtlest)" }}>
            <BodyText size="sm" paddingTop="lg" paddingBottom="2xs">
              paddingTop="lg" paddingBottom="2xs"
            </BodyText>
          </div>
        </div>
      </section>
    </div>
  );
}
