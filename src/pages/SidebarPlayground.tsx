import { type CSSProperties, useState } from "react";
import { AppShell } from "../components/AppShell";
import { Divider } from "../components/Divider";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { NavigationCategoryItem } from "../components/NavigationCategoryItem";
import { NavigationItem } from "../components/NavigationItem";
import { NavigationProfileItem } from "../components/NavigationProfileItem";
import { NavigationSubItem } from "../components/NavigationSubItem";
import { Sidebar, useSidebarExpanded } from "../components/Sidebar";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 0,
  marginTop: 12,
  height: 600,
  overflow: "hidden",
};
const contentStyle: CSSProperties = {
  padding: 24,
  background: "var(--element-surface-primary)",
  height: "100%",
  overflow: "auto",
};

function SidebarNavContent() {
  const expanded = useSidebarExpanded();
  const iconOnly = !expanded;
  const [activeItem, setActiveItem] = useState("campaigns");
  const [catExpanded, setCatExpanded] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <NavigationItem
        label="Campaigns"
        leadingIcon={<Icon name="campaign" size={20} />}
        iconOnly={iconOnly}
        checked={activeItem === "campaigns"}
        onClick={() => setActiveItem("campaigns")}
      />
      <NavigationItem
        label="Audiences"
        leadingIcon={<Icon name="group" size={20} />}
        iconOnly={iconOnly}
        checked={activeItem === "audiences"}
        onClick={() => setActiveItem("audiences")}
      />
      <NavigationCategoryItem
        label="Reports"
        leadingIcon={<Icon name="stacked_bar_chart" size={20} />}
        iconOnly={iconOnly}
        expanded={catExpanded}
        onClick={() => setCatExpanded((v) => !v)}
      >
        <NavigationSubItem
          label="Performance"
          checked={activeItem === "performance"}
          onClick={() => setActiveItem("performance")}
        />
        <NavigationSubItem
          label="Conversion"
          checked={activeItem === "conversion"}
          onClick={() => setActiveItem("conversion")}
        />
        <NavigationSubItem
          label="Attribution"
          checked={activeItem === "attribution"}
          onClick={() => setActiveItem("attribution")}
        />
      </NavigationCategoryItem>
      <NavigationItem
        label="Creative Library"
        leadingIcon={<Icon name="image" size={20} />}
        iconOnly={iconOnly}
        checked={activeItem === "library"}
        onClick={() => setActiveItem("library")}
      />
      <NavigationItem
        label="Settings"
        leadingIcon={<Icon name="settings" size={20} />}
        iconOnly={iconOnly}
        checked={activeItem === "settings"}
        onClick={() => setActiveItem("settings")}
      />
      <Divider />
      <NavigationProfileItem
        label="John Doe"
        avatarInitials="JD"
        iconOnly={iconOnly}
        chevron
      />
    </div>
  );
}

function PageContent({ extra }: { extra?: React.ReactNode }) {
  return (
    <div style={contentStyle}>
      {extra}
    </div>
  );
}

function PersistentCollapsiblePushDemo() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={cardStyle}>
      <AppShell style={{ height: "100%", minHeight: 0 }}>
        <Sidebar
          expanded={expanded}
          onExpandedChange={setExpanded}
          collapsible
          expandBehavior="push"
        >
          <SidebarNavContent />
        </Sidebar>
        <AppShell.Content>
          <PageContent
            extra={<p>Expanded: <strong>{String(expanded)}</strong></p>}
          />
        </AppShell.Content>
      </AppShell>
    </div>
  );
}

function PersistentCollapsibleOverlayDemo() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={cardStyle}>
      <AppShell style={{ height: "100%", minHeight: 0 }}>
        <Sidebar
          expanded={expanded}
          onExpandedChange={setExpanded}
          collapsible
          expandBehavior="overlay"
        >
          <SidebarNavContent />
        </Sidebar>
        <AppShell.Content>
          <PageContent
            extra={<p>Expanded: <strong>{String(expanded)}</strong></p>}
          />
        </AppShell.Content>
      </AppShell>
    </div>
  );
}

function PersistentCollapsibleOverlayWithHeaderDemo() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={cardStyle}>
      <AppShell style={{ height: "100%", minHeight: 0 }}>
        <Sidebar
          expanded={expanded}
          onExpandedChange={setExpanded}
          collapsible
          expandBehavior="overlay"
          resizable
          expandedWidth={240}
          minWidth={240}
          maxWidth={350}
          title="Workspace"
          headerActions={
            <IconButton
              size="lg"
              variant="neutral"
              emphasis="low"
              icon={<Icon name="add" size={20} />}
              aria-label="Add item"
            />
          }
        >
          <SidebarNavContent />
        </Sidebar>
        <AppShell.Content>
          <PageContent
            extra={<p>Expanded: <strong>{String(expanded)}</strong></p>}
          />
        </AppShell.Content>
      </AppShell>
    </div>
  );
}

function PersistentCollapsedOnlyDemo() {
  return (
    <div style={cardStyle}>
      <AppShell style={{ height: "100%", minHeight: 0 }}>
        <Sidebar>
          <SidebarNavContent />
        </Sidebar>
        <AppShell.Content>
          <PageContent label="Page content area" />
        </AppShell.Content>
      </AppShell>
    </div>
  );
}

function ToggleableCollapsedPushDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={cardStyle}>
      <AppShell style={{ height: "100%", minHeight: 0 }}>
        <Sidebar
          open={open}
          onOpenChange={setOpen}
          expandBehavior="push"
        >
          <SidebarNavContent />
        </Sidebar>
        <AppShell.Content>
          <PageContent
            extra={
              <button onClick={() => setOpen((v) => !v)}>
                {open ? "Close" : "Open"} Sidebar
              </button>
            }
          />
        </AppShell.Content>
      </AppShell>
    </div>
  );
}

function ToggleableExpandedOverlayDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={cardStyle}>
      <AppShell style={{ height: "100%", minHeight: 0 }}>
        <Sidebar
          open={open}
          onOpenChange={setOpen}
          expanded
          expandBehavior="overlay"
        >
          <SidebarNavContent />
        </Sidebar>
        <AppShell.Content>
          <PageContent
            extra={
              <button onClick={() => setOpen((v) => !v)}>
                {open ? "Close" : "Open"} Sidebar
              </button>
            }
          />
        </AppShell.Content>
      </AppShell>
    </div>
  );
}

function ResizableDemo() {
  const [expanded, setExpanded] = useState(true);
  const [width, setWidth] = useState(240);
  return (
    <div style={cardStyle}>
      <AppShell style={{ height: "100%", minHeight: 0 }}>
        <Sidebar
          expanded={expanded}
          onExpandedChange={setExpanded}
          collapsible
          expandBehavior="push"
          resizable
          expandedWidth={240}
          minWidth={240}
          maxWidth={350}
          onWidthChange={setWidth}
        >
          <SidebarNavContent />
        </Sidebar>
        <AppShell.Content>
          <PageContent
            extra={<p>Current width: <strong>{width}px</strong></p>}
          />
        </AppShell.Content>
      </AppShell>
    </div>
  );
}

export default function SidebarPlayground() {
  return (
    <>
      <h1>Sidebar</h1>

      <section style={sectionStyle}>
        <h2>Persistent + Collapsible + Push</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Collapsed pushes 72px, expanded pushes 240px.
        </p>
        <PersistentCollapsiblePushDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Persistent + Collapsible + Overlay</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Collapsed pushes 72px, expanded overlays without pushing.
        </p>
        <PersistentCollapsibleOverlayDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Persistent + Collapsible + Overlay + Header</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Same as overlay but with title and an action button in the header.
        </p>
        <PersistentCollapsibleOverlayWithHeaderDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Persistent + Collapsed-only</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Always collapsed at 72px. No expand trigger.
        </p>
        <PersistentCollapsedOnlyDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Toggleable + Collapsed + Push</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Starts hidden, opens as collapsed in push mode.
        </p>
        <ToggleableCollapsedPushDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Toggleable + Expanded + Overlay</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Starts hidden, opens as expanded overlay.
        </p>
        <ToggleableExpandedOverlayDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Resizable</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Collapsible + push + resizable between 240–350px.
        </p>
        <ResizableDemo />
      </section>
    </>
  );
}
