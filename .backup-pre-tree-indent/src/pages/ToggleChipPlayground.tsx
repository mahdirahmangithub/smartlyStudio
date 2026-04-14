import { useState } from "react";
import {
  ToggleChip,
  type ToggleChipSize,
  type ToggleChipEmphasis,
} from "../components/ToggleChip";
import { Icon } from "../components/Icon";

const SIZES: ToggleChipSize[] = ["sm", "md", "lg"];
const EMPHASES: ToggleChipEmphasis[] = ["medium", "low"];

export default function ToggleChipPlayground() {
  const [size, setSize] = useState<ToggleChipSize>("md");
  const [emphasis, setEmphasis] = useState<ToggleChipEmphasis>("medium");
  const [showLabel, setShowLabel] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const [showRemove, setShowRemove] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [checked, setChecked] = useState(false);

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

  const iconSize = size === "lg" ? 20 : 16;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Toggle Chip</h2>

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
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as ToggleChipSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Emphasis</span>
              <select value={emphasis} onChange={(e) => setEmphasis(e.target.value as ToggleChipEmphasis)} style={selectStyle}>
                {EMPHASES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              <span style={captionStyle}>Checked</span>
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
            <ToggleChip
              size={size}
              emphasis={emphasis}
              checked={checked}
              onChange={setChecked}
              leadingIcon={showIcon ? <Icon name="favorite" size={iconSize} /> : undefined}
              onRemove={showRemove ? () => {} : undefined}
              disabled={disabled}
            >
              {showLabel ? "Label" : undefined}
            </ToggleChip>
          </div>
        </div>
      </section>

      {/* ── All sizes × emphases: unchecked vs checked ─────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Unchecked vs Checked</h2>

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
          {EMPHASES.map((emp) => (
            <div key={emp}>
              <p style={{ ...captionStyle, margin: "0 0 8px", textTransform: "capitalize" }}>{emp} emphasis</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {SIZES.map((s) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)", width: 24, flexShrink: 0 }}>{s}</span>
                    <ToggleChip
                      size={s}
                      emphasis={emp}
                      defaultChecked={false}
                      leadingIcon={<Icon name="favorite" size={s === "lg" ? 20 : 16} />}
                      onRemove={() => {}}
                    >
                      Unchecked
                    </ToggleChip>
                    <ToggleChip
                      size={s}
                      emphasis={emp}
                      defaultChecked={true}
                      leadingIcon={<Icon name="favorite" size={s === "lg" ? 20 : 16} />}
                      onRemove={() => {}}
                    >
                      Checked
                    </ToggleChip>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Uncontrolled (click to toggle) ─────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Uncontrolled (click to toggle)</h2>

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
            SIZES.map((s) => (
              <ToggleChip
                key={`${emp}-${s}`}
                size={s}
                emphasis={emp}
                leadingIcon={<Icon name="favorite" size={s === "lg" ? 20 : 16} />}
                onRemove={() => {}}
              >
                Label
              </ToggleChip>
            ))
          )}
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
          {EMPHASES.map((emp) => (
            <>
              <ToggleChip
                key={`${emp}-unchecked`}
                size="md"
                emphasis={emp}
                checked={false}
                leadingIcon={<Icon name="favorite" size={16} />}
                onRemove={() => {}}
                disabled
              >
                Unchecked
              </ToggleChip>
              <ToggleChip
                key={`${emp}-checked`}
                size="md"
                emphasis={emp}
                checked={true}
                leadingIcon={<Icon name="favorite" size={16} />}
                onRemove={() => {}}
                disabled
              >
                Checked
              </ToggleChip>
            </>
          ))}
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
            <ToggleChip leadingIcon={<Icon name="favorite" size={16} />} onRemove={() => {}}>Label</ToggleChip>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Label + Remove</span>
            <ToggleChip onRemove={() => {}}>Label</ToggleChip>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Icon + Label</span>
            <ToggleChip leadingIcon={<Icon name="favorite" size={16} />}>Label</ToggleChip>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Label only</span>
            <ToggleChip>Label</ToggleChip>
          </div>
        </div>
      </section>
    </div>
  );
}
