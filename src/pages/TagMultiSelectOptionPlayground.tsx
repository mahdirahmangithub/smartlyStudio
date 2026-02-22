import { useState } from "react";
import { TagMultiSelectOption } from "../components/TagMultiSelectOption";
import { Icon } from "../components/Icon";
import type { TagType } from "../components/Tag";

const ITEMS: { label: string; variant: TagType; icon: string }[] = [
  { label: "Marketing", variant: "brand", icon: "favorite" },
  { label: "Analytics", variant: "info", icon: "info" },
  { label: "Revenue", variant: "success", icon: "trending_up" },
  { label: "Budget Alert", variant: "warning", icon: "warning" },
  { label: "Deprecated", variant: "alert", icon: "delete" },
  { label: "Segment A", variant: "cat-1", icon: "group" },
  { label: "Segment B", variant: "cat-2", icon: "person" },
  { label: "Segment C", variant: "cat-3", icon: "star" },
];

export default function TagMultiSelectOptionPlayground() {
  const [selections, setSelections] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setSelections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <h2>TagMultiSelectOption</h2>

      {/* ── Interactive — different tag variants ─────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Interactive — Tag variants</h3>
        <div style={{ maxWidth: 380 }}>
          {ITEMS.map(({ label, variant, icon }) => (
            <TagMultiSelectOption
              key={label}
              checked={!!selections[label]}
              labelText={label}
              tagVariant={variant}
              descriptionText={`${variant} tag variant`}
              leading={<Icon name={icon} size={20} />}
              trailing={{ type: "helper-text", helperText: variant }}
              onChange={() => toggle(label)}
            />
          ))}
        </div>
      </section>

      {/* ── High emphasis ────────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>High emphasis</h3>
        <div style={{ maxWidth: 380 }}>
          <TagMultiSelectOption
            labelText="Brand high"
            tagVariant="brand"
            tagEmphasis="high"
            descriptionText="High emphasis brand tag"
            leading={<Icon name="favorite" size={20} />}
          />
          <TagMultiSelectOption
            labelText="Success high"
            tagVariant="success"
            tagEmphasis="high"
            descriptionText="High emphasis success tag"
            leading={<Icon name="check_circle" size={20} />}
          />
          <TagMultiSelectOption
            labelText="Alert high"
            tagVariant="alert"
            tagEmphasis="high"
            descriptionText="High emphasis alert tag"
            leading={<Icon name="error" size={20} />}
          />
        </div>
      </section>

      {/* ── States ───────────────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>States</h3>
        <div style={{ maxWidth: 380 }}>
          <TagMultiSelectOption
            labelText="Normal"
            tagVariant="info"
            descriptionText="Default unchecked"
            leading={<Icon name="info" size={20} />}
            trailing={{ type: "helper-text" }}
          />
          <TagMultiSelectOption
            checked
            labelText="Checked"
            tagVariant="success"
            descriptionText="Checked state"
            leading={<Icon name="check_circle" size={20} />}
            trailing={{ type: "helper-text" }}
          />
          <TagMultiSelectOption
            disabled
            labelText="Disabled"
            tagVariant="warning"
            descriptionText="Cannot be interacted with"
            leading={<Icon name="warning" size={20} />}
            trailing={{ type: "helper-text" }}
          />
          <TagMultiSelectOption
            checked
            disabled
            labelText="Checked disabled"
            tagVariant="alert"
            descriptionText="Cannot be unchecked"
            leading={<Icon name="error" size={20} />}
            trailing={{ type: "helper-text" }}
          />
        </div>
      </section>

      {/* ── Without optional slots ────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Variations</h3>
        <div style={{ maxWidth: 380 }}>
          <TagMultiSelectOption
            labelText="Tag only"
            tagVariant="cat-4"
            description={false}
          />
          <TagMultiSelectOption
            checked
            labelText="Checked, no leading"
            tagVariant="cat-5"
            descriptionText="Has description but no icon"
          />
          <TagMultiSelectOption
            labelText="With leading, no trailing"
            tagVariant="cat-6"
            descriptionText="Only leading icon shown"
            leading={<Icon name="settings" size={20} />}
          />
        </div>
      </section>
    </div>
  );
}
