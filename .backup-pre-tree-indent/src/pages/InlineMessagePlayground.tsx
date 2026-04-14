import { useState } from "react";
import { InlineMessage, type InlineMessageType } from "../components/InlineMessage";

const sectionStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 12,
};

const cardStyle = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
  display: "flex",
  flexDirection: "column" as const,
  gap: 16,
};

const rowStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 16,
};

const captionStyle = {
  fontSize: 12,
  color: "var(--text-neutral-secondary-default)",
  minWidth: 110,
  flexShrink: 0 as const,
};

const HIGH_TYPES: InlineMessageType[] = ["neutral", "info", "success", "warning", "alert"];
const LOW_TYPES: InlineMessageType[] = ["none", "neutral", "info", "success", "warning", "alert"];

export default function InlineMessagePlayground() {
  const [inputText, setInputText] = useState("");
  const maxChars = 200;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2 style={{ margin: 0 }}>InlineMessage</h2>

      {/* ── High emphasis ─────────────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>High Emphasis</h3>
        <div style={cardStyle}>
          {HIGH_TYPES.map((t) => (
            <div key={t} style={rowStyle}>
              <span style={captionStyle}>{t}</span>
              <div style={{ width: 240 }}>
                <InlineMessage
                  type={t}
                  emphasis="high"
                  text="Hint text"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── High emphasis – no icon ────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>High Emphasis – No Icon</h3>
        <div style={cardStyle}>
          {HIGH_TYPES.map((t) => (
            <div key={t} style={rowStyle}>
              <span style={captionStyle}>{t}</span>
              <div style={{ width: 240 }}>
                <InlineMessage
                  type={t}
                  emphasis="high"
                  text="Hint text"
                  showLeadingIcon={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Low emphasis ──────────────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Low Emphasis</h3>
        <div style={cardStyle}>
          {LOW_TYPES.map((t) => (
            <div key={t} style={rowStyle}>
              <span style={captionStyle}>{t}</span>
              <div style={{ width: 240 }}>
                <InlineMessage
                  type={t}
                  emphasis="low"
                  text="Hint text"
                  charCount={0}
                  charMax={200}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Low emphasis – no icon ─────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Low Emphasis – No Icon, No Counter</h3>
        <div style={cardStyle}>
          {LOW_TYPES.map((t) => (
            <div key={t} style={rowStyle}>
              <span style={captionStyle}>{t}</span>
              <div style={{ width: 240 }}>
                <InlineMessage
                  type={t}
                  emphasis="low"
                  text="Hint text"
                  showLeadingIcon={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Range ─────────────────────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Range</h3>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <span style={captionStyle}>range</span>
            <div style={{ width: 240 }}>
              <InlineMessage type="range" startText="Start" endText="End" />
            </div>
          </div>
          <div style={rowStyle}>
            <span style={captionStyle}>range (custom)</span>
            <div style={{ width: 240 }}>
              <InlineMessage type="range" startText="0" endText="100" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Wired to input ────────────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Wired to Input (Character Counter)</h3>
        <div style={cardStyle}>
          <input
            type="text"
            placeholder="Type something…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            maxLength={maxChars}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--element-outline-neutral-default)",
              background: "var(--element-fill-neutral-primary-default)",
              color: "var(--text-neutral-primary-default)",
              fontSize: 14,
              outline: "none",
            }}
          />
          <InlineMessage
            type="neutral"
            emphasis="low"
            text="Max 200 characters"
            charCount={inputText.length}
            charMax={maxChars}
          />
          <InlineMessage
            type={inputText.length >= maxChars ? "alert" : "none"}
            emphasis="low"
            text={
              inputText.length >= maxChars
                ? "Character limit reached"
                : "Start typing to see the counter"
            }
            charCount={inputText.length}
            charMax={maxChars}
          />
        </div>
      </div>
    </div>
  );
}
