import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavigationCategoryItem } from "../components/NavigationCategoryItem";
import { NavigationSubItem } from "../components/NavigationSubItem";
import { Icon } from "../components/Icon";

const WRAPPER_PADDING = 16;
const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 296;

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
  const [label, setLabel] = useState("Favorites");
  const [iconOnly, setIconOnly] = useState(false);
  const [checked, setChecked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [locked, setLocked] = useState(false);
  const [badge, setBadge] = useState(true);

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
          <input type="checkbox" checked={expanded} onChange={(e) => setExpanded(e.target.checked)} />
          expanded
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} />
          locked
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={badge} onChange={(e) => setBadge(e.target.checked)} />
          badge
        </label>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "start" }}>
        <div style={{
          "--nav-expanded-width": `${EXPANDED_WIDTH}px`,
          width: iconOnly ? 40 : EXPANDED_WIDTH,
          transition: iconOnly
            ? "width var(--animation-state-collapse-duration) var(--animation-state-collapse-easing)"
            : "width var(--animation-state-expand-duration) var(--animation-state-expand-easing)",
        } as React.CSSProperties}>
          <NavigationCategoryItem
            label={label}
            leadingIcon={<Icon name="favorite_fill" size={20} />}
            iconOnly={iconOnly}
            checked={checked}
            expanded={expanded}
            badgeCount={badge ? 2 : undefined}
            locked={locked}
            onClick={() => setExpanded((e) => !e)}
          >
            <NavigationSubItem label="Overview" checked />
            <NavigationSubItem label="Recent Activity" />
            <NavigationSubItem label="Shared With Me" badgeCount="New" />
          </NavigationCategoryItem>
        </div>
      </div>
    </div>
  );
}

function BasicDemo() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const toggle = (i: number) => setExpanded((s) => ({ ...s, [i]: !s[i] }));

  const items = [
    { label: "Favorites", icon: "favorite_fill" as const, badge: 2 },
    { label: "Reports", icon: "reporting" as const },
    { label: "Settings", icon: "settings" as const, locked: true },
    { label: "A Very Long Category Name That Should Truncate", icon: "folder" as const, badge: 12 },
  ];

  return (
    <div style={{ "--nav-expanded-width": `${EXPANDED_WIDTH}px`, display: "flex", flexDirection: "column", gap: 8, maxWidth: EXPANDED_WIDTH } as React.CSSProperties}>
      {items.map((item, i) => (
        <NavigationCategoryItem
          key={i}
          label={item.label}
          leadingIcon={<Icon name={item.icon} size={20} />}
          expanded={!!expanded[i]}
          badgeCount={item.badge}
          locked={item.locked}
          onClick={() => toggle(i)}
        >
          <NavigationSubItem label="Sub Item 1" />
          <NavigationSubItem label="Sub Item 2" checked />
          <NavigationSubItem label="Sub Item 3" />
        </NavigationCategoryItem>
      ))}
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
      <div style={{
        "--nav-expanded-width": `${EXPANDED_WIDTH}px`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: iconOnly ? 40 : EXPANDED_WIDTH,
        transition: iconOnly
          ? "width var(--animation-state-collapse-duration) var(--animation-state-collapse-easing)"
          : "width var(--animation-state-expand-duration) var(--animation-state-expand-easing)",
      } as React.CSSProperties}>
        <NavigationCategoryItem
          label="Favorites"
          leadingIcon={<Icon name="favorite_fill" size={20} />}
          iconOnly={iconOnly}
          badgeCount={2}
        />
        <NavigationCategoryItem
          label="Reports"
          leadingIcon={<Icon name="reporting" size={20} />}
          iconOnly={iconOnly}
        />
        <NavigationCategoryItem
          label="Settings"
          leadingIcon={<Icon name="settings" size={20} />}
          iconOnly={iconOnly}
          locked
        />
      </div>
    </div>
  );
}

function CheckedDemo() {
  const [selected, setSelected] = useState(0);

  const items = [
    { label: "Favorites", icon: "favorite_fill" as const },
    { label: "Reports", icon: "reporting" as const },
    { label: "Settings", icon: "settings" as const },
  ];

  return (
    <div style={{ "--nav-expanded-width": `${EXPANDED_WIDTH}px`, display: "flex", flexDirection: "column", gap: 8, maxWidth: EXPANDED_WIDTH } as React.CSSProperties}>
      {items.map((item, i) => (
        <NavigationCategoryItem
          key={i}
          label={item.label}
          leadingIcon={<Icon name={item.icon} size={20} />}
          checked={selected === i}
          onClick={() => setSelected(i)}
        />
      ))}
    </div>
  );
}

function ParentDrivenDemo() {
  const [expanded, setExpanded] = useState(false);
  const [expandedWidth, setExpandedWidth] = useState(320);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);

  useLayoutEffect(() => {
    isTransitioningRef.current = true;
    const el = wrapperRef.current;
    if (!el) return;
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName === "width") isTransitioningRef.current = false;
    };
    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, [expanded]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !expanded) return;
    const ro = new ResizeObserver(([entry]) => {
      if (isTransitioningRef.current) return;
      const w = Math.round(entry.borderBoxSize[0].inlineSize);
      setExpandedWidth((prev) => (prev === w ? prev : w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded]);

  const handleWidthInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setExpandedWidth(Number(e.target.value));
  }, []);

  const WRAPPER_BORDER = 1;
  const navExpandedWidth = expandedWidth - WRAPPER_PADDING * 2 - WRAPPER_BORDER * 2;

  const wrapperStyle: Record<string, unknown> = {
    "--nav-expanded-width": `${navExpandedWidth}px`,
    width: expanded ? expandedWidth : COLLAPSED_WIDTH,
    padding: WRAPPER_PADDING,
    borderRadius: 12,
    background: "var(--element-surface-base)",
    border: "1px solid var(--element-outline-neutral-default)",
    overflow: "hidden",
    transition: expanded
      ? "width var(--animation-state-expand-duration) var(--animation-state-expand-easing)"
      : "width var(--animation-state-collapse-duration) var(--animation-state-collapse-easing)",
    resize: expanded ? "horizontal" : "none",
    minWidth: expanded ? COLLAPSED_WIDTH : undefined,
    maxWidth: expanded ? 600 : undefined,
  };

  return (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <button onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Collapse" : "Expand"}
        </button>
        <label style={controlRow}>
          Width:
          <input
            type="number"
            value={expandedWidth}
            onChange={handleWidthInput}
            style={{ width: 60 }}
          />
        </label>
      </div>

      <div ref={wrapperRef} style={wrapperStyle}>
        <NavigationCategoryItem
          label="Favorites"
          leadingIcon={<Icon name="favorite_fill" size={20} />}
          iconOnly={!expanded}
          expanded={accordionOpen}
          badgeCount={3}
          onClick={() => setAccordionOpen((v) => !v)}
        >
          <NavigationSubItem label="All Favorites" checked />
          <NavigationSubItem label="Recent" />
          <NavigationSubItem label="Shared" badgeCount="New" />
        </NavigationCategoryItem>
      </div>
    </>
  );
}

export default function NavigationCategoryItemPlayground() {
  return (
    <>
      <h1>NavigationCategoryItem</h1>

      <section style={sectionStyle}>
        <h2>Parent-Driven Expansion</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Parent wrapper drives the width transition. Resizable from the right edge when expanded. Badge animates between positions via FLIP.
        </p>
        <div style={cardStyle}>
          <ParentDrivenDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Props Playground</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Interactive controls for all props. Click the item to toggle expanded.
        </p>
        <div style={cardStyle}>
          <PropsPlayground />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Basic — Expand / Collapse</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Click each category to toggle its expanded state.
        </p>
        <div style={cardStyle}>
          <BasicDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Icon Only</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle icon-only mode — label, badge, lock, and expander collapse.
        </p>
        <div style={cardStyle}>
          <IconOnlyDemo />
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
