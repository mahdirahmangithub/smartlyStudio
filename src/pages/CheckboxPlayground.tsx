import { useState } from "react";
import { Checkbox, CheckboxField, type CheckboxSize } from "../components/Checkbox";

const SIZES: CheckboxSize[] = ["sm", "lg"];

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

export default function CheckboxPlayground() {
  const [size, setSize] = useState<CheckboxSize>("sm");
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ─────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Checkbox</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as CheckboxSize)} style={selectStyle}>
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
              <input type="checkbox" checked={error} onChange={(e) => setError(e.target.checked)} />
              <span style={captionStyle}>Error</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              <span style={captionStyle}>Disabled</span>
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Checkbox
              size={size}
              checked={checked}
              indeterminate={indeterminate}
              error={error}
              disabled={disabled}
              onChange={(v) => { setChecked(v); setIndeterminate(false); }}
              aria-label="Demo checkbox"
            />
          </div>
        </div>
      </section>

      {/* ── All states — no error ─────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>States (no error)</h3>

        <div style={sectionCard}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            {["normal", "hover", "press", "focus", "disable"].map((s) => (
              <span key={s} style={{ ...captionStyle, width: 40, textAlign: "center" }}>{s}</span>
            ))}
          </div>

          {/* Unchecked */}
          <div style={{ marginBottom: 4 }}>
            <span style={{ ...captionStyle, marginBottom: 4, display: "block" }}>Unchecked</span>
            <div style={{ display: "flex", gap: 8 }}>
              {SIZES.map((sz) => (
                <div key={sz} style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 8 }}>
                  <span style={captionStyle}>{sz}</span>
                  <Checkbox size={sz} aria-label={`unchecked ${sz}`} />
                  <Checkbox size={sz} disabled aria-label={`unchecked disabled ${sz}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Checked */}
          <div style={{ marginBottom: 4 }}>
            <span style={{ ...captionStyle, marginBottom: 4, display: "block" }}>Checked</span>
            <div style={{ display: "flex", gap: 8 }}>
              {SIZES.map((sz) => (
                <div key={sz} style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 8 }}>
                  <span style={captionStyle}>{sz}</span>
                  <Checkbox size={sz} checked aria-label={`checked ${sz}`} />
                  <Checkbox size={sz} checked disabled aria-label={`checked disabled ${sz}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Indeterminate */}
          <div>
            <span style={{ ...captionStyle, marginBottom: 4, display: "block" }}>Indeterminate</span>
            <div style={{ display: "flex", gap: 8 }}>
              {SIZES.map((sz) => (
                <div key={sz} style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 8 }}>
                  <span style={captionStyle}>{sz}</span>
                  <Checkbox size={sz} indeterminate aria-label={`indeterminate ${sz}`} />
                  <Checkbox size={sz} indeterminate disabled aria-label={`indeterminate disabled ${sz}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── All states — error ────────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>States (error)</h3>

        <div style={sectionCard}>
          {/* Unchecked error */}
          <div style={{ marginBottom: 4 }}>
            <span style={{ ...captionStyle, marginBottom: 4, display: "block" }}>Unchecked</span>
            <div style={{ display: "flex", gap: 8 }}>
              {SIZES.map((sz) => (
                <div key={sz} style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 8 }}>
                  <span style={captionStyle}>{sz}</span>
                  <Checkbox size={sz} error aria-label={`unchecked error ${sz}`} />
                  <Checkbox size={sz} error disabled aria-label={`unchecked error disabled ${sz}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Checked error */}
          <div style={{ marginBottom: 4 }}>
            <span style={{ ...captionStyle, marginBottom: 4, display: "block" }}>Checked</span>
            <div style={{ display: "flex", gap: 8 }}>
              {SIZES.map((sz) => (
                <div key={sz} style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 8 }}>
                  <span style={captionStyle}>{sz}</span>
                  <Checkbox size={sz} error checked aria-label={`checked error ${sz}`} />
                  <Checkbox size={sz} error checked disabled aria-label={`checked error disabled ${sz}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Indeterminate error */}
          <div>
            <span style={{ ...captionStyle, marginBottom: 4, display: "block" }}>Indeterminate</span>
            <div style={{ display: "flex", gap: 8 }}>
              {SIZES.map((sz) => (
                <div key={sz} style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 8 }}>
                  <span style={captionStyle}>{sz}</span>
                  <Checkbox size={sz} error indeterminate aria-label={`indeterminate error ${sz}`} />
                  <Checkbox size={sz} error indeterminate disabled aria-label={`indeterminate error disabled ${sz}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Field (with Label) ─────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>CheckboxField (with Label)</h3>

        <div style={sectionCard}>
          {(["sm", "lg"] as const).map((sz) => (
            <div key={sz} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <span style={{ ...captionStyle, fontWeight: 600 }}>Size: {sz}</span>
              <CheckboxField size={sz} label="Unchecked label" />
              <CheckboxField size={sz} label="Checked label" checked onChange={() => {}} />
              <CheckboxField size={sz} label="Indeterminate label" indeterminate />
              <CheckboxField size={sz} label="Error label" error checked onChange={() => {}} />
              <CheckboxField size={sz} label="Disabled label" disabled checked onChange={() => {}} />
              <CheckboxField size={sz} label="With description" description="Helper text goes here" checked onChange={() => {}} density="xs" />
              <CheckboxField size={sz} label="Required field" required checked onChange={() => {}} />
              <CheckboxField size={sz} label="Optional field" optional />
              <CheckboxField size={sz} label="With hint" hint="More info" />
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
                <Checkbox size={sz} aria-label="u" />
                <Checkbox size={sz} checked aria-label="c" />
                <Checkbox size={sz} indeterminate aria-label="i" />
                <Checkbox size={sz} disabled aria-label="d" />

                <span style={captionStyle}>checked disabled</span>
                <Checkbox size={sz} disabled aria-label="ud" />
                <Checkbox size={sz} checked disabled aria-label="cd" />
                <Checkbox size={sz} indeterminate disabled aria-label="id" />
                <span />

                <span style={captionStyle}>error</span>
                <Checkbox size={sz} error aria-label="eu" />
                <Checkbox size={sz} error checked aria-label="ec" />
                <Checkbox size={sz} error indeterminate aria-label="ei" />
                <Checkbox size={sz} error disabled aria-label="ed" />

                <span style={captionStyle}>error+checked disabled</span>
                <Checkbox size={sz} error disabled aria-label="eud" />
                <Checkbox size={sz} error checked disabled aria-label="ecd" />
                <Checkbox size={sz} error indeterminate disabled aria-label="eid" />
                <span />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
