import { useState } from "react";
import { InputClear, type InputClearSize, type InputClearType } from "@sds/components/InputClear";

const TYPES: InputClearType[] = ["neutral", "brand", "info", "success", "warning", "alert", "inverse"];
const SIZES: InputClearSize[] = ["2xs", "xs", "sm", "md", "lg"];

export default function InputClearPlayground() {
  const [type, setType] = useState<InputClearType>("neutral");
  const [size, setSize] = useState<InputClearSize>("md");
  const [round, setRound] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>InputClear</h2>

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
              <select value={type} onChange={(e) => setType(e.target.value as InputClearType)} style={selectStyle}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as InputClearSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={round} onChange={(e) => setRound(e.target.checked)} />
              <span style={captionStyle}>Round</span>
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
              background: type === "inverse" ? "var(--element-fill-neutral-primary-default)" : undefined,
              borderRadius: 8,
            }}
          >
            <InputClear variant={type} size={size} round={round} disabled={disabled} />
          </div>
        </div>
      </section>

      {/* ── All sizes: round ───────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Round — All Sizes & Types</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {TYPES.map((t) => (
            <div key={t} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)" }}>{t}</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: 12,
                  borderRadius: 8,
                  background: t === "inverse" ? "var(--element-fill-neutral-primary-default)" : undefined,
                }}
              >
                {SIZES.map((s) => (
                  <InputClear key={s} variant={t} size={s} round />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── All sizes: square ──────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Square — All Sizes & Types</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {TYPES.map((t) => (
            <div key={t} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)" }}>{t}</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: 12,
                  borderRadius: 8,
                  background: t === "inverse" ? "var(--element-fill-neutral-primary-default)" : undefined,
                }}
              >
                {SIZES.map((s) => (
                  <InputClear key={s} variant={t} size={s} round={false} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── States demo ────────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>States</h2>

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
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ ...captionStyle, width: 80 }}>Normal</span>
            <InputClear variant="neutral" size="md" />
            <InputClear variant="brand" size="md" />
            <InputClear variant="info" size="md" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ ...captionStyle, width: 80 }}>Disabled</span>
            <InputClear variant="neutral" size="md" disabled />
            <InputClear variant="brand" size="md" disabled />
            <InputClear variant="info" size="md" disabled />
          </div>
        </div>
      </section>
    </div>
  );
}
