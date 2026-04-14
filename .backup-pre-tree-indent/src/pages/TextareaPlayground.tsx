import { useState } from "react";
import { Textarea, type TextareaSize } from "../components/Textarea";

const SIZES: TextareaSize[] = ["md", "lg", "xl"];

const SAMPLE_SHORT = "Hello world";
const SAMPLE_LONG = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`;

const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;
const selectStyle = { fontSize: 13, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--element-outline-neutral-default)", background: "var(--element-surface-default)", color: "var(--text-neutral-primary)" } as const;
const labelCtrlStyle = { display: "inline-flex", alignItems: "center", gap: 6 } as const;

export default function TextareaPlayground() {
  const [size, setSize] = useState<TextareaSize>("md");
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [resize, setResize] = useState(true);
  const [useMaxHeight, setUseMaxHeight] = useState(false);
  const [maxHeight, setMaxHeight] = useState(160);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <h2 style={{ margin: 0 }}>Textarea</h2>

      {/* ── Interactive ─────────────────────────────────────────── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h3 style={{ margin: 0 }}>Interactive</h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
          <label style={labelCtrlStyle}>
            <span style={captionStyle}>Size</span>
            <select value={size} onChange={(e) => setSize(e.target.value as TextareaSize)} style={selectStyle}>
              {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label style={labelCtrlStyle}>
            <input type="checkbox" checked={error} onChange={(e) => setError(e.target.checked)} />
            <span style={captionStyle}>Error</span>
          </label>

          <label style={labelCtrlStyle}>
            <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
            <span style={captionStyle}>Disabled</span>
          </label>

          <label style={labelCtrlStyle}>
            <input type="checkbox" checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} />
            <span style={captionStyle}>Read-only</span>
          </label>

          <label style={labelCtrlStyle}>
            <input type="checkbox" checked={resize} onChange={(e) => setResize(e.target.checked)} />
            <span style={captionStyle}>Resize</span>
          </label>

          <label style={labelCtrlStyle}>
            <input type="checkbox" checked={useMaxHeight} onChange={(e) => setUseMaxHeight(e.target.checked)} />
            <span style={captionStyle}>Max height</span>
          </label>

          {useMaxHeight && (
            <label style={labelCtrlStyle}>
              <span style={captionStyle}>px</span>
              <input
                type="number"
                value={maxHeight}
                onChange={(e) => setMaxHeight(Number(e.target.value))}
                style={{ ...selectStyle, width: 64 }}
              />
            </label>
          )}
        </div>

        <div style={{ maxWidth: 480 }}>
          <Textarea
            size={size}
            error={error}
            disabled={disabled}
            readOnly={readOnly}
            resize={resize}
            maxHeight={useMaxHeight ? maxHeight : undefined}
            placeholder="Type something…"
            rows={4}
          />
        </div>
      </section>

      {/* ── Sizes ──────────────────────────────────────────────── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h3 style={{ margin: 0 }}>Sizes</h3>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", gap: 8, width: 280 }}>
              <span style={captionStyle}>{s}</span>
              <Textarea size={s} placeholder="placeholder" rows={3} />
            </div>
          ))}
        </div>
      </section>

      {/* ── States ─────────────────────────────────────────────── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h3 style={{ margin: 0 }}>States</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={captionStyle}>Default</span>
            <Textarea placeholder="placeholder" rows={2} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={captionStyle}>Filled</span>
            <Textarea defaultValue={SAMPLE_SHORT} rows={2} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={captionStyle}>Error</span>
            <Textarea error placeholder="placeholder" rows={2} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={captionStyle}>Error + Filled</span>
            <Textarea error defaultValue={SAMPLE_SHORT} rows={2} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={captionStyle}>Disabled</span>
            <Textarea disabled placeholder="placeholder" rows={2} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={captionStyle}>Read-only</span>
            <Textarea readOnly defaultValue={SAMPLE_SHORT} rows={2} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={captionStyle}>No resize</span>
            <Textarea resize={false} placeholder="placeholder" rows={2} />
          </div>
        </div>
      </section>

      {/* ── Max-height with scroll fading ──────────────────────── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h3 style={{ margin: 0 }}>Max Height with Scroll Fade</h3>
        <p style={{ ...captionStyle, margin: 0 }}>
          When content exceeds the max-height, it becomes scrollable with vertical fade overlays.
        </p>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", gap: 8, width: 300 }}>
              <span style={captionStyle}>{s} — maxHeight: 120px</span>
              <Textarea
                size={s}
                maxHeight={120}
                defaultValue={SAMPLE_LONG}
                resize={false}
              />
            </div>
          ))}
        </div>
      </section>
      {/* ── Auto-expand ─────────────────────────────────────── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h3 style={{ margin: 0 }}>Auto Expand</h3>
        <p style={{ ...captionStyle, margin: 0 }}>
          Starts at one line and grows with content. With maxHeight it caps and becomes scrollable with fades.
        </p>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 340 }}>
            <span style={captionStyle}>Auto-expand (no limit)</span>
            <Textarea autoExpand placeholder="Type to expand…" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 340 }}>
            <span style={captionStyle}>Auto-expand — maxHeight: 160px</span>
            <Textarea autoExpand maxHeight={160} placeholder="Type to expand… caps at 160px" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 340 }}>
            <span style={captionStyle}>Auto-expand xl — maxHeight: 200px</span>
            <Textarea autoExpand size="xl" maxHeight={200} placeholder="XL auto-expand" />
          </div>
        </div>
      </section>
    </div>
  );
}
