import { Thumbnail, type ThumbnailSize, type ThumbnailType } from "../components/Thumbnail";

const SIZES: ThumbnailSize[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
const TYPES: ThumbnailType[] = ["media", "icon", "text"];

const SAMPLE_IMG =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop";

const captionStyle = {
  fontSize: 12,
  color: "var(--text-neutral-secondary-default)",
} as const;

const sectionStyle = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
} as const;

export default function ThumbnailPlayground() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2 style={{ margin: 0 }}>Thumbnail</h2>

      {/* ── All sizes × types ─────────────────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>Sizes &times; Types</h3>
        <div style={sectionStyle}>
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th />
                {TYPES.map((t) => (
                  <th key={t} style={{ ...captionStyle, padding: "0 16px 8px", textAlign: "center" }}>
                    {t}
                  </th>
                ))}
                <th style={{ ...captionStyle, padding: "0 16px 8px", textAlign: "center" }}>
                  error
                </th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s) => (
                <tr key={s}>
                  <td style={{ ...captionStyle, paddingRight: 16, textAlign: "right" }}>{s}</td>
                  <td style={{ padding: 8, textAlign: "center" }}>
                    <Thumbnail size={s} type="media" src={SAMPLE_IMG} alt="Landscape" />
                  </td>
                  <td style={{ padding: 8, textAlign: "center" }}>
                    <Thumbnail size={s} type="icon" />
                  </td>
                  <td style={{ padding: 8, textAlign: "center" }}>
                    <Thumbnail size={s} type="text" text="+7" />
                  </td>
                  <td style={{ padding: 8, textAlign: "center" }}>
                    <Thumbnail size={s} type="icon" error />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Loading state ─────────────────────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>Loading</h3>
        <div style={{ ...sectionStyle, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Thumbnail size={s} type="media" src={SAMPLE_IMG} alt="" loading />
              <span style={captionStyle}>{s}</span>
            </div>
          ))}
          {SIZES.map((s) => (
            <div key={`icon-${s}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Thumbnail size={s} type="icon" loading />
              <span style={captionStyle}>{s} icon</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Video badge ───────────────────────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>Video Badge</h3>
        <div style={{ ...sectionStyle, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Thumbnail size={s} type="media" src={SAMPLE_IMG} alt="" video />
              <span style={captionStyle}>{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Error state ───────────────────────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>Error</h3>
        <div style={{ ...sectionStyle, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
          {SIZES.map((s) => (
            <div key={`icon-${s}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Thumbnail size={s} type="icon" error />
              <span style={captionStyle}>{s} icon</span>
            </div>
          ))}
          {SIZES.map((s) => (
            <div key={`text-${s}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Thumbnail size={s} type="text" text="+3" error />
              <span style={captionStyle}>{s} text</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
