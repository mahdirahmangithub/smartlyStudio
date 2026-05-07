import { type CSSProperties, useCallback, useState } from "react";
import { DragHandle } from "@sds/components/DragHandle";
import { DragHandleMenu } from "@sds/components/DragHandleMenu";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
  display: "flex",
  gap: 24,
  alignItems: "center",
};

/* ── mock sortable list demo ───────────────────────────────────────── */

const INITIAL_ITEMS = [
  "Design tokens",
  "Icon library",
  "Button component",
  "Dropdown menu",
  "Data table",
];

function ReorderDemo() {
  const [items, setItems] = useState(INITIAL_ITEMS);

  const moveItem = useCallback(
    (from: number, to: number) => {
      setItems((prev) => {
        const next = [...prev];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return next;
      });
    },
    [],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {items.map((item, i) => (
        <div
          key={item}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 8px",
            borderRadius: 6,
            border: "1px solid #e0e0e0",
            background: "#fafafa",
          }}
        >
          <DragHandleMenu
            type="dot"
            size="sm"
            index={i}
            total={items.length}
            onMoveUp={() => moveItem(i, i - 1)}
            onMoveDown={() => moveItem(i, i + 1)}
            onMoveToTop={() => moveItem(i, 0)}
            onMoveToBottom={() => moveItem(i, items.length - 1)}
          />
          <span style={{ fontSize: 14 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function DragHandlePlayground() {
  return (
    <>
      <h1>DragHandle</h1>

      <section style={sectionStyle}>
        <h2>Dot type</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Four dots stacked vertically. Available in sm and lg sizes.
        </p>
        <div style={cardStyle}>
          <div style={{ textAlign: "center" }}>
            <DragHandle type="dot" size="sm" />
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.5 }}>sm</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <DragHandle type="dot" size="lg" />
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.5 }}>lg</div>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Line type</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Single vertical line. Available in sm and lg sizes.
        </p>
        <div style={cardStyle}>
          <div style={{ textAlign: "center" }}>
            <DragHandle type="line" size="sm" />
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.5 }}>sm</div>
          </div>
          <div style={{ textAlign: "center", height: 32, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <DragHandle type="line" size="lg" style={{ height: "100%" }} />
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.5 }}>lg</div>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Interactive states</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Hover, press, and focus states. Try tabbing and clicking.
        </p>
        <div style={cardStyle}>
          <DragHandle type="dot" size="lg" />
          <DragHandle type="dot" size="sm" />
          <DragHandle type="line" size="lg" style={{ height: 32 }} />
          <DragHandle type="line" size="sm" />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>DragHandleMenu</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Click a drag handle to open the reorder menu. First/last items
          have move-to-top/move-to-bottom disabled.
        </p>
        <div style={{ ...cardStyle, flexDirection: "column", alignItems: "stretch" }}>
          <ReorderDemo />
        </div>
      </section>
    </>
  );
}
