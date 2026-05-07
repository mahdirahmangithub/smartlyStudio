import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  Children,
  isValidElement,
  cloneElement,
  type HTMLAttributes,
  type ReactNode,
  type ReactElement,
} from "react";
import { Icon } from "../Icon";
import { Dropdown } from "../Dropdown";
import { NavigationSelectOption } from "../NavigationSelectOption";
import type { BreadcrumbItemSize } from "../BreadcrumbItem";
import itemStyles from "../BreadcrumbItem/BreadcrumbItem.module.css";
import styles from "./Breadcrumb.module.css";
import { cx } from "../../utils/cx";


/* ── Props ── */

export type BreadcrumbSize = "sm" | "md" | "lg";

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Visual size propagated to items */
  size?: BreadcrumbSize;
  /** Flat style without pill containers on items */
  basic?: boolean;
  /** Maximum visible items before collapsing */
  maxItems?: number;
  /** Items to show before the collapse button (default 1) */
  itemsBeforeCollapse?: number;
  /** Items to show after the collapse button (default 1) */
  itemsAfterCollapse?: number;
  /** Accessible label for the expand button */
  expandText?: string;
  /** Prevent items from wrapping — truncate instead */
  noWrap?: boolean;
  /** Custom separator (defaults to chevron_right icon) */
  separator?: ReactNode;
  children: ReactNode;
  className?: string;
}

/* ── Collapsed button (internal) ── */


const CollapsedButton = forwardRef<
  HTMLButtonElement,
  {
    size: BreadcrumbItemSize;
    onClick: () => void;
    label: string;
    expanded?: boolean;
  }
>(function CollapsedButton({ size, onClick, label, expanded }, ref) {
  const cls = cx(itemStyles.collapsed, itemStyles[size]);

  return (
    <button
      ref={ref}
      type="button"
      className={cls}
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      aria-haspopup="listbox"
    >
      <Icon name="more_horiz" size={16} />
    </button>
  );
});

/* ── Breadcrumb ── */

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  function Breadcrumb(
    {
      size = "lg",
      basic = false,
      maxItems = 8,
      itemsBeforeCollapse = 1,
      itemsAfterCollapse = 1,
      expandText = "Show full path",
      noWrap = false,
      separator,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const collapsedBtnRef = useRef<HTMLButtonElement>(null);
    const variantCls = basic ? styles.flat : styles.pill;

    const allItems = Children.toArray(children).filter(isValidElement);

    const injectProps = (child: ReactElement, isCurrent: boolean) => {
      const p = child.props as Record<string, unknown>;
      const extra: Record<string, unknown> = {};
      if (p.size === undefined) extra.size = size;
      if (p.basic === undefined) extra.basic = basic;
      if (p.current === undefined && isCurrent) extra.current = true;
      return Object.keys(extra).length > 0
        ? cloneElement(child, extra)
        : child;
    };

    const chevron = separator ?? (
      <Icon name="chevron_right" size={16} aria-hidden="true" />
    );

    const shouldCollapse = maxItems > 0 && allItems.length > maxItems;

    const hiddenItems = shouldCollapse
      ? (allItems.slice(
          itemsBeforeCollapse,
          allItems.length - itemsAfterCollapse,
        ) as ReactElement[])
      : [];

    let visibleItems: ReactElement[];
    if (shouldCollapse) {
      if (itemsBeforeCollapse + itemsAfterCollapse >= allItems.length) {
        visibleItems = allItems as ReactElement[];
      } else {
        visibleItems = [
          ...(allItems.slice(0, itemsBeforeCollapse) as ReactElement[]),
          ...(allItems.slice(
            allItems.length - itemsAfterCollapse,
          ) as ReactElement[]),
        ];
      }
    } else {
      visibleItems = allItems as ReactElement[];
    }

    const toggleDropdown = useCallback(
      () => setDropdownOpen((prev) => !prev),
      [],
    );

    const closeDropdown = useCallback(() => setDropdownOpen(false), []);

    const isSelectItem = (el: ReactElement) =>
      (el.type as any)?.displayName === "BreadcrumbSelectItem";

    const isIconOnlyItem = (el: ReactElement) => {
      const p = el.props as Record<string, unknown>;
      return !!p.icon && !p.children;
    };

    const renderItems = () => {
      const result: ReactNode[] = [];
      let insertedCollapsed = false;

      for (let i = 0; i < visibleItems.length; i++) {
        const isLast = i === visibleItems.length - 1;

        if (
          shouldCollapse &&
          !insertedCollapsed &&
          i === itemsBeforeCollapse
        ) {
          result.push(
            <li
              key="__collapsed"
              className={cx(styles.collapsedItem, variantCls, basic && styles[size])}
            >
              <CollapsedButton
                ref={collapsedBtnRef}
                size={size}
                onClick={toggleDropdown}
                label={expandText}
                expanded={dropdownOpen}
              />
              <span className={styles.chevron} aria-hidden="true">{chevron}</span>
            </li>,
          );
          insertedCollapsed = true;
        }

        const child = injectProps(visibleItems[i], isLast);
        const isSelect = isSelectItem(visibleItems[i]);
        const isIconOnly = isIconOnlyItem(visibleItems[i]);
        result.push(
          <li
            key={(child as ReactElement).key ?? i}
            className={cx(
              styles.listItem,
              isSelect && styles.selectItem,
              isIconOnly && styles.iconOnlyItem,
              variantCls,
              basic && styles[size],
            )}
          >
            {child}
            {!isLast && !isSelect && <span className={styles.chevron} aria-hidden="true">{chevron}</span>}
          </li>,
        );
      }

      return result;
    };

    return (
      <>
        <nav
          ref={ref}
          aria-label="Breadcrumb"
          className={cx(styles.root, className)}
          {...rest}
        >
          <ol role="list" className={cx(styles.list, basic && styles.basicList, noWrap && styles.noWrap)}>{renderItems()}</ol>
        </nav>

        {shouldCollapse && (
          <Dropdown
            open={dropdownOpen}
            onClose={closeDropdown}
            anchorRef={collapsedBtnRef}
            placement="bottom-start"
            width={200}
          >
            {hiddenItems.map((item, i) => {
              const p = item.props as Record<string, unknown>;
              const label =
                typeof p.children === "string"
                  ? p.children
                  : String(p.children ?? "");
              const icon = p.icon as ReactNode | undefined;
              const href = p.href as string | undefined;
              const onItemClick = p.onClick as ((e: unknown) => void) | undefined;
              const disabled = (p.disabled as boolean) ?? false;

              const iconNode =
                typeof icon === "string" ? (
                  <Icon name={icon as any} size={20} />
                ) : (
                  icon
                );

              return (
                <NavigationSelectOption
                  key={i}
                  labelText={label}
                  leading={iconNode ?? undefined}
                  disabled={disabled}
                  onClick={() => {
                    closeDropdown();
                    if (onItemClick) onItemClick({ preventDefault() {} } as any);
                    else if (href) window.location.href = href;
                  }}
                />
              );
            })}
          </Dropdown>
        )}
      </>
    );
  },
);

Breadcrumb.displayName = "Breadcrumb";
