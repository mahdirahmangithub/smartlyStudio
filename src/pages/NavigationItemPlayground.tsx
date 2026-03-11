import { type CSSProperties, useState } from "react";
import { NavigationItem } from "../components/NavigationItem";
import { Icon } from "../components/Icon";

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
  const [iconOnly, setIconOnly] = useState(false);
  const [checked, setChecked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [externalLink, setExternalLink] = useState(false);
  const [badgeEnabled, setBadgeEnabled] = useState(false);
  const [badgeCount, setBadgeCount] = useState("3");
  const [pinned, setPinned] = useState(false);
  const [actionEnabled, setActionEnabled] = useState(false);

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
              style={{ width: 40, padding: "4px 6px", borderRadius: 4, border: "1px solid #ccc", fontSize: 13, textAlign: "center" }}
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
        <div style={{ width: iconOnly ? "auto" : 296, transition: "width 300ms ease" }}>
          <NavigationItem
            label={label}
            leadingIcon={<Icon name="dashboard" size={20} />}
            iconOnly={iconOnly}
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
  const [checked, setChecked] = useState<string | null>("home");

  const items = [
    { id: "home", label: "Home", icon: "home" as const },
    { id: "campaigns", label: "Campaigns", icon: "rocket" as const },
    { id: "analytics", label: "Analytics & Reporting Dashboard", icon: "dashboard" as const },
    { id: "audiences", label: "Audiences", icon: "group" as const },
    { id: "assets", label: "Creative Assets Library", icon: "image" as const },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 296 }}>
      {items.map((item) => (
        <NavigationItem
          key={item.id}
          label={item.label}
          leadingIcon={<Icon name={item.icon} size={20} />}
          checked={checked === item.id}
          onClick={() => setChecked(item.id)}
        />
      ))}
    </div>
  );
}

function IconOnlyToggleDemo() {
  const [iconOnly, setIconOnly] = useState(false);
  const [checked, setChecked] = useState<string | null>("home");

  const items = [
    { id: "home", label: "Home", icon: "home" as const },
    { id: "campaigns", label: "Campaigns", icon: "rocket" as const },
    { id: "analytics", label: "Analytics & Reporting", icon: "dashboard" as const },
    { id: "settings", label: "Settings", icon: "settings" as const },
  ];

  return (
    <>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={iconOnly}
          onChange={(e) => setIconOnly(e.target.checked)}
        />
        Icon-only mode
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: iconOnly ? "auto" : 296, transition: "width 300ms ease" }}>
        {items.map((item) => (
          <NavigationItem
            key={item.id}
            label={item.label}
            leadingIcon={<Icon name={item.icon} size={20} />}
            iconOnly={iconOnly}
            checked={checked === item.id}
            onClick={() => setChecked(item.id)}
          />
        ))}
      </div>
    </>
  );
}

function BadgeLockDemo() {
  const [checked, setChecked] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 296 }}>
      <NavigationItem
        label="Inbox"
        leadingIcon={<Icon name="inbox" size={20} />}
        badgeCount={12}
        checked={checked === "inbox"}
        onClick={() => setChecked("inbox")}
      />
      <NavigationItem
        label="Shared with me"
        leadingIcon={<Icon name="share" size={20} />}
        badgeCount={3}
        locked
        checked={checked === "shared"}
        onClick={() => setChecked("shared")}
      />
      <NavigationItem
        label="Private Workspace"
        leadingIcon={<Icon name="folder" size={20} />}
        locked
        checked={checked === "private"}
        onClick={() => setChecked("private")}
      />
    </div>
  );
}

function IconOnlyBadgeDemo() {
  const [iconOnly, setIconOnly] = useState(true);

  return (
    <>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={iconOnly}
          onChange={(e) => setIconOnly(e.target.checked)}
        />
        Icon-only mode
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: iconOnly ? "auto" : 296, transition: "width 300ms ease" }}>
        <NavigationItem
          label="Inbox"
          leadingIcon={<Icon name="inbox" size={20} />}
          iconOnly={iconOnly}
          badgeCount={5}
        />
        <NavigationItem
          label="Notifications"
          leadingIcon={<Icon name="notifications" size={20} />}
          iconOnly={iconOnly}
          checked
          badgeCount={12}
        />
        <NavigationItem
          label="Messages"
          leadingIcon={<Icon name="chat" size={20} />}
          iconOnly={iconOnly}
        />
      </div>
    </>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 296 }}>
      {items.map((item) => {
        const isPinned = pinnedItems.has(item.id);
        return (
          <NavigationItem
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
    <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 296 }}>
      <NavigationItem
        label="Documentation"
        leadingIcon={<Icon name="description" size={20} />}
        externalLink
      />
      <NavigationItem
        label="Help Center"
        leadingIcon={<Icon name="help" size={20} />}
        externalLink
      />
    </div>
  );
}

export default function NavigationItemPlayground() {
  return (
    <>
      <h1>NavigationItem</h1>

      <section style={sectionStyle}>
        <h2>Props Playground</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Manipulate all props and label text interactively.
        </p>
        <div style={cardStyle}>
          <PropsPlayground />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Basic</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Standard navigation items with leading icons and checked state.
        </p>
        <div style={cardStyle}>
          <BasicDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Icon-Only Toggle</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle between expanded and icon-only mode. Labels animate smoothly.
        </p>
        <div style={cardStyle}>
          <IconOnlyToggleDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Badge & Lock</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Items with notification badges and lock indicators.
        </p>
        <div style={cardStyle}>
          <BadgeLockDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Icon-Only with Badge</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Badge repositions from inline to top-right corner in icon-only mode.
        </p>
        <div style={cardStyle}>
          <IconOnlyBadgeDemo />
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
          Items with an external link indicator icon.
        </p>
        <div style={cardStyle}>
          <ExternalLinkDemo />
        </div>
      </section>
    </>
  );
}
