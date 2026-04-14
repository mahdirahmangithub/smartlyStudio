import { useState } from "react";
import { Chip, type ChipSize, type ChipType, type ChipEmphasis } from "../components/Chip";
import { Icon } from "../components/Icon";

const TYPES: ChipType[] = ["neutral", "brand", "info", "success", "warning", "alert"];
const SIZES: ChipSize[] = ["sm", "md", "lg"];
const EMPHASES: ChipEmphasis[] = ["medium", "low"];

export default function ChipPlayground() {
  const [type, setType] = useState<ChipType>("neutral");
  const [size, setSize] = useState<ChipSize>("md");
  const [emphasis, setEmphasis] = useState<ChipEmphasis>("medium");
  const [showLabel, setShowLabel] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const [showRemove, setShowRemove] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

  const iconSize = size === "lg" ? 20 : 16;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Chip</h2>

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
              <span style={captionStyle}>Type</span>
              <select value={type} onChange={(e) => setType(e.target.value as ChipType)} style={selectStyle}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as ChipSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Emphasis</span>
              <select value={emphasis} onChange={(e) => setEmphasis(e.target.value as ChipEmphasis)} style={selectStyle}>
                {EMPHASES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={showLabel} onChange={(e) => setShowLabel(e.target.checked)} />
              <span style={captionStyle}>Label</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={showIcon} onChange={(e) => setShowIcon(e.target.checked)} />
              <span style={captionStyle}>Leading Icon</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={showRemove} onChange={(e) => setShowRemove(e.target.checked)} />
              <span style={captionStyle}>Remove</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              <span style={captionStyle}>Disabled</span>
            </label>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: 24,
              background: "var(--element-surface-default)",
              borderRadius: 8,
            }}
          >
            <Chip
              variant={type}
              size={size}
              emphasis={emphasis}
              leadingIcon={showIcon ? <Icon name="favorite" size={iconSize} /> : undefined}
              onRemove={showRemove ? () => {} : undefined}
              disabled={disabled}
            >
              {showLabel ? "Label" : undefined}
            </Chip>
          </div>
        </div>
      </section>

      {/* ── All types × emphasis: medium ───────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Medium Emphasis</h2>

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
          {TYPES.map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)", width: 64, flexShrink: 0 }}>{t}</span>
              {SIZES.map((s) => (
                <Chip
                  key={s}
                  variant={t}
                  size={s}
                  emphasis="medium"
                  leadingIcon={<Icon name="favorite" size={s === "lg" ? 20 : 16} />}
                  onRemove={() => {}}
                >
                  Label
                </Chip>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── All types × emphasis: low ──────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Low Emphasis</h2>

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
          {TYPES.map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)", width: 64, flexShrink: 0 }}>{t}</span>
              {SIZES.map((s) => (
                <Chip
                  key={s}
                  variant={t}
                  size={s}
                  emphasis="low"
                  leadingIcon={<Icon name="favorite" size={s === "lg" ? 20 : 16} />}
                  onRemove={() => {}}
                >
                  Label
                </Chip>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Disabled ───────────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Disabled</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {EMPHASES.map((emp) =>
            TYPES.map((t) => (
              <Chip
                key={`${emp}-${t}`}
                variant={t}
                size="md"
                emphasis={emp}
                leadingIcon={<Icon name="favorite" size={16} />}
                onRemove={() => {}}
                disabled
              >
                Label
              </Chip>
            ))
          )}
        </div>
      </section>

      {/* ── Combinations ───────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Combinations</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Icon + Label + Remove</span>
            <Chip variant="brand" leadingIcon={<Icon name="favorite" size={16} />} onRemove={() => {}}>Label</Chip>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Label + Remove</span>
            <Chip variant="brand" onRemove={() => {}}>Label</Chip>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Icon + Label</span>
            <Chip variant="brand" leadingIcon={<Icon name="favorite" size={16} />}>Label</Chip>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Label only</span>
            <Chip variant="brand">Label</Chip>
          </div>
        </div>
      </section>
    </div>
  );
}
