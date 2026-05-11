import { Fragment, type ReactNode } from "react";
import { GenericSelectOption } from "../GenericSelectOption";
import { OptionSeparator } from "../OptionSeparator";
import { Icon } from "../Icon";
import type { MenuNode } from "../../types/MenuNode";
import type { MenuNodeFilter } from "../../utils/filterMenuTree";
import {
  useTriggerMenu,
  type TriggerSelectHelpers,
} from "./useTriggerMenu";

/**
 * Props passed to a consumer's `renderItem` override. Spread the bag onto
 * any select-option component (`<GenericSelectOption>`,
 * `<SingleSelectOption>`, `<MultiSelectOption>`, …) — the keys match the
 * combobox-mode props those components already expect.
 */
export interface TriggerMenuRenderItemProps {
  /** Stable id used for `aria-activedescendant` wiring. Spread onto your row. */
  optionId: string;
  /** Whether this row is the currently-highlighted pickable. */
  isActive: boolean;
  /** Tells the row not to take DOM focus (input keeps it). Always `true`. */
  unmanagedFocus: true;
  /** True when the item has children — render a chevron / submenu affordance. */
  hasChildren: boolean;
  /** Click handler — drills in (if the item has children) or fires the leaf select. */
  onClick: () => void;
}

export interface TriggerMenuProps {
  /** Menu items at the root level. Recursive — drill depth is unlimited. */
  items: readonly MenuNode[];

  /* ── PromptInput renderContent props (just spread `props` from your
   * trigger config's `renderContent` and we'll thread them). ───────── */
  query: string;
  activeIndex: number;
  setItemCount: (n: number) => void;
  registerPickHandler: (fn: () => void) => void;
  menuId: string;
  onAccept: () => void;
  onClose: () => void;

  /* ── Optional consumer customization ─────────────────────────────── */
  /** Called when the user picks a leaf. Default routes to chip (RTE) or context row (textarea). */
  onSelect?: (item: MenuNode, helpers: TriggerSelectHelpers) => void;
  /** Override the default filter (label + subtitle + keywords substring). */
  filter?: MenuNodeFilter;
  /**
   * Override per-row rendering. Return `undefined` to fall through to the
   * default (`<GenericSelectOption>`). Useful for mixing in
   * `<MultiSelectOption>`, `<SingleSelectOption>`, avatars, two-line rows,
   * etc. without dropping to the bare `useTriggerMenu` hook.
   *
   * Note: this only fires for `type: "item"` rows. Separators and group
   * labels render via `<OptionSeparator>` regardless.
   */
  renderItem?: (
    item: MenuNode,
    props: TriggerMenuRenderItemProps,
  ) => ReactNode;
  /** Optional non-scrollable prefix rendered above the rows (e.g. group label). */
  header?: ReactNode;
  /** Empty-state label when filter matches nothing. Default: "No matches". */
  emptyLabel?: string;
}

/**
 * High-level component for trigger-driven menus opened by typing `/`, `@`,
 * or any configured character in `<PromptInput>` /
 * `<PromptInputRichTextEditor>`. Wraps `useTriggerMenu` with default
 * rendering using `GenericSelectOption`.
 *
 * Usage — drop directly into a trigger config's `renderContent`:
 *
 *     {
 *       char: "@",
 *       renderContent: (props) => (
 *         <TriggerMenu {...props} items={CONTEXT_CATEGORIES} />
 *       ),
 *     }
 *
 * That's the full integration. Filter, drill, keyboard nav, chip
 * insertion vs context-row insertion — all handled. Override `onSelect`
 * only when you need custom dispatch (e.g. typed `/` attachment kinds).
 *
 * For full custom layouts, use the `useTriggerMenu` hook directly.
 */
export function TriggerMenu(props: TriggerMenuProps) {
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
    renderItem,
    header,
    emptyLabel = "No matches",
  } = props;

  const tm = useTriggerMenu({
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
  });

  const backRowProps = tm.getBackRowProps();

  // Walk visibleItems, tracking pickable index separately so structural rows
  // (separators / group-labels) don't consume a keyboard slot. Pickable items
  // start at logical index `hasBackRow ? 1 : 0` to leave room for the Back row.
  let pickableCounter = 0;

  return (
    <>
      {header}
      {backRowProps && (
        <GenericSelectOption
          {...backRowProps}
          itemRole="option"
          description={false}
          leading={<Icon name="arrow_back" size={16} />}
          onClick={tm.pop}
        />
      )}
      {tm.visibleItems.length === 0 ? (
        <OptionSeparator type="group-label" labelText={emptyLabel} />
      ) : (
        tm.visibleItems.map((item, i) => {
          // Structural rows render but don't get a logical index.
          if (item.type === "separator") {
            return <OptionSeparator key={item.id} type="divider" />;
          }
          if (item.type === "group-label") {
            return (
              <OptionSeparator
                key={item.id}
                type="group-label"
                labelText={item.label}
              />
            );
          }

          const logicalIndex =
            (tm.hasBackRow ? 1 : 0) + pickableCounter;
          pickableCounter += 1;
          const optionProps = tm.getOptionProps(logicalIndex);
          const hasChildren = !!item.items && item.items.length > 0;
          const onClick = () => tm.pickIndex(logicalIndex);

          const custom = renderItem?.(item, {
            ...optionProps,
            hasChildren,
            onClick,
          });

          return (
            <Fragment key={item.id}>
              {item.dividerBefore && i > 0 ? (
                <OptionSeparator type="divider" />
              ) : null}
              {custom !== undefined ? (
                custom
              ) : (
                <GenericSelectOption
                  itemRole="option"
                  {...optionProps}
                  labelText={item.label}
                  description={Boolean(item.subtitle)}
                  descriptionText={item.subtitle}
                  leading={item.icon ? <Icon name={item.icon} size={20} /> : undefined}
                  subMenu={hasChildren}
                  disabled={item.disabled}
                  onClick={onClick}
                />
              )}
            </Fragment>
          );
        })
      )}
    </>
  );
}

TriggerMenu.displayName = "TriggerMenu";
