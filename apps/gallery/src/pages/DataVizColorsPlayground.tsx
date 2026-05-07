import { useState, useMemo, useCallback, type CSSProperties } from "react";
import {
  getCategoricalPalette,
  getSequentialPalette,
  getDivergentPalette,
  getSemanticColor,
  getColorInterpolator,
  resolveColorScheme,
  setOklchEnhancement,
  isOklchEnhanced,
  type SemanticHue,
  type DivergentHue,
  type ColorScheme,
} from "@sds/components/ChartPrimitives";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const descStyle: CSSProperties = { fontSize: 13, margin: "0 0 8px", opacity: 0.7 };

const ALL_HUES: SemanticHue[] = [
  "brand",
  "info",
  "success",
  "warning",
  "alert",
  "neutral",
  "info-alt",
  "warning-alt",
  "alert-alt",
];

const DIVERGENT_HUES: DivergentHue[] = ["brand", "info", "success", "info-alt"];

function Swatch({
  color,
  label,
  size = 48,
}: {
  color: string;
  label?: string;
  size?: number;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
    >
      <button
        onClick={() => {
          navigator.clipboard.writeText(color);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        title={`Copy ${color}`}
        style={{
          width: size,
          height: size,
          borderRadius: 6,
          background: color,
          border: "1px solid rgba(0,0,0,0.1)",
          cursor: "pointer",
          transition: "transform 120ms ease",
          transform: copied ? "scale(0.9)" : "scale(1)",
        }}
      />
      {label && (
        <span style={{ fontSize: 10, opacity: 0.6, maxWidth: size + 16, textAlign: "center", wordBreak: "break-all" }}>
          {label}
        </span>
      )}
    </div>
  );
}

function SwatchRow({ colors, labels }: { colors: string[]; labels?: string[] }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {colors.map((c, i) => (
        <Swatch key={i} color={c} label={labels?.[i] ?? c} />
      ))}
    </div>
  );
}

function GradientBar({
  hue,
  type,
  height = 32,
  borderRadius = "6px",
}: {
  hue: SemanticHue;
  type: "sequential" | "divergent";
  height?: number;
  borderRadius?: string;
}) {
  const interpolate = useMemo(
    () => getColorInterpolator(hue, type),
    [hue, type]
  );
  const gradient = useMemo(() => {
    const stops = 32;
    const parts = Array.from({ length: stops + 1 }, (_, i) => {
      const t = i / stops;
      return `${interpolate(t)} ${(t * 100).toFixed(1)}%`;
    });
    return `linear-gradient(to right, ${parts.join(", ")})`;
  }, [interpolate]);

  return (
    <div
      style={{
        height,
        borderRadius,
        border: "1px solid rgba(0,0,0,0.1)",
        background: gradient,
      }}
    />
  );
}

function ComparisonStrip({
  label,
  getColors,
}: {
  label: string;
  getColors: () => string[];
}) {
  const [rawColors, enhancedColors] = useMemo(() => {
    setOklchEnhancement(false);
    const raw = getColors();
    setOklchEnhancement(true);
    const enhanced = getColors();
    return [raw, enhanced] as const;
  }, [getColors]);

  return (
    <div style={{ marginBottom: 16 }}>
      <span style={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{label}</span>
      <div style={{ display: "flex", gap: 0, marginTop: 4 }}>
        {rawColors.map((c, i) => (
          <div
            key={`raw-${i}`}
            style={{
              flex: 1,
              height: 20,
              background: c,
              borderRadius: i === 0 ? "4px 0 0 0" : 0,
            }}
            title={`Token: ${c}`}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 0 }}>
        {enhancedColors.map((c, i) => (
          <div
            key={`enh-${i}`}
            style={{
              flex: 1,
              height: 20,
              background: c,
              borderRadius: i === 0 ? "0 0 0 4px" : i === enhancedColors.length - 1 ? "0 0 4px 0" : 0,
            }}
            title={`OKLCH: ${c}`}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.4, marginTop: 2 }}>
        <span>top: raw tokens</span>
        <span>bottom: OKLCH enhanced</span>
      </div>
    </div>
  );
}

function BeforeAfterSection() {
  const getCat = useCallback(() => getCategoricalPalette(), []);
  const getSeqBrand = useCallback(() => getSequentialPalette("brand"), []);
  const getSeqInfo = useCallback(() => getSequentialPalette("info"), []);
  const getSeqSuccess = useCallback(() => getSequentialPalette("success"), []);
  const getSeqWarning = useCallback(() => getSequentialPalette("warning"), []);
  const getSeqAlert = useCallback(() => getSequentialPalette("alert"), []);
  const getSeqWarningAlt = useCallback(() => getSequentialPalette("warning-alt"), []);
  const getSeqInfoAlt = useCallback(() => getSequentialPalette("info-alt"), []);
  const getSeqAlertAlt = useCallback(() => getSequentialPalette("alert-alt"), []);
  const getDivBrand = useCallback(() => getDivergentPalette("brand"), []);
  const getDivInfo = useCallback(() => getDivergentPalette("info"), []);
  const getDivSuccess = useCallback(() => getDivergentPalette("success"), []);

  return (
    <section style={sectionStyle}>
      <h2>Before / After — OKLCH Enhancement</h2>
      <p style={descStyle}>
        Top row: raw token colors. Bottom row: OKLCH-reconstructed with normalized
        lightness, max-gamut chroma, and hue separation for distinguishability.
        Categorical colors are pushed to equal perceptual lightness with vivid saturation
        and minimum 25° hue spacing. Sequential ramps get smooth lightness progression
        with chroma maximized at each step.
      </p>
      <div style={cardStyle}>
        <ComparisonStrip label="Categorical (8 colors)" getColors={getCat} />
        <ComparisonStrip label="Sequential — brand (purple)" getColors={getSeqBrand} />
        <ComparisonStrip label="Sequential — info (blue)" getColors={getSeqInfo} />
        <ComparisonStrip label="Sequential — success (green)" getColors={getSeqSuccess} />
        <ComparisonStrip label="Sequential — warning (orange)" getColors={getSeqWarning} />
        <ComparisonStrip label="Sequential — alert (red)" getColors={getSeqAlert} />
        <ComparisonStrip label="Sequential — warning-alt (yellow)" getColors={getSeqWarningAlt} />
        <ComparisonStrip label="Sequential — info-alt (teal)" getColors={getSeqInfoAlt} />
        <ComparisonStrip label="Sequential — alert-alt (magenta)" getColors={getSeqAlertAlt} />
        <ComparisonStrip label="Divergent — brand" getColors={getDivBrand} />
        <ComparisonStrip label="Divergent — info" getColors={getDivInfo} />
        <ComparisonStrip label="Divergent — success" getColors={getDivSuccess} />
      </div>
    </section>
  );
}

function CategoricalSection() {
  const colors = getCategoricalPalette();
  return (
    <section style={sectionStyle}>
      <h2>Categorical Palette</h2>
      <p style={descStyle}>
        8 distinct hues for unrelated series. Click any swatch to copy its resolved color value.
        Switch themes in the top bar to see how colors adapt.
      </p>
      <div style={cardStyle}>
        <SwatchRow
          colors={colors}
          labels={colors.map((c, i) => `Cat ${i + 1}\n${c}`)}
        />
      </div>
    </section>
  );
}

function SemanticSection() {
  return (
    <section style={sectionStyle}>
      <h2>Semantic Colors (Default + Hover)</h2>
      <p style={descStyle}>
        Each semantic hue provides a default and hover variant.
        Neutral only has a "normal" token (same for both).
      </p>
      <div style={cardStyle}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
          {ALL_HUES.map((hue) => {
            const def = getSemanticColor(hue, "default");
            const hover = getSemanticColor(hue, "hover");
            return (
              <div key={hue} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <strong style={{ fontSize: 12, textTransform: "capitalize" }}>{hue}</strong>
                <div style={{ display: "flex", gap: 6 }}>
                  <Swatch color={def} label={`default\n${def}`} size={40} />
                  <Swatch color={hover} label={`hover\n${hover}`} size={40} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SequentialSection() {
  const [selectedHue, setSelectedHue] = useState<SemanticHue>("brand");
  const [stepCount, setStepCount] = useState(0);
  const full = useMemo(() => getSequentialPalette(selectedHue), [selectedHue]);
  const sampled = useMemo(
    () => (stepCount > 0 ? getSequentialPalette(selectedHue, stepCount) : full),
    [selectedHue, stepCount, full]
  );

  return (
    <section style={sectionStyle}>
      <h2>Sequential Palettes</h2>
      <p style={descStyle}>
        Single-hue light-to-dark ramps. Up to 10 steps (6 for neutral).
        Use the "steps" control to see evenly sampled subsets.
      </p>
      <div style={cardStyle}>
        <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ fontSize: 13 }}>
            Hue:{" "}
            <select
              value={selectedHue}
              onChange={(e) => setSelectedHue(e.target.value as SemanticHue)}
              style={{ padding: "4px 8px" }}
            >
              {ALL_HUES.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 13 }}>
            Steps:{" "}
            <input
              type="range"
              min={0}
              max={full.length}
              value={stepCount}
              onChange={(e) => setStepCount(Number(e.target.value))}
              style={{ width: 120, verticalAlign: "middle" }}
            />
            <span style={{ marginLeft: 6 }}>
              {stepCount === 0 ? `all (${full.length})` : stepCount}
            </span>
          </label>
        </div>
        <SwatchRow
          colors={sampled}
          labels={sampled.map((c, i) => `${i + 1}: ${c}`)}
        />
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 12, opacity: 0.5, margin: "0 0 6px" }}>Continuous interpolator:</p>
          <GradientBar hue={selectedHue} type="sequential" />
        </div>
      </div>

      <p style={{ ...descStyle, marginTop: 16 }}>All hues at a glance:</p>
      <div style={cardStyle}>
        {ALL_HUES.map((hue) => {
          const colors = getSequentialPalette(hue);
          return (
            <div key={hue} style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{hue}</span>
              <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
                {colors.map((c, i) => (
                  <div
                    key={i}
                    style={{ flex: 1, height: 24, background: c, borderRadius: i === 0 ? "4px 0 0 4px" : i === colors.length - 1 ? "0 4px 4px 0" : 0 }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DivergentSection() {
  const [selectedHue, setSelectedHue] = useState<DivergentHue>("brand");
  const [stepCount, setStepCount] = useState(0);
  const full = useMemo(() => getDivergentPalette(selectedHue), [selectedHue]);
  const sampled = useMemo(
    () => (stepCount > 0 ? getDivergentPalette(selectedHue, stepCount) : full),
    [selectedHue, stepCount, full]
  );

  return (
    <section style={sectionStyle}>
      <h2>Divergent Palettes</h2>
      <p style={descStyle}>
        Two-hue ramps with lightest values in the center, intensity increasing outward.
        Cold on the left, warm on the right. 12 stops total (6 per side).
        Available for: brand, info, success, info-alt.
      </p>
      <div style={cardStyle}>
        <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ fontSize: 13 }}>
            Hue:{" "}
            <select
              value={selectedHue}
              onChange={(e) => setSelectedHue(e.target.value as DivergentHue)}
              style={{ padding: "4px 8px" }}
            >
              {DIVERGENT_HUES.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 13 }}>
            Steps:{" "}
            <input
              type="range"
              min={0}
              max={full.length}
              value={stepCount}
              onChange={(e) => setStepCount(Number(e.target.value))}
              style={{ width: 120, verticalAlign: "middle" }}
            />
            <span style={{ marginLeft: 6 }}>
              {stepCount === 0 ? `all (${full.length})` : stepCount}
            </span>
          </label>
        </div>
        <SwatchRow
          colors={sampled}
          labels={sampled.map((c, i) => {
            const mid = full.length / 2;
            const side = i < mid ? "cold" : "warm";
            const step = i < mid ? 6 - i : i - mid + 1;
            return `${side} ${step}\n${c}`;
          })}
        />
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 12, opacity: 0.5, margin: "0 0 6px" }}>Continuous interpolator:</p>
          <GradientBar hue={selectedHue} type="divergent" />
        </div>
      </div>

      <p style={{ ...descStyle, marginTop: 16 }}>All divergent hues at a glance:</p>
      <div style={cardStyle}>
        {DIVERGENT_HUES.map((hue) => {
          const colors = getDivergentPalette(hue);
          return (
            <div key={hue} style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{hue}</span>
              <div style={{ display: "flex", gap: 0, marginTop: 4 }}>
                {colors.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 24,
                      background: c,
                      borderRadius:
                        i === 0
                          ? "4px 0 0 0"
                          : i === colors.length - 1
                          ? "0 4px 0 0"
                          : 0,
                    }}
                    title={c}
                  />
                ))}
              </div>
              <GradientBar hue={hue} type="divergent" height={24} borderRadius="0 0 4px 4px" />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function InterpolatorSection() {
  const [hue, setHue] = useState<SemanticHue>("brand");
  const [type, setType] = useState<"sequential" | "divergent">("sequential");
  const [tValue, setTValue] = useState(0.5);
  const interpolate = useMemo(() => getColorInterpolator(hue, type), [hue, type]);
  const color = interpolate(tValue);
  const isDivOk = DIVERGENT_HUES.includes(hue as DivergentHue);
  const effectiveType = type === "divergent" && !isDivOk ? "sequential" : type;

  return (
    <section style={sectionStyle}>
      <h2>Color Interpolator</h2>
      <p style={descStyle}>
        Returns a continuous function <code>(t: number) =&gt; string</code> where t ∈ [0, 1].
        Useful for heatmaps, gradients, and continuous scales.
      </p>
      <div style={cardStyle}>
        <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ fontSize: 13 }}>
            Hue:{" "}
            <select value={hue} onChange={(e) => setHue(e.target.value as SemanticHue)} style={{ padding: "4px 8px" }}>
              {ALL_HUES.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 13 }}>
            Type:{" "}
            <select value={type} onChange={(e) => setType(e.target.value as "sequential" | "divergent")} style={{ padding: "4px 8px" }}>
              <option value="sequential">Sequential</option>
              <option value="divergent">Divergent</option>
            </select>
            {type === "divergent" && !isDivOk && (
              <span style={{ color: "orange", fontSize: 11, marginLeft: 6 }}>
                (no divergent for {hue}, falls back to sequential)
              </span>
            )}
          </label>
        </div>
        <GradientBar hue={hue} type={effectiveType} />
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ fontSize: 13 }}>
            t = {tValue.toFixed(2)}{" "}
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={tValue}
              onChange={(e) => setTValue(Number(e.target.value))}
              style={{ width: 200, verticalAlign: "middle" }}
            />
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                background: color,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
            <code style={{ fontSize: 13 }}>{color}</code>
          </div>
        </div>
      </div>
    </section>
  );
}

function ColorSchemeResolverSection() {
  const [schemeType, setSchemeType] = useState<"categorical" | "sequential" | "divergent" | "custom">("categorical");
  const [hue, setHue] = useState<SemanticHue>("brand");
  const [customColors, setCustomColors] = useState("#ff0000, #00ff00, #0000ff");
  const [count, setCount] = useState(6);

  const scheme = useMemo((): ColorScheme => {
    switch (schemeType) {
      case "categorical":
        return { type: "categorical" };
      case "sequential":
        return { type: "sequential", hue };
      case "divergent":
        return { type: "divergent", hue: DIVERGENT_HUES.includes(hue as DivergentHue) ? (hue as DivergentHue) : "brand" };
      case "custom":
        return { type: "custom", colors: customColors.split(",").map((c) => c.trim()).filter(Boolean) };
    }
  }, [schemeType, hue, customColors]);

  const resolved = useMemo(
    () => resolveColorScheme(scheme, count),
    [scheme, count]
  );

  return (
    <section style={sectionStyle}>
      <h2>resolveColorScheme()</h2>
      <p style={descStyle}>
        Convenience function: pass a <code>ColorScheme</code> descriptor and get back an array of colors.
        This is the API chart components use internally.
      </p>
      <div style={cardStyle}>
        <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ fontSize: 13 }}>
            Type:{" "}
            <select value={schemeType} onChange={(e) => setSchemeType(e.target.value as typeof schemeType)} style={{ padding: "4px 8px" }}>
              <option value="categorical">Categorical</option>
              <option value="sequential">Sequential</option>
              <option value="divergent">Divergent</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          {(schemeType === "sequential" || schemeType === "divergent") && (
            <label style={{ fontSize: 13 }}>
              Hue:{" "}
              <select
                value={schemeType === "divergent" && !DIVERGENT_HUES.includes(hue as DivergentHue) ? "brand" : hue}
                onChange={(e) => setHue(e.target.value as SemanticHue)}
                style={{ padding: "4px 8px" }}
              >
                {(schemeType === "divergent" ? DIVERGENT_HUES : ALL_HUES).map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </label>
          )}
          {schemeType === "custom" && (
            <label style={{ fontSize: 13 }}>
              Colors (comma-sep):{" "}
              <input
                type="text"
                value={customColors}
                onChange={(e) => setCustomColors(e.target.value)}
                style={{ padding: "4px 8px", width: 220 }}
              />
            </label>
          )}
          {schemeType !== "categorical" && schemeType !== "custom" && (
            <label style={{ fontSize: 13 }}>
              Count:{" "}
              <input
                type="range"
                min={2}
                max={12}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                style={{ width: 100, verticalAlign: "middle" }}
              />
              <span style={{ marginLeft: 6 }}>{count}</span>
            </label>
          )}
        </div>
        <SwatchRow colors={resolved} labels={resolved.map((c, i) => `${i + 1}: ${c}`)} />
        <pre style={{ fontSize: 11, marginTop: 12, opacity: 0.6, overflow: "auto" }}>
          {`resolveColorScheme(${JSON.stringify(scheme)}, ${count})`}
        </pre>
      </div>
    </section>
  );
}

function ApiReferenceSection() {
  return (
    <section style={sectionStyle}>
      <h2>API Reference</h2>
      <p style={descStyle}>All exports from <code>ChartPrimitives/dataVizPalette</code>:</p>
      <div style={cardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "6px 12px 6px 0" }}>Function</th>
              <th style={{ padding: "6px 12px 6px 0" }}>Returns</th>
              <th style={{ padding: "6px 0" }}>Purpose</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["getCategoricalPalette()", "string[]", "Full 8-color categorical palette"],
              ["getCategoricalColor(index, override?)", "string", "Pick one categorical color by index"],
              ["getSequentialPalette(hue, steps?)", "string[]", "Single-hue light→dark ramp (6–10 stops)"],
              ["getDivergentPalette(hue, steps?)", "string[]", "Cold+warm 12-stop ramp"],
              ["getSemanticColor(hue, variant?)", "string", "Single default/hover color for a hue"],
              ["getColorInterpolator(hue, type?)", "(t) => string", "Continuous interpolation function for gradients"],
              ["resolveColorScheme(scheme, count?)", "string[]", "Resolve a ColorScheme descriptor to colors"],
              ["invalidateDataVizCache()", "void", "Force-clear resolved color caches"],
            ].map(([fn, ret, desc], i) => (
              <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "6px 12px 6px 0" }}><code>{fn}</code></td>
                <td style={{ padding: "6px 12px 6px 0" }}><code>{ret}</code></td>
                <td style={{ padding: "6px 0" }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 16 }}>
          <h4 style={{ fontSize: 13, marginBottom: 4 }}>Types</h4>
          <ul style={{ fontSize: 12, margin: 0, paddingLeft: 20, opacity: 0.7 }}>
            <li><code>SemanticHue</code> — "brand" | "info" | "success" | "warning" | "alert" | "neutral" | "info-alt" | "warning-alt" | "alert-alt"</li>
            <li><code>DivergentHue</code> — "brand" | "info" | "success" | "info-alt"</li>
            <li><code>ColorScheme</code> — {"{"} type: "categorical" {"}"} | {"{"} type: "sequential", hue {"}"} | {"{"} type: "divergent", hue {"}"} | {"{"} type: "custom", colors {"}"}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function DataVizColorsPlayground() {
  const [oklch, setOklch] = useState(isOklchEnhanced);
  const [, rerender] = useState(0);

  const toggleOklch = useCallback(() => {
    const next = !oklch;
    setOklchEnhancement(next);
    setOklch(next);
    rerender((n) => n + 1);
  }, [oklch]);

  return (
    <>
      <h1>Data Viz Colors</h1>
      <p style={{ fontSize: 14, opacity: 0.6, marginBottom: 12 }}>
        All colors are resolved from CSS custom properties at runtime — switch themes in the top bar to see them update.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, padding: "8px 12px", borderRadius: 8, background: oklch ? "rgba(80, 180, 80, 0.1)" : "rgba(0,0,0,0.04)" }}>
        <label style={{ fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={oklch}
            onChange={toggleOklch}
            style={{ width: 18, height: 18 }}
          />
          OKLCH Perceptual Enhancement
        </label>
        <span style={{ fontSize: 12, opacity: 0.6 }}>
          {oklch
            ? "Active — lightness equalized, chroma boosted for yellow/orange, interpolation in OKLCH"
            : "Off — using raw token colors, RGB interpolation"}
        </span>
      </div>
      <BeforeAfterSection />
      <CategoricalSection />
      <SemanticSection />
      <SequentialSection />
      <DivergentSection />
      <InterpolatorSection />
      <ColorSchemeResolverSection />
      <ApiReferenceSection />
    </>
  );
}
