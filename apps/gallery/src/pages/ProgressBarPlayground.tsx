import { useState, useEffect, useRef, type CSSProperties } from "react";
import { ProgressBar } from "@sds/components/ProgressBar";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const rowStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
  maxWidth: 560,
};

/* ── Type Variants ── */
function TypeVariantsDemo() {
  return (
    <div style={rowStyle}>
      <ProgressBar type="brand" label="Brand" value={75} />
      <ProgressBar type="neutral" label="Neutral" value={75} />
      <ProgressBar type="info" label="Info" value={75} />
      <ProgressBar type="error" label="Error" value={75} />
    </div>
  );
}

/* ── Values ── */
function ValuesDemo() {
  return (
    <div style={rowStyle}>
      <ProgressBar label="Empty" value={0} />
      <ProgressBar label="Quarter" value={25} />
      <ProgressBar label="Half" value={50} />
      <ProgressBar label="Three quarters" value={75} />
      <ProgressBar label="Complete" value={100} />
    </div>
  );
}

/* ── Indeterminate ── */
function IndeterminateDemo() {
  return (
    <div style={rowStyle}>
      <ProgressBar type="brand" label="Loading…" />
      <ProgressBar type="neutral" label="Processing…" />
      <ProgressBar type="info" label="Syncing…" />
      <ProgressBar type="error" label="Retrying…" />
    </div>
  );
}

/* ── Custom Max / Format ── */
function CustomMaxDemo() {
  return (
    <div style={rowStyle}>
      <ProgressBar
        label="Steps completed"
        value={3}
        max={10}
        formatValue={(v, max) => `${v} of ${max}`}
      />
      <ProgressBar
        label="Files uploaded"
        value={7}
        max={12}
        formatValue={(v, max) => `${v}/${max} files`}
      />
      <ProgressBar
        label="Storage used"
        value={4.2}
        max={8}
        formatValue={(v, max) => `${v.toFixed(1)} / ${max} GB`}
      />
    </div>
  );
}

/* ── Label & Value Visibility ── */
function VisibilityDemo() {
  return (
    <div style={rowStyle}>
      <ProgressBar label="Label + value" value={60} />
      <ProgressBar label="Label only" value={60} showValue={false} />
      <ProgressBar value={60} aria-label="Value only progress" />
      <ProgressBar
        value={60}
        showValue={false}
        aria-label="No text progress"
      />
    </div>
  );
}

/* ── Animated Progress ── */
function AnimatedDemo() {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let start: number | null = null;
    const duration = 4000;

    function step(ts: number) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setValue(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(step);
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div style={rowStyle}>
      <ProgressBar
        type="info"
        label="Uploading…"
        value={value}
        formatValue={(v) => `${Math.round(v)}%`}
        valueText={`${Math.round(value)} percent complete`}
      />
      <button
        style={{ alignSelf: "flex-start", marginTop: 4 }}
        onClick={() => setValue(0)}
      >
        Reset
      </button>
    </div>
  );
}

/* ── Interactive ── */
function InteractiveDemo() {
  const [value, setValue] = useState(50);
  const [type, setType] = useState<"brand" | "neutral" | "info" | "error">(
    "brand"
  );

  return (
    <div style={{ ...rowStyle, gap: 16 }}>
      <ProgressBar type={type} label="Interactive" value={value} />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label style={{ fontSize: 13 }}>Value:</label>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{ fontSize: 13, minWidth: 36, textAlign: "right" }}>
          {value}%
        </span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {(["brand", "neutral", "info", "error"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              fontWeight: type === t ? 700 : 400,
              textTransform: "capitalize",
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function ProgressBarPlayground() {
  return (
    <>
      <h1>ProgressBar</h1>

      <section style={sectionStyle}>
        <h2>Type Variants</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Brand, neutral, info, and error — all at 75%.
        </p>
        <div style={cardStyle}>
          <TypeVariantsDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Values</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          0%, 25%, 50%, 75%, and 100%.
        </p>
        <div style={cardStyle}>
          <ValuesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Indeterminate</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          No value prop — shows a loading animation.
        </p>
        <div style={cardStyle}>
          <IndeterminateDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Custom Max & Format</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Custom max values with formatValue for non-percentage displays.
        </p>
        <div style={cardStyle}>
          <CustomMaxDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Label & Value Visibility</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggling label and value text independently.
        </p>
        <div style={cardStyle}>
          <VisibilityDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Animated Progress</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Smooth value transition from 0 to 100%.
        </p>
        <div style={cardStyle}>
          <AnimatedDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Interactive</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Control value and type with the slider and buttons.
        </p>
        <div style={cardStyle}>
          <InteractiveDemo />
        </div>
      </section>
    </>
  );
}
