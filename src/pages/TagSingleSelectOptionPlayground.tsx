import { useState } from "react";
import { TagSingleSelectOption } from "../components/TagSingleSelectOption";
import { Icon, type IconName } from "../components/Icon";
import type { TagType } from "../components/Tag";

const ITEMS: { label: string; variant: TagType; icon: IconName }[] = [
  { label: "Marketing", variant: "brand", icon: "favorite" },
  { label: "Analytics", variant: "info", icon: "info" },
  { label: "Revenue", variant: "success", icon: "trending_up" },
  { label: "Budget Alert", variant: "warning", icon: "warning" },
  { label: "Deprecated", variant: "alert", icon: "delete" },
  { label: "Segment A", variant: "cat-1", icon: "group" },
];

export default function TagSingleSelectOptionPlayground() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <h2>TagSingleSelectOption</h2>

      {/* ── Interactive — different tag variants ─────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Interactive — Tag variants</h3>
        <div style={{ maxWidth: 380 }}>
          {ITEMS.map(({ label, variant, icon }) => (
            <TagSingleSelectOption
              key={label}
              checked={selected === label}
              labelText={label}
              tagVariant={variant}
              description={false}
              leading={<Icon name={icon} size={20} />}
              trailing={{ type: "helper-text", helperText: variant }}
              onChange={() => setSelected(selected === label ? null : label)}
            />
          ))}
        </div>
      </section>

      {/* ── High emphasis ────────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>High emphasis</h3>
        <div style={{ maxWidth: 380 }}>
          <TagSingleSelectOption
            checked
            labelText="Brand high"
            tagVariant="brand"
            tagEmphasis="high"
            description={false}
            leading={<Icon name="favorite" size={20} />}
          />
          <TagSingleSelectOption
            labelText="Success high"
            tagVariant="success"
            tagEmphasis="high"
            description={false}
            leading={<Icon name="check_circle" size={20} />}
          />
        </div>
      </section>

      {/* ── States ───────────────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>States</h3>
        <div style={{ maxWidth: 380 }}>
          <TagSingleSelectOption
            labelText="Normal"
            tagVariant="info"
            description={false}
            leading={<Icon name="info" size={20} />}
            trailing={{ type: "helper-text" }}
          />
          <TagSingleSelectOption
            checked
            labelText="Checked"
            tagVariant="success"
            description={false}
            leading={<Icon name="check_circle" size={20} />}
            trailing={{ type: "helper-text" }}
          />
          <TagSingleSelectOption
            disabled
            labelText="Disabled"
            tagVariant="warning"
            description={false}
            leading={<Icon name="warning" size={20} />}
            trailing={{ type: "helper-text" }}
          />
          <TagSingleSelectOption
            checked
            disabled
            labelText="Checked disabled"
            tagVariant="alert"
            description={false}
            leading={<Icon name="error" size={20} />}
            trailing={{ type: "helper-text" }}
          />
        </div>
      </section>

      {/* ── Variations ────────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Variations</h3>
        <div style={{ maxWidth: 380 }}>
          <TagSingleSelectOption
            labelText="Tag only"
            tagVariant="cat-2"
            description={false}
          />
          <TagSingleSelectOption
            checked
            labelText="Checked, no leading"
            tagVariant="cat-3"
            description={false}
          />
          <TagSingleSelectOption
            labelText="With leading, no trailing"
            tagVariant="cat-4"
            description={false}
            leading={<Icon name="settings" size={20} />}
          />
        </div>
      </section>
    </div>
  );
}
