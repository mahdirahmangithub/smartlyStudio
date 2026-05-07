import { useState } from "react";
import { Button, type ButtonType, type ButtonSize } from "@sds/components/Button";
import { IconButton } from "@sds/components/IconButton";
import { ToggleButton } from "@sds/components/ToggleButton";
import { IconToggleButton } from "@sds/components/IconToggleButton";
import { ButtonGroup, type ButtonGroupEmphasis } from "@sds/components/ButtonGroup";
import { Icon } from "@sds/components/Icon";

const TYPES: ButtonType[] = ["brand", "neutral", "inverse", "info", "success", "warning", "alert"];
const SIZES: ButtonSize[] = ["sm", "md", "lg"];
const EMPHASES: ButtonGroupEmphasis[] = ["high", "medium"];

export default function ButtonGroupPlayground() {
  const [type, setType] = useState<ButtonType>("brand");
  const [size, setSize] = useState<ButtonSize>("md");
  const [emphasis, setEmphasis] = useState<ButtonGroupEmphasis>("high");

  const selectStyle = { fontSize: 12, padding: "2px 6px" } as const;
  const labelStyle = { display: "flex", alignItems: "center", gap: 6 } as const;
  const captionStyle = { fontSize: 12, color: "var(--text-neutral-secondary-default)" } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Interactive playground ──────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Button Group</h2>

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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <label style={labelStyle}>
              <span style={captionStyle}>Type</span>
              <select value={type} onChange={(e) => setType(e.target.value as ButtonType)} style={selectStyle}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Size</span>
              <select value={size} onChange={(e) => setSize(e.target.value as ButtonSize)} style={selectStyle}>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              <span style={captionStyle}>Emphasis</span>
              <select value={emphasis} onChange={(e) => setEmphasis(e.target.value as ButtonGroupEmphasis)} style={selectStyle}>
                {EMPHASES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ButtonGroup variant={type} emphasis={emphasis}>
              <Button variant={type} emphasis={emphasis} size={size}>Label</Button>
              <Button variant={type} emphasis={emphasis} size={size}>Label</Button>
              <Button variant={type} emphasis={emphasis} size={size}>Label</Button>
            </ButtonGroup>
          </div>
        </div>
      </section>

      {/* ── Button Group: all type × emphasis combos ───────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Button Groups</h2>

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
            EMPHASES.map((emp) => (
              <div key={`${t}-${emp}`} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)", width: 120, flexShrink: 0 }}>
                  {t} / {emp}
                </span>
                <ButtonGroup variant={t} emphasis={emp}>
                  <Button variant={t} emphasis={emp} size="md">Label</Button>
                  <Button variant={t} emphasis={emp} size="md">Label</Button>
                  <Button variant={t} emphasis={emp} size="md">Label</Button>
                </ButtonGroup>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── IconButton Group ───────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Icon Button Groups</h2>

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
          {(["brand", "neutral", "inverse"] as ButtonType[]).map((t) =>
            EMPHASES.map((emp) => (
              <div key={`icon-${t}-${emp}`} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)", width: 120, flexShrink: 0 }}>
                  {t} / {emp}
                </span>
                <ButtonGroup variant={t} emphasis={emp}>
                  <IconButton variant={t} emphasis={emp} size="md" icon={<Icon name="edit" size={16} />} aria-label="Edit" />
                  <IconButton variant={t} emphasis={emp} size="md" icon={<Icon name="delete" size={16} />} aria-label="Delete" />
                  <IconButton variant={t} emphasis={emp} size="md" icon={<Icon name="settings" size={16} />} aria-label="Settings" />
                </ButtonGroup>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── ToggleButton Group ─────────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Toggle Button Groups (medium)</h2>

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
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)", width: 120, flexShrink: 0 }}>
                {s}
              </span>
              <ToggleGroup size={s} />
            </div>
          ))}
        </div>
      </section>

      {/* ── IconToggleButton Group ─────────────────────────────────── */}
      <section>
        <h2 style={{ margin: "0 0 16px" }}>Icon Toggle Button Groups (medium)</h2>

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
          {SIZES.map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 11, color: "var(--text-neutral-secondary-default)", width: 120, flexShrink: 0 }}>
                {s}
              </span>
              <IconToggleGroup size={s} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ToggleGroup({ size }: { size: ButtonSize }) {
  const [selected, setSelected] = useState(0);

  return (
    <ButtonGroup variant="neutral" emphasis="medium">
      {["Left", "Center", "Right"].map((label, i) => (
        <ToggleButton
          key={label}
          size={size}
          emphasis="medium"
          checked={selected === i}
          onChange={() => setSelected(i)}
        >
          {label}
        </ToggleButton>
      ))}
    </ButtonGroup>
  );
}

function IconToggleGroup({ size }: { size: ButtonSize }) {
  const [selected, setSelected] = useState(0);
  const icons = ["star", "favorite", "add"] as const;

  return (
    <ButtonGroup variant="neutral" emphasis="medium">
      {icons.map((name, i) => (
        <IconToggleButton
          key={name}
          size={size}
          emphasis="medium"
          checked={selected === i}
          onChange={() => setSelected(i)}
          icon={<Icon name={name} size={16} />}
          aria-label={name}
        />
      ))}
    </ButtonGroup>
  );
}
