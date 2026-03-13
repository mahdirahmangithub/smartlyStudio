import { type CSSProperties, useCallback, useState } from "react";
import { GlobalNavigationBar, useNavBarExpanded } from "../components/GlobalNavigationBar";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";
import { NavigationCategoryItem } from "../components/NavigationCategoryItem";
import { NavigationItem } from "../components/NavigationItem";
import { NavigationSubItem } from "../components/NavigationSubItem";

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

function FullPageDemo() {
  return (
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
  );
}

export default function GlobalNavigationBarPlayground() {
  return (
    <>
      <h1>GlobalNavigationBar</h1>

      <section style={sectionStyle}>
        <h2>Full Page Layout</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Fixed nav bar on the left. Hover to expand (320px), mouse-leave to collapse (64px).
          Content area is offset 80px. The nav overlays content on expand.
        </p>
        <div style={cardStyle}>
          <FullPageDemo />
        </div>
      </section>
    </>
  );
}
