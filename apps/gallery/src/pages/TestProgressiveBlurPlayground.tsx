import { useState, type CSSProperties } from "react";
import { ProgressiveBlur } from "@sds/components/ProgressiveBlur";
import type { ProgressiveBlurPosition } from "@sds/components/ProgressiveBlur";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

const IMG_URL =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=500&fit=crop";

function InteractiveDemo() {
  const [position, setPosition] = useState<ProgressiveBlurPosition>("bottom");
  const [showText, setShowText] = useState(true);
  const [textLength, setTextLength] = useState<"short" | "medium" | "long">("medium");

  const textContent: Record<string, string> = {
    short: "Mountain Landscape",
    medium:
      "Mountain Landscape — A breathtaking view of snow-capped peaks rising above the morning mist, with evergreen forests covering the valley below.",
    long: "Mountain Landscape — A breathtaking view of snow-capped peaks rising above the morning mist, with evergreen forests covering the valley below. The golden light of sunrise paints the clouds in warm hues of orange and pink, casting long shadows across the rugged terrain. A winding river cuts through the valley, its surface reflecting the sky above like a mirror of liquid gold.",
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <label style={{ fontSize: 13 }}>
          Position:{" "}
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value as ProgressiveBlurPosition)}
          >
            <option value="bottom">Bottom</option>
            <option value="top">Top</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          <input
            type="checkbox"
            checked={showText}
            onChange={(e) => setShowText(e.target.checked)}
          />{" "}
          Show text
        </label>
        <label style={{ fontSize: 13 }}>
          Text:{" "}
          <select
            value={textLength}
            onChange={(e) => setTextLength(e.target.value as "short" | "medium" | "long")}
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </label>
      </div>

      <div
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          maxWidth: 480,
        }}
      >
        <img
          src={IMG_URL}
          alt="Nature landscape"
          style={{ display: "block", width: "100%", height: 320, objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            ...(position === "bottom" ? { bottom: 0 } : { top: 0 }),
          }}
        >
          <ProgressiveBlur position={position}>
            {showText && (
              <div style={{ padding: "16px 20px", color: "#fff" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>
                  {textContent[textLength].split("—")[0].trim()}
                </h3>
                {textLength !== "short" && (
                  <p style={{ margin: 0, fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>
                    {textContent[textLength].split("—")[1]?.trim()}
                  </p>
                )}
              </div>
            )}
          </ProgressiveBlur>
        </div>
      </div>
    </div>
  );
}

function PositionDemo() {
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <div>
        <p style={{ fontSize: 12, margin: "0 0 8px", opacity: 0.6 }}>Bottom</p>
        <div
          style={{
            position: "relative",
            borderRadius: 12,
            overflow: "hidden",
            width: 320,
          }}
        >
          <img
            src={IMG_URL}
            alt="Nature"
            style={{ display: "block", width: "100%", height: 220, objectFit: "cover" }}
          />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
            <ProgressiveBlur position="bottom">
              <div style={{ padding: "12px 16px", color: "#fff" }}>
                <h4 style={{ margin: "0 0 4px", fontSize: 16 }}>Bottom blur</h4>
                <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>
                  Blur ramps from clear at top to 32px at bottom.
                </p>
              </div>
            </ProgressiveBlur>
          </div>
        </div>
      </div>

      <div>
        <p style={{ fontSize: 12, margin: "0 0 8px", opacity: 0.6 }}>Top</p>
        <div
          style={{
            position: "relative",
            borderRadius: 12,
            overflow: "hidden",
            width: 320,
          }}
        >
          <img
            src={IMG_URL}
            alt="Nature"
            style={{ display: "block", width: "100%", height: 220, objectFit: "cover" }}
          />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
            <ProgressiveBlur position="top">
              <div style={{ padding: "12px 16px", color: "#fff" }}>
                <h4 style={{ margin: "0 0 4px", fontSize: 16 }}>Top blur</h4>
                <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>
                  Blur ramps from clear at bottom to 32px at top.
                </p>
              </div>
            </ProgressiveBlur>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestProgressiveBlurPlayground() {
  return (
    <>
      <h1>Test Progressive Blur</h1>

      <section style={sectionStyle}>
        <h2>Interactive Demo</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          8 layers, 32px max blur, gradient from transparent to black 64%.
          Toggle text length to see the blur zone adapt.
        </p>
        <div style={cardStyle}>
          <InteractiveDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Top &amp; Bottom</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Both positions side by side.
        </p>
        <div style={cardStyle}>
          <PositionDemo />
        </div>
      </section>
    </>
  );
}
