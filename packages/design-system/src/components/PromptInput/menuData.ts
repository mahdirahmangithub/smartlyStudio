import type { MenuNode } from "../../types/MenuNode";

/**
 * Default attachment items rendered by the built-in `/` trigger.
 *
 * `kind` values map to `PromptInputAttachmentKind` — the consumer's
 * `onSelect` (or the built-in attachment dispatch) reads `item.kind` to
 * decide which picker / handler fires.
 */
export const ATTACHMENT_MENU_ITEMS: readonly MenuNode[] = [
  {
    id: "photos-files",
    kind: "photos-files",
    label: "Add photos & files",
    icon: "attach_file",
    keywords: ["upload", "file", "image", "photo"],
  },
  {
    id: "link",
    kind: "link",
    label: "Add link",
    icon: "link",
    keywords: ["url", "href"],
  },
  {
    id: "context",
    kind: "context",
    label: "Add context",
    icon: "forecasting_context",
    keywords: ["ai", "prompt", "smart"],
  },
  {
    id: "google-drive",
    kind: "google-drive",
    label: "Add from Google drive",
    icon: "Google Drive_color",
    keywords: ["drive", "google", "cloud"],
    dividerBefore: true,
  },
];

/**
 * Default suggested items shown above the categories list in `@` mention
 * pickers. Each represents "recently / currently relevant context" — workspace,
 * campaign, etc. — and renders with a subtitle (e.g. "Workspace",
 * "in {workspace name}").
 */
export const SUGGESTED_CONTEXT_ITEMS: readonly MenuNode[] = [
  {
    id: "ws-1",
    icon: "Meta_color",
    label: "Summer 2026 - Run BMW",
    subtitle: "Workspace",
  },
  {
    id: "camp-1",
    icon: "campaign_alt",
    label: "Campaign_1209",
    subtitle: "in Summer 2026 - Run BMW",
  },
  {
    id: "camp-2",
    icon: "campaign_alt",
    label: "Campaign_freq",
    subtitle: "in Summer 2026 - Run BMW",
  },
];

/**
 * Default category list with optional drill levels for `@` mention pickers.
 * Categories with `items` open a nested level when selected; without `items`
 * they fire the consumer's `onSelect` immediately. Sub-items in `items`
 * are leaves today, but the recursive `MenuNode` shape lets consumers nest
 * deeper without changes.
 */
export const CONTEXT_CATEGORIES: readonly MenuNode[] = [
  {
    id: "campaigns",
    icon: "campaign_alt",
    label: "Campaigns",
    items: [
      { id: "c-1", icon: "campaign_alt", label: "Summer 2026 - Run BMW" },
      { id: "c-2", icon: "campaign_alt", label: "Campaign_1209" },
      { id: "c-3", icon: "campaign_alt", label: "Campaign_freq" },
      { id: "c-4", icon: "campaign_alt", label: "Q4 Retargeting" },
    ],
  },
  { id: "catalogs", icon: "shopping_cart", label: "Catalogs" },
  { id: "producers", icon: "data_table", label: "Producers" },
  {
    id: "projects",
    icon: "folder",
    label: "Projects",
    items: [
      { id: "p-1", icon: "folder", label: "Alpha Project" },
      { id: "p-2", icon: "folder", label: "Beta Launch" },
      { id: "p-3", icon: "folder", label: "Internal Tools" },
    ],
  },
  { id: "reports-bar", icon: "reporting", label: "Reports" },
  { id: "reports-org", icon: "page_info", label: "Reports" },
  { id: "reports-lab", icon: "science", label: "Reports" },
];

/**
 * Combined `@` mention tree — sectioned suggested + all categories with the
 * structural rows (group-label, separator) baked in. Equivalent to what the
 * legacy `<PromptInputContextMenu>` rendered, but expressed as a single
 * `MenuNode[]` so consumers don't need a wrapper.
 *
 *     [group-label "Suggested context"]
 *     [Summer 2026 - Run BMW] [Campaign_1209] [Campaign_freq]
 *     [separator]
 *     [Campaigns] [Catalogs] [Producers] [Projects] [Reports] …
 *
 * Group labels and separators are skipped by keyboard nav and dropped by the
 * filter when the user types a query.
 */
export const MENTION_MENU_ITEMS: readonly MenuNode[] = [
  { id: "suggested-header", type: "group-label", label: "Suggested context" },
  ...SUGGESTED_CONTEXT_ITEMS,
  { id: "suggested-separator", type: "separator", label: "" },
  ...CONTEXT_CATEGORIES,
];
