import { type CSSProperties, useCallback, useMemo, useState } from "react";
import { GlobalNavigationBar, useNavBarExpanded } from "@sds/components/GlobalNavigationBar";
import { Icon } from "@sds/components/Icon";
import type { IconName } from "@sds/components/Icon";
import { NavigationCategoryItem } from "@sds/components/NavigationCategoryItem";
import { NavigationItem } from "@sds/components/NavigationItem";
import { NavigationSubItem } from "@sds/components/NavigationSubItem";

/* ── Nav item data ─────────────────────────────────────────────────── */

interface SubItemDef {
  id: string;
  label: string;
  icon: IconName;
  badgeCount?: number | string;
  externalLink?: boolean;
}

interface CategoryDef {
  key: string;
  label: string;
  icon: IconName;
  items: SubItemDef[];
}

const CATEGORIES: CategoryDef[] = [
  {
    key: "intelligence", label: "Intelligence", icon: "intelligence",
    items: [
      { id: "reporting", label: "Reporting", icon: "reporting" },
      { id: "brand-pulse", label: "Brand Pulse", icon: "monitor_heart" },
      { id: "benchmarks", label: "Benchmarks", icon: "difference", badgeCount: "New" },
      { id: "creative-prediction", label: "Creative Prediction Potential", icon: "visibility", badgeCount: "New" },
      { id: "triggers", label: "Triggers", icon: "page_info" },
      { id: "budget-pools", label: "Budget Pools (PBA)", icon: "local_atm" },
      { id: "ad-studies", label: "Ad Studies", icon: "science" },
      { id: "change-log", label: "Change Log", icon: "settings_backup_restore" },
      { id: "activity-log", label: "Activity Log", icon: "settings_backup_restore" },
    ],
  },
  {
    key: "media", label: "Media", icon: "campaign",
    items: [
      { id: "campaign-workspaces", label: "Campaign Workspaces", icon: "topic" },
      { id: "campaign-assets", label: "Campaign Assets", icon: "stacks" },
      { id: "automation-feeds", label: "Automation Feeds", icon: "automation_feeds" },
      { id: "catalogs", label: "Catalogs", icon: "shopping_cart" },
      { id: "product-recommender", label: "Product Recommender", icon: "shopping_bag" },
    ],
  },
  {
    key: "creative", label: "Creative", icon: "palette",
    items: [
      { id: "asset-library", label: "Asset Library", icon: "category" },
      { id: "files", label: "Files", icon: "auto_awesome_mosaic" },
      { id: "templates", label: "Templates", icon: "backup_table" },
      { id: "producers", label: "Producers", icon: "data_table" },
      { id: "projects", label: "Projects", icon: "folder" },
      { id: "creative-insights", label: "Creative Insights", icon: "lightbulb" },
      { id: "boards-and-pins", label: "Boards and Pins", icon: "keep" },
      { id: "ai-studio", label: "AI Studio", icon: "forecasting" },
      { id: "custom-fonts", label: "Custom Fonts", icon: "serif" },
      { id: "creative-concepts", label: "Creative Concepts", icon: "video_library", externalLink: true },
    ],
  },
  {
    key: "settings", label: "Settings", icon: "settings",
    items: [
      { id: "add-accounts", label: "Add Accounts", icon: "share", badgeCount: "New" },
      { id: "users", label: "Users", icon: "group" },
      { id: "company", label: "Company", icon: "domain" },
      { id: "billing", label: "Billing", icon: "receipt_long" },
      { id: "integrations", label: "Integrations", icon: "lan" },
    ],
  },
];

const ALL_ITEMS_MAP = new Map<string, SubItemDef>();
for (const cat of CATEGORIES) {
  for (const item of cat.items) {
    ALL_ITEMS_MAP.set(item.id, item);
  }
}

/* ── NavContent ────────────────────────────────────────────────────── */

function NavContent() {
  const navExpanded = useNavBarExpanded();
  const iconOnly = !navExpanded;

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  const toggleCategory = useCallback((key: string) => {
    setOpenCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }, []);

  const pinnedSet = new Set(pinnedIds);

  return (
    <>
      <NavigationItem
        label="Home"
        leadingIcon={<Icon name="home" size={20} />}
        iconOnly={iconOnly}
      />

      {pinnedIds.map((id) => {
        const item = ALL_ITEMS_MAP.get(id);
        if (!item) return null;
        return (
          <NavigationItem
            key={id}
            label={item.label}
            leadingIcon={<Icon name={item.icon} size={20} />}
            iconOnly={iconOnly}
            pinned
            actionIcon="keep_off"
            actionLabel="Unpin"
            onAction={() => togglePin(id)}
          />
        );
      })}

      {CATEGORIES.map((cat) => (
        <NavigationCategoryItem
          key={cat.key}
          label={cat.label}
          leadingIcon={<Icon name={cat.icon} size={20} />}
          iconOnly={iconOnly}
          expanded={!!openCategories[cat.key]}
          onClick={() => toggleCategory(cat.key)}
        >
          {cat.items
            .filter((item) => !pinnedSet.has(item.id))
            .map((item) => (
              <NavigationSubItem
                key={item.id}
                label={item.label}
                leadingIcon={<Icon name={item.icon} size={20} />}
                badgeCount={item.badgeCount}
                externalLink={item.externalLink}
                actionIcon="keep"
                actionLabel="Pin"
                onAction={() => togglePin(item.id)}
              />
            ))}
        </NavigationCategoryItem>
      ))}
    </>
  );
}

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

const DEFAULTS = {
  dwellDelay: 320,
  velocityThreshold: 0.6,
  exitGrace: 180,
};

const controlRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 6,
};

const labelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  cursor: "pointer",
  userSelect: "none",
};

const sliderWrap: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  opacity: 0.8,
};

function FullPageDemo() {
  const [dwellEnabled, setDwellEnabled] = useState(true);
  const [dwellDelay, setDwellDelay] = useState(DEFAULTS.dwellDelay);
  const [velocityEnabled, setVelocityEnabled] = useState(true);
  const [velocityThreshold, setVelocityThreshold] = useState(DEFAULTS.velocityThreshold);
  const [exitGraceEnabled, setExitGraceEnabled] = useState(true);
  const [exitGrace, setExitGrace] = useState(DEFAULTS.exitGrace);

  const hoverProps = useMemo(
    () => ({
      dwellDelay: dwellEnabled ? dwellDelay : 0,
      velocityThreshold: velocityEnabled ? velocityThreshold : 0,
      exitGrace: exitGraceEnabled ? exitGrace : 0,
    }),
    [dwellEnabled, dwellDelay, velocityEnabled, velocityThreshold, exitGraceEnabled, exitGrace],
  );

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
        <div style={controlRow}>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={dwellEnabled}
              onChange={(e) => setDwellEnabled(e.target.checked)}
            />
            Dwell Delay
          </label>
          <div style={{ ...sliderWrap, opacity: dwellEnabled ? 0.8 : 0.3 }}>
            <input
              type="range"
              min={50}
              max={800}
              step={10}
              value={dwellDelay}
              disabled={!dwellEnabled}
              onChange={(e) => setDwellDelay(Number(e.target.value))}
            />
            <span style={{ minWidth: 48 }}>{dwellDelay}ms</span>
          </div>
        </div>

        <div style={controlRow}>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={velocityEnabled}
              onChange={(e) => setVelocityEnabled(e.target.checked)}
            />
            Velocity Gate
          </label>
          <div style={{ ...sliderWrap, opacity: velocityEnabled ? 0.8 : 0.3 }}>
            <input
              type="range"
              min={0.1}
              max={2}
              step={0.05}
              value={velocityThreshold}
              disabled={!velocityEnabled}
              onChange={(e) => setVelocityThreshold(Number(e.target.value))}
            />
            <span style={{ minWidth: 64 }}>{velocityThreshold.toFixed(2)} px/ms</span>
          </div>
        </div>

        <div style={controlRow}>
          <label style={labelStyle}>
            <input
              type="checkbox"
              checked={exitGraceEnabled}
              onChange={(e) => setExitGraceEnabled(e.target.checked)}
            />
            Exit Grace
          </label>
          <div style={{ ...sliderWrap, opacity: exitGraceEnabled ? 0.8 : 0.3 }}>
            <input
              type="range"
              min={0}
              max={400}
              step={10}
              value={exitGrace}
              disabled={!exitGraceEnabled}
              onChange={(e) => setExitGrace(Number(e.target.value))}
            />
            <span style={{ minWidth: 48 }}>{exitGrace}ms</span>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          height: 840,
          borderRadius: 12,
          overflow: "hidden",
          background: "var(--element-surface-default)",
        }}
      >
        <GlobalNavigationBar
          brandBadge
          onBrandClick={() => console.log("Brand clicked")}
          inboxBadgeCount={2}
          onSearchClick={() => console.log("Search clicked")}
          onInboxClick={() => console.log("Inbox clicked")}
          onHelpClick={() => console.log("Help clicked")}
          profileAvatarSrc="https://i.pravatar.cc/80?img=12"
          profileLabel="Mahdi Rahman"
          onProfileClick={() => console.log("Profile clicked")}
          secondaryInitials="ES"
          secondaryLabel="Smartly.io"
          onSecondaryProfileClick={() => console.log("Secondary profile clicked")}
          dwellDelay={hoverProps.dwellDelay}
          velocityThreshold={hoverProps.velocityThreshold}
          exitGrace={hoverProps.exitGrace}
          style={{
            position: "absolute",
            top: "var(--spacing-md)",
            left: "var(--spacing-md)",
            bottom: "var(--spacing-md)",
          }}
        >
          <NavContent />
        </GlobalNavigationBar>

        <div
          style={{
            marginLeft: 80,
            padding: 24,
            height: "100%",
            boxSizing: "border-box",
            overflow: "auto",
          }}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              style={{
                height: 60,
                borderRadius: 8,
                background: "var(--element-fill-neutral-tertiary-default)",
                marginBottom: 8,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default function GlobalNavigationBarPlayground() {
  return (
    <>
      <h1>GlobalNavigationBar</h1>

      <section style={sectionStyle}>
        <h2>Full Page Layout</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle smart hover layers below to test different intent-detection combinations.
          Uncheck all for instant hover (original behaviour).
        </p>
        <div style={cardStyle}>
          <FullPageDemo />
        </div>
      </section>
    </>
  );
}
