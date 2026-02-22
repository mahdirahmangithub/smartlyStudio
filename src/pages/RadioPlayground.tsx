import { useState } from "react";
import { Radio, RadioField, type RadioSize } from "../components/Radio";

const SIZES: RadioSize[] = ["sm", "lg"];

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
  gridTemplateColumns: "repeat(4, auto)",
  gap: 16,
  alignItems: "center",
  justifyItems: "center",
} as const;

export default function RadioPlayground() {
  const [size, setSize] = useState<RadioSize>("sm");
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ─────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Radio</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as RadioSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              <span style={captionStyle}>Checked</span>
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
            <Radio
              size={size}
              checked={checked}
              error={error}
              disabled={disabled}
              onChange={(v) => setChecked(v)}
              aria-label="Demo radio"
            />
          </div>
        </div>
      </section>

      {/* ── Radio group demo ────────────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>Radio group</h3>
        <div style={sectionCard}>
          <RadioGroupDemo />
        </div>
      </section>

      {/* ── All states — no error ─────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>States (no error)</h3>

        <div style={sectionCard}>
          <div style={{ marginBottom: 4 }}>
            <span style={{ ...captionStyle, marginBottom: 4, display: "block" }}>Unchecked</span>
            <div style={{ display: "flex", gap: 8 }}>
              {SIZES.map((sz) => (
                <div key={sz} style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 8 }}>
                  <span style={captionStyle}>{sz}</span>
                  <Radio size={sz} aria-label={`unchecked ${sz}`} />
                  <Radio size={sz} disabled aria-label={`unchecked disabled ${sz}`} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <span style={{ ...captionStyle, marginBottom: 4, display: "block" }}>Checked</span>
            <div style={{ display: "flex", gap: 8 }}>
              {SIZES.map((sz) => (
                <div key={sz} style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 8 }}>
                  <span style={captionStyle}>{sz}</span>
                  <Radio size={sz} checked aria-label={`checked ${sz}`} />
                  <Radio size={sz} checked disabled aria-label={`checked disabled ${sz}`} />
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
          <div style={{ marginBottom: 4 }}>
            <span style={{ ...captionStyle, marginBottom: 4, display: "block" }}>Unchecked</span>
            <div style={{ display: "flex", gap: 8 }}>
              {SIZES.map((sz) => (
                <div key={sz} style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 8 }}>
                  <span style={captionStyle}>{sz}</span>
                  <Radio size={sz} error aria-label={`unchecked error ${sz}`} />
                  <Radio size={sz} error disabled aria-label={`unchecked error disabled ${sz}`} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <span style={{ ...captionStyle, marginBottom: 4, display: "block" }}>Checked</span>
            <div style={{ display: "flex", gap: 8 }}>
              {SIZES.map((sz) => (
                <div key={sz} style={{ display: "flex", gap: 32, alignItems: "center", marginBottom: 8 }}>
                  <span style={captionStyle}>{sz}</span>
                  <Radio size={sz} error checked aria-label={`checked error ${sz}`} />
                  <Radio size={sz} error checked disabled aria-label={`checked error disabled ${sz}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Field (with Label) ─────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>RadioField (with Label)</h3>

        <div style={sectionCard}>
          {(["sm", "lg"] as const).map((sz) => (
            <div key={sz} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <span style={{ ...captionStyle, fontWeight: 600 }}>Size: {sz}</span>
              <RadioField size={sz} label="Unchecked radio" />
              <RadioField size={sz} label="Checked radio" checked onChange={() => {}} />
              <RadioField size={sz} label="Error radio" error checked onChange={() => {}} />
              <RadioField size={sz} label="Disabled radio" disabled checked onChange={() => {}} />
              <RadioField size={sz} label="With description" description="Helper text goes here" checked onChange={() => {}} density="xs" />
              <RadioField size={sz} label="Required field" required checked onChange={() => {}} />
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
                <span style={captionStyle}>disabled</span>

                <span style={captionStyle}>normal</span>
                <Radio size={sz} aria-label="u" />
                <Radio size={sz} checked aria-label="c" />
                <Radio size={sz} disabled aria-label="d" />

                <span style={captionStyle}>checked disabled</span>
                <Radio size={sz} disabled aria-label="ud" />
                <Radio size={sz} checked disabled aria-label="cd" />
                <span />

                <span style={captionStyle}>error</span>
                <Radio size={sz} error aria-label="eu" />
                <Radio size={sz} error checked aria-label="ec" />
                <Radio size={sz} error disabled aria-label="ed" />

                <span style={captionStyle}>error+checked disabled</span>
                <Radio size={sz} error disabled aria-label="eud" />
                <Radio size={sz} error checked disabled aria-label="ecd" />
                <span />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function RadioGroupDemo() {
  const [selected, setSelected] = useState("opt1");

  const options = [
    { value: "opt1", label: "Option 1" },
    { value: "opt2", label: "Option 2" },
    { value: "opt3", label: "Option 3" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {options.map((opt) => (
        <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <Radio
            size="sm"
            name="demo-group"
            value={opt.value}
            checked={selected === opt.value}
            onChange={() => setSelected(opt.value)}
            aria-label={opt.label}
          />
          <span style={{ fontSize: 14, color: "var(--text-neutral-primary-default)" }}>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
