import { useEffect, type ReactNode } from "react";
import { Icon } from "../Icon";
import type { IconName } from "../Icon";
import { OptionSeparator } from "../OptionSeparator";
import { GenericSelectOption } from "../GenericSelectOption";

/* ── Types ── */

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
  onSelect: () => void;
}

export interface PromptInputContextMenuProps {
  /** Label shown above suggested items. Defaults to "Suggested context". */
  suggestedLabel?: string;
  /** Recently/currently relevant context items shown at the top. */
  suggestedItems?: readonly ContextMenuSuggestedItem[];
  /** Called when the user selects a suggested item. */
  onSelectSuggested?: (item: ContextMenuSuggestedItem) => void;
  /** Category rows shown below the divider — each has a chevron for drilling in. */
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
  /** Extra content rendered at the bottom. */
  children?: ReactNode;
}

/**
 * Context picker for the `@` trigger in `<PromptInput>`.
 *
 * Uses `OptionSeparator` (group-label + divider) and `GenericSelectOption`.
 * Keyboard navigation (arrow keys, Enter, Escape) works identically to the
 * built-in `/` attachment menu when wired via `renderContent`.
 *
 * ```tsx
 * triggerMenus={[
 *   { char: "/" },
 *   {
 *     char: "@",
 *     renderContent: (props) => (
 *       <PromptInputContextMenu
 *         {...props}
 *         suggestedItems={suggestedItems}
 *         onSelectSuggested={(item) => { handleSelect(item); props.onClose(); }}
 *         categories={categories}
 *       />
 *     ),
 *   },
 * ]}
 * ```
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

  const totalItems = filteredSuggested.length + filteredCategories.length;

  // Report item count to PromptInput for arrow-key wrap.
  useEffect(() => {
    setItemCount?.(totalItems);
  }, [totalItems, setItemCount]);

  // Register the pick handler so Enter selects the active row.
  useEffect(() => {
    registerPickHandler?.(() => {
      const si = filteredSuggested.length;
      if (activeIndex < si) {
        const item = filteredSuggested[activeIndex];
        if (item) onSelectSuggested?.(item);
      } else {
        const cat = filteredCategories[activeIndex - si];
        cat?.onSelect();
      }
    });
  });

  const hasSuggested = filteredSuggested.length > 0;
  const hasCategories = filteredCategories.length > 0;

  if (!hasSuggested && !hasCategories && !children) {
    return <OptionSeparator type="group-label" labelText="No matches" />;
  }

  return (
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
              onMouseEnter={() => {/* activeIndex managed by parent */}}
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
              subMenu
              onClick={cat.onSelect}
              onMouseEnter={() => {/* activeIndex managed by parent */}}
            />
          );
        })}

      {children}
    </>
  );
}

PromptInputContextMenu.displayName = "PromptInputContextMenu";
