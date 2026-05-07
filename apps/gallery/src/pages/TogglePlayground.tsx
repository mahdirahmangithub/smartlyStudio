import { useState } from "react";
import { Toggle, ToggleField, type ToggleSize } from "@sds/components/Toggle";

const SIZES: ToggleSize[] = ["sm", "lg"];

const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;
const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
const labelCtrlStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
const sectionCard = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
} as const;

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(5, auto)",
  gap: 16,
  alignItems: "center",
  justifyItems: "center",
} as const;

export default function TogglePlayground() {
  const [size, setSize] = useState<ToggleSize>("sm");
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ─────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Toggle</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as ToggleSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={checked} onChange={(e) => { setChecked(e.target.checked); if (e.target.checked) setIndeterminate(false); }} />
              <span style={captionStyle}>Checked</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={indeterminate} onChange={(e) => { setIndeterminate(e.target.checked); if (e.target.checked) setChecked(false); }} />
              <span style={captionStyle}>Indeterminate</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              <span style={captionStyle}>Disabled</span>
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Toggle
              size={size}
              checked={checked}
              indeterminate={indeterminate}
              disabled={disabled}
              onChange={(v) => { setChecked(v); setIndeterminate(false); }}
              aria-label="Demo toggle"
            />
          </div>
        </div>
      </section>

      {/* ── All states ────────────────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>States</h3>

        <div style={sectionCard}>
          <div style={{ marginBottom: 4 }}>
            <span style={{ ...captionStyle, marginBottom: 4, display: "block" }}>Unchecked</span>
            <div style={{ display: "flex", gap: 8 }}>
              {SIZES.map((sz) => (
                <div key={sz} style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 8 }}>
                  <span style={captionStyle}>{sz}</span>
                  <Toggle size={sz} aria-label={`unchecked ${sz}`} />
                  <Toggle size={sz} disabled aria-label={`unchecked disabled ${sz}`} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 4 }}>
            <span style={{ ...captionStyle, marginBottom: 4, display: "block" }}>Checked</span>
            <div style={{ display: "flex", gap: 8 }}>
              {SIZES.map((sz) => (
                <div key={sz} style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 8 }}>
                  <span style={captionStyle}>{sz}</span>
                  <Toggle size={sz} checked aria-label={`checked ${sz}`} />
                  <Toggle size={sz} checked disabled aria-label={`checked disabled ${sz}`} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <span style={{ ...captionStyle, marginBottom: 4, display: "block" }}>Indeterminate</span>
            <div style={{ display: "flex", gap: 8 }}>
              {SIZES.map((sz) => (
                <div key={sz} style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 8 }}>
                  <span style={captionStyle}>{sz}</span>
                  <Toggle size={sz} indeterminate aria-label={`indeterminate ${sz}`} />
                  <Toggle size={sz} indeterminate disabled aria-label={`indeterminate disabled ${sz}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Field (with Label) ─────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>ToggleField (with Label)</h3>

        <div style={sectionCard}>
          {(["sm", "lg"] as const).map((sz) => (
            <div key={sz} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <span style={{ ...captionStyle, fontWeight: 600 }}>Size: {sz}</span>
              <ToggleField size={sz} label="Unchecked toggle" />
              <ToggleField size={sz} label="Checked toggle" checked onChange={() => {}} />
              <ToggleField size={sz} label="Indeterminate toggle" indeterminate />
              <ToggleField size={sz} label="Disabled toggle" disabled checked onChange={() => {}} />
              <ToggleField size={sz} label="With description" description="Helper text goes here" checked onChange={() => {}} density="xs" />
              <ToggleField size={sz} label="Required field" required checked onChange={() => {}} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Full matrix ──────────────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>Full matrix</h3>

        <div style={sectionCard}>
          {(["sm", "lg"] as const).map((sz) => (
            <div key={sz} style={{ marginBottom: 24 }}>
              <span style={{ ...captionStyle, display: "block", marginBottom: 8, fontWeight: 600 }}>Size: {sz}</span>
              <div style={gridStyle}>
                <span />
                <span style={captionStyle}>unchecked</span>
                <span style={captionStyle}>checked</span>
                <span style={captionStyle}>indeterminate</span>
                <span style={captionStyle}>disabled</span>

                <span style={captionStyle}>normal</span>
                <Toggle size={sz} aria-label="u" />
                <Toggle size={sz} checked aria-label="c" />
                <Toggle size={sz} indeterminate aria-label="i" />
                <Toggle size={sz} disabled aria-label="d" />

                <span style={captionStyle}>checked disabled</span>
                <Toggle size={sz} disabled aria-label="ud" />
                <Toggle size={sz} checked disabled aria-label="cd" />
                <Toggle size={sz} indeterminate disabled aria-label="id" />
                <span />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
