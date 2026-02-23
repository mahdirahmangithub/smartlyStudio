import { GenericSelectOption } from "../components/GenericSelectOption";
import { Icon } from "../components/Icon";

export default function GenericSelectOptionPlayground() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <h2>GenericSelectOption</h2>

      {/* ── Neutral ────────────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Neutral</h3>
        <div style={{ maxWidth: 340 }}>
          <GenericSelectOption
            labelText="Open file"
            description={false}
            leading={<Icon name="favorite" size={20} />}
            trailing={{ type: "helper-text" }}
            subMenu
          />
          <GenericSelectOption
            labelText="No sub-menu"
            description={false}
            leading={<Icon name="edit" size={20} />}
            trailing={{ type: "helper-text", helperText: "⌘E", helperIcon: false }}
          />
          <GenericSelectOption
            labelText="Label only"
            description={false}
          />
          <GenericSelectOption
            labelText="Disabled item"
            description={false}
            disabled
            leading={<Icon name="favorite" size={20} />}
            trailing={{ type: "helper-text" }}
            subMenu
          />
        </div>
      </section>

      {/* ── Alert / Destructive ────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Alert (Destructive)</h3>
        <div style={{ maxWidth: 340 }}>
          <GenericSelectOption
            alert
            labelText="Delete"
            description={false}
            leading={<Icon name="delete" size={20} />}
            trailing={{ type: "helper-text", helperText: "⌫", helperIcon: false }}
          />
          <GenericSelectOption
            alert
            labelText="Remove all"
            description={false}
            leading={<Icon name="delete" size={20} />}
            subMenu
          />
          <GenericSelectOption
            alert
            disabled
            labelText="Disabled alert"
            description={false}
            leading={<Icon name="delete" size={20} />}
            subMenu
          />
        </div>
      </section>

      {/* ── Without optional slots ────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Variations</h3>
        <div style={{ maxWidth: 340 }}>
          <GenericSelectOption
            labelText="No leading, no trailing"
            description={false}
          />
          <GenericSelectOption
            labelText="Sub-menu only"
            description={false}
            subMenu
          />
          <GenericSelectOption
            labelText="With leading only"
            description={false}
            leading={<Icon name="settings" size={20} />}
          />
        </div>
      </section>
    </div>
  );
}
