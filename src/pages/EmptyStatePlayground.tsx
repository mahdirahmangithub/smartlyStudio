import { useState, type CSSProperties } from "react";
import { EmptyState, type EmptyStateSize, type EmptyStateEmphasis } from "../components/EmptyState";
import type { IllustrationType } from "../components/Illustration";
import { Icon } from "../components/Icon";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const controlRow: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
  alignItems: "center",
  marginBottom: 16,
};
const labelStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 4, fontSize: 13 };

const ILLUSTRATION_TYPES: (IllustrationType | "none")[] = [
  "none",
  "all-done",
  "bolt",
  "idea",
  "lets-start",
  "no-result",
  "upgrade-now",
];

function ConfigurableDemo() {
  const [size, setSize] = useState<EmptyStateSize>("md");
  const [emphasis, setEmphasis] = useState<EmptyStateEmphasis>("high");
  const [illustrationType, setIllustrationType] = useState<IllustrationType | "none">("upgrade-now");
  const [title, setTitle] = useState("No results found");
  const [description, setDescription] = useState("Try adjusting your search or filters to find what you're looking for.");
  const [showDescription, setShowDescription] = useState(true);
  const [showPrimary, setShowPrimary] = useState(true);
  const [showSecondary, setShowSecondary] = useState(true);
  const [showDetail, setShowDetail] = useState(true);
  const [maxWidth, setMaxWidth] = useState("");

  return (
    <div>
      <div style={controlRow}>
        <label style={labelStyle}>
          Size:
          <select value={size} onChange={(e) => setSize(e.target.value as EmptyStateSize)}>
            <option value="sm">sm</option>
            <option value="md">md</option>
            <option value="lg">lg</option>
          </select>
        </label>
        <label style={labelStyle}>
          Emphasis:
          <select value={emphasis} onChange={(e) => setEmphasis(e.target.value as EmptyStateEmphasis)}>
            <option value="high">high</option>
            <option value="low">low</option>
          </select>
        </label>
        <label style={labelStyle}>
          Illustration:
          <select value={illustrationType} onChange={(e) => setIllustrationType(e.target.value as IllustrationType | "none")}>
            {ILLUSTRATION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Max Width:
          <input type="text" value={maxWidth} onChange={(e) => setMaxWidth(e.target.value)} placeholder="e.g. 400 or 50%" style={{ width: 100 }} />
        </label>
      </div>
      <div style={controlRow}>
        <label style={labelStyle}>
          <input type="checkbox" checked={showDescription} onChange={(e) => setShowDescription(e.target.checked)} />
          Description
        </label>
        <label style={labelStyle}>
          <input type="checkbox" checked={showPrimary} onChange={(e) => setShowPrimary(e.target.checked)} />
          Primary Action
        </label>
        <label style={labelStyle}>
          <input type="checkbox" checked={showSecondary} onChange={(e) => setShowSecondary(e.target.checked)} />
          Secondary Action
        </label>
        <label style={labelStyle}>
          <input type="checkbox" checked={showDetail} onChange={(e) => setShowDetail(e.target.checked)} />
          Detail Accordion
        </label>
      </div>
      <div style={controlRow}>
        <label style={labelStyle}>
          Title:
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: 200 }} />
        </label>
        <label style={labelStyle}>
          Description:
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: 300 }} />
        </label>
      </div>

      <div style={cardStyle}>
        <EmptyState
          size={size}
          emphasis={emphasis}
          illustration={illustrationType === "none" ? undefined : illustrationType}
          title={title}
          description={showDescription ? description : undefined}
          maxWidth={maxWidth ? (isNaN(Number(maxWidth)) ? maxWidth : Number(maxWidth)) : undefined}
          primaryAction={
            showPrimary
              ? {
                  label: "Go to Homepage",
                  icon: <Icon name="school" size={size === "sm" ? 16 : 20} />,
                  onClick: () => alert("Primary clicked"),
                }
              : undefined
          }
          secondaryAction={
            showSecondary
              ? {
                  label: "Browse Knowledge base",
                  icon: <Icon name="school" size={size === "sm" ? 16 : 20} />,
                  onClick: () => alert("Secondary clicked"),
                }
              : undefined
          }
          detail={
            showDetail
              ? {
                  children: (
                    <div style={{ padding: 16, color: "#666", fontSize: 14 }}>
                      <p>Error code: 404</p>
                      <p style={{ marginTop: 8 }}>The requested resource could not be found on this server. Please check the URL or contact support if the issue persists.</p>
                    </div>
                  ),
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}

export default function EmptyStatePlayground() {
  return (
    <>
      <h1>EmptyState</h1>

      <section style={sectionStyle}>
        <h2>Configurable</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle all props: size, emphasis, illustration, description, actions, and detail accordion.
        </p>
        <ConfigurableDemo />
      </section>
    </>
  );
}
