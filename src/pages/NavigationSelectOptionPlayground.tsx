import { NavigationSelectOption } from "../components/NavigationSelectOption";
import { Icon } from "../components/Icon";

export default function NavigationSelectOptionPlayground() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <h2>NavigationSelectOption</h2>

      {/* ── With leading icon ────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>With leading icon</h3>
        <div style={{ maxWidth: 340 }}>
          <NavigationSelectOption
            labelText="Settings"
            leading={<Icon name="settings" size={20} />}
            onClick={() => alert("Settings clicked")}
          />
          <NavigationSelectOption
            labelText="Profile"
            leading={<Icon name="person" size={20} />}
            onClick={() => alert("Profile clicked")}
          />
          <NavigationSelectOption
            labelText="Favorites"
            leading={<Icon name="favorite" size={20} />}
            onClick={() => alert("Favorites clicked")}
          />
          <NavigationSelectOption
            labelText="Notifications"
            leading={<Icon name="notifications" size={20} />}
            onClick={() => alert("Notifications clicked")}
          />
        </div>
      </section>

      {/* ── Without leading icon ─────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Without leading icon</h3>
        <div style={{ maxWidth: 340 }}>
          <NavigationSelectOption labelText="Label only" />
          <NavigationSelectOption labelText="Another option" />
        </div>
      </section>

      {/* ── Truncated label (hover for tooltip) ────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Truncated label</h3>
        <div style={{ maxWidth: 180 }}>
          <NavigationSelectOption
            labelText="This is a very long navigation label that will be truncated"
            leading={<Icon name="settings" size={20} />}
          />
          <NavigationSelectOption
            labelText="Another extremely long option label to demonstrate truncation tooltip"
            leading={<Icon name="favorite" size={20} />}
          />
        </div>
      </section>

      {/* ── Disabled ─────────────────────────────────────────────────────── */}
      <section>
        <h3 style={{ marginBottom: 16 }}>Disabled</h3>
        <div style={{ maxWidth: 340 }}>
          <NavigationSelectOption
            labelText="Disabled with icon"
            leading={<Icon name="favorite" size={20} />}
            disabled
          />
          <NavigationSelectOption
            labelText="Disabled without icon"
            disabled
          />
        </div>
      </section>
    </div>
  );
}
