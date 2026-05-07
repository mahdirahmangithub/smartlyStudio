import { useState } from "react";
import { AiLogoLoading } from "@sds/components/AnimatedIcons";

const captionStyle = {
  fontSize: 12,
  color: "var(--text-neutral-secondary-default)",
} as const;

const sectionStyle = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
} as const;

const PRESET_SIZES = [
  { label: "16", value: 16 },
  { label: "20", value: 20 },
  { label: "24", value: 24 },
  { label: "32", value: 32 },
  { label: "40", value: 40 },
  { label: "64", value: 64 },
  { label: "128", value: 128 },
];

const SPEEDS = [
  { label: "0.25×", value: 0.25 },
  { label: "0.5×", value: 0.5 },
  { label: "1×", value: 1 },
  { label: "1.5×", value: 1.5 },
  { label: "2×", value: 2 },
];

export default function AnimatedIconsPlayground() {
  const [active, setActive] = useState(true);
  const [speed, setSpeed] = useState(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2 style={{ margin: 0 }}>Animated Icons</h2>

      {/* ── AiLogoLoading — sizes ──────────────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>AiLogoLoading — Sizes</h3>
        <div style={sectionStyle}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-end" }}>
            {PRESET_SIZES.map((s) => (
              <div
                key={s.value}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
              >
                <AiLogoLoading size={s.value} active={active} speed={speed} />
                <span style={captionStyle}>{s.label}px</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Controls ─────────────────────────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>Controls</h3>
        <div style={{ ...sectionStyle, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={captionStyle}>Active</span>
            <button
              onClick={() => setActive((a) => !a)}
              style={{
                fontSize: 12,
                padding: "4px 14px",
                borderRadius: 6,
                border: "1px solid var(--element-outline-neutral-subtlest)",
                background: active ? "var(--element-surface-brand-default)" : "var(--element-surface-over)",
                color: active ? "#fff" : "inherit",
                cursor: "pointer",
              }}
            >
              {active ? "Playing" : "Paused"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={captionStyle}>Speed</span>
            <div style={{ display: "flex", gap: 6 }}>
              {SPEEDS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSpeed(s.value)}
                  style={{
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 4,
                    border: "1px solid var(--element-outline-neutral-subtlest)",
                    background:
                      speed === s.value
                        ? "var(--element-surface-brand-default)"
                        : "var(--element-surface-over)",
                    color: speed === s.value ? "#fff" : "inherit",
                    cursor: "pointer",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Color ────────────────────────────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>AiLogoLoading — Custom Color</h3>
        <div style={{ ...sectionStyle, display: "flex", gap: 40, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <AiLogoLoading size={40} active={active} speed={speed} />
            <span style={captionStyle}>inherited (currentColor)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <AiLogoLoading size={40} active={active} speed={speed} color="var(--text-brand-default)" />
            <span style={captionStyle}>brand</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <AiLogoLoading size={40} active={active} speed={speed} color="#e53e3e" />
            <span style={captionStyle}>#e53e3e</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <AiLogoLoading size={40} active={active} speed={speed} color="#38a169" />
            <span style={captionStyle}>#38a169</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              background: "var(--util-subtle-strongest)",
              padding: 16,
              borderRadius: 8,
            }}
          >
            <AiLogoLoading size={40} active={active} speed={speed} color="#fff" />
            <span style={{ ...captionStyle, color: "rgba(255,255,255,.7)" }}>inverse</span>
          </div>
        </div>
      </section>

      {/* ── Static vs Active ─────────────────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>Static vs Active</h3>
        <div style={{ ...sectionStyle, display: "flex", gap: 40, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <AiLogoLoading size={48} active={false} />
            <span style={captionStyle}>active=false</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <AiLogoLoading size={48} active />
            <span style={captionStyle}>active=true</span>
          </div>
        </div>
      </section>
    </div>
  );
}
