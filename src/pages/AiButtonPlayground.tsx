import { type CSSProperties } from "react";
import { AiButton } from "../components/AiButton";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { Icon } from "../components/Icon";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = { border: "1px solid #ddd", borderRadius: 8, padding: 16, marginTop: 12 };
const rowStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" };

export default function AiButtonPlayground() {
  return (
    <>
      <h1>AI Button</h1>

      <section style={sectionStyle}>
        <h2>Text button — low emphasis</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>All three sizes.</p>
        <div style={cardStyle}>
          <div style={rowStyle}>
            {(["sm", "md", "lg"] as const).map((size) => (
              <AiButton key={size} size={size}>
                <Button variant="neutral" emphasis="low" size={size}>Label</Button>
              </AiButton>
            ))}
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Text button — high emphasis</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>Dark fill variant.</p>
        <div style={cardStyle}>
          <div style={rowStyle}>
            {(["sm", "md", "lg"] as const).map((size) => (
              <AiButton key={size} size={size}>
                <Button variant="neutral" emphasis="high" size={size}>Label</Button>
              </AiButton>
            ))}
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Icon button — low emphasis</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>All three sizes.</p>
        <div style={cardStyle}>
          <div style={rowStyle}>
            {(["sm", "md", "lg"] as const).map((size) => (
              <AiButton key={size} size={size}>
                <IconButton
                  variant="neutral"
                  emphasis="low"
                  size={size}
                  aria-label="Settings"
                  icon={<Icon name="settings" />}
                />
              </AiButton>
            ))}
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Icon button — high emphasis</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>Dark fill variant.</p>
        <div style={cardStyle}>
          <div style={rowStyle}>
            {(["sm", "md", "lg"] as const).map((size) => (
              <AiButton key={size} size={size}>
                <IconButton
                  variant="neutral"
                  emphasis="high"
                  size={size}
                  aria-label="Settings"
                  icon={<Icon name="settings" />}
                />
              </AiButton>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
