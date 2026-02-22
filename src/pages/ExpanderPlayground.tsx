import { useState } from "react";
import { Expander } from "../components/Expander";
import { Button, type ButtonSize, type ButtonType, type ButtonEmphasis } from "../components/Button";

type ExpanderSize = "sm" | "lg";
type ExpanderEmphasis = "medium" | "low";

const EXPANDER_SIZES: ExpanderSize[] = ["sm", "lg"];
const EXPANDER_EMPHASES: ExpanderEmphasis[] = ["medium", "low"];

const BUTTON_SIZES: ButtonSize[] = ["sm", "md", "lg"];
const BUTTON_TYPES: ButtonType[] = ["brand", "neutral", "info", "success", "warning", "alert", "inverse"];
const BUTTON_EMPHASES: ButtonEmphasis[] = ["high", "medium", "low"];

const EXPANDER_FOR_BUTTON: Record<ButtonSize, ExpanderSize> = { sm: "sm", md: "sm", lg: "lg" };

export default function ExpanderPlayground() {
  const [expanded, setExpanded] = useState(false);
  const [expanderSize, setExpanderSize] = useState<ExpanderSize>("sm");
  const [expanderEmphasis, setExpanderEmphasis] = useState<ExpanderEmphasis>("medium");
  const [error, setError] = useState(false);
  const [expanderDisabled, setExpanderDisabled] = useState(false);

  const [btnExpanded, setBtnExpanded] = useState(false);
  const [btnSize, setBtnSize] = useState<ButtonSize>("md");
  const [btnType, setBtnType] = useState<ButtonType>("neutral");
  const [btnEmphasis, setBtnEmphasis] = useState<ButtonEmphasis>("medium");
  const [btnDisabled, setBtnDisabled] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Button + Expander playground ──────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Button with Expander</h2>

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
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Size</span>
              <select value={btnSize} onChange={(e) => setBtnSize(e.target.value as ButtonSize)}
                style={{ fontSize: 12, padding: "2px 6px" }}>
                {BUTTON_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Type</span>
              <select value={btnType} onChange={(e) => setBtnType(e.target.value as ButtonType)}
                style={{ fontSize: 12, padding: "2px 6px" }}>
                {BUTTON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Emphasis</span>
              <select value={btnEmphasis} onChange={(e) => setBtnEmphasis(e.target.value as ButtonEmphasis)}
                style={{ fontSize: 12, padding: "2px 6px" }}>
                {BUTTON_EMPHASES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={btnDisabled} onChange={(e) => setBtnDisabled(e.target.checked)} />
              <span style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Disabled</span>
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button
              size={btnSize}
              variant={btnType}
              emphasis={btnEmphasis}
              disabled={btnDisabled}
              trailingIcon={<Expander expanded={btnExpanded} size={EXPANDER_FOR_BUTTON[btnSize]} />}
              onClick={() => setBtnExpanded((v) => !v)}
            >
              Label
            </Button>
          </div>

          <p style={{ fontSize: 11, color: "var(--text-neutral-tertiary-default)" }}>
            Click the button to toggle the expander. The Expander inherits color from the Button via <code>currentColor</code>.
          </p>
        </div>
      </section>

      {/* ── Standalone Expander preview ────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Standalone Expander</h2>

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
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Size</span>
              <select value={expanderSize} onChange={(e) => setExpanderSize(e.target.value as ExpanderSize)}
                style={{ fontSize: 12, padding: "2px 6px" }}>
                {EXPANDER_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Emphasis</span>
              <select value={expanderEmphasis} onChange={(e) => setExpanderEmphasis(e.target.value as ExpanderEmphasis)}
                style={{ fontSize: 12, padding: "2px 6px" }}>
                {EXPANDER_EMPHASES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={error} onChange={(e) => setError(e.target.checked)} />
              <span style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Error</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={expanderDisabled} onChange={(e) => setExpanderDisabled(e.target.checked)} />
              <span style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Disabled</span>
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => !expanderDisabled && setExpanded((v) => !v)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                border: "1px solid var(--element-outline-neutral-default)",
                borderRadius: 8,
                background: "var(--element-fill-neutral-primary-default)",
                color: "var(--text-neutral-primary)",
                cursor: expanderDisabled ? "not-allowed" : "pointer",
                opacity: expanderDisabled ? 0.5 : 1,
                fontSize: 14,
              }}
            >
              <span>{expanded ? "Collapse" : "Expand"}</span>
              <Expander
                expanded={expanded}
                size={expanderSize}
                emphasis={expanderEmphasis}
                error={error}
                disabled={expanderDisabled}
              />
            </button>
          </div>
        </div>
      </section>

      {/* ── State matrix ───────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>All Variants</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto repeat(4, 1fr)",
            gap: "8px 24px",
            alignItems: "center",
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {/* Column headers */}
          <div />
          <div style={{ fontSize: 11, color: "var(--text-neutral-tertiary-default)", textAlign: "center" }}>Default</div>
          <div style={{ fontSize: 11, color: "var(--text-neutral-tertiary-default)", textAlign: "center" }}>Error</div>
          <div style={{ fontSize: 11, color: "var(--text-neutral-tertiary-default)", textAlign: "center" }}>Disabled</div>
          <div style={{ fontSize: 11, color: "var(--text-neutral-tertiary-default)", textAlign: "center" }}>Error + Disabled</div>

          {EXPANDER_SIZES.map((s) =>
            EXPANDER_EMPHASES.map((emp) => (
              <div key={`${s}-${emp}`} style={{ display: "contents" }}>
                {/* Row label */}
                <div style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)", whiteSpace: "nowrap" }}>
                  {s} / {emp}
                </div>

                {/* Default */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <Expander size={s} emphasis={emp} />
                  <Expander size={s} emphasis={emp} expanded />
                </div>

                {/* Error */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <Expander size={s} emphasis={emp} error />
                  <Expander size={s} emphasis={emp} error expanded />
                </div>

                {/* Disabled */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <Expander size={s} emphasis={emp} disabled />
                  <Expander size={s} emphasis={emp} disabled expanded />
                </div>

                {/* Error + Disabled */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <Expander size={s} emphasis={emp} error disabled />
                  <Expander size={s} emphasis={emp} error disabled expanded />
                </div>
              </div>
            ))
          )}
        </div>
        <p style={{ fontSize: 11, color: "var(--text-neutral-tertiary-default)", marginTop: 8 }}>
          Each cell shows collapsed (left) and expanded (right).
        </p>
      </section>
    </div>
  );
}
