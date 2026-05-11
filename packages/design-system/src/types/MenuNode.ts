import type { IconName } from "../components/Icon";

/**
 * Canonical menu data shape — used by both Dropdown drilldown
 * (`DrilldownSubmenu`) and PromptInput trigger menus (`<TriggerMenu>`).
 *
 * Recursive — drill depth is unlimited. Presence of `items` makes a node a
 * drill node (selecting it opens children); absence makes it a leaf.
 */
export interface MenuNode {
  /** Stable id, unique within its parent's `items[]`. */
  id: string;
  /**
   * Row kind. Defaults to `"item"` when omitted.
   *
   * - `"item"` — pickable row. Counted by keyboard nav, filtered by the
   *   default filter, fired on Enter / click.
   * - `"separator"` — non-pickable horizontal rule. Skipped by keyboard nav
   *   and dropped from filtered results (structural, no content to match).
   * - `"group-label"` — non-pickable subheader (e.g. "Suggested context").
   *   Renders the `label` field; same nav / filter behavior as `"separator"`.
   *
   * Lets a single `MenuNode[]` describe section'd menus inline instead of
   * forcing the consumer into a custom `renderContent`.
   */
  type?: "item" | "separator" | "group-label";
  /** Visible label. Matched against the user's query by the default filter. */
  label: string;
  /** Optional leading icon. */
  icon?: IconName;
  /** Optional secondary text rendered below the label. */
  subtitle?: string;
  /**
   * Extra terms checked by the default filter (alongside `label` / `subtitle`).
   * Useful for synonyms — e.g. an "Add photos & files" item with
   * `keywords: ["upload", "image"]` matches a `/upload` query.
   */
  keywords?: readonly string[];
  /**
   * Optional discriminator for typed dispatch in `onSelect`. Lets a single
   * `onSelect(item)` switch on `item.kind` instead of brittle id comparisons.
   */
  kind?: string;
  /**
   * Nested children. Presence makes this a drill node (selecting it opens
   * children); absence makes it a leaf (selecting it fires `onSelect`).
   * Recursive — depth is unlimited.
   */
  items?: readonly MenuNode[];
  /**
   * When `true` the option renders with `aria-disabled` and is skipped by
   * keyboard navigation / filter results.
   */
  disabled?: boolean;
  /**
   * When `true` the renderer prepends a visual `OptionSeparator` above this
   * row to group it visually (e.g. "Add from Google drive" sits below a
   * divider in the default `/` attachment menu). Ignored on the first row.
   */
  dividerBefore?: boolean;
}
