import { type CSSProperties, useState } from "react";
import { Stat, type StatSize, type StatTrendDirection, type StatAnimationStyle } from "@sds/components/Stat";
import { Button } from "@sds/components/Button";

const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 32,
  marginTop: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 160,
  background: "var(--element-surface-default)",
};

const controlsCardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 13,
};

const labelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontWeight: 500,
};

const inputStyle: CSSProperties = {
  padding: "4px 8px",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: 13,
  fontFamily: "inherit",
};

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

export default function StatPlayground() {
  const [size, setSize] = useState<StatSize>("lg");
  const [animationStyle, setAnimationStyle] = useState<StatAnimationStyle>("flip");
  const [monospace, setMonospace] = useState(true);

  const [showPretitle, setShowPretitle] = useState(true);
  const [pretitleText, setPretitleText] = useState("Pretitle");

  const [showPrefix, setShowPrefix] = useState(true);
  const [prefixText, setPrefixText] = useState("$");

  const [showSuffix, setShowSuffix] = useState(true);
  const [suffixText, setSuffixText] = useState("M");

  const [showCaption, setShowCaption] = useState(true);
  const [captionText, setCaptionText] = useState("(detail)");

  const [showBadge, setShowBadge] = useState(true);
  const [badgeText, setBadgeText] = useState("245.65");
  const [direction, setDirection] = useState<StatTrendDirection>("up");

  const [value, setValue] = useState(18.96);
  const [replayKey, setReplayKey] = useState(0);

  return (
    <>
      <h1>Stat</h1>
      <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 8px" }}>
        A single key value (KPI/metric) with optional pretitle, prefix/suffix,
        caption, and a trending badge. Numeric values animate on mount and on
        change. Honors <code>prefers-reduced-motion</code>.
      </p>

      <h2>Preview</h2>
      <div style={cardStyle}>
        <Stat
          key={replayKey}
          size={size}
          monospace={monospace}
          animationStyle={animationStyle}
          pretitle={showPretitle ? pretitleText : undefined}
          prefix={showPrefix ? prefixText : undefined}
          suffix={showSuffix ? suffixText : undefined}
          caption={showCaption ? captionText : undefined}
          value={value}
          trend={
            showBadge
              ? { direction, value: badgeText }
              : undefined
          }
        />
      </div>

      <h2 style={{ marginTop: 24 }}>Controls</h2>
      <div style={controlsCardStyle}>
        <label style={fieldStyle}>
          <span style={labelStyle}>Size</span>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as StatSize)}
            style={inputStyle}
          >
            <option value="xs">xs</option>
            <option value="sm">sm</option>
            <option value="md">md</option>
            <option value="lg">lg</option>
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Animation style</span>
          <select
            value={animationStyle}
            onChange={(e) => setAnimationStyle(e.target.value as StatAnimationStyle)}
            style={inputStyle}
          >
            <option value="flip">flip (slot machine)</option>
            <option value="none">none</option>
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>
            <input
              type="checkbox"
              checked={showPretitle}
              onChange={(e) => setShowPretitle(e.target.checked)}
            />
            Pretitle
          </span>
          <input
            type="text"
            value={pretitleText}
            onChange={(e) => setPretitleText(e.target.value)}
            disabled={!showPretitle}
            style={inputStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>
            <input
              type="checkbox"
              checked={showPrefix}
              onChange={(e) => setShowPrefix(e.target.checked)}
            />
            Prefix
          </span>
          <input
            type="text"
            value={prefixText}
            onChange={(e) => setPrefixText(e.target.value)}
            disabled={!showPrefix}
            style={inputStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>
            <input
              type="checkbox"
              checked={showSuffix}
              onChange={(e) => setShowSuffix(e.target.checked)}
            />
            Suffix
          </span>
          <input
            type="text"
            value={suffixText}
            onChange={(e) => setSuffixText(e.target.value)}
            disabled={!showSuffix}
            style={inputStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>
            <input
              type="checkbox"
              checked={showCaption}
              onChange={(e) => setShowCaption(e.target.checked)}
            />
            Caption
          </span>
          <input
            type="text"
            value={captionText}
            onChange={(e) => setCaptionText(e.target.value)}
            disabled={!showCaption}
            style={inputStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>
            <input
              type="checkbox"
              checked={showBadge}
              onChange={(e) => setShowBadge(e.target.checked)}
            />
            Trending badge
          </span>
          <input
            type="text"
            value={badgeText}
            onChange={(e) => setBadgeText(e.target.value)}
            disabled={!showBadge}
            style={inputStyle}
            placeholder="badge label"
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Trending direction</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as StatTrendDirection)}
            disabled={!showBadge}
            style={inputStyle}
          >
            <option value="up">up</option>
            <option value="down">down</option>
            <option value="neutral">neutral</option>
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>Value</span>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            step="0.01"
            style={inputStyle}
          />
        </label>

        <div style={fieldStyle}>
          <span style={labelStyle}>Step value (one by one)</span>
          <div style={rowStyle}>
            <Button
              size="md"
              emphasis="medium"
              variant="neutral"
              onClick={() => setValue((v) => +(v - 1).toFixed(2))}
            >
              − 1
            </Button>
            <Button
              size="md"
              emphasis="medium"
              variant="neutral"
              onClick={() => setValue((v) => +(v + 1).toFixed(2))}
            >
              + 1
            </Button>
          </div>
        </div>

        <label style={fieldStyle}>
          <span style={labelStyle}>
            <input
              type="checkbox"
              checked={monospace}
              onChange={(e) => setMonospace(e.target.checked)}
            />
            Monospace digits
          </span>
          <Button
            size="sm"
            emphasis="medium"
            variant="neutral"
            onClick={() => setReplayKey((k) => k + 1)}
          >
            Replay animation
          </Button>
        </label>
      </div>
    </>
  );
}
