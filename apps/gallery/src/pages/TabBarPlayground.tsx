import { useState, type CSSProperties } from "react";
import { TabBar } from "@sds/components/TabBar";
import { TabItem } from "@sds/components/TabItem";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

function BasicDemo() {
  const [value, setValue] = useState("tab1");
  return (
    <TabBar value={value} onChange={setValue} aria-label="Basic tabs">
      <TabItem value="tab1">Overview</TabItem>
      <TabItem value="tab2">Activity</TabItem>
      <TabItem value="tab3">Settings</TabItem>
    </TabBar>
  );
}

function WithIconsDemo() {
  const [value, setValue] = useState("favorites");
  return (
    <TabBar value={value} onChange={setValue} aria-label="Tabs with icons">
      <TabItem value="favorites" icon="favorite_fill">Favorites</TabItem>
      <TabItem value="recent" icon="schedule">Recent</TabItem>
      <TabItem value="shared" icon="group">Shared</TabItem>
    </TabBar>
  );
}

function InsetDemo() {
  const [value, setValue] = useState("tab1");
  return (
    <TabBar
      value={value}
      onChange={setValue}
      insetLeft="lg"
      insetRight="lg"
      aria-label="Tabs with insets"
    >
      <TabItem value="tab1" icon="favorite_fill">Overview</TabItem>
      <TabItem value="tab2" icon="favorite_fill">Activity</TabItem>
      <TabItem value="tab3" icon="favorite_fill">Settings</TabItem>
    </TabBar>
  );
}

function AddTabDemo() {
  const [tabs, setTabs] = useState([
    { value: "tab1", label: "Tab 1" },
    { value: "tab2", label: "Tab 2" },
    { value: "tab3", label: "Tab 3" },
  ]);
  const [value, setValue] = useState("tab1");

  const handleAdd = () => {
    const id = `tab${Date.now()}`;
    const num = tabs.length + 1;
    setTabs((prev) => [...prev, { value: id, label: `Tab ${num}` }]);
    setValue(id);
  };

  return (
    <TabBar
      value={value}
      onChange={setValue}
      onAddTab={handleAdd}
      insetLeft="lg"
      aria-label="Dynamic tabs"
    >
      {tabs.map((t) => (
        <TabItem key={t.value} value={t.value} icon="favorite_fill">
          {t.label}
        </TabItem>
      ))}
    </TabBar>
  );
}

function DisabledDemo() {
  const [value, setValue] = useState("tab1");
  return (
    <TabBar value={value} onChange={setValue} aria-label="Tabs with disabled">
      <TabItem value="tab1">Active</TabItem>
      <TabItem value="tab2" disabled>Disabled</TabItem>
      <TabItem value="tab3">Another</TabItem>
      <TabItem value="tab4" disabled>Also disabled</TabItem>
    </TabBar>
  );
}

function AllDisabledDemo() {
  return (
    <TabBar value="tab1" disabled aria-label="All disabled tabs">
      <TabItem value="tab1" icon="favorite_fill">Tab 1</TabItem>
      <TabItem value="tab2" icon="favorite_fill">Tab 2</TabItem>
      <TabItem value="tab3" icon="favorite_fill">Tab 3</TabItem>
    </TabBar>
  );
}

function FullWidthDemo() {
  const [value, setValue] = useState("tab1");
  return (
    <TabBar
      value={value}
      onChange={setValue}
      fullWidth
      aria-label="Full width tabs"
    >
      <TabItem value="tab1" icon="favorite_fill">Overview</TabItem>
      <TabItem value="tab2" icon="favorite_fill">Activity</TabItem>
      <TabItem value="tab3" icon="favorite_fill">Settings</TabItem>
    </TabBar>
  );
}

function ManualActivationDemo() {
  const [value, setValue] = useState("tab1");
  return (
    <TabBar
      value={value}
      onChange={setValue}
      activationMode="manual"
      aria-label="Manual activation tabs"
    >
      <TabItem value="tab1">Overview</TabItem>
      <TabItem value="tab2">Activity</TabItem>
      <TabItem value="tab3">Settings</TabItem>
    </TabBar>
  );
}

function ScrollDemo() {
  const [value, setValue] = useState("tab1");
  return (
    <div style={{ maxWidth: 400 }}>
      <TabBar
        value={value}
        onChange={setValue}
        insetLeft="lg"
        insetRight="lg"
        aria-label="Scrollable tabs"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <TabItem key={i} value={`tab${i + 1}`} icon="favorite_fill">
            Tab {i + 1}
          </TabItem>
        ))}
      </TabBar>
    </div>
  );
}

function UncontrolledDemo() {
  return (
    <TabBar defaultValue="tab2" aria-label="Uncontrolled tabs">
      <TabItem value="tab1">First</TabItem>
      <TabItem value="tab2">Second (default)</TabItem>
      <TabItem value="tab3">Third</TabItem>
    </TabBar>
  );
}

const TAB_PANELS: Record<string, { title: string; body: string }> = {
  overview: {
    title: "Overview",
    body: "Welcome to the project dashboard. Here you can see a high-level summary of your project's health, recent milestones, and key metrics at a glance.",
  },
  activity: {
    title: "Activity",
    body: "Recent activity across your project: 3 new commits pushed, 2 pull requests merged, and 1 issue closed in the last 24 hours.",
  },
  members: {
    title: "Members",
    body: "This project has 8 active members across 3 teams. Invite new members or manage roles from the settings panel.",
  },
  settings: {
    title: "Settings",
    body: "Configure project visibility, notification preferences, integrations, and danger-zone actions like archiving or deleting the project.",
  },
};

function TabPanelDemo() {
  const [value, setValue] = useState("overview");
  const panel = TAB_PANELS[value];

  return (
    <div>
      <TabBar value={value} onChange={setValue} aria-label="Project tabs">
        <TabItem value="overview" icon="dashboard">Overview</TabItem>
        <TabItem value="activity" icon="schedule">Activity</TabItem>
        <TabItem value="members" icon="group">Members</TabItem>
        <TabItem value="settings" icon="settings">Settings</TabItem>
      </TabBar>
      <div
        role="tabpanel"
        aria-labelledby={value}
        style={{ padding: "20px 4px" }}
      >
        <h3 style={{ margin: "0 0 8px" }}>{panel.title}</h3>
        <p style={{ margin: 0, lineHeight: 1.5, opacity: 0.8 }}>{panel.body}</p>
      </div>
    </div>
  );
}

function IconOnlyDemo() {
  const [value, setValue] = useState("fav");
  return (
    <TabBar value={value} onChange={setValue} aria-label="Icon-only tabs">
      <TabItem value="fav" icon="favorite_fill" aria-label="Favorites" />
      <TabItem value="search" icon="search" aria-label="Search" />
      <TabItem value="settings" icon="settings" aria-label="Settings" />
    </TabBar>
  );
}

export default function TabBarPlayground() {
  return (
    <>
      <h1>TabBar</h1>

      <section style={sectionStyle}>
        <h2>Basic</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Simple tab bar with text labels, controlled state.
        </p>
        <div style={cardStyle}><BasicDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Tab Panels</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Switching tabs updates the content panel below.
        </p>
        <div style={cardStyle}><TabPanelDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>With Icons</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Tabs with leading icons.
        </p>
        <div style={cardStyle}><WithIconsDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Icon Only</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Tabs with only icons (no text label). Uses aria-label for accessibility.
        </p>
        <div style={cardStyle}><IconOnlyDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>With Insets</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Left and right inset padding via spacing tokens.
        </p>
        <div style={cardStyle}><InsetDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Add Tab Button</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Dynamic tabs with an add button. Click + to add new tabs.
        </p>
        <div style={cardStyle}><AddTabDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Disabled Tabs</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Individual tabs can be disabled. Arrow keys skip disabled tabs.
        </p>
        <div style={cardStyle}><DisabledDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>All Disabled</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Entire tab bar disabled via the disabled prop.
        </p>
        <div style={cardStyle}><AllDisabledDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Full Width</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Tabs stretch equally to fill the available width.
        </p>
        <div style={cardStyle}><FullWidthDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Manual Activation</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Arrow keys move focus but don't select. Press Enter or Space to activate.
        </p>
        <div style={cardStyle}><ManualActivationDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Scrollable (overflow)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Many tabs in a constrained width. Scroll fades appear at edges.
        </p>
        <div style={cardStyle}><ScrollDemo /></div>
      </section>

      <section style={sectionStyle}>
        <h2>Uncontrolled</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Uses defaultValue instead of value/onChange. Second tab selected by default.
        </p>
        <div style={cardStyle}><UncontrolledDemo /></div>
      </section>
    </>
  );
}
