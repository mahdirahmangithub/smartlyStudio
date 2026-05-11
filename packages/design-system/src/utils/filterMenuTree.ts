import type { MenuNode } from "../types/MenuNode";

/** Returns `true` if `item` should be kept for `query`. */
export type MenuNodeFilter = (item: MenuNode, query: string) => boolean;

/**
 * Default filter — case-insensitive substring against `label`, `subtitle`,
 * and any `keywords[]`. Diacritics-insensitive variants can be supplied via
 * the `customFilter` argument to `filterMenuTree`.
 */
export const defaultMenuNodeFilter: MenuNodeFilter = (item, query) => {
  const q = query.toLowerCase();
  if (item.label.toLowerCase().includes(q)) return true;
  if (item.subtitle && item.subtitle.toLowerCase().includes(q)) return true;
  if (item.keywords && item.keywords.some((k) => k.toLowerCase().includes(q))) {
    return true;
  }
  return false;
};

/**
 * Recursive filter for a `MenuNode` tree. Returns a new array where:
 *
 * - Leaves are kept iff they match the query.
 * - Drill nodes are kept iff they match (children unchanged so the user can
 *   still drill into the full subtree) OR any descendant matches (children
 *   narrowed to the matching subtree).
 *
 * Empty / whitespace-only `query` returns the input unchanged. Disabled items
 * are excluded from the result (keyboard-nav and filter ignore them
 * uniformly).
 *
 * Used by both Dropdown drill consumers (when filtering is desired) and
 * `<TriggerMenu>` (where filtering is automatic per query).
 */
export function filterMenuTree(
  items: readonly MenuNode[],
  query: string,
  customFilter?: MenuNodeFilter,
): readonly MenuNode[] {
  const q = query.trim();
  if (!q) return items.filter((item) => !item.disabled);
  const matches = customFilter ?? defaultMenuNodeFilter;

  function walk(level: readonly MenuNode[]): MenuNode[] {
    const result: MenuNode[] = [];
    for (const item of level) {
      if (item.disabled) continue;
      // Structural rows (separators, group labels) have no content to match —
      // drop them when a query is active. They reappear when the query clears.
      if (item.type === "separator" || item.type === "group-label") continue;
      const itemMatches = matches(item, q);
      if (item.items && item.items.length > 0) {
        if (itemMatches) {
          // Parent itself matches — keep entire subtree so the user can drill
          // in and see everything inside.
          result.push(item);
        } else {
          // Parent doesn't match — keep only if any descendant matches, with
          // children narrowed to the matching subtree.
          const filteredChildren = walk(item.items);
          if (filteredChildren.length > 0) {
            result.push({ ...item, items: filteredChildren });
          }
        }
      } else {
        if (itemMatches) result.push(item);
      }
    }
    return result;
  }

  return walk(items);
}
