import { useState } from "react";
import {
  ExpandableBadge,
  type ExpandableBadgeSize,
  type ExpandableBadgeType,
  type ExpandableBadgeSurface,
} from "@sds/components/ExpandableBadge";

const TYPES: ExpandableBadgeType[] = ["brand", "info", "success", "warning", "alert"];
const SIZES: ExpandableBadgeSize[] = ["sm", "md", "lg"];

export default function ExpandableBadgePlayground() {
  const [type, setType] = useState<ExpandableBadgeType>("brand");
  const [size, setSize] = useState<ExpandableBadgeSize>("md");
  const [outlineOn, setOutlineOn] = useState(true);
  const [surface, setSurface] = useState<ExpandableBadgeSurface>("auto");
  const [label, setLabel] = useState("New");
  const [manualExpanded, setManualExpanded] = useState(false);

  const [hoverStates, setHoverStates] = useState<Record<string, boolean>>({});
  const hover = (key: string, val: boolean) =>
    setHoverStates((prev) => ({ ...prev, [key]: val }));

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>ExpandableBadge</h2>

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
              <select value={type} onChange={(e) => setType(e.target.value as ExpandableBadgeType)} style={selectStyle}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as ExpandableBadgeSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={outlineOn} onChange={(e) => setOutlineOn(e.target.checked)} />
              <span style={captionStyle}>Outline</span>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Surface</span>
              <select value={surface} onChange={(e) => setSurface(e.target.value as ExpandableBadgeSurface)} style={selectStyle}>
                <option value="auto">auto</option>
                <option value="default">default</option>
                <option value="over">over</option>
                <option value="under">under</option>
              </select>
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

            <label style={labelStyle}>
              <input type="checkbox" checked={manualExpanded} onChange={(e) => setManualExpanded(e.target.checked)} />
              <span style={captionStyle}>Expanded</span>
            </label>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: 32,
              height: 80,
              boxSizing: "border-box",
              background: "var(--element-surface-default)",
              borderRadius: 8,
            }}
          >
            <ExpandableBadge
              variant={type}
              size={size}
              expanded={manualExpanded}
              outline={outlineOn}
              surface={surface}
            >
              {label}
            </ExpandableBadge>
          </div>

          <p style={{ ...captionStyle, margin: 0, textAlign: "center" }}>
            Toggle the "Expanded" checkbox to see the animation
          </p>
        </div>
      </section>

      {/* ── Hover to expand demo ───────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Hover to Expand</h2>
        <p style={{ ...captionStyle, margin: "0 0 12px" }}>
          Hover over each badge or the container around it to trigger the expand animation.
        </p>

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
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)", width: 64, flexShrink: 0 }}>{t}</span>
              {SIZES.map((s) => {
                const key = `${t}-${s}`;
                return (
                  <div
                    key={key}
                    onMouseEnter={() => hover(key, true)}
                    onMouseLeave={() => hover(key, false)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      width: 80,
                      height: 40,
                      boxSizing: "border-box",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--element-outline-neutral-subtlest)",
                      cursor: "default",
                    }}
                  >
                    <ExpandableBadge
                      variant={t}
                      size={s}
                      expanded={!!hoverStates[key]}
                      outline
                    >
                      New
                    </ExpandableBadge>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      {/* ── Connected trigger demo ─────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Connected Trigger</h2>
        <p style={{ ...captionStyle, margin: "0 0 12px" }}>
          Hover over the button to expand the badge — demonstrates how an external element controls the badge.
        </p>

        <div
          style={{
            display: "flex",
            gap: 24,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {TYPES.map((t) => {
            const key = `trigger-${t}`;
            return (
              <div
                key={t}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
              >
                <div style={{ position: "relative", display: "inline-flex" }}>
                  <div
                    onMouseEnter={() => hover(key, true)}
                    onMouseLeave={() => hover(key, false)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: "var(--element-fill-neutral-tertiary-default)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "default",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>★</span>
                  </div>
                  <span style={{ position: "absolute", top: -4, right: -4 }}>
                    <ExpandableBadge
                      variant={t}
                      size="sm"
                      expanded={!!hoverStates[key]}
                      outline
                    >
                      New
                    </ExpandableBadge>
                  </span>
                </div>
                <span style={captionStyle}>{t}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Surface detection demo ─────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Outline Surface Detection</h2>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {(["default", "over", "under"] as const).map((surf) => {
            const key = `surf-${surf}`;
            return (
              <div
                key={surf}
                onMouseEnter={() => hover(key, true)}
                onMouseLeave={() => hover(key, false)}
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
                  cursor: "default",
                }}
              >
                <span style={captionStyle}>surface-{surf}</span>
                <div style={{ display: "flex", gap: 12, alignItems: "center", width: 400, height: 28 }}>
                  {TYPES.map((t) => (
                    <ExpandableBadge
                      key={t}
                      variant={t}
                      size="md"
                      expanded={!!hoverStates[key]}
                      outline
                    >
                      New
                    </ExpandableBadge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
