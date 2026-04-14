import { useState } from "react";
import { Avatar, type AvatarSize } from "../components/Avatar";

const SIZES: AvatarSize[] = ["xs", "sm", "md", "lg"];

const SAMPLE_NAMES = [
  "Alice Brown", "Bob Chen", "Clara Diaz", "Dan Evans",
  "Eva Fischer", "Frank Green", "Grace Hill", "Hiro Ito",
  "Ivy Jones", "Jack Kim", "Kara Li", "Leo Mora",
  "Mia Nash", "Noah Park", "Olivia Quinn", "Paul Reed",
  "Quinn Scott", "Ruby Tang",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const SAMPLE_IMG = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop";

export default function AvatarPlayground() {
  const [size, setSize] = useState<AvatarSize>("lg");
  const [round, setRound] = useState(false);
  const [statusOn, setStatusOn] = useState(true);
  const [mode, setMode] = useState<"image" | "initials" | "icon">("initials");

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Avatar</h2>

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
              <select value={size} onChange={(e) => setSize(e.target.value as AvatarSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Mode</span>
              <select value={mode} onChange={(e) => setMode(e.target.value as "image" | "initials" | "icon")} style={selectStyle}>
                <option value="image">image</option>
                <option value="initials">initials</option>
                <option value="icon">icon</option>
              </select>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={round} onChange={(e) => setRound(e.target.checked)} />
              <span style={captionStyle}>Round</span>
            </label>

            <label style={labelStyle}>
              <input type="checkbox" checked={statusOn} onChange={(e) => setStatusOn(e.target.checked)} />
              <span style={captionStyle}>Status</span>
            </label>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              padding: 32,
              background: "var(--element-surface-default)",
              borderRadius: 8,
            }}
          >
            {SIZES.map((s) => (
              <Avatar
                key={s}
                size={s}
                round={round}
                status={statusOn}
                alt="User avatar"
                {...(mode === "image"
                  ? { src: SAMPLE_IMG }
                  : mode === "initials"
                    ? { initials: "ES" }
                    : {})}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Size × Shape grid ──────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Sizes &amp; Shapes</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto repeat(4, 1fr)",
            gap: 16,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <span />
          {SIZES.map((s) => <span key={s} style={{ ...captionStyle, textAlign: "center" }}>{s}</span>)}

          <span style={captionStyle}>Square / Image</span>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", justifyContent: "center" }}>
              <Avatar size={s} src={SAMPLE_IMG} alt="User" status />
            </div>
          ))}

          <span style={captionStyle}>Round / Image</span>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", justifyContent: "center" }}>
              <Avatar size={s} src={SAMPLE_IMG} alt="User" round status />
            </div>
          ))}

          <span style={captionStyle}>Square / Initials</span>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", justifyContent: "center" }}>
              <Avatar size={s} initials="ES" alt="Emily Smith" status />
            </div>
          ))}

          <span style={captionStyle}>Round / Initials</span>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", justifyContent: "center" }}>
              <Avatar size={s} initials="ES" alt="Emily Smith" round status />
            </div>
          ))}

          <span style={captionStyle}>Square / Icon</span>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", justifyContent: "center" }}>
              <Avatar size={s} alt="Default user" status />
            </div>
          ))}

          <span style={captionStyle}>Round / Icon</span>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", justifyContent: "center" }}>
              <Avatar size={s} alt="Default user" round status />
            </div>
          ))}
        </div>
      </section>

      {/* ── Random color demo ──────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Deterministic Random Colors</h2>
        <p style={{ ...captionStyle, margin: "0 0 12px" }}>
          Each name gets a deterministic color from the primitive palette with automatic contrast-aware text color.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {SAMPLE_NAMES.map((name) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Avatar
                size="lg"
                round
                initials={getInitials(name)}
                alt={name}
                colorSeed={name}
              />
              <span style={{ ...captionStyle, fontSize: 10, maxWidth: 56, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
