import { useState } from "react";
import {
  Divider,
  type DividerType,
  type DividerVariant,
  type DividerOrientation,
} from "../components/Divider";

const TYPES: DividerType[] = ["neutral", "brand"];
const VARIANTS: DividerVariant[] = ["normal", "dashed", "dotted"];
const ORIENTATIONS: DividerOrientation[] = ["horizontal", "vertical"];

export default function DividerPlayground() {
  const [type, setType] = useState<DividerType>("neutral");
  const [variant, setVariant] = useState<DividerVariant>("normal");
  const [orientation, setOrientation] = useState<DividerOrientation>("horizontal");
  const [inset, setInset] = useState(false);
  const [padding, setPadding] = useState(false);

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Divider</h2>

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
              <select value={type} onChange={(e) => setType(e.target.value as DividerType)} style={selectStyle}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Style</span>
              <select value={variant} onChange={(e) => setVariant(e.target.value as DividerVariant)} style={selectStyle}>
                {VARIANTS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Orientation</span>
              <select value={orientation} onChange={(e) => setOrientation(e.target.value as DividerOrientation)} style={selectStyle}>
                {ORIENTATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} />
              <span style={captionStyle}>Inset</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={padding} onChange={(e) => setPadding(e.target.checked)} />
              <span style={captionStyle}>Padding</span>
            </label>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: orientation === "vertical" ? "row" : "column",
              alignItems: "stretch",
              justifyContent: "center",
              minHeight: orientation === "vertical" ? 120 : undefined,
              background: "var(--surface-default)",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <Divider
              type={type}
              variant={variant}
              orientation={orientation}
              inset={inset}
              padding={padding}
            />
          </div>
        </div>
      </section>

      {/* ── Horizontal matrix ──────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Horizontal</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr 1fr",
            gap: "12px 24px",
            alignItems: "center",
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          <div />
          {TYPES.map((t) => (
            <div key={t} style={{ fontSize: 11, color: "var(--text-neutral-tertiary-default)", textAlign: "center" }}>{t}</div>
          ))}

          {VARIANTS.map((v) => (
            <div key={v} style={{ display: "contents" }}>
              <div style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)" }}>{v}</div>
              {TYPES.map((t) => (
                <div key={t}><Divider type={t} variant={v} /></div>
              ))}
            </div>
          ))}

          {VARIANTS.map((v) => (
            <div key={`${v}-inset`} style={{ display: "contents" }}>
              <div style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)" }}>{v} + inset</div>
              {TYPES.map((t) => (
                <div key={t}><Divider type={t} variant={v} inset /></div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Vertical matrix ────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Vertical</h2>

        <div
          style={{
            display: "flex",
            gap: 32,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
            minHeight: 120,
          }}
        >
          {TYPES.map((t) =>
            VARIANTS.map((v) => (
              <div key={`${t}-${v}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "var(--text-neutral-tertiary-default)", whiteSpace: "nowrap" }}>
                  {t} / {v}
                </span>
                <div style={{ flex: 1, display: "flex" }}>
                  <Divider type={t} variant={v} orientation="vertical" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Usage examples ─────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Usage</h2>

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
          <p style={{ fontSize: 13, color: "var(--text-neutral-secondary-default)", margin: 0 }}>
            List with inset dividers
          </p>
          <div style={{ background: "var(--surface-default)", borderRadius: 8, padding: "8px 0" }}>
            {["Inbox", "Drafts", "Sent", "Trash"].map((item, i, arr) => (
              <div key={item}>
                <div style={{ padding: "10px 16px", fontSize: 14, color: "var(--text-neutral-primary)" }}>{item}</div>
                {i < arr.length - 1 && <Divider inset />}
              </div>
            ))}
          </div>

          <p style={{ fontSize: 13, color: "var(--text-neutral-secondary-default)", margin: "8px 0 0" }}>
            Toolbar with vertical dividers
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--surface-default)",
              borderRadius: 8,
              padding: "8px 12px",
              height: 40,
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text-neutral-primary)" }}>Cut</span>
            <Divider orientation="vertical" padding />
            <span style={{ fontSize: 13, color: "var(--text-neutral-primary)" }}>Copy</span>
            <Divider orientation="vertical" padding />
            <span style={{ fontSize: 13, color: "var(--text-neutral-primary)" }}>Paste</span>
          </div>
        </div>
      </section>
    </div>
  );
}
