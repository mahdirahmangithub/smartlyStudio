import { useState, type CSSProperties } from "react";
import {
  Illustration,
  type IllustrationType,
  type IllustrationSize,
} from "../components/Illustration";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

const TYPES: IllustrationType[] = ["all-done", "bolt", "idea", "lets-start", "no-result", "upgrade-now"];

export default function IllustrationPlayground() {
  const [size, setSize] = useState<IllustrationSize>("sm");

  return (
    <>
      <h1>Illustration</h1>

      <div style={{ marginBottom: 24 }}>
        <label>
          Size:{" "}
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as IllustrationSize)}
            style={{ marginLeft: 4 }}
          >
            <option value="sm">sm (80×80)</option>
            <option value="lg">lg (140×140)</option>
          </select>
        </label>
      </div>

      <section style={sectionStyle}>
        <h2>All Types</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          All available illustration types at the selected size.
        </p>
        <div style={cardStyle}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
            {TYPES.map((type) => (
              <div key={type} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Illustration type={type} size={size} />
                <span style={{ fontSize: 12, opacity: 0.6 }}>{type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
