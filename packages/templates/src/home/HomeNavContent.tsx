import { useCallback, useState } from "react";
import { useNavBarExpanded } from "@sds/components/GlobalNavigationBar";
import { Icon } from "@sds/components/Icon";
import type { IconName } from "@sds/components/Icon";
import { NavigationCategoryItem } from "@sds/components/NavigationCategoryItem";
import { NavigationItem } from "@sds/components/NavigationItem";
import { NavigationSubItem } from "@sds/components/NavigationSubItem";

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

export function HomeNavContent() {
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
        checked
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
