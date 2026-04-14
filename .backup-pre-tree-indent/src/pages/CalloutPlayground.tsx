import { useState } from "react";
import {
  Callout,
  type CalloutType,
  type CalloutSize,
  type CalloutLayout,
} from "../components/Callout";
import { Button } from "../components/Button";

const TYPES: CalloutType[] = ["brand", "info", "success", "warning", "alert"];
const SIZES: CalloutSize[] = ["lg", "md", "sm"];
const LAYOUTS: CalloutLayout[] = ["vertical", "horizontal"];

const BUTTON_SIZE_MAP: Record<CalloutSize, "sm" | "md"> = {
  lg: "md",
  md: "md",
  sm: "sm",
};

export default function CalloutPlayground() {
  const [type, setType] = useState<CalloutType>("info");
  const [size, setSize] = useState<CalloutSize>("lg");
  const [layout, setLayout] = useState<CalloutLayout>("vertical");
  const [showDescription, setShowDescription] = useState(true);
  const [showClose, setShowClose] = useState(true);
  const [showActions, setShowActions] = useState(true);

  const btnSize = BUTTON_SIZE_MAP[size];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive preview ──────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Interactive Preview</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {/* Controls */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Type</span>
              <select value={type} onChange={(e) => setType(e.target.value as CalloutType)}
                style={{ fontSize: 12, padding: "2px 6px" }}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as CalloutSize)}
                style={{ fontSize: 12, padding: "2px 6px" }}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Layout</span>
              <select value={layout} onChange={(e) => setLayout(e.target.value as CalloutLayout)}
                style={{ fontSize: 12, padding: "2px 6px" }}>
                {LAYOUTS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={showDescription} onChange={(e) => setShowDescription(e.target.checked)} />
              <span style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Description</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={showClose} onChange={(e) => setShowClose(e.target.checked)} />
              <span style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Close</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={showActions} onChange={(e) => setShowActions(e.target.checked)} />
              <span style={{ fontSize: 12, color: "var(--text-neutral-secondary-default)" }}>Actions</span>
            </label>
          </div>

          {/* Preview */}
          <div style={{ maxWidth: 688 }}>
            <Callout
              type={type}
              size={size}
              layout={layout}
              title="Title"
              description={showDescription ? "Description" : undefined}
              onClose={showClose ? () => {} : undefined}
              actions={
                showActions ? (
                  <>
                    <Button variant="neutral" emphasis="low" size={btnSize}>Label</Button>
                    <Button variant="neutral" emphasis="medium" size={btnSize}>Label</Button>
                  </>
                ) : undefined
              }
            />
          </div>
        </div>
      </section>

      {/* ── Type matrix ─────────────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>All Types &times; Sizes (vertical)</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {TYPES.map((t) =>
            SIZES.map((s) => (
              <div key={`${t}-${s}`} style={{ maxWidth: 688 }}>
                <Callout
                  type={t}
                  size={s}
                  layout="vertical"
                  title="Title"
                  description="Description"
                  onClose={() => {}}
                  actions={
                    <>
                      <Button variant="neutral" emphasis="low" size={BUTTON_SIZE_MAP[s]}>Label</Button>
                      <Button variant="neutral" emphasis="medium" size={BUTTON_SIZE_MAP[s]}>Label</Button>
                    </>
                  }
                />
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Horizontal matrix ───────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>All Types &times; Sizes (horizontal)</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 24,
            border: "1px solid var(--element-outline-neutral-subtlest)",
            borderRadius: 12,
          }}
        >
          {TYPES.map((t) =>
            SIZES.map((s) => (
              <div key={`${t}-${s}-h`} style={{ maxWidth: 688 }}>
                <Callout
                  type={t}
                  size={s}
                  layout="horizontal"
                  title="Title"
                  onClose={() => {}}
                  actions={
                    <>
                      <Button variant="neutral" emphasis="low" size={BUTTON_SIZE_MAP[s]}>Label</Button>
                      <Button variant="neutral" emphasis="medium" size={BUTTON_SIZE_MAP[s]}>Label</Button>
                    </>
                  }
                />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
