import { useState } from "react";
import { MultiSelectOption } from "@sds/components/MultiSelectOption";
import { Icon } from "@sds/components/Icon";

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
              description={false}
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
            description={false}
            leading={<Icon name="favorite" size={20} />}
            trailing={{ type: "helper-text" }}
          />
          <MultiSelectOption
            labelText="Disabled"
            description={false}
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
            description={false}
            leading={<Icon name="favorite" size={20} />}
            trailing={{ type: "helper-text" }}
          />
          <MultiSelectOption
            checked
            disabled
            labelText="Disabled checked"
            description={false}
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
            description={false}
          />
          <MultiSelectOption
            labelText="With leading, no trailing"
            description={false}
            leading={<Icon name="favorite" size={20} />}
          />
        </div>
      </section>
    </div>
  );
}
