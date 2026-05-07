import { useState } from "react";
import { Tooltip, TooltipProvider, type TooltipType, type TooltipAnchor, type Placement } from "@sds/components/Tooltip";
import { Icon, type IconName } from "@sds/components/Icon";

const TYPES: TooltipType[] = ["inverse", "neutral", "brand", "info", "success", "warning", "alert"];
const PLACEMENTS: Placement[] = [
  "top", "top-start", "top-end",
  "bottom", "bottom-start", "bottom-end",
  "left", "left-start", "left-end",
  "right", "right-start", "right-end",
];
const ANCHORS: TooltipAnchor[] = ["trigger", "cursor"];

const TYPE_ICONS: Record<TooltipType, IconName> = {
  inverse: "info",
  neutral: "info",
  brand: "star",
  info: "info",
  success: "check",
  warning: "warning",
  alert: "error",
};

export default function TooltipPlayground() {
  const [type, setType] = useState<TooltipType>("inverse");
  const [placement, setPlacement] = useState<Placement>("top");
  const [anchor, setAnchor] = useState<TooltipAnchor>("trigger");
  const [showTail, setShowTail] = useState(true);
  const [showLabel, setShowLabel] = useState(true);
  const [showDesc, setShowDesc] = useState(true);
  const [showLeading, setShowLeading] = useState(false);
  const [showTrailing, setShowTrailing] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [disableInteractive, setDisableInteractive] = useState(false);
  const [closeOnPointerDownOutside, setCloseOnPointerDownOutside] = useState(false);

  return (
    <TooltipProvider showDelay={300} hideDelay={150} skipDelay={300}>
      <div style={{ display: "flex", flexDirection: "column", gap: 40, padding: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Tooltip</h1>

        {/* ── Controls ─────────────────────────────────────── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Type</span>
            <select value={type} onChange={(e) => setType(e.target.value as TooltipType)}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Placement</span>
            <select value={placement} onChange={(e) => setPlacement(e.target.value as Placement)}>
              {PLACEMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Anchor</span>
            <select value={anchor} onChange={(e) => setAnchor(e.target.value as TooltipAnchor)}>
              {ANCHORS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={showTail} onChange={(e) => setShowTail(e.target.checked)} />
            Tail
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={showLabel} onChange={(e) => setShowLabel(e.target.checked)} />
            Label
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={showDesc} onChange={(e) => setShowDesc(e.target.checked)} />
            Description
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={showLeading} onChange={(e) => setShowLeading(e.target.checked)} />
            Leading Icon
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={showTrailing} onChange={(e) => setShowTrailing(e.target.checked)} />
            Trailing Icon
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
            Disabled
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={disableInteractive}
              onChange={(e) => setDisableInteractive(e.target.checked)}
            />
            disableInteractive
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={closeOnPointerDownOutside}
              onChange={(e) => setCloseOnPointerDownOutside(e.target.checked)}
            />
            close on outside pointer
          </label>
        </div>

        {/* ── Main demo ───────────────────────────────────── */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}>
          <Tooltip
            type={type}
            placement={placement}
            anchor={anchor}
            showTail={showTail}
            disabled={disabled}
            disableInteractive={disableInteractive}
            closeOnPointerDownOutside={closeOnPointerDownOutside}
            label={showLabel ? "Tooltip Label" : undefined}
            description={showDesc ? "This is a tooltip description providing additional context." : undefined}
            leadingIcon={showLeading ? <Icon name={TYPE_ICONS[type]} size={16} /> : undefined}
            trailingIcon={showTrailing ? <Icon name="help" size={16} /> : undefined}
          >
            <button style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid var(--util-border-weak)",
              background: "var(--element-fill-neutral-tertiary-default)",
              color: "var(--text-neutral-primary)",
              cursor: "pointer",
              fontSize: 14,
            }}>
              Hover me
            </button>
          </Tooltip>
        </div>

        {/* ── Persistent preview ─────────────────────────── */}
        <section>
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>Persistent Preview</h2>
          <p style={{ margin: "0 0 12px", fontSize: 13, opacity: 0.6 }}>
            This tooltip stays open so you can inspect styling, shadows, and theme.
          </p>
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}>
            <Tooltip
              type={type}
              placement={placement}
              showTail={showTail}
              open={true}
              label={showLabel ? "Tooltip Label" : undefined}
              description={showDesc ? "This is a tooltip description providing additional context." : undefined}
              leadingIcon={showLeading ? <Icon name={TYPE_ICONS[type]} size={16} /> : undefined}
              trailingIcon={showTrailing ? <Icon name="help" size={16} /> : undefined}
            >
              <button style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid var(--util-border-weak)",
                background: "var(--element-fill-neutral-tertiary-default)",
                color: "var(--text-neutral-primary)",
                cursor: "default",
                fontSize: 14,
              }}>
                Always visible tooltip
              </button>
            </Tooltip>
          </div>
        </section>

        {/* ── All types ───────────────────────────────────── */}
        <section>
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>All Types</h2>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "center",
            padding: "60px 0",
          }}>
            {TYPES.map((t) => (
              <Tooltip
                key={t}
                type={t}
                label={t.charAt(0).toUpperCase() + t.slice(1)}
                description={`${t} tooltip example`}
                leadingIcon={<Icon name={TYPE_ICONS[t]} size={16} />}
                placement="top"
              >
                <button style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid var(--util-border-weak)",
                  background: "var(--element-fill-neutral-tertiary-default)",
                  color: "var(--text-neutral-primary)",
                  cursor: "pointer",
                  fontSize: 13,
                  textTransform: "capitalize",
                }}>
                  {t}
                </button>
              </Tooltip>
            ))}
          </div>
        </section>

        {/* ── Placement grid ──────────────────────────────── */}
        <section>
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>Placements</h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 32,
            justifyItems: "center",
            padding: "60px 20px",
          }}>
            {PLACEMENTS.map((p) => (
              <Tooltip
                key={p}
                type="inverse"
                label={p}
                placement={p}
              >
                <button style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--util-border-weak)",
                  background: "var(--element-fill-neutral-tertiary-default)",
                  color: "var(--text-neutral-primary)",
                  cursor: "pointer",
                  fontSize: 12,
                }}>
                  {p}
                </button>
              </Tooltip>
            ))}
          </div>
        </section>

        {/* ── Mouse follow demo ───────────────────────────── */}
        <section>
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>Mouse Follow (cursor anchor)</h2>
          <Tooltip
            type="inverse"
            label="Following cursor"
            description="This tooltip follows your mouse"
            anchor="cursor"
            showTail={false}
            placement="bottom"
          >
            <div style={{
              width: "100%",
              height: 200,
              border: "2px dashed var(--util-border-weak)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-neutral-tertiary-default)",
              fontSize: 14,
              cursor: "crosshair",
            }}>
              Move your mouse inside this area
            </div>
          </Tooltip>
        </section>

        {/* ── Skip delay group demo ───────────────────────── */}
        <section>
          <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>Skip Delay (hover between quickly)</h2>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", padding: "40px 0" }}>
            {["First", "Second", "Third"].map((text, i) => (
              <Tooltip
                key={i}
                type="inverse"
                label={`${text} tooltip`}
                description="Move quickly between buttons to see skip-delay in action."
                placement="top"
              >
                <button style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid var(--util-border-weak)",
                  background: "var(--element-fill-neutral-tertiary-default)",
                  color: "var(--text-neutral-primary)",
                  cursor: "pointer",
                  fontSize: 13,
                }}>
                  {text}
                </button>
              </Tooltip>
            ))}
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}
