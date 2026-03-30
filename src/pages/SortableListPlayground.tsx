import { type CSSProperties, useCallback, useState } from "react";
import { SortableList, SortableListItem } from "../components/SortableList";
import { Entity } from "../components/Entity";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
  maxWidth: 420,
};

/* ── helpers ─────────────────────────────────────────────────────── */

interface Item {
  id: string;
  title: string;
  description: string;
  icon: string;
  disabled?: boolean;
}

function reorder<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

const ITEMS: Item[] = [
  { id: "1", title: "Design tokens", description: "Color, spacing, typography", icon: "favorite" },
  { id: "2", title: "Icon library", description: "800+ icons with search", icon: "bookmark" },
  { id: "3", title: "Button component", description: "Primary, secondary, ghost", icon: "settings" },
  { id: "4", title: "Dropdown menu", description: "Anchored overlay panel", icon: "notifications" },
  { id: "5", title: "Data table", description: "Sortable columns with pagination", icon: "description" },
];

const ITEMS_WITH_DISABLED: Item[] = [
  { id: "a", title: "Active item one", description: "Can be moved", icon: "home" },
  { id: "b", title: "Disabled item", description: "Cannot be moved", icon: "lock", disabled: true },
  { id: "c", title: "Active item two", description: "Can be moved", icon: "edit" },
  { id: "d", title: "Active item three", description: "Can be moved", icon: "visibility" },
];

/* ── demos ────────────────────────────────────────────────────────── */

function BasicDemo() {
  const [items, setItems] = useState(ITEMS);

  const handleReorder = useCallback((from: number, to: number) => {
    setItems((prev) => reorder(prev, from, to));
  }, []);

  return (
    <SortableList onReorder={handleReorder} total={items.length}>
      {items.map((item, i) => (
        <SortableListItem key={item.id} index={i}>
          <Entity
            leading={<Icon name={item.icon as never} size={16} />}
            title={item.title}
            description={item.description}
            hiddenActions={
              <>
                <IconButton icon={<Icon name="favorite" size={16} />} aria-label="Favorite" variant="neutral" emphasis="low" size="sm" />
                <IconButton icon={<Icon name="delete" size={16} />} aria-label="Delete" variant="neutral" emphasis="low" size="sm" />
                <IconButton icon={<Icon name="more_vert" size={16} />} aria-label="More" variant="neutral" emphasis="low" size="sm" />
              </>
            }
          />
        </SortableListItem>
      ))}
    </SortableList>
  );
}

function OutlineDemo() {
  const [items, setItems] = useState(ITEMS);

  const handleReorder = useCallback((from: number, to: number) => {
    setItems((prev) => reorder(prev, from, to));
  }, []);

  return (
    <SortableList onReorder={handleReorder} total={items.length}>
      {items.map((item, i) => (
        <SortableListItem key={item.id} index={i} outline>
          <Entity
            leading={<Icon name={item.icon as never} size={16} />}
            title={item.title}
            description={item.description}
            hiddenActions={
              <>
                <IconButton icon={<Icon name="favorite" size={16} />} aria-label="Favorite" variant="neutral" emphasis="low" size="sm" />
                <IconButton icon={<Icon name="delete" size={16} />} aria-label="Delete" variant="neutral" emphasis="low" size="sm" />
                <IconButton icon={<Icon name="more_vert" size={16} />} aria-label="More" variant="neutral" emphasis="low" size="sm" />
              </>
            }
          />
        </SortableListItem>
      ))}
    </SortableList>
  );
}

function ShiftDemo({ outline = false }: { outline?: boolean }) {
  const [items, setItems] = useState(ITEMS);

  const handleReorder = useCallback((from: number, to: number) => {
    setItems((prev) => reorder(prev, from, to));
  }, []);

  return (
    <SortableList onReorder={handleReorder} total={items.length} behavior="shift">
      {items.map((item, i) => (
        <SortableListItem key={item.id} index={i} outline={outline}>
          <Entity
            leading={<Icon name={item.icon as never} size={16} />}
            title={item.title}
            description={item.description}
            hiddenActions={
              <>
                <IconButton icon={<Icon name="favorite" size={16} />} aria-label="Favorite" variant="neutral" emphasis="low" size="sm" />
                <IconButton icon={<Icon name="delete" size={16} />} aria-label="Delete" variant="neutral" emphasis="low" size="sm" />
                <IconButton icon={<Icon name="more_vert" size={16} />} aria-label="More" variant="neutral" emphasis="low" size="sm" />
              </>
            }
          />
        </SortableListItem>
      ))}
    </SortableList>
  );
}

function DisabledDemo() {
  const [items, setItems] = useState(ITEMS_WITH_DISABLED);

  const handleReorder = useCallback((from: number, to: number) => {
    setItems((prev) => reorder(prev, from, to));
  }, []);

  return (
    <SortableList onReorder={handleReorder} total={items.length}>
      {items.map((item, i) => (
        <SortableListItem key={item.id} index={i} outline disabled={item.disabled}>
          <Entity
            leading={<Icon name={item.icon as never} size={16} />}
            title={item.title}
            description={item.description}
            hiddenActions={
              <>
                <IconButton icon={<Icon name="favorite" size={16} />} aria-label="Favorite" variant="neutral" emphasis="low" size="sm" />
                <IconButton icon={<Icon name="delete" size={16} />} aria-label="Delete" variant="neutral" emphasis="low" size="sm" />
                <IconButton icon={<Icon name="more_vert" size={16} />} aria-label="More" variant="neutral" emphasis="low" size="sm" />
              </>
            }
          />
        </SortableListItem>
      ))}
    </SortableList>
  );
}

/* ── page ─────────────────────────────────────────────────────────── */

export default function SortableListPlayground() {
  return (
    <>
      <h1>SortableList</h1>

      <section style={sectionStyle}>
        <h2>Default (no outline)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Drag via the handle or use the menu (click handle) to reorder.
          Hidden actions appear on hover.
        </p>
        <div style={cardStyle}>
          <BasicDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Outline variant</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Each item has a visible border. Placeholder shows dashed brand border
          while dragging.
        </p>
        <div style={cardStyle}>
          <OutlineDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Shift behavior (no outline)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Grab from anywhere on the item. Items shift in real-time as you drag.
        </p>
        <div style={cardStyle}>
          <ShiftDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Shift behavior (outline)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Same natural reorder with outline variant.
        </p>
        <div style={cardStyle}>
          <ShiftDemo outline />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Disabled items</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Disabled items cannot be dragged or interacted with.
        </p>
        <div style={cardStyle}>
          <DisabledDemo />
        </div>
      </section>
    </>
  );
}
