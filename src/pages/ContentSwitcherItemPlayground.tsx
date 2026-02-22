import { useState } from "react";
import {
  ContentSwitcherItem,
  type ContentSwitcherItemSize,
  type ContentSwitcherItemEmphasis,
} from "../components/ContentSwitcherItem";
import { Icon } from "../components/Icon";

const SIZES: ContentSwitcherItemSize[] = ["sm", "md", "lg"];
const EMPHASES: ContentSwitcherItemEmphasis[] = ["high", "low"];

export default function ContentSwitcherItemPlayground() {
  const [size, setSize] = useState<ContentSwitcherItemSize>("md");
  const [emphasis, setEmphasis] = useState<ContentSwitcherItemEmphasis>("high");
  const [checked, setChecked] = useState(false);
  const [withIcon, setWithIcon] = useState(true);
  const [disabledState, setDisabledState] = useState(false);

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

  const iconForSize = (s: ContentSwitcherItemSize) => (
    <Icon name="favorite_fill" size={s === "lg" ? 20 : 16} type="monochrome" />
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>ContentSwitcherItem</h2>

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
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as ContentSwitcherItemSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Emphasis</span>
              <select value={emphasis} onChange={(e) => setEmphasis(e.target.value as ContentSwitcherItemEmphasis)} style={selectStyle}>
                {EMPHASES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              <span style={captionStyle}>Checked</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={withIcon} onChange={(e) => setWithIcon(e.target.checked)} />
              <span style={captionStyle}>Leading icon</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={disabledState} onChange={(e) => setDisabledState(e.target.checked)} />
              <span style={captionStyle}>Disabled</span>
            </label>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: 32,
              background: "var(--element-surface-default)",
              borderRadius: 8,
            }}
          >
            <ContentSwitcherItem
              size={size}
              emphasis={emphasis}
              checked={checked}
              disabled={disabledState}
              leadingIcon={withIcon ? iconForSize(size) : undefined}
              onClick={() => setChecked(!checked)}
            >
              Label
            </ContentSwitcherItem>
          </div>
        </div>
      </section>

      {/* ── All States grid ────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>States &amp; Sizes</h2>

        {EMPHASES.map((emp) => (
          <div key={emp} style={{ marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500 }}>
              emphasis=&quot;{emp}&quot;
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto repeat(3, 1fr)",
                gap: 12,
                padding: 24,
                border: "1px solid var(--element-outline-neutral-subtlest)",
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <span />
              {SIZES.map((s) => (
                <span key={s} style={{ ...captionStyle, textAlign: "center" }}>{s}</span>
              ))}

              <span style={captionStyle}>Normal</span>
              {SIZES.map((s) => (
                <div key={s} style={{ display: "flex", justifyContent: "center" }}>
                  <ContentSwitcherItem size={s} emphasis={emp} leadingIcon={iconForSize(s)}>
                    Label
                  </ContentSwitcherItem>
                </div>
              ))}

              <span style={captionStyle}>Checked</span>
              {SIZES.map((s) => (
                <div key={s} style={{ display: "flex", justifyContent: "center" }}>
                  <ContentSwitcherItem size={s} emphasis={emp} checked leadingIcon={iconForSize(s)}>
                    Label
                  </ContentSwitcherItem>
                </div>
              ))}

              <span style={captionStyle}>Disabled</span>
              {SIZES.map((s) => (
                <div key={s} style={{ display: "flex", justifyContent: "center" }}>
                  <ContentSwitcherItem size={s} emphasis={emp} disabled leadingIcon={iconForSize(s)}>
                    Label
                  </ContentSwitcherItem>
                </div>
              ))}

              <span style={captionStyle}>Icon only</span>
              {SIZES.map((s) => (
                <div key={s} style={{ display: "flex", justifyContent: "center" }}>
                  <ContentSwitcherItem size={s} emphasis={emp} leadingIcon={iconForSize(s)} />
                </div>
              ))}

              <span style={captionStyle}>Label only</span>
              {SIZES.map((s) => (
                <div key={s} style={{ display: "flex", justifyContent: "center" }}>
                  <ContentSwitcherItem size={s} emphasis={emp}>
                    Label
                  </ContentSwitcherItem>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
