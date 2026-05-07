import { useState } from "react";
import { SingleSelectOption } from "@sds/components/SingleSelectOption";
import { Icon } from "@sds/components/Icon";

export default function SingleSelectOptionPlayground() {
  const [selected, setSelected] = useState<string | null>(null);

  const fruits = ["Apple", "Banana", "Cherry", "Dragonfruit"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <h2>SingleSelectOption</h2>

      {/* ── Interactive demo ────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Interactive</h3>
        <div style={{ maxWidth: 340 }}>
          {fruits.map((fruit) => (
            <SingleSelectOption
              key={fruit}
              checked={selected === fruit}
              labelText={fruit}
              description={false}
              leading={<Icon name="favorite" size={20} />}
              trailing={{ type: "helper-text", helperText: "Fruit" }}
              onChange={() => setSelected(selected === fruit ? null : fruit)}
            />
          ))}
        </div>
      </section>

      {/* ── States matrix ──────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>States — Unchecked</h3>
        <div style={{ maxWidth: 340 }}>
          <SingleSelectOption
            labelText="Normal"
            description={false}
            leading={<Icon name="favorite" size={20} />}
            trailing={{ type: "helper-text" }}
          />
          <SingleSelectOption
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
          <SingleSelectOption
            checked
            labelText="Normal checked"
            description={false}
            leading={<Icon name="favorite" size={20} />}
            trailing={{ type: "helper-text" }}
          />
          <SingleSelectOption
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
          <SingleSelectOption
            labelText="Label only"
            description={false}
          />
          <SingleSelectOption
            checked
            labelText="Checked, no leading"
            description={false}
          />
          <SingleSelectOption
            labelText="With leading, no trailing"
            description={false}
            leading={<Icon name="favorite" size={20} />}
          />
        </div>
      </section>
    </div>
  );
}
