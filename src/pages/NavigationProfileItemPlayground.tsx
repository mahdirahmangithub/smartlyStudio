import { type CSSProperties, useState } from "react";
import { NavigationProfileItem } from "../components/NavigationProfileItem";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const controlRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
};

function PropsPlayground() {
  const [label, setLabel] = useState("Mahdi Rahman");
  const [iconOnly, setIconOnly] = useState(false);
  const [checked, setChecked] = useState(false);
  const [chevron, setChevron] = useState(true);

  return (
    <div style={{ display: "flex", gap: 32 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 220 }}>
        <label style={controlRow}>
          Label
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={{ flex: 1, padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc", fontSize: 13 }}
          />
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={iconOnly} onChange={(e) => setIconOnly(e.target.checked)} />
          iconOnly
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          checked
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={chevron} onChange={(e) => setChevron(e.target.checked)} />
          chevron
        </label>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "start" }}>
        <NavigationProfileItem
          label={label}
          avatarSrc="https://i.pravatar.cc/80?u=mahdi"
          avatarAlt={label}
          iconOnly={iconOnly}
          checked={checked}
          chevron={chevron}
          onClick={() => console.log("clicked")}
        />
      </div>
    </div>
  );
}

function BasicDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 296 }}>
      <NavigationProfileItem
        label="Mahdi Rahman"
        avatarSrc="https://i.pravatar.cc/80?u=mahdi"
        avatarAlt="Mahdi Rahman"
      />
      <NavigationProfileItem
        label="John Doe"
        avatarInitials="JD"
        avatarAlt="John Doe"
      />
      <NavigationProfileItem
        label="A Very Long Profile Name That Should Truncate"
        avatarSrc="https://i.pravatar.cc/80?u=long"
        avatarAlt="Long Name"
      />
    </div>
  );
}

function IconOnlyDemo() {
  const [iconOnly, setIconOnly] = useState(true);

  return (
    <div>
      <label style={{ ...controlRow, marginBottom: 12 }}>
        <input type="checkbox" checked={iconOnly} onChange={(e) => setIconOnly(e.target.checked)} />
        iconOnly
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: iconOnly ? "fit-content" : 296 }}>
        <NavigationProfileItem
          label="Mahdi Rahman"
          avatarSrc="https://i.pravatar.cc/80?u=mahdi"
          avatarAlt="Mahdi Rahman"
          iconOnly={iconOnly}
        />
        <NavigationProfileItem
          label="John Doe"
          avatarInitials="JD"
          avatarAlt="John Doe"
          iconOnly={iconOnly}
        />
      </div>
    </div>
  );
}

function NoChevronDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 296 }}>
      <NavigationProfileItem
        label="Mahdi Rahman"
        avatarSrc="https://i.pravatar.cc/80?u=mahdi"
        avatarAlt="Mahdi Rahman"
        chevron={false}
      />
      <NavigationProfileItem
        label="John Doe"
        avatarInitials="JD"
        avatarAlt="John Doe"
        chevron={false}
      />
    </div>
  );
}

function CheckedDemo() {
  const [selected, setSelected] = useState(0);
  const profiles = [
    { label: "Mahdi Rahman", src: "https://i.pravatar.cc/80?u=mahdi" },
    { label: "John Doe", initials: "JD" },
    { label: "Jane Smith", src: "https://i.pravatar.cc/80?u=jane" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 296 }}>
      {profiles.map((p, i) => (
        <NavigationProfileItem
          key={i}
          label={p.label}
          avatarSrc={p.src}
          avatarInitials={p.initials}
          avatarAlt={p.label}
          checked={selected === i}
          onClick={() => setSelected(i)}
        />
      ))}
    </div>
  );
}

export default function NavigationProfileItemPlayground() {
  return (
    <>
      <h1>NavigationProfileItem</h1>

      <section style={sectionStyle}>
        <h2>Props Playground</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Interactive controls for all props.
        </p>
        <div style={cardStyle}>
          <PropsPlayground />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Basic</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Default state with image, initials, and long label.
        </p>
        <div style={cardStyle}>
          <BasicDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Icon Only</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle icon-only mode — avatar stays visible, label and chevron collapse.
        </p>
        <div style={cardStyle}>
          <IconOnlyDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>No Chevron</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Chevron hidden via <code>chevron=false</code>.
        </p>
        <div style={cardStyle}>
          <NoChevronDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Checked / Selected</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Click to select — shows active background.
        </p>
        <div style={cardStyle}>
          <CheckedDemo />
        </div>
      </section>
    </>
  );
}
