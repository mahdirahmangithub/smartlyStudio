import { useState } from "react";
import { MultiSelectOption } from "../components/MultiSelectOption";
import { Icon } from "../components/Icon";

export default function MultiSelectOptionPlayground() {
  const [selections, setSelections] = useState<Record<string, boolean>>({});

  const toggle = (key: string) =>
    setSelections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <h2>MultiSelectOption</h2>

      {/* ── Interactive demo ────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Interactive</h3>
        <div style={{ maxWidth: 340 }}>
          {["Apple", "Banana", "Cherry", "Dragonfruit"].map((fruit) => (
            <MultiSelectOption
              key={fruit}
              checked={!!selections[fruit]}
              labelText={fruit}
              descriptionText={`A delicious ${fruit.toLowerCase()}`}
              leading={<Icon name="favorite" size={20} />}
              trailing={{ type: "helper-text", helperText: "Fruit" }}
              onChange={() => toggle(fruit)}
            />
          ))}
        </div>
      </section>

      {/* ── States matrix ──────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>States — Unchecked</h3>
        <div style={{ maxWidth: 340 }}>
          <MultiSelectOption
            labelText="Normal"
            descriptionText="Default unchecked state"
            leading={<Icon name="favorite" size={20} />}
            trailing={{ type: "helper-text" }}
          />
          <MultiSelectOption
            labelText="Disabled"
            descriptionText="Cannot be interacted with"
            disabled
            leading={<Icon name="favorite" size={20} />}
            trailing={{ type: "helper-text" }}
          />
        </div>
      </section>

      <section>
        <h3 style={{ marginBottom: 16 }}>States — Checked</h3>
        <div style={{ maxWidth: 340 }}>
          <MultiSelectOption
            checked
            labelText="Normal checked"
            descriptionText="Default checked state"
            leading={<Icon name="favorite" size={20} />}
            trailing={{ type: "helper-text" }}
          />
          <MultiSelectOption
            checked
            disabled
            labelText="Disabled checked"
            descriptionText="Cannot be unchecked"
            leading={<Icon name="favorite" size={20} />}
            trailing={{ type: "helper-text" }}
          />
        </div>
      </section>

      {/* ── Without optional slots ────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Without leading / trailing / description</h3>
        <div style={{ maxWidth: 340 }}>
          <MultiSelectOption
            labelText="Label only"
            description={false}
          />
          <MultiSelectOption
            checked
            labelText="Checked, no leading"
            descriptionText="Has description but no icon"
          />
          <MultiSelectOption
            labelText="With leading, no trailing"
            descriptionText="Only leading icon shown"
            leading={<Icon name="favorite" size={20} />}
          />
        </div>
      </section>
    </div>
  );
}
