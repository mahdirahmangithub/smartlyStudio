import { useState } from "react";
import { Tag, type TagType, type TagEmphasis, type TagSize } from "../components/Tag";
import { Icon } from "../components/Icon";

const TYPES: TagType[] = [
  "brand", "neutral", "info", "success", "warning", "alert",
  "cat-1", "cat-2", "cat-3", "cat-4", "cat-5", "cat-6", "cat-7", "cat-8",
];
const EMPHASES: TagEmphasis[] = ["low", "high"];
const SIZES: TagSize[] = ["md", "lg"];

export default function TagPlayground() {
  const [activeType, setActiveType] = useState<TagType>("brand");
  const [activeEmphasis, setActiveEmphasis] = useState<TagEmphasis>("high");
  const [activeSize, setActiveSize] = useState<TagSize>("md");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2>Tag</h2>

      {/* ── interactive preview ────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 12 }}>Interactive Preview</h3>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Type</label>
            <select
              value={activeType}
              onChange={(e) => setActiveType(e.target.value as TagType)}
              style={{ fontSize: 13, padding: "4px 8px" }}
            >
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Emphasis</label>
            <select
              value={activeEmphasis}
              onChange={(e) => setActiveEmphasis(e.target.value as TagEmphasis)}
              style={{ fontSize: 13, padding: "4px 8px" }}
            >
              {EMPHASES.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Size</label>
            <select
              value={activeSize}
              onChange={(e) => setActiveSize(e.target.value as TagSize)}
              style={{ fontSize: 13, padding: "4px 8px" }}
            >
              {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "flex-end" }}>
            <label style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Result</label>
            <Tag
              variant={activeType}
              emphasis={activeEmphasis}
              size={activeSize}
              label="Label"
              leadingIcon={<Icon name="favorite" size={activeSize === "md" ? 12 : 14} />}
              trailingIcon={<Icon name="favorite" size={activeSize === "md" ? 12 : 14} />}
              onRemove={() => {}}
            />
          </div>
        </div>
      </section>

      {/* ── emphasis × type matrix ──────────────────────────────────────── */}
      {EMPHASES.map((emphasis) => (
        <section key={emphasis}>
          <h3 style={{ marginBottom: 12, textTransform: "capitalize" }}>
            Emphasis: {emphasis}
          </h3>

          {SIZES.map((size) => (
            <div key={size} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)", marginBottom: 8 }}>
                Size: {size}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {TYPES.map((variant) => (
                  <Tag
                    key={variant}
                    size={size}
                    variant={variant}
                    emphasis={emphasis}
                    label="Label"
                    leadingIcon={<Icon name="favorite" size={size === "md" ? 12 : 14} />}
                    trailingIcon={<Icon name="favorite" size={size === "md" ? 12 : 14} />}
                    onRemove={() => {}}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      {/* ── slot combinations ───────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 12 }}>Slot Combinations</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <Tag label="Label only" variant="brand" />
          <Tag label="With remove" variant="info" onRemove={() => {}} />
          <Tag
            label="Leading"
            variant="success"
            leadingIcon={<Icon name="favorite" size={12} />}
          />
          <Tag
            label="Trailing"
            variant="warning"
            trailingIcon={<Icon name="favorite" size={12} />}
          />
          <Tag
            label="All slots"
            variant="alert"
            leadingIcon={<Icon name="favorite" size={12} />}
            trailingIcon={<Icon name="favorite" size={12} />}
            onRemove={() => {}}
          />
          <Tag
            label="No icons"
            variant="neutral"
            emphasis="high"
            onRemove={() => {}}
          />
        </div>
      </section>

      {/* ── outline ─────────────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 12 }}>Outline (for stacking)</h3>
        <div style={{ display: "flex", alignItems: "center" }}>
          {[...TYPES.slice(0, 6), "cat-1" as TagType].map((variant, i) => (
            <Tag
              key={variant}
              size="lg"
              variant={variant}
              emphasis="high"
              label="Label"
              outline
              onRemove={() => {}}
              style={{ marginLeft: i > 0 ? -8 : 0, zIndex: TYPES.length - i }}
            />
          ))}
        </div>
      </section>

      {/* ── truncation ──────────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 12 }}>Label Truncation (max 160px)</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <Tag
            label="This is a very long label that should be truncated"
            variant="brand"
            size="md"
            onRemove={() => {}}
          />
          <Tag
            label="This is a very long label that should be truncated"
            variant="info"
            emphasis="high"
            size="lg"
            leadingIcon={<Icon name="favorite" size={14} />}
            onRemove={() => {}}
          />
        </div>
      </section>
    </div>
  );
}
