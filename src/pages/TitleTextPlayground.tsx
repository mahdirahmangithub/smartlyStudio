import { useState } from "react";
import { TitleText, type TitleTextSize } from "../components/TitleText";
import { Icon } from "../components/Icon";

const SIZES: TitleTextSize[] = ["xl", "lg", "md", "sm", "xs", "2xs"];

const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;
const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
const labelCtrlStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
const sectionCard = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
} as const;

const ICON_SIZES: Record<TitleTextSize, number> = {
  xl: 24,
  lg: 24,
  md: 24,
  sm: 20,
  xs: 16,
  "2xs": 14,
};

export default function TitleTextPlayground() {
  const [size, setSize] = useState<TitleTextSize>("lg");
  const [showIcon, setShowIcon] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [titleText, setTitleText] = useState("Title");
  const [descText, setDescText] = useState("Description");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ─────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>TitleText</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as TitleTextSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={showIcon} onChange={(e) => setShowIcon(e.target.checked)} />
              <span style={captionStyle}>Leading icon</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={showDescription} onChange={(e) => setShowDescription(e.target.checked)} />
              <span style={captionStyle}>Description</span>
            </label>

            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Title</span>
              <input type="text" value={titleText} onChange={(e) => setTitleText(e.target.value)} style={{ ...selectStyle, width: 160 }} />
            </label>

            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Description</span>
              <input type="text" value={descText} onChange={(e) => setDescText(e.target.value)} style={{ ...selectStyle, width: 200 }} />
            </label>
          </div>

          <div style={{ maxWidth: 480 }}>
            <TitleText
              size={size}
              title={titleText}
              description={showDescription ? descText : undefined}
              leadingIcon={showIcon ? <Icon name="favorite_fill" size={ICON_SIZES[size]} /> : undefined}
            />
          </div>
        </div>
      </section>

      {/* ── All sizes ─────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>All Sizes</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 24 }}>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={captionStyle}>{s}</span>
              <TitleText
                size={s}
                title="Title"
                description="Description"
                leadingIcon={<Icon name="favorite_fill" size={ICON_SIZES[s]} />}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Without icon ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Without Icon</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 24 }}>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={captionStyle}>{s}</span>
              <TitleText
                size={s}
                title="Title"
                description="Description"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Title only (no description) ───────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Title Only</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 24 }}>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={captionStyle}>{s}</span>
              <TitleText
                size={s}
                title="Title"
                leadingIcon={<Icon name="favorite_fill" size={ICON_SIZES[s]} />}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Long text truncation ──────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Truncation</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ maxWidth: 280 }}>
            <span style={captionStyle}>lg — 280px container</span>
            <TitleText
              size="lg"
              title="This is a very long title that should truncate with an ellipsis"
              description="This description can wrap to multiple lines because it uses pre-wrap for whitespace handling."
              leadingIcon={<Icon name="favorite_fill" size={24} />}
            />
          </div>
          <div style={{ maxWidth: 200 }}>
            <span style={captionStyle}>sm — 200px container</span>
            <TitleText
              size="sm"
              title="Another very long title that truncates"
              description="Short description."
              leadingIcon={<Icon name="favorite_fill" size={20} />}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
