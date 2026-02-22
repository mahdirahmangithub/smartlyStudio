import { useState, useEffect, useRef, useCallback } from "react";
import { Spinner, type SpinnerSize, type SpinnerType } from "../components/Spinner";

const SIZES: SpinnerSize[] = ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl"];
const TYPES: SpinnerType[] = ["brand", "neutral", "inverse"];

const captionStyle = {
  fontSize: 12,
  color: "var(--text-neutral-secondary-default)",
} as const;

const sectionStyle = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
} as const;

function DeterminateDemo() {
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);

  const DURATION = 3000;

  const animate = useCallback((ts: number) => {
    if (!startRef.current) startRef.current = ts;
    const elapsed = ts - startRef.current;
    const pct = Math.min(100, (elapsed / DURATION) * 100);
    setValue(pct);
    if (pct < 100) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      setRunning(false);
    }
  }, []);

  const start = () => {
    setValue(0);
    startRef.current = 0;
    setRunning(true);
    rafRef.current = requestAnimationFrame(animate);
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setValue(0);
    startRef.current = 0;
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {SIZES.map((s) => (
          <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Spinner size={s} mode="determinate" value={value} type="brand" />
            <span style={captionStyle}>{s}</span>
          </div>
        ))}
        <Spinner diameter={56} mode="determinate" value={value} type="brand" />
        <span style={captionStyle}>custom 56px</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={start} disabled={running} style={{ fontSize: 12, padding: "4px 12px" }}>
          Start
        </button>
        <button onClick={reset} style={{ fontSize: 12, padding: "4px 12px" }}>
          Reset
        </button>
        <span style={{ ...captionStyle, fontVariantNumeric: "tabular-nums" }}>
          {Math.round(value)}%
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={captionStyle}>Manual:</span>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => {
            if (!running) setValue(Number(e.target.value));
          }}
          style={{ flex: 1 }}
          disabled={running}
        />
      </div>
    </div>
  );
}

export default function SpinnerPlayground() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2 style={{ margin: 0 }}>Spinner</h2>

      {/* ── Indeterminate — all types ──────────────────────────────── */}
      {TYPES.map((t) => (
        <section key={t}>
          <h3 style={{ margin: "0 0 12px" }}>Indeterminate — {t}</h3>
          <div
            style={{
              ...sectionStyle,
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              alignItems: "flex-end",
              ...(t === "inverse"
                ? { background: "var(--util-subtle-strongest)", borderColor: "transparent" }
                : {}),
            }}
          >
            {SIZES.map((s) => (
              <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <Spinner size={s} type={t} />
                <span
                  style={{
                    ...captionStyle,
                    ...(t === "inverse" ? { color: "rgba(255,255,255,0.7)" } : {}),
                  }}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* ── Determinate ────────────────────────────────────────────── */}
      <section>
        <h3 style={{ margin: "0 0 12px" }}>Determinate (progress)</h3>
        <div style={sectionStyle}>
          <DeterminateDemo />
        </div>
      </section>
    </div>
  );
}
