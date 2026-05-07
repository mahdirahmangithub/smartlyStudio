import { useState } from "react";
import { ScrollFade, type ScrollFadeSurface } from "@sds/components/ScrollFade";
import { Button } from "@sds/components/Button";

const BUTTONS = [
  "All", "Design", "Engineering", "Product", "Marketing", "Sales",
  "Analytics", "Research", "Operations", "Finance", "Legal", "Support",
  "HR", "Infrastructure", "Mobile", "Web", "API", "Data Science",
  "DevOps", "QA", "Security", "Growth", "Content", "Partnerships",
];

const MENU_ITEMS = Array.from({ length: 30 }, (_, i) => `Menu item ${i + 1}`);

const SURFACES: ScrollFadeSurface[] = ["auto", "default", "over", "under"];

const labelStyle: React.CSSProperties = {
  margin: "0 0 12px",
  fontFamily: "var(--type-label-strong-sm-family)",
  fontWeight: "var(--type-label-strong-sm-weight)" as never,
  fontSize: "var(--type-label-strong-sm-size)",
  color: "var(--text-neutral-primary)",
};

export default function ScrollFadePage() {
  const [surface, setSurface] = useState<ScrollFadeSurface>("auto");
  const [showChevrons, setShowChevrons] = useState(true);
  const [fadeSize, setFadeSize] = useState(40);

  return (
    <div className="playground">
      <div className="playground-layout">
        <div className="playground-controls" style={{ marginBottom: 24 }}>
          <div className="control-group">
            <label className="control-label">Surface</label>
            <div className="control-options">
              {SURFACES.map((s) => (
                <button
                  key={s}
                  className={`control-btn ${surface === s ? "active" : ""}`}
                  onClick={() => setSurface(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label className="control-label">Fade size (px)</label>
            <input
              type="range"
              min={16}
              max={80}
              value={fadeSize}
              onChange={(e) => setFadeSize(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <span style={{ fontSize: 12, opacity: 0.6 }}>{fadeSize}px</span>
          </div>

          <div className="control-group">
            <label className="control-toggle">
              <input
                type="checkbox"
                checked={showChevrons}
                onChange={(e) => setShowChevrons(e.target.checked)}
              />
              <span>Show chevrons</span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Horizontal: surface default ────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <h3 style={labelStyle}>Horizontal — surface: default</h3>
        <div
          style={{
            maxWidth: 480,
            background: "var(--element-surface-default)",
            borderRadius: "var(--radius-lg)",
            padding: "12px 0",
            border: "1px solid var(--element-outline-neutral-default)",
          }}
        >
          <ScrollFade
            direction="horizontal"
            surface={surface}
            fadeSize={fadeSize}
            showChevrons={showChevrons}
          >
            <div style={{ display: "flex", gap: 8, padding: "0 16px" }}>
              {BUTTONS.map((label) => (
                <Button key={label} size="sm" variant="neutral" emphasis="medium">
                  {label}
                </Button>
              ))}
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* ── Horizontal: surface over ───────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <h3 style={labelStyle}>Horizontal — surface: over</h3>
        <div
          style={{
            maxWidth: 480,
            background: "var(--element-surface-over)",
            borderRadius: "var(--radius-lg)",
            padding: "12px 0",
            border: "1px solid var(--element-outline-neutral-default)",
          }}
        >
          <ScrollFade
            direction="horizontal"
            surface={surface}
            fadeSize={fadeSize}
            showChevrons={showChevrons}
          >
            <div style={{ display: "flex", gap: 8, padding: "0 16px" }}>
              {BUTTONS.map((label) => (
                <Button key={label} size="sm" variant="neutral" emphasis="low">
                  {label}
                </Button>
              ))}
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* ── Horizontal: surface under ──────────────────────── */}
      <section style={{ marginBottom: 32 }}>
        <h3 style={labelStyle}>Horizontal — surface: under</h3>
        <div
          style={{
            maxWidth: 480,
            background: "var(--element-surface-under)",
            borderRadius: "var(--radius-lg)",
            padding: "12px 0",
            border: "1px solid var(--element-outline-neutral-default)",
          }}
        >
          <ScrollFade
            direction="horizontal"
            surface={surface}
            fadeSize={fadeSize}
            showChevrons={showChevrons}
          >
            <div style={{ display: "flex", gap: 8, padding: "0 16px" }}>
              {BUTTONS.map((label) => (
                <Button key={label} size="sm" variant="neutral" emphasis="medium">
                  {label}
                </Button>
              ))}
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* ── Vertical example ───────────────────────────────── */}
      <section>
        <h3 style={labelStyle}>Vertical — Menu list</h3>
        <div style={{ display: "flex", gap: 24 }}>
          {(["default", "over", "under"] as const).map((bg) => (
            <div
              key={bg}
              style={{
                width: 200,
                background: `var(--element-surface-${bg})`,
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--element-outline-neutral-default)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px 8px",
                  fontFamily: "var(--type-label-strong-sm-family)",
                  fontWeight: "var(--type-label-strong-sm-weight)" as never,
                  fontSize: "var(--type-label-strong-sm-size)",
                  color: "var(--text-neutral-secondary-default)",
                }}
              >
                {bg}
              </div>
              <ScrollFade
                direction="vertical"
                surface={surface}
                fadeSize={fadeSize}
                showChevrons={showChevrons}
                style={{ height: 200 }}
              >
                <div style={{ padding: "0 0 8px" }}>
                  {MENU_ITEMS.map((item) => (
                    <div
                      key={item}
                      style={{
                        padding: "8px 16px",
                        fontFamily: "var(--type-label-strong-xs-family)",
                        fontSize: "var(--type-label-strong-xs-size)",
                        color: "var(--text-neutral-primary)",
                        cursor: "pointer",
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </ScrollFade>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
