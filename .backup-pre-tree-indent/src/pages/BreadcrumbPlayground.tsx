import { useState, type CSSProperties } from "react";
import { Breadcrumb } from "../components/Breadcrumb";
import type { BreadcrumbSize } from "../components/Breadcrumb";
import { BreadcrumbItem } from "../components/BreadcrumbItem";
import { BreadcrumbSelectItem } from "../components/BreadcrumbSelectItem";
import type { BreadcrumbSelectOption } from "../components/BreadcrumbSelectItem";
import { Icon } from "../components/Icon";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

function PropsPlayground() {
  const [size, setSize] = useState<BreadcrumbSize>("lg");
  const [basic, setBasic] = useState(false);
  const [merge, setMerge] = useState(false);

  const iconSize = size === "lg" ? 20 : 16;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          Size:
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as BreadcrumbSize)}
            style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc" }}
          >
            <option value="lg">lg</option>
            <option value="md">md</option>
            <option value="sm">sm</option>
          </select>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={basic}
            onChange={(e) => setBasic(e.target.checked)}
          />
          basic
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={merge}
            onChange={(e) => setMerge(e.target.checked)}
          />
          merge (maxItems=4)
        </label>
      </div>
      <Breadcrumb size={size} basic={basic} maxItems={merge ? 4 : undefined}>
        <BreadcrumbItem href="#" icon={<Icon name="favorite_fill" size={iconSize} />}>
          Home
        </BreadcrumbItem>
        <BreadcrumbItem href="#">Products</BreadcrumbItem>
        <BreadcrumbItem href="#">Electronics</BreadcrumbItem>
        <BreadcrumbItem href="#">Computers</BreadcrumbItem>
        <BreadcrumbItem href="#">Laptops</BreadcrumbItem>
        <BreadcrumbItem href="#">Gaming</BreadcrumbItem>
        <BreadcrumbItem current>Current Page</BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
}

function ItemPropsPlayground() {
  const [size, setSize] = useState<BreadcrumbSize>("lg");
  const [basic, setBasic] = useState(false);
  const [leading, setLeading] = useState(true);
  const [label, setLabel] = useState(true);
  const [current, setCurrent] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const iconSize = size === "lg" ? 20 : 16;

  const controlStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <label style={controlStyle}>
          Size:
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as BreadcrumbSize)}
            style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc" }}
          >
            <option value="lg">lg</option>
            <option value="md">md</option>
            <option value="sm">sm</option>
          </select>
        </label>
        <label style={controlStyle}>
          <input type="checkbox" checked={basic} onChange={(e) => setBasic(e.target.checked)} />
          basic
        </label>
        <label style={controlStyle}>
          <input type="checkbox" checked={leading} onChange={(e) => setLeading(e.target.checked)} />
          leading icon
        </label>
        <label style={controlStyle}>
          <input type="checkbox" checked={label} onChange={(e) => setLabel(e.target.checked)} />
          label
        </label>
        <label style={controlStyle}>
          <input type="checkbox" checked={current} onChange={(e) => setCurrent(e.target.checked)} />
          current
        </label>
        <label style={controlStyle}>
          <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
          disabled
        </label>
      </div>
      <div>
        <BreadcrumbItem
          size={size}
          basic={basic}
          icon={leading ? <Icon name="favorite_fill" size={iconSize} /> : undefined}
          current={current}
          disabled={disabled}
          href={current ? undefined : "#"}
        >
          {label ? "Link" : undefined}
        </BreadcrumbItem>
      </div>
    </div>
  );
}

function BasicDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbItem href="#" icon={<Icon name="home" size={20} />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem href="#">Products</BreadcrumbItem>
      <BreadcrumbItem href="#">Category</BreadcrumbItem>
      <BreadcrumbItem current>Current Page</BreadcrumbItem>
    </Breadcrumb>
  );
}

function TruncationDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Breadcrumb>
        <BreadcrumbItem href="#" icon={<Icon name="home" size={20} />}>
          Home
        </BreadcrumbItem>
        <BreadcrumbItem href="#">
          This is a very long breadcrumb label that should be truncated with an ellipsis and show a tooltip on hover
        </BreadcrumbItem>
        <BreadcrumbItem current>Current Page</BreadcrumbItem>
      </Breadcrumb>
      <Breadcrumb basic>
        <BreadcrumbItem href="#" icon={<Icon name="home" size={20} />}>
          Home
        </BreadcrumbItem>
        <BreadcrumbItem href="#">
          This is a very long breadcrumb label that should be truncated with an ellipsis and show a tooltip on hover
        </BreadcrumbItem>
        <BreadcrumbItem current>Current Page</BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
}

function BasicVariantDemo() {
  return (
    <Breadcrumb basic>
      <BreadcrumbItem href="#" icon={<Icon name="home" size={20} />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbItem href="#">Products</BreadcrumbItem>
      <BreadcrumbItem href="#">Category</BreadcrumbItem>
      <BreadcrumbItem current>Current Page</BreadcrumbItem>
    </Breadcrumb>
  );
}

function SizesDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {(["lg", "md", "sm"] as const).map((size) => (
        <div key={size}>
          <p style={{ fontSize: 12, margin: "0 0 8px", opacity: 0.5 }}>
            size="{size}"
          </p>
          <Breadcrumb size={size}>
            <BreadcrumbItem href="#" icon={<Icon name="favorite_fill" size={size === "lg" ? 20 : 16} />}>
              Link
            </BreadcrumbItem>
            <BreadcrumbItem href="#">Link</BreadcrumbItem>
            <BreadcrumbItem href="#">Link</BreadcrumbItem>
            <BreadcrumbItem current>Link</BreadcrumbItem>
          </Breadcrumb>
        </div>
      ))}
    </div>
  );
}

function BasicSizesDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {(["lg", "md", "sm"] as const).map((size) => (
        <div key={size}>
          <p style={{ fontSize: 12, margin: "0 0 8px", opacity: 0.5 }}>
            basic, size="{size}"
          </p>
          <Breadcrumb size={size} basic>
            <BreadcrumbItem href="#" icon={<Icon name="favorite_fill" size={size === "lg" ? 20 : 16} />}>
              Link
            </BreadcrumbItem>
            <BreadcrumbItem href="#">Link</BreadcrumbItem>
            <BreadcrumbItem href="#">Link</BreadcrumbItem>
            <BreadcrumbItem current>Link</BreadcrumbItem>
          </Breadcrumb>
        </div>
      ))}
    </div>
  );
}

function NoWrapDemo() {
  const [width, setWidth] = useState(500);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
        Container width:
        <input
          type="range"
          min={200}
          max={800}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
        />
        <span>{width}px</span>
      </label>

      <p style={{ fontSize: 12, margin: 0, opacity: 0.5 }}>
        noWrap, basic, sm — 3 segments (no collapse)
      </p>
      <div style={{ width, border: "1px dashed #ccc", padding: 8, borderRadius: 6 }}>
        <Breadcrumb size="sm" basic noWrap>
          <BreadcrumbItem href="#" icon={<Icon name="home" size={16} />} aria-label="Root" />
          <BreadcrumbItem href="#">My Documents and Projects</BreadcrumbItem>
          <BreadcrumbItem current>Current Folder</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <p style={{ fontSize: 12, margin: 0, opacity: 0.5 }}>
        noWrap, basic, sm — 4 segments (2 between, no collapse)
      </p>
      <div style={{ width, border: "1px dashed #ccc", padding: 8, borderRadius: 6 }}>
        <Breadcrumb size="sm" basic noWrap maxItems={4} itemsBeforeCollapse={1} itemsAfterCollapse={2}>
          <BreadcrumbItem href="#" icon={<Icon name="home" size={16} />} aria-label="Root" />
          <BreadcrumbItem href="#">Very Long Folder Name Here</BreadcrumbItem>
          <BreadcrumbItem href="#">Another Long Folder Name</BreadcrumbItem>
          <BreadcrumbItem current>Current Folder With A Long Name</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <p style={{ fontSize: 12, margin: 0, opacity: 0.5 }}>
        noWrap, basic, sm — 6 segments (collapsed, maxItems=4)
      </p>
      <div style={{ width, border: "1px dashed #ccc", padding: 8, borderRadius: 6 }}>
        <Breadcrumb size="sm" basic noWrap maxItems={4} itemsBeforeCollapse={1} itemsAfterCollapse={2}>
          <BreadcrumbItem href="#" icon={<Icon name="home" size={16} />} aria-label="Root" />
          <BreadcrumbItem href="#">Projects</BreadcrumbItem>
          <BreadcrumbItem href="#">Design System</BreadcrumbItem>
          <BreadcrumbItem href="#">Components</BreadcrumbItem>
          <BreadcrumbItem href="#">Breadcrumb Folder With Long Name</BreadcrumbItem>
          <BreadcrumbItem current>Current Very Deep Folder</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <p style={{ fontSize: 12, margin: 0, opacity: 0.5 }}>
        noWrap, pill, md — 5 segments (collapsed, maxItems=4)
      </p>
      <div style={{ width, border: "1px dashed #ccc", padding: 8, borderRadius: 6 }}>
        <Breadcrumb size="md" noWrap maxItems={4} itemsBeforeCollapse={1} itemsAfterCollapse={2}>
          <BreadcrumbItem href="#" icon={<Icon name="home" size={16} />}>Home</BreadcrumbItem>
          <BreadcrumbItem href="#">Products Category</BreadcrumbItem>
          <BreadcrumbItem href="#">Electronics</BreadcrumbItem>
          <BreadcrumbItem href="#">Laptops and Computers</BreadcrumbItem>
          <BreadcrumbItem current>MacBook Pro 16 inch</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </div>
  );
}

function CollapseDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, margin: "0 0 8px", opacity: 0.5 }}>
          maxItems=4 (7 items, collapsed)
        </p>
        <Breadcrumb maxItems={4}>
          <BreadcrumbItem href="#" icon={<Icon name="home" size={20} />}>
            Home
          </BreadcrumbItem>
          <BreadcrumbItem href="#">Products</BreadcrumbItem>
          <BreadcrumbItem href="#">Electronics</BreadcrumbItem>
          <BreadcrumbItem href="#">Computers</BreadcrumbItem>
          <BreadcrumbItem href="#">Laptops</BreadcrumbItem>
          <BreadcrumbItem href="#">Gaming</BreadcrumbItem>
          <BreadcrumbItem current>MSI Raider</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div>
        <p style={{ fontSize: 12, margin: "0 0 8px", opacity: 0.5 }}>
          basic, maxItems=4 (7 items, collapsed)
        </p>
        <Breadcrumb maxItems={4} basic>
          <BreadcrumbItem href="#" icon={<Icon name="home" size={20} />}>
            Home
          </BreadcrumbItem>
          <BreadcrumbItem href="#">Products</BreadcrumbItem>
          <BreadcrumbItem href="#">Electronics</BreadcrumbItem>
          <BreadcrumbItem href="#">Computers</BreadcrumbItem>
          <BreadcrumbItem href="#">Laptops</BreadcrumbItem>
          <BreadcrumbItem href="#">Gaming</BreadcrumbItem>
          <BreadcrumbItem current>MSI Raider</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </div>
  );
}

function IconOnlyDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbItem href="#" icon={<Icon name="home" size={20} />} aria-label="Home" />
      <BreadcrumbItem href="#">Products</BreadcrumbItem>
      <BreadcrumbItem href="#">Category</BreadcrumbItem>
      <BreadcrumbItem current>Item</BreadcrumbItem>
    </Breadcrumb>
  );
}

function DisabledDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Breadcrumb>
        <BreadcrumbItem href="#" icon={<Icon name="home" size={20} />}>
          Home
        </BreadcrumbItem>
        <BreadcrumbItem href="#" disabled>
          Disabled
        </BreadcrumbItem>
        <BreadcrumbItem href="#">Active</BreadcrumbItem>
        <BreadcrumbItem current>Current</BreadcrumbItem>
      </Breadcrumb>
      <Breadcrumb basic>
        <BreadcrumbItem href="#" icon={<Icon name="home" size={20} />}>
          Home
        </BreadcrumbItem>
        <BreadcrumbItem href="#" disabled>
          Disabled
        </BreadcrumbItem>
        <BreadcrumbItem href="#">Active</BreadcrumbItem>
        <BreadcrumbItem current>Current</BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
}

/* ── Selectable item demos ── */

const CATEGORY_OPTIONS: BreadcrumbSelectOption[] = [
  { value: "electronics", label: "Electronics", href: "#electronics" },
  { value: "clothing", label: "Clothing", href: "#clothing" },
  { value: "books", label: "Books", href: "#books" },
  { value: "home-garden", label: "Home & Garden", href: "#home-garden" },
];

const SUBCATEGORY_OPTIONS: BreadcrumbSelectOption[] = [
  { value: "laptops", label: "Laptops", href: "#laptops" },
  { value: "phones", label: "Phones", href: "#phones" },
  { value: "tablets", label: "Tablets", href: "#tablets" },
];

function SelectItemPlayground() {
  const [size, setSize] = useState<BreadcrumbSize>("lg");
  const [leading, setLeading] = useState(true);
  const [badge, setBadge] = useState(true);
  const [current, setCurrent] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [selected, setSelected] = useState("electronics");

  const iconSize = size === "lg" ? 20 : 16;
  const controlStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <label style={controlStyle}>
          Size:
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as BreadcrumbSize)}
            style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc" }}
          >
            <option value="lg">lg</option>
            <option value="md">md</option>
            <option value="sm">sm</option>
          </select>
        </label>
        <label style={controlStyle}>
          <input type="checkbox" checked={leading} onChange={(e) => setLeading(e.target.checked)} />
          leading icon
        </label>
        <label style={controlStyle}>
          <input type="checkbox" checked={badge} onChange={(e) => setBadge(e.target.checked)} />
          badge
        </label>
        <label style={controlStyle}>
          <input type="checkbox" checked={current} onChange={(e) => setCurrent(e.target.checked)} />
          current
        </label>
        <label style={controlStyle}>
          <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
          disabled
        </label>
      </div>
      <div>
        <BreadcrumbSelectItem
          size={size}
          icon={leading ? <Icon name="favorite_fill" size={iconSize} /> : undefined}
          current={current}
          disabled={disabled}
          href="#"
          options={CATEGORY_OPTIONS}
          value={selected}
          onChange={(v) => setSelected(v)}
          showBadge={badge}
        >
          Category
        </BreadcrumbSelectItem>
      </div>
      <p style={{ fontSize: 12, opacity: 0.5, margin: 0 }}>
        Selected: <strong>{selected}</strong>
      </p>
    </div>
  );
}

function SelectInBreadcrumbDemo() {
  const [category, setCategory] = useState("electronics");
  const [subcategory, setSubcategory] = useState("laptops");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {(["lg", "md", "sm"] as const).map((size) => (
        <div key={size}>
          <p style={{ fontSize: 12, margin: "0 0 8px", opacity: 0.5 }}>
            size=&quot;{size}&quot;
          </p>
          <Breadcrumb size={size}>
            <BreadcrumbItem href="#" icon={<Icon name="home" size={size === "lg" ? 20 : 16} />}>
              Home
            </BreadcrumbItem>
            <BreadcrumbSelectItem
              href="#"
              icon={<Icon name="favorite_fill" size={size === "lg" ? 20 : 16} />}
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(v) => setCategory(v)}
            >
              Electronics
            </BreadcrumbSelectItem>
            <BreadcrumbSelectItem
              href="#"
              options={SUBCATEGORY_OPTIONS}
              value={subcategory}
              onChange={(v) => setSubcategory(v)}
            >
              Laptops
            </BreadcrumbSelectItem>
            <BreadcrumbItem current>MacBook Pro</BreadcrumbItem>
          </Breadcrumb>
        </div>
      ))}
      <p style={{ fontSize: 12, opacity: 0.5, margin: 0 }}>
        Category: <strong>{category}</strong> / Subcategory: <strong>{subcategory}</strong>
      </p>
    </div>
  );
}

function SelectCurrentDemo() {
  const [category, setCategory] = useState("electronics");
  const [subcategory, setSubcategory] = useState("laptops");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Breadcrumb>
        <BreadcrumbItem href="#" icon={<Icon name="home" size={20} />}>
          Home
        </BreadcrumbItem>
        <BreadcrumbSelectItem
          href="#"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(v) => setCategory(v)}
        >
          Electronics
        </BreadcrumbSelectItem>
        <BreadcrumbSelectItem
          current
          options={SUBCATEGORY_OPTIONS}
          value={subcategory}
          onChange={(v) => setSubcategory(v)}
          icon={<Icon name="favorite_fill" size={20} />}
        >
          Laptops
        </BreadcrumbSelectItem>
      </Breadcrumb>
      <p style={{ fontSize: 12, opacity: 0.5, margin: 0 }}>
        Selected subcategory: <strong>{subcategory}</strong>
      </p>
    </div>
  );
}

function SelectDisabledDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbItem href="#" icon={<Icon name="home" size={20} />}>
        Home
      </BreadcrumbItem>
      <BreadcrumbSelectItem
        href="#"
        options={CATEGORY_OPTIONS}
        value="electronics"
        disabled
      >
        Electronics
      </BreadcrumbSelectItem>
      <BreadcrumbItem href="#">Laptops</BreadcrumbItem>
      <BreadcrumbItem current>MacBook Pro</BreadcrumbItem>
    </Breadcrumb>
  );
}

export default function BreadcrumbPlayground() {
  return (
    <>
      <h1>Breadcrumb</h1>

      <section style={sectionStyle}>
        <h2>Props Playground</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle size, basic, and merge to explore all combinations.
        </p>
        <div style={cardStyle}>
          <PropsPlayground />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Single Item</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle all BreadcrumbItem props: size, basic, leading icon, label, current, disabled.
        </p>
        <div style={cardStyle}>
          <ItemPropsPlayground />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Truncation &amp; Tooltip</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Long labels truncate at 20rem and show a tooltip on hover.
        </p>
        <div style={cardStyle}>
          <TruncationDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Default (Pill)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Standard breadcrumb with pill-shaped items.
        </p>
        <div style={cardStyle}>
          <BasicDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Basic (Flat)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Flat text-style breadcrumb without pill containers.
        </p>
        <div style={cardStyle}>
          <BasicVariantDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Sizes (Pill)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Large, medium, and small pill variants.
        </p>
        <div style={cardStyle}>
          <SizesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Sizes (Basic)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Large, medium, and small basic variants.
        </p>
        <div style={cardStyle}>
          <BasicSizesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>No Wrap + Collapse</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Breadcrumb stays on one line, items truncate when constrained. Drag the slider to resize.
        </p>
        <div style={cardStyle}>
          <NoWrapDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Collapsed (maxItems)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Middle items collapse into an ellipsis button. Click to open a dropdown with hidden items.
        </p>
        <div style={cardStyle}>
          <CollapseDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Icon Only (First Item)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          First item with icon only, no label.
        </p>
        <div style={cardStyle}>
          <IconOnlyDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Disabled Items</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Disabled intermediate items in both variants.
        </p>
        <div style={cardStyle}>
          <DisabledDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Selectable Item</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle props on a single BreadcrumbSelectItem. The pill area navigates; the chevron opens a dropdown.
        </p>
        <div style={cardStyle}>
          <SelectItemPlayground />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Selectable Items in Breadcrumb</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Mixed regular and selectable items across all sizes. Hover to reveal the dropdown chevron.
        </p>
        <div style={cardStyle}>
          <SelectInBreadcrumbDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Selectable Current (Last Item)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          The last selectable item as current — chevron always points down.
        </p>
        <div style={cardStyle}>
          <SelectCurrentDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Selectable Disabled</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          A disabled selectable item alongside regular items.
        </p>
        <div style={cardStyle}>
          <SelectDisabledDemo />
        </div>
      </section>
    </>
  );
}
