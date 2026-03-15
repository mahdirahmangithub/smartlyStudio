import { useState, type CSSProperties } from "react";
import { Breadcrumb } from "../components/Breadcrumb";
import type { BreadcrumbSize } from "../components/Breadcrumb";
import { BreadcrumbItem } from "../components/BreadcrumbItem";
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
    </>
  );
}
