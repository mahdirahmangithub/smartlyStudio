import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import type { MenuNode } from "../../types/MenuNode";
import { filterMenuTree, type MenuNodeFilter } from "../../utils/filterMenuTree";
import { useInsertChip, usePromptInput, usePromptInputSurface } from "./promptInputContext";
import type { TriggerSelectHelpers } from "./promptInputTypes";

export type { TriggerSelectHelpers } from "./promptInputTypes";

/** Configuration for `useTriggerMenu`. */
export interface UseTriggerMenuConfig {
  /** The root menu items. Recursive — drill depth is unlimited. */
  items: readonly MenuNode[];
  /** Current query (text typed after the trigger char). */
  query: string;
  /** Active row index from PromptInput's renderContent props. */
  activeIndex: number;
  /** Report visible item count to PromptInput so arrow-key wrap stays correct. */
  setItemCount: (n: number) => void;
  /** Register the function PromptInput calls when the user presses Enter. */
  registerPickHandler: (fn: () => void) => void;
  /** Base id for option elements (e.g. `${menuId}-opt-${index}`). */
  menuId: string;
  /** From renderContent props — closes menu and removes trigger + query. */
  onAccept: () => void;
  /** From renderContent props — closes menu without removing the trigger. */
  onClose: () => void;
  /**
   * Called when the user selects a leaf node. Receives surface helpers so
   * the same config works for textarea AND RTE consumers. When omitted, the
   * default routes the picked item to the right sink:
   * - `"rte"` → `helpers.insertChip()` then `helpers.close()`.
   * - `"textarea"` → `helpers.addContextItem()` then `helpers.accept()`.
   */
  onSelect?: (item: MenuNode, helpers: TriggerSelectHelpers) => void;
  /** Optional override for the default filter (label + subtitle + keywords substring). */
  filter?: MenuNodeFilter;
}

/** Props bag returned by `getOptionProps` and `getBackRowProps`. */
export interface TriggerMenuOptionProps {
  optionId: string;
  isActive: boolean;
  unmanagedFocus: true;
}

/** Props bag for the Back row. Includes a contextual `labelText`. */
export interface TriggerMenuBackRowProps extends TriggerMenuOptionProps {
  labelText: string;
}

export interface UseTriggerMenuReturn {
  /**
   * Every row at the current drill level (after filter), separators and
   * group-labels included. Use this for rendering — call `getOptionProps` for
   * pickable rows only.
   */
  visibleItems: readonly MenuNode[];
  /**
   * Pickable subset of `visibleItems` — separators / group-labels excluded.
   * `pickIndex` indexes into this list (offset by 1 when drilled, since the
   * Back row takes logical index 0).
   */
  pickableItems: readonly MenuNode[];
  /** Drill stack — empty when at root. Each element is the trigger node that opened that level. */
  drillPath: readonly MenuNode[];
  /** True when there are no drill levels above. */
  isRoot: boolean;
  /**
   * Total focusable rows — `pickableItems.length + 1` if drilled (Back row).
   * Separators / group-labels do NOT count.
   */
  itemCount: number;
  /** True when a Back row should render at logical index 0. */
  hasBackRow: boolean;
  /** Pop the drill stack — used by Back row click. */
  pop: () => void;
  /** Push a drill node — used by clicking on a node with `items`. */
  push: (item: MenuNode) => void;
  /** Pick the row at `index` (Back, drill, or leaf) — wired to registerPickHandler. */
  pickIndex: (index: number) => void;
  /** Props to spread on a pickable row at logical `index`. */
  getOptionProps: (index: number) => TriggerMenuOptionProps;
  /** Props for the Back row (drilled levels only). Returns null at root. */
  getBackRowProps: () => TriggerMenuBackRowProps | null;
}

/**
 * Headless engine for trigger menus opened by typing `/`, `@`, or any
 * configured character in `<PromptInput>` / `<PromptInputRichTextEditor>`.
 *
 * Owns:
 * - Drill stack (push on selecting a node with `items`, pop on Back).
 * - Filtering via `filterMenuTree` (shared with Dropdown drill consumers).
 * - Keyboard wiring (item count, pick handler, option ids matching
 *   `${menuId}-opt-${index}` for `aria-activedescendant`).
 * - Default `onSelect` that routes the picked item to the right sink based
 *   on the surface (RTE → inline chip; textarea → context row).
 *
 * Drill state is internal to this hook — it does NOT use Dropdown's
 * `DrilldownContext`. The two state machines stay independent because
 * Dropdown's drill is DOM-focus-based and TriggerMenu's is virtual-highlight
 * (input owns DOM focus). They share the **data shape** (`MenuNode`) and
 * **filter** (`filterMenuTree`).
 */
export function useTriggerMenu(config: UseTriggerMenuConfig): UseTriggerMenuReturn {
  const {
    items,
    query,
    activeIndex,
    setItemCount,
    registerPickHandler,
    menuId,
    onAccept,
    onClose,
    onSelect,
    filter,
  } = config;

  const surface = usePromptInputSurface();
  const { addContextItem } = usePromptInput();
  const insertChip = useInsertChip();

  const [drillPath, setDrillPath] = useState<MenuNode[]>([]);

  const currentLevel: readonly MenuNode[] =
    drillPath.length > 0
      ? drillPath[drillPath.length - 1].items ?? []
      : items;

  const visibleItems = filterMenuTree(currentLevel, query, filter);

  /**
   * Pickable subset — separators / group-labels render inline but don't take
   * a keyboard-nav slot. `activeIndex` from the consumer is in pickable space:
   * Back row at 0 (when drilled), then pickable items at 1..N.
   */
  const pickableItems = visibleItems.filter(
    (item) => item.type !== "separator" && item.type !== "group-label",
  );

  const isRoot = drillPath.length === 0;
  const hasBackRow = !isRoot;
  const itemCount = pickableItems.length + (hasBackRow ? 1 : 0);

  // Report item count to PromptInput so its arrow-key wrap math stays correct.
  useEffect(() => {
    setItemCount(itemCount);
  }, [itemCount, setItemCount]);

  // Build helpers for a specific item — recreated when query changes (deleteCount
  // depends on it) but not per-item, so we close over `item` at call time.
  const queryLength = query.length;
  const buildHelpers = useCallback(
    (item: MenuNode): TriggerSelectHelpers => ({
      insertChip: () => {
        if (!item.icon) return;
        insertChip(item.label, item.icon, queryLength + 1);
      },
      addContextItem: () => {
        addContextItem({
          id: item.id,
          icon: item.icon ?? "info",
          label: item.label,
        });
      },
      close: onClose,
      accept: onAccept,
      surface,
    }),
    [insertChip, addContextItem, queryLength, onClose, onAccept, surface],
  );

  /**
   * Default routing when consumer omits `onSelect`.
   * - RTE: replace trigger + query with an inline chip; close the menu.
   * - Textarea: add to the prompt's external context row; accept (clears
   *   trigger + query from the input).
   */
  const defaultOnSelect = useCallback(
    (item: MenuNode) => {
      if (surface === "rte") {
        if (item.icon) insertChip(item.label, item.icon, queryLength + 1);
        onClose();
      } else {
        addContextItem({
          id: item.id,
          icon: item.icon ?? "info",
          label: item.label,
        });
        onAccept();
      }
    },
    [surface, insertChip, addContextItem, queryLength, onClose, onAccept],
  );

  const push = useCallback((item: MenuNode) => {
    if (item.items && item.items.length > 0) {
      setDrillPath((prev) => [...prev, item]);
    }
  }, []);

  const pop = useCallback(() => {
    setDrillPath((prev) => prev.slice(0, -1));
  }, []);

  const pickIndex = useCallback(
    (index: number) => {
      // Back row when drilled — index 0.
      if (hasBackRow && index === 0) {
        pop();
        return;
      }
      const itemIdx = hasBackRow ? index - 1 : index;
      const item = pickableItems[itemIdx];
      if (!item) return;
      // Drill node — push onto stack.
      if (item.items && item.items.length > 0) {
        setDrillPath((prev) => [...prev, item]);
        return;
      }
      // Leaf — fire consumer's onSelect or the default.
      if (onSelect) {
        onSelect(item, buildHelpers(item));
      } else {
        defaultOnSelect(item);
      }
    },
    [hasBackRow, pop, pickableItems, onSelect, buildHelpers, defaultOnSelect],
  );

  // Register Enter handler. useLayoutEffect (no deps) so it's fresh with the
  // latest activeIndex / drillPath every render — matches the pattern used
  // in the legacy PromptInputContextMenu.
  useLayoutEffect(() => {
    registerPickHandler(() => pickIndex(activeIndex));
  });

  const getOptionProps = useCallback(
    (index: number): TriggerMenuOptionProps => ({
      optionId: `${menuId}-opt-${index}`,
      isActive: index === activeIndex,
      unmanagedFocus: true as const,
    }),
    [menuId, activeIndex],
  );

  const getBackRowProps = useCallback((): TriggerMenuBackRowProps | null => {
    if (!hasBackRow) return null;
    const trigger = drillPath[drillPath.length - 1];
    return {
      optionId: `${menuId}-opt-0`,
      isActive: activeIndex === 0,
      unmanagedFocus: true as const,
      labelText: `Back to ${trigger.label}`,
    };
  }, [hasBackRow, drillPath, menuId, activeIndex]);

  return {
    visibleItems,
    pickableItems,
    drillPath,
    isRoot,
    itemCount,
    hasBackRow,
    pop,
    push,
    pickIndex,
    getOptionProps,
    getBackRowProps,
  };
}
