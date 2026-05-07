import { useState } from "react";
import {
  SelectChip,
  type SelectChipSize,
  type SelectChipType,
  type SelectChipEmphasis,
} from "@sds/components/SelectChip";
import { Icon } from "@sds/components/Icon";

const TYPES: SelectChipType[] = ["neutral", "brand", "info", "success", "warning", "alert"];
const SIZES: SelectChipSize[] = ["sm", "md", "lg"];
const EMPHASES: SelectChipEmphasis[] = ["medium", "low"];

export default function SelectChipPlayground() {
  const [type, setType] = useState<SelectChipType>("neutral");
  const [size, setSize] = useState<SelectChipSize>("md");
  const [emphasis, setEmphasis] = useState<SelectChipEmphasis>("medium");
  const [showLabel, setShowLabel] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const [showRemove, setShowRemove] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [open, setOpen] = useState(false);

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

  const iconSize = size === "lg" ? 20 : 16;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Select Chip</h2>

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
              <select value={type} onChange={(e) => setType(e.target.value as SelectChipType)} style={selectStyle}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as SelectChipSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Emphasis</span>
              <select value={emphasis} onChange={(e) => setEmphasis(e.target.value as SelectChipEmphasis)} style={selectStyle}>
                {EMPHASES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} />
              <span style={captionStyle}>Open</span>
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
            <SelectChip
              variant={type}
              size={size}
              emphasis={emphasis}
              open={open}
              leadingIcon={showIcon ? <Icon name="favorite" size={iconSize} /> : undefined}
              onRemove={showRemove ? () => {} : undefined}
              disabled={disabled}
              onClick={() => setOpen((v) => !v)}
            >
              {showLabel ? "Label" : undefined}
            </SelectChip>
          </div>
        </div>
      </section>

      {/* ── All types × medium emphasis ────────────────────────────── */}
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
                <SelectChip
                  key={s}
                  variant={t}
                  size={s}
                  emphasis="medium"
                  leadingIcon={<Icon name="favorite" size={s === "lg" ? 20 : 16} />}
                  onRemove={() => {}}
                >
                  Label
                </SelectChip>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── All types × low emphasis ───────────────────────────────── */}
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
                <SelectChip
                  key={s}
                  variant={t}
                  size={s}
                  emphasis="low"
                  leadingIcon={<Icon name="favorite" size={s === "lg" ? 20 : 16} />}
                  onRemove={() => {}}
                >
                  Label
                </SelectChip>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Open state ─────────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Open (chevron rotated)</h2>

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
          {SIZES.map((s) => (
            <SelectChip
              key={s}
              variant="brand"
              size={s}
              emphasis="medium"
              open
              leadingIcon={<Icon name="favorite" size={s === "lg" ? 20 : 16} />}
              onRemove={() => {}}
            >
              Label
            </SelectChip>
          ))}
          {SIZES.map((s) => (
            <SelectChip
              key={`low-${s}`}
              variant="brand"
              size={s}
              emphasis="low"
              open
              leadingIcon={<Icon name="favorite" size={s === "lg" ? 20 : 16} />}
              onRemove={() => {}}
            >
              Label
            </SelectChip>
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
              <SelectChip
                key={`${emp}-${t}`}
                variant={t}
                size="md"
                emphasis={emp}
                leadingIcon={<Icon name="favorite" size={16} />}
                onRemove={() => {}}
                disabled
              >
                Label
              </SelectChip>
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
            <span style={captionStyle}>Icon + Label + Chevron + Remove</span>
            <SelectChip variant="brand" leadingIcon={<Icon name="favorite" size={16} />} onRemove={() => {}}>Label</SelectChip>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Label + Chevron + Remove</span>
            <SelectChip variant="brand" onRemove={() => {}}>Label</SelectChip>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Icon + Label + Chevron</span>
            <SelectChip variant="brand" leadingIcon={<Icon name="favorite" size={16} />}>Label</SelectChip>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Label + Chevron</span>
            <SelectChip variant="brand">Label</SelectChip>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Chevron only</span>
            <SelectChip variant="brand" />
          </div>
        </div>
      </section>
    </div>
  );
}
