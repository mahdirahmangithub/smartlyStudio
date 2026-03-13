import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
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
  const [label, setLabel] = useState("Analytics & Reporting Dashboard");
  const [checked, setChecked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [externalLink, setExternalLink] = useState(false);
  const [badgeEnabled, setBadgeEnabled] = useState(false);
  const [badgeCount, setBadgeCount] = useState("New");
  const [hasLeadingIcon, setHasLeadingIcon] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [actionEnabled, setActionEnabled] = useState(false);

  return (
    <div style={{ display: "flex", gap: 32 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180 }}>
        <label style={controlRow}>
          label:
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={{ width: 160 }}
          />
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={hasLeadingIcon} onChange={(e) => setHasLeadingIcon(e.target.checked)} />
          leading icon
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          checked
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} />
          locked
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={externalLink} onChange={(e) => setExternalLink(e.target.checked)} />
          externalLink
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={badgeEnabled} onChange={(e) => setBadgeEnabled(e.target.checked)} />
          badge
          {badgeEnabled && (
            <input
              type="text"
              value={badgeCount}
              onChange={(e) => setBadgeCount(e.target.value)}
              style={{ width: 40 }}
            />
          )}
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          pinned
        </label>
        <label style={controlRow}>
          <input type="checkbox" checked={actionEnabled} onChange={(e) => setActionEnabled(e.target.checked)} />
          action button
        </label>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "start" }}>
        <div style={{
          "--nav-expanded-width": `${EXPANDED_WIDTH}px`,
          width: EXPANDED_WIDTH,
        } as React.CSSProperties}>
          <NavigationSubItem
            label={label}
            leadingIcon={hasLeadingIcon ? <Icon name="favorite_fill" size={20} /> : undefined}
            checked={checked}
            locked={locked}
            externalLink={externalLink}
            badgeCount={badgeEnabled ? badgeCount : undefined}
            pinned={pinned}
            actionIcon={actionEnabled ? (pinned ? "keep_off" : "keep") : undefined}
            actionLabel={pinned ? "Unpin" : "Pin"}
            onAction={() => setPinned((p) => !p)}
          />
        </div>
      </div>
    </div>
  );
}

function BasicDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 296, "--nav-expanded-width": `${EXPANDED_WIDTH}px` } as React.CSSProperties}>
      <NavigationSubItem
        label="Home"
        leadingIcon={<Icon name="home" size={20} />}
      />
      <NavigationSubItem
        label="Campaigns"
        leadingIcon={<Icon name="rocket" size={20} />}
        checked
      />
      <NavigationSubItem
        label="Analytics & Reporting Dashboard"
        leadingIcon={<Icon name="dashboard" size={20} />}
      />
      <NavigationSubItem
        label="Settings"
        leadingIcon={<Icon name="settings" size={20} />}
      />
    </div>
  );
}

function NoIconDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 296, "--nav-expanded-width": `${EXPANDED_WIDTH}px` } as React.CSSProperties}>
      <NavigationSubItem label="Overview" />
      <NavigationSubItem label="Campaign Performance" checked />
      <NavigationSubItem label="Audience Insights & Segmentation" />
      <NavigationSubItem label="Budget Allocation" />
    </div>
  );
}

function BadgeLockDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 296, "--nav-expanded-width": `${EXPANDED_WIDTH}px` } as React.CSSProperties}>
      <NavigationSubItem
        label="Notifications"
        leadingIcon={<Icon name="notifications" size={20} />}
        badgeCount="New"
      />
      <NavigationSubItem
        label="Locked Feature"
        leadingIcon={<Icon name="star" size={20} />}
        locked
      />
      <NavigationSubItem
        label="Premium Analytics"
        leadingIcon={<Icon name="dashboard" size={20} />}
        locked
        badgeCount="New"
      />
    </div>
  );
}

function PinnedActionsDemo() {
  const [pinnedItems, setPinnedItems] = useState<Set<string>>(new Set(["campaigns", "assets"]));

  const toggle = (id: string) => {
    setPinnedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const items = [
    { id: "home", label: "Home", icon: "home" as const },
    { id: "campaigns", label: "Campaigns", icon: "rocket" as const },
    { id: "analytics", label: "Analytics & Reporting Dashboard", icon: "dashboard" as const },
    { id: "assets", label: "Creative Assets Library", icon: "image" as const },
    { id: "settings", label: "Settings", icon: "settings" as const },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 296, "--nav-expanded-width": `${EXPANDED_WIDTH}px` } as React.CSSProperties}>
      {items.map((item) => {
        const isPinned = pinnedItems.has(item.id);
        return (
          <NavigationSubItem
            key={item.id}
            label={item.label}
            leadingIcon={<Icon name={item.icon} size={20} />}
            pinned={isPinned}
            actionIcon={isPinned ? "keep_off" : "keep"}
            actionLabel={isPinned ? "Unpin" : "Pin"}
            onAction={() => toggle(item.id)}
          />
        );
      })}
    </div>
  );
}

function ExternalLinkDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 296, "--nav-expanded-width": `${EXPANDED_WIDTH}px` } as React.CSSProperties}>
      <NavigationSubItem
        label="Documentation"
        leadingIcon={<Icon name="description" size={20} />}
        externalLink
      />
      <NavigationSubItem
        label="API Reference & Developer Portal"
        externalLink
      />
    </div>
  );
}

function ParentDrivenDemo() {
  const [expanded, setExpanded] = useState(true);
  const [expandedWidth, setExpandedWidth] = useState(320);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [liveWidth, setLiveWidth] = useState(expandedWidth);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !expanded) return;
    let latestWidth = expandedWidth;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentBoxSize[0].inlineSize) + WRAPPER_PADDING * 2;
      latestWidth = w;
      setLiveWidth(w);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      setExpandedWidth(latestWidth);
    };
  }, [expanded]);

  const handleWidthInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setExpandedWidth(v);
    setLiveWidth(v);
  }, []);

  const navExpandedWidth = (expanded ? liveWidth : expandedWidth) - WRAPPER_PADDING * 2;

  const wrapperStyle: Record<string, unknown> = {
    "--nav-expanded-width": `${navExpandedWidth}px`,
    "--_fade-size": expanded ? "0px" : "64px",
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

  const itemsStyle: Record<string, unknown> = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    overflow: "hidden",
    opacity: expanded ? 1 : 0,
    maxHeight: expanded ? 999 : 0,
    transition: expanded
      ? "opacity var(--animation-state-expand-duration) var(--animation-state-expand-easing), max-height var(--animation-state-expand-duration) var(--animation-state-expand-easing)"
      : "opacity var(--animation-state-collapse-duration) var(--animation-state-collapse-easing), max-height var(--animation-state-collapse-duration) var(--animation-state-collapse-easing)",
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
        <div style={itemsStyle}>
          <NavigationSubItem
            label="Home"
            leadingIcon={<Icon name="home" size={20} />}
            checked
          />
          <NavigationSubItem
            label="Campaigns"
            leadingIcon={<Icon name="rocket" size={20} />}
            badgeCount={3}
          />
          <NavigationSubItem
            label="Analytics & Reporting Dashboard"
            leadingIcon={<Icon name="dashboard" size={20} />}
            locked
          />
          <NavigationSubItem
            label="Settings"
            leadingIcon={<Icon name="settings" size={20} />}
          />
        </div>
      </div>
    </>
  );
}

export default function NavigationSubItemPlayground() {
  return (
    <>
      <h1>NavigationSubItem</h1>

      <section style={sectionStyle}>
        <h2>Props Playground</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle all props interactively.
        </p>
        <div style={cardStyle}>
          <PropsPlayground />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Basic (with leading icon)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Standard sub-items with leading icon and checked state.
        </p>
        <div style={cardStyle}>
          <BasicDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Without Leading Icon</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Sub-items without a leading icon — label only.
        </p>
        <div style={cardStyle}>
          <NoIconDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Badge & Lock</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Badge appears after lock badge per design spec.
        </p>
        <div style={cardStyle}>
          <BadgeLockDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Pinned & Actions</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Hover to reveal the action button. Pinned items show a keep icon that the button overlays on hover.
        </p>
        <div style={cardStyle}>
          <PinnedActionsDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>External Link</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Items with external link indicator, with and without leading icon.
        </p>
        <div style={cardStyle}>
          <ExternalLinkDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Parent-Driven Collapse</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Parent controls width and fade. Sub-items inherit <code>--_fade-size</code> and fade
          uniformly (icon + content) on collapse. Resize when expanded.
        </p>
        <div style={cardStyle}>
          <ParentDrivenDemo />
        </div>
      </section>
    </>
  );
}
