import { useState, useEffect, useLayoutEffect, type ReactNode } from "react";
import { Icon } from "../Icon";
import type { IconName } from "../Icon";
import { OptionSeparator } from "../OptionSeparator";
import { GenericSelectOption } from "../GenericSelectOption";

/* ── Types ── */

export interface ContextMenuDrillItem {
  id: string;
  icon: IconName;
  label: string;
  onSelect: () => void;
}

/**
 * A nested level that opens when the user selects a category with `drillLevel`.
 * Fully keyboard-navigable: Back is index 0, items follow.
 */
export interface ContextMenuDrillLevel {
  items: ReadonlyArray<ContextMenuDrillItem>;
}

export interface ContextMenuSuggestedItem {
  id: string;
  icon: IconName;
  label: string;
  /** Secondary line shown below the label (e.g. "Workspace", "in Summer 2026 - Run BMW"). */
  subtitle?: string;
}

export interface ContextMenuCategory {
  id: string;
  icon: IconName;
  label: string;
  /** Called when clicked and no `drillLevel` is provided. */
  onSelect: () => void;
  /**
   * When provided, selecting this category slides the panel to show a nested level
   * instead of calling `onSelect`. The Back row is added automatically at index 0.
   */
  drillLevel?: ContextMenuDrillLevel;
}

export interface PromptInputContextMenuProps {
  /** Label shown above suggested items. Defaults to "Suggested context". */
  suggestedLabel?: string;
  /** Recently/currently relevant context items shown at the top. */
  suggestedItems?: readonly ContextMenuSuggestedItem[];
  /** Called when the user selects a suggested item. */
  onSelectSuggested?: (item: ContextMenuSuggestedItem) => void;
  /** Category rows shown below the divider — each may drill into a nested level. */
  categories?: readonly ContextMenuCategory[];
  /** Current query text (typed after `@`). Filters both sections. */
  query?: string;
  // ── Keyboard nav (injected by PromptInput via renderContent) ──
  /** Currently highlighted row index (0-based across all rows). */
  activeIndex?: number;
  /** Report your visible item count so PromptInput can wrap arrow keys correctly. */
  setItemCount?: (n: number) => void;
  /** Register the function that picks the item at activeIndex (called on Enter). */
  registerPickHandler?: (fn: () => void) => void;
  /** Base id for option elements — use `${menuId}-opt-${index}` on each row. */
  menuId?: string;
  /** Extra content rendered at the bottom of the root level. */
  children?: ReactNode;
}

/**
 * Context picker for the `@` trigger in `<PromptInput>`.
 *
 * Category rows can optionally specify a `drillLevel` to slide into a nested list
 * instead of immediately calling `onSelect`. The Back row is index 0 in the drilled
 * level; subsequent items follow. Arrow-key navigation and Enter work identically to
 * the root level — all routed through `registerPickHandler`.
 */
export function PromptInputContextMenu({
  suggestedLabel = "Suggested context",
  suggestedItems = [],
  onSelectSuggested,
  categories = [],
  query = "",
  activeIndex = 0,
  setItemCount,
  registerPickHandler,
  menuId,
  children,
}: PromptInputContextMenuProps) {
  const q = query.toLowerCase();

  const [drillState, setDrillState] = useState<{
    label: string;
    level: ContextMenuDrillLevel;
  } | null>(null);

  /* ── Filtered root items ── */

  const filteredSuggested = q
    ? suggestedItems.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          (item.subtitle?.toLowerCase().includes(q) ?? false),
      )
    : suggestedItems;

  const filteredCategories = q
    ? categories.filter((cat) => cat.label.toLowerCase().includes(q))
    : categories;

  /* ── Item counts — root vs drilled ── */

  const rootItemCount = filteredSuggested.length + filteredCategories.length;
  // Drilled level: 1 Back row + level items.
  const totalItems = drillState
    ? 1 + drillState.level.items.length
    : rootItemCount;

  useEffect(() => {
    setItemCount?.(totalItems);
  }, [totalItems, setItemCount]);

  /* ── Pick handler ── */

  // useLayoutEffect (no deps) so the handler is always fresh with the latest
  // activeIndex/drillState before keyboard events are processed in the same frame.
  useLayoutEffect(() => {
    registerPickHandler?.(() => {
      if (drillState) {
        if (activeIndex === 0) {
          setDrillState(null); // Back
        } else {
          drillState.level.items[activeIndex - 1]?.onSelect();
        }
        return;
      }
      // Root level.
      const si = filteredSuggested.length;
      if (activeIndex < si) {
        const item = filteredSuggested[activeIndex];
        if (item) onSelectSuggested?.(item);
      } else {
        const cat = filteredCategories[activeIndex - si];
        if (!cat) return;
        if (cat.drillLevel) {
          setDrillState({ label: cat.label, level: cat.drillLevel });
        } else {
          cat.onSelect();
        }
      }
    });
  });

  const hasSuggested = filteredSuggested.length > 0;
  const hasCategories = filteredCategories.length > 0;

  /* ── Root level content ── */

  const rootContent =
    !hasSuggested && !hasCategories && !children ? (
      <OptionSeparator type="group-label" labelText="No matches" />
    ) : (
      <>
        {hasSuggested && (
          <>
            <OptionSeparator type="group-label" labelText={suggestedLabel} />
            {filteredSuggested.map((item, index) => (
              <GenericSelectOption
                key={item.id}
                itemRole="option"
                unmanagedFocus
                optionId={menuId ? `${menuId}-opt-${index}` : undefined}
                isActive={index === activeIndex}
                labelText={item.label}
                description={Boolean(item.subtitle)}
                descriptionText={item.subtitle}
                leading={<Icon name={item.icon} size={20} />}
                onClick={() => onSelectSuggested?.(item)}
              />
            ))}
          </>
        )}

        {hasSuggested && hasCategories && <OptionSeparator type="divider" />}

        {hasCategories &&
          filteredCategories.map((cat, i) => {
            const index = filteredSuggested.length + i;
            return (
              <GenericSelectOption
                key={cat.id}
                itemRole="option"
                unmanagedFocus
                optionId={menuId ? `${menuId}-opt-${index}` : undefined}
                isActive={index === activeIndex}
                labelText={cat.label}
                description={false}
                leading={<Icon name={cat.icon} size={20} />}
                subMenu={Boolean(cat.drillLevel)}
                onClick={() => {
                  if (cat.drillLevel) {
                    setDrillState({ label: cat.label, level: cat.drillLevel });
                  } else {
                    cat.onSelect();
                  }
                }}
              />
            );
          })}

        {children}
      </>
    );

  /* ── Drilled level content ── */

  const drilledContent = drillState && (
    <>
      {/* Back row — always index 0 */}
      <GenericSelectOption
        itemRole="option"
        unmanagedFocus
        optionId={menuId ? `${menuId}-opt-0` : undefined}
        isActive={activeIndex === 0}
        description={false}
        labelText="Back"
        leading={<Icon name="arrow_back" size={16} />}
        onClick={() => setDrillState(null)}
      />
      {drillState.level.items.map((item, i) => {
        const index = i + 1;
        return (
          <GenericSelectOption
            key={item.id}
            itemRole="option"
            unmanagedFocus
            optionId={menuId ? `${menuId}-opt-${index}` : undefined}
            isActive={index === activeIndex}
            description={false}
            labelText={item.label}
            leading={<Icon name={item.icon} size={20} />}
            onClick={item.onSelect}
          />
        );
      })}
    </>
  );

  return drillState ? <>{drilledContent}</> : <>{rootContent}</>;
}

PromptInputContextMenu.displayName = "PromptInputContextMenu";
