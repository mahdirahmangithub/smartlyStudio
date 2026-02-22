import { OptionSeparator } from "../components/OptionSeparator";
import { SingleSelectOption } from "../components/SingleSelectOption";
import { MultiSelectOption } from "../components/MultiSelectOption";
import { Icon } from "../components/Icon";

export default function OptionSeparatorPlayground() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2>OptionSeparator</h2>

      {/* ── Divider type ─────────────────────────────────────────── */}
      <section>
        <h3>Divider</h3>
        <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
          A horizontal line separating groups of options.
        </p>
        <div style={{ maxWidth: 304 }}>
          <SingleSelectOption labelText="Apple" leading={<Icon name="favorite" size={24} />} />
          <SingleSelectOption labelText="Banana" leading={<Icon name="info" size={24} />} />
          <OptionSeparator type="divider" />
          <SingleSelectOption labelText="Carrot" leading={<Icon name="settings" size={24} />} />
          <SingleSelectOption labelText="Broccoli" leading={<Icon name="check" size={24} />} />
        </div>
      </section>

      {/* ── Group label type ─────────────────────────────────────── */}
      <section>
        <h3>Group Label</h3>
        <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
          Acts as an optgroup title for a group of options.
        </p>
        <div style={{ maxWidth: 304 }}>
          <OptionSeparator type="group-label" labelText="Fruits" />
          <SingleSelectOption labelText="Apple" checked />
          <SingleSelectOption labelText="Banana" />
          <SingleSelectOption labelText="Cherry" />
          <OptionSeparator type="group-label" labelText="Vegetables" />
          <SingleSelectOption labelText="Carrot" />
          <SingleSelectOption labelText="Broccoli" />
        </div>
      </section>

      {/* ── Combined usage ───────────────────────────────────────── */}
      <section>
        <h3>Combined (divider + group labels)</h3>
        <div style={{ maxWidth: 304 }}>
          <OptionSeparator type="group-label" labelText="Recently used" />
          <MultiSelectOption labelText="Draft" checked />
          <MultiSelectOption labelText="Published" />
          <OptionSeparator type="divider" />
          <OptionSeparator type="group-label" labelText="All statuses" />
          <MultiSelectOption labelText="Draft" checked />
          <MultiSelectOption labelText="Published" />
          <MultiSelectOption labelText="Archived" />
          <MultiSelectOption labelText="Deleted" />
        </div>
      </section>
    </div>
  );
}
