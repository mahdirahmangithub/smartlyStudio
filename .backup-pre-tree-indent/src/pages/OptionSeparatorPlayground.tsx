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
          <SingleSelectOption labelText="Apple" description={false} leading={<Icon name="favorite" size={24} />} />
          <SingleSelectOption labelText="Banana" description={false} leading={<Icon name="info" size={24} />} />
          <OptionSeparator type="divider" />
          <SingleSelectOption labelText="Carrot" description={false} leading={<Icon name="settings" size={24} />} />
          <SingleSelectOption labelText="Broccoli" description={false} leading={<Icon name="check" size={24} />} />
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
          <SingleSelectOption labelText="Apple" description={false} checked />
          <SingleSelectOption labelText="Banana" description={false} />
          <SingleSelectOption labelText="Cherry" description={false} />
          <OptionSeparator type="group-label" labelText="Vegetables" />
          <SingleSelectOption labelText="Carrot" description={false} />
          <SingleSelectOption labelText="Broccoli" description={false} />
        </div>
      </section>

      {/* ── Combined usage ───────────────────────────────────────── */}
      <section>
        <h3>Combined (divider + group labels)</h3>
        <div style={{ maxWidth: 304 }}>
          <OptionSeparator type="group-label" labelText="Recently used" />
          <MultiSelectOption labelText="Draft" description={false} checked />
          <MultiSelectOption labelText="Published" description={false} />
          <OptionSeparator type="divider" />
          <OptionSeparator type="group-label" labelText="All statuses" />
          <MultiSelectOption labelText="Draft" description={false} checked />
          <MultiSelectOption labelText="Published" description={false} />
          <MultiSelectOption labelText="Archived" description={false} />
          <MultiSelectOption labelText="Deleted" description={false} />
        </div>
      </section>
    </div>
  );
}
