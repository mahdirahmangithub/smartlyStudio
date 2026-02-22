import { useState } from "react";
import {
  Badge,
  type BadgeSize,
  type BadgeType,
  type BadgeEmphasis,
} from "../components/Badge";
import { Icon } from "../components/Icon";

const TYPES: BadgeType[] = ["neutral", "brand", "info", "success", "warning", "alert"];
const SIZES: BadgeSize[] = ["sm", "md", "lg"];
const EMPHASES: BadgeEmphasis[] = ["low", "medium", "high"];

export default function BadgePlayground() {
  const [type, setType] = useState<BadgeType>("neutral");
  const [size, setSize] = useState<BadgeSize>("md");
  const [emphasis, setEmphasis] = useState<BadgeEmphasis>("medium");
  const [round, setRound] = useState(false);
  const [showLeading, setShowLeading] = useState(false);
  const [showTrailing, setShowTrailing] = useState(false);
  const [label, setLabel] = useState("12");

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

  const iconSize = size === "lg" ? 16 : 12;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Badge</h2>

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
              <select value={type} onChange={(e) => setType(e.target.value as BadgeType)} style={selectStyle}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as BadgeSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Emphasis</span>
              <select value={emphasis} onChange={(e) => setEmphasis(e.target.value as BadgeEmphasis)} style={selectStyle}>
                {EMPHASES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={round} onChange={(e) => setRound(e.target.checked)} />
              <span style={captionStyle}>Round</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={showLeading} onChange={(e) => setShowLeading(e.target.checked)} />
              <span style={captionStyle}>Leading Icon</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={showTrailing} onChange={(e) => setShowTrailing(e.target.checked)} />
              <span style={captionStyle}>Trailing Icon</span>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Label</span>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                style={{ ...selectStyle, width: 60 }}
              />
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
            <Badge
              variant={type}
              size={size}
              emphasis={emphasis}
              round={round}
              leadingIcon={showLeading ? <Icon name="favorite" size={iconSize} /> : undefined}
              trailingIcon={showTrailing ? <Icon name="favorite" size={iconSize} /> : undefined}
            >
              {label}
            </Badge>
          </div>

          <p style={{ ...captionStyle, margin: 0, textAlign: "center" }}>
            Typography: {/^\d+$/.test(label) ? "number/strong (auto-detected numeric)" : "label/strong (text)"}
          </p>
        </div>
      </section>

      {/* ── All types × emphases ───────────────────────────────────── */}
      {EMPHASES.map((emp) => (
        <section key={emp}>
          <h2 style={{ margin: "0 0 16px", textTransform: "capitalize" }}>{emp} Emphasis</h2>

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
                  <Badge key={s} variant={t} size={s} emphasis={emp}>12</Badge>
                ))}
                {SIZES.map((s) => (
                  <Badge key={`r-${s}`} variant={t} size={s} emphasis={emp} round>12</Badge>
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* ── Numeric vs Text ────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Numeric vs Text (auto-detected)</h2>

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
            <span style={captionStyle}>Numeric &quot;42&quot;</span>
            {SIZES.map((s) => (
              <Badge key={s} variant="brand" size={s} emphasis="medium">42</Badge>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Text &quot;New&quot;</span>
            {SIZES.map((s) => (
              <Badge key={s} variant="brand" size={s} emphasis="medium">New</Badge>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Mixed &quot;3+&quot;</span>
            {SIZES.map((s) => (
              <Badge key={s} variant="info" size={s} emphasis="medium">3+</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* ── With icons ─────────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>With Icons</h2>

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
            <span style={captionStyle}>Leading + Trailing</span>
            {SIZES.map((s) => (
              <Badge
                key={s}
                variant="brand"
                size={s}
                emphasis="medium"
                leadingIcon={<Icon name="favorite" size={s === "lg" ? 16 : 12} />}
                trailingIcon={<Icon name="favorite" size={s === "lg" ? 16 : 12} />}
              >
                5
              </Badge>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Leading only</span>
            {SIZES.map((s) => (
              <Badge
                key={s}
                variant="success"
                size={s}
                emphasis="high"
                leadingIcon={<Icon name="favorite" size={s === "lg" ? 16 : 12} />}
              >
                OK
              </Badge>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={captionStyle}>Trailing only</span>
            {SIZES.map((s) => (
              <Badge
                key={s}
                variant="alert"
                size={s}
                emphasis="high"
                round
                trailingIcon={<Icon name="favorite" size={s === "lg" ? 16 : 12} />}
              >
                99
              </Badge>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
