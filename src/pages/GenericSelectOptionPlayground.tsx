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
            descriptionText="Browse and open a file"
            leading={<Icon name="favorite" size={20} />}
            trailing={{ type: "helper-text" }}
            subMenu
          />
          <GenericSelectOption
            labelText="No sub-menu"
            descriptionText="Regular action item"
            leading={<Icon name="edit" size={20} />}
            trailing={{ type: "helper-text", helperText: "⌘E", helperIcon: false }}
          />
          <GenericSelectOption
            labelText="Label only"
            description={false}
          />
          <GenericSelectOption
            labelText="Disabled item"
            descriptionText="Cannot be interacted with"
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
            descriptionText="Permanently remove this item"
            leading={<Icon name="delete" size={20} />}
            trailing={{ type: "helper-text", helperText: "⌫", helperIcon: false }}
          />
          <GenericSelectOption
            alert
            labelText="Remove all"
            descriptionText="Clear entire list"
            leading={<Icon name="delete" size={20} />}
            subMenu
          />
          <GenericSelectOption
            alert
            disabled
            labelText="Disabled alert"
            descriptionText="Cannot be executed"
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
            descriptionText="Just text content"
          />
          <GenericSelectOption
            labelText="Sub-menu only"
            description={false}
            subMenu
          />
          <GenericSelectOption
            labelText="With leading only"
            descriptionText="No trailing or sub-menu"
            leading={<Icon name="settings" size={20} />}
          />
        </div>
      </section>
    </div>
  );
}
