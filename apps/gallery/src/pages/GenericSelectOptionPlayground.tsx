import { GenericSelectOption } from "@sds/components/GenericSelectOption";
import { Icon } from "@sds/components/Icon";
import { KeyboardShortcut } from "@sds/components/KeyboardShortcut";
import { RowContainer } from "@sds/components/RowContainer";

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
            trailing={{
              type: "shortcut",
              children: (
                <RowContainer density="xs">
                  <KeyboardShortcut keyText="⌘" size="lg" />
                  <KeyboardShortcut keyText="E" size="lg" />
                </RowContainer>
              ),
            }}
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
            trailing={{
              type: "shortcut",
              children: (
                <RowContainer density="xs">
                  <KeyboardShortcut keyText="⌫" size="lg" />
                </RowContainer>
              ),
            }}
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
