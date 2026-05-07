import { useState } from "react";
import {
  NotificationBadge,
  type NotificationBadgeSize,
  type NotificationBadgeType,
  type NotificationBadgeEmphasis,
  type NotificationBadgeSurface,
} from "@sds/components/NotificationBadge";
import { Icon } from "@sds/components/Icon";

const TYPES: NotificationBadgeType[] = [
  "neutral",
  "brand",
  "info",
  "success",
  "warning",
  "alert",
];
const SIZES: NotificationBadgeSize[] = ["xs", "sm", "md", "lg"];
const EMPHASES: NotificationBadgeEmphasis[] = ["medium", "high"];

export default function NotificationBadgePlayground() {
  const [type, setType] = useState<NotificationBadgeType>("brand");
  const [size, setSize] = useState<NotificationBadgeSize>("md");
  const [emphasis, setEmphasis] = useState<NotificationBadgeEmphasis>("high");
  const [outline, setOutline] = useState(true);
  const [surface, setSurface] = useState<NotificationBadgeSurface>("auto");
  const [contentMode, setContentMode] = useState<"none" | "icon" | "text">("text");

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

  const iconSize = size === "lg" ? 16 : 12;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>NotificationBadge</h2>

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
              <select value={type} onChange={(e) => setType(e.target.value as NotificationBadgeType)} style={selectStyle}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as NotificationBadgeSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Emphasis</span>
              <select value={emphasis} onChange={(e) => setEmphasis(e.target.value as NotificationBadgeEmphasis)} style={selectStyle}>
                {EMPHASES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Content</span>
              <select value={contentMode} onChange={(e) => setContentMode(e.target.value as "none" | "icon" | "text")} style={selectStyle}>
                <option value="none">none (dot)</option>
                <option value="icon">icon</option>
                <option value="text">text</option>
              </select>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={outline} onChange={(e) => setOutline(e.target.checked)} />
              <span style={captionStyle}>Outline</span>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Surface</span>
              <select value={surface} onChange={(e) => setSurface(e.target.value as NotificationBadgeSurface)} style={selectStyle}>
                <option value="auto">auto</option>
                <option value="default">default</option>
                <option value="over">over</option>
                <option value="under">under</option>
              </select>
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
            <NotificationBadge
              variant={type}
              size={size}
              emphasis={emphasis}
              outline={outline}
              surface={surface}
              icon={contentMode === "icon" ? <Icon name="favorite" size={iconSize} /> : undefined}
            >
              {contentMode === "text" ? "2" : undefined}
            </NotificationBadge>
          </div>
        </div>
      </section>

      {/* ── Outline surface detection demo ─────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Outline Surface Detection</h2>
        <p style={{ ...captionStyle, margin: "0 0 12px" }}>
          The outline automatically detects the parent surface color and matches it,
          creating a visual gap when the badge overlays content.
        </p>

        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          {(["default", "over", "under"] as const).map((surf) => (
            <div
              key={surf}
              style={{
                flex: "1 1 200px",
                padding: 32,
                borderRadius: 12,
                background: `var(${surf === "default" ? "--element-surface-default" : surf === "over" ? "--element-surface-over" : "--element-surface-under"})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                border: "1px solid var(--element-outline-neutral-subtlest)",
              }}
            >
              <span style={captionStyle}>surface-{surf}</span>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {TYPES.map((t) => (
                  <NotificationBadge key={t} variant={t} size="lg" emphasis="high" outline>
                    2
                  </NotificationBadge>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {TYPES.map((t) => (
                  <NotificationBadge key={t} variant={t} size="md" emphasis="high" outline icon={<Icon name="favorite" size={12} />} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {TYPES.map((t) => (
                  <NotificationBadge key={t} variant={t} size="sm" emphasis="high" outline />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── All types × emphases — dot (none) ──────────────────────── */}
      {EMPHASES.map((emp) => (
        <section key={`dot-${emp}`}>
          <h2 style={{ margin: "0 0 16px", textTransform: "capitalize" }}>
            Dot — {emp} Emphasis
          </h2>

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
                  <NotificationBadge key={s} variant={t} size={s} emphasis={emp} />
                ))}
                <span style={{ fontSize: 10, color: "var(--text-neutral-secondary-default)", marginLeft: 8 }}>with outline:</span>
                {SIZES.map((s) => (
                  <NotificationBadge key={`o-${s}`} variant={t} size={s} emphasis={emp} outline />
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* ── All types × emphases — icon ────────────────────────────── */}
      {EMPHASES.map((emp) => (
        <section key={`icon-${emp}`}>
          <h2 style={{ margin: "0 0 16px", textTransform: "capitalize" }}>
            Icon — {emp} Emphasis
          </h2>

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
                {(["sm", "md", "lg"] as const).map((s) => (
                  <NotificationBadge key={s} variant={t} size={s} emphasis={emp} icon={<Icon name="favorite" size={s === "lg" ? 16 : 12} />} />
                ))}
                {(["sm", "md", "lg"] as const).map((s) => (
                  <NotificationBadge key={`o-${s}`} variant={t} size={s} emphasis={emp} outline icon={<Icon name="favorite" size={s === "lg" ? 16 : 12} />} />
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* ── All types × emphases — text ────────────────────────────── */}
      {EMPHASES.map((emp) => (
        <section key={`text-${emp}`}>
          <h2 style={{ margin: "0 0 16px", textTransform: "capitalize" }}>
            Text — {emp} Emphasis
          </h2>

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
                {(["sm", "md", "lg"] as const).map((s) => (
                  <NotificationBadge key={s} variant={t} size={s} emphasis={emp}>2</NotificationBadge>
                ))}
                {(["sm", "md", "lg"] as const).map((s) => (
                  <NotificationBadge key={`o-${s}`} variant={t} size={s} emphasis={emp} outline>2</NotificationBadge>
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
