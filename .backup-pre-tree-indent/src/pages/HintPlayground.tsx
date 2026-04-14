import { useState } from "react";
import { Hint, type HintSize } from "../components/Hint";
import type { Placement } from "../components/Tooltip";

const SIZES: HintSize[] = ["xs", "sm", "md", "lg"];
const PLACEMENTS: Placement[] = ["top", "bottom", "left", "right"];

const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;
const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;

export default function HintPlayground() {
  const [size, setSize] = useState<HintSize>("md");
  const [placement, setPlacement] = useState<Placement>("top");
  const [showTail, setShowTail] = useState(true);
  const [disabled, setDisabled] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Hint</h2>

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
              <select value={size} onChange={(e) => setSize(e.target.value as HintSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Placement</span>
              <select value={placement} onChange={(e) => setPlacement(e.target.value as Placement)} style={selectStyle}>
                {PLACEMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={showTail} onChange={(e) => setShowTail(e.target.checked)} />
              <span style={captionStyle}>Show Tail</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              <span style={captionStyle}>Disabled</span>
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Hint
              size={size}
              placement={placement}
              showTail={showTail}
              disabled={disabled}
              label="Label"
              description="Description"
            />
          </div>
        </div>
      </section>

      {/* ── Size comparison ──────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Sizes</h2>

        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "center",
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Hint size={s} label="Hint label" description="Helpful description" />
              <span style={captionStyle}>{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── States ──────────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>States</h2>

        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "center",
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Hint size="lg" label="Normal hint" />
            <span style={captionStyle}>Normal</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Hint size="lg" label="Disabled hint" disabled />
            <span style={captionStyle}>Disabled</span>
          </div>
        </div>
      </section>

      {/* ── Custom icon ─────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Custom Icon</h2>

        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "center",
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          <Hint size="lg" iconName="help" label="Help" description="Click for assistance" />
          <Hint size="lg" iconName="warning" label="Warning" description="Something needs attention" tooltipType="neutral" />
          <Hint size="lg" iconName="error" label="Error" description="An issue occurred" />
        </div>
      </section>
    </div>
  );
}
