import { useState } from "react";
import { DataCellContent } from "../components/DataCellContent";
import type {
  DataCellContentState,
  DataCellContentTextAlignment,
  DataCellContentCellAlignment,
} from "../components/DataCellContent";
import { Checkbox } from "../components/Checkbox";
import { Radio } from "../components/Radio";
import { Toggle } from "../components/Toggle";
import { IconButton } from "../components/IconButton";
import { Expander } from "../components/Expander";
import { RowContainer } from "../components/RowContainer";
import { Icon } from "../components/Icon";
import { Badge } from "../components/Badge";

const sectionStyle = { marginBottom: 40 } as const;
const cardStyle = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
} as const;
const rowStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 16,
};
const controlRowStyle = {
  display: "flex",
  alignItems: "center" as const,
  gap: 12,
  flexWrap: "wrap" as const,
  marginBottom: 24,
};
const selectStyle = {
  padding: "4px 8px",
  borderRadius: 6,
  border: "1px solid var(--element-outline-neutral-default)",
  background: "var(--element-surface-over)",
  color: "var(--text-neutral-primary)",
  fontSize: 13,
};

const STATES: DataCellContentState[] = ["normal", "normal-low", "disable"];
const TEXT_ALIGNS: DataCellContentTextAlignment[] = ["left", "center", "right"];
const CELL_ALIGNS: DataCellContentCellAlignment[] = ["left", "center", "right"];

export default function DataCellContentPlayground() {
  const [state, setState] = useState<DataCellContentState>("normal");
  const [textAlign, setTextAlign] = useState<DataCellContentTextAlignment>("left");
  const [cellAlign, setCellAlign] = useState<DataCellContentCellAlignment>("left");
  const [expanded, setExpanded] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2 style={{ margin: 0 }}>DataCellContent</h2>

      {/* ── Controls ─────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={controlRowStyle}>
          <label style={{ fontSize: 13 }}>
            State:{" "}
            <select
              value={state}
              onChange={(e) => setState(e.target.value as DataCellContentState)}
              style={selectStyle}
            >
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label style={{ fontSize: 13 }}>
            Text align:{" "}
            <select
              value={textAlign}
              onChange={(e) => setTextAlign(e.target.value as DataCellContentTextAlignment)}
              style={selectStyle}
            >
              {TEXT_ALIGNS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>

          <label style={{ fontSize: 13 }}>
            Cell align:{" "}
            <select
              value={cellAlign}
              onChange={(e) => setCellAlign(e.target.value as DataCellContentCellAlignment)}
              style={selectStyle}
            >
              {CELL_ALIGNS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </label>
        </div>

        {/* ── Full example ────────────────────────────────────── */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px" }}>All slots</h3>
          <div style={rowStyle}>
            <DataCellContent
              state={state}
              textAlignment={textAlign}
              cellAlignment={cellAlign}
              expandButton={
                <IconButton
                  size="sm"
                  variant="neutral"
                  emphasis="low"
                  icon={<Expander expanded={expanded} size="sm" />}
                  aria-label="Expand row"
                  onClick={() => setExpanded((e) => !e)}
                />
              }
              switchSlot={
                <Checkbox
                  size="sm"
                  checked={checked}
                  onChange={setChecked}
                />
              }
              leading={
                <RowContainer density="sm">
                  <Icon name="person" size={20} />
                </RowContainer>
              }
              title="John Doe"
              description="Senior Software Engineer"
              trailing={
                <RowContainer density="sm">
                  <Badge>Active</Badge>
                </RowContainer>
              }
            />
          </div>
        </div>
      </section>

      {/* ── States comparison ─────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px" }}>States</h3>
          <div style={rowStyle}>
            {STATES.map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 12, opacity: 0.5, width: 80, flexShrink: 0 }}>{s}</span>
                <DataCellContent
                  state={s}
                  title="Title"
                  description="Description"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Text alignment ────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px" }}>Text alignment</h3>
          <div style={rowStyle}>
            {TEXT_ALIGNS.map((a) => (
              <div key={a}>
                <span style={{ fontSize: 12, opacity: 0.5 }}>{a}</span>
                <DataCellContent
                  textAlignment={a}
                  title="Title"
                  description="Description"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Switch slot variants ──────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px" }}>Switch slot variants</h3>
          <div style={rowStyle}>
            <DataCellContent
              switchSlot={<Checkbox size="sm" checked={checked} onChange={setChecked} />}
              title="With Checkbox"
              description="Checkbox in switch slot"
            />
            <DataCellContent
              switchSlot={<Radio size="sm" checked={checked} onChange={setChecked} />}
              title="With Radio"
              description="Radio in switch slot"
            />
            <DataCellContent
              switchSlot={<Toggle size="sm" checked={checked} onChange={setChecked} />}
              title="With Toggle"
              description="Toggle in switch slot"
            />
          </div>
        </div>
      </section>

      {/* ── Trailing-only, centered ────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px" }}>Trailing only (cell-align center)</h3>
          <DataCellContent
            cellAlignment="center"
            trailing={
              <RowContainer density="sm">
                <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="edit" size={16} />} aria-label="Edit" />
                <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="content_copy" size={16} />} aria-label="Copy" />
                <IconButton size="sm" variant="neutral" emphasis="low" icon={<Icon name="delete" size={16} />} aria-label="Delete" />
              </RowContainer>
            }
          />
        </div>
      </section>

      {/* ── Title only / Description only ─────────────────────── */}
      <section style={sectionStyle}>
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px" }}>Text variations</h3>
          <div style={rowStyle}>
            <DataCellContent title="Title only" />
            <DataCellContent description="Description only" />
            <DataCellContent title="Title" description="With description" />
          </div>
        </div>
      </section>
    </div>
  );
}
