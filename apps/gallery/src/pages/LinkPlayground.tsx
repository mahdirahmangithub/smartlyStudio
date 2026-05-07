import { useState } from "react";
import { Link, type LinkSize, type LinkType } from "@sds/components/Link";
import { BodyText } from "@sds/components/BodyText";

const SIZES: LinkSize[] = ["lg", "md", "sm"];
const TYPES: LinkType[] = ["neutral", "brand"];

const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;
const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
const labelCtrlStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
const sectionCard = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
} as const;

export default function LinkPlayground() {
  const [size, setSize] = useState<LinkSize>("lg");
  const [type, setType] = useState<LinkType>("neutral");
  const [strong, setStrong] = useState(false);
  const [showIcon, setShowIcon] = useState(true);
  const [external, setExternal] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [text, setText] = useState("Link");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ─────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Link</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as LinkSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Type</span>
              <select value={type} onChange={(e) => setType(e.target.value as LinkType)} style={selectStyle}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={strong} onChange={(e) => setStrong(e.target.checked)} />
              <span style={captionStyle}>Strong</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={showIcon} onChange={(e) => setShowIcon(e.target.checked)} />
              <span style={captionStyle}>Icon</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={external} onChange={(e) => setExternal(e.target.checked)} />
              <span style={captionStyle}>External</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              <span style={captionStyle}>Disabled</span>
            </label>

            <label style={labelCtrlStyle}>
              <input type="checkbox" checked={underline} onChange={(e) => setUnderline(e.target.checked)} />
              <span style={captionStyle}>Underline</span>
            </label>

            <label style={labelCtrlStyle}>
              <span style={captionStyle}>Text</span>
              <input type="text" value={text} onChange={(e) => setText(e.target.value)} style={{ ...selectStyle, width: 140 }} />
            </label>
          </div>

          <div>
            <Link
              href="https://example.com"
              size={size}
              type={type}
              strong={strong}
              icon={showIcon}
              external={external}
              disabled={disabled}
              underline={underline}
            >
              {text}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Size × type matrix ────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Size &times; Type</h2>

        <div style={{ ...sectionCard, display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: "16px 32px", alignItems: "center" }}>
          <span />
          <span style={captionStyle}>neutral</span>
          <span style={captionStyle}>brand</span>
          <span style={captionStyle}>disabled</span>

          {SIZES.map((s) => (
            <>
              <span key={`${s}-label`} style={captionStyle}>{s}</span>
              <Link key={`${s}-neutral`} href="#" size={s} icon>Link</Link>
              <Link key={`${s}-brand`} href="#" size={s} type="brand" icon>Link</Link>
              <Link key={`${s}-disabled`} href="#" size={s} icon disabled>Link</Link>
            </>
          ))}
        </div>
      </section>

      {/* ── Strong variants ───────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Strong Weight</h2>

        <div style={{ ...sectionCard, display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: "16px 32px", alignItems: "center" }}>
          <span />
          <span style={captionStyle}>neutral strong</span>
          <span style={captionStyle}>brand strong</span>
          <span style={captionStyle}>disabled strong</span>

          {SIZES.map((s) => (
            <>
              <span key={`${s}-label`} style={captionStyle}>{s}</span>
              <Link key={`${s}-neutral`} href="#" size={s} strong icon>Link</Link>
              <Link key={`${s}-brand`} href="#" size={s} type="brand" strong icon>Link</Link>
              <Link key={`${s}-disabled`} href="#" size={s} strong icon disabled>Link</Link>
            </>
          ))}
        </div>
      </section>

      {/* ── Inline usage ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Inline within Text</h2>

        <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 16 }}>
          <BodyText size="lg">
            Here is a paragraph with an{" "}
            <Link href="https://example.com" inline type="brand" external>
              inline brand link
            </Link>{" "}
            that opens in a new tab and inherits the surrounding text size.
          </BodyText>

          <BodyText size="md">
            A smaller paragraph with a{" "}
            <Link href="#" inline strong>
              strong neutral link
            </Link>{" "}
            that stays on the same page and blends naturally into the text flow.
          </BodyText>

          <BodyText size="sm" emphasis="medium">
            Even at small body text, an{" "}
            <Link href="https://example.com" inline type="brand" icon>
              inline link with icon
            </Link>{" "}
            aligns properly with the surrounding text.
          </BodyText>
        </div>
      </section>
    </div>
  );
}
