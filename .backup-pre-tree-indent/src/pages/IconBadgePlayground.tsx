import { useState } from "react";
import {
  IconBadge,
  type IconBadgeSize,
  type IconBadgeType,
  type IconBadgeEmphasis,
} from "../components/IconBadge";
import { Icon } from "../components/Icon";

const TYPES: IconBadgeType[] = ["neutral", "brand", "info", "success", "warning", "alert"];
const SIZES: IconBadgeSize[] = ["sm", "md", "lg"];
const EMPHASES: IconBadgeEmphasis[] = ["low", "medium", "high"];

export default function IconBadgePlayground() {
  const [type, setType] = useState<IconBadgeType>("neutral");
  const [size, setSize] = useState<IconBadgeSize>("md");
  const [emphasis, setEmphasis] = useState<IconBadgeEmphasis>("medium");
  const [round, setRound] = useState(false);

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

  const iconSize = size === "lg" ? 16 : 12;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>IconBadge</h2>

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
              <select value={type} onChange={(e) => setType(e.target.value as IconBadgeType)} style={selectStyle}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as IconBadgeSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Emphasis</span>
              <select value={emphasis} onChange={(e) => setEmphasis(e.target.value as IconBadgeEmphasis)} style={selectStyle}>
                {EMPHASES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={round} onChange={(e) => setRound(e.target.checked)} />
              <span style={captionStyle}>Round</span>
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
            <IconBadge variant={type} size={size} emphasis={emphasis} round={round}>
              <Icon name="favorite" size={iconSize} />
            </IconBadge>
          </div>
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
                  <IconBadge key={s} variant={t} size={s} emphasis={emp}>
                    <Icon name="favorite" size={s === "lg" ? 16 : 12} />
                  </IconBadge>
                ))}
                {SIZES.map((s) => (
                  <IconBadge key={`r-${s}`} variant={t} size={s} emphasis={emp} round>
                    <Icon name="favorite" size={s === "lg" ? 16 : 12} />
                  </IconBadge>
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* ── Different icons ──────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Various Icons</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {(["favorite", "star", "add", "edit", "delete", "settings"] as const).map((icon) => (
            <IconBadge key={icon} variant="brand" size="lg" emphasis="medium" round>
              <Icon name={icon} size={16} />
            </IconBadge>
          ))}
        </div>
      </section>
    </div>
  );
}
