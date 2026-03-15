import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  Children,
  isValidElement,
  cloneElement,
  createContext,
  useContext,
  type HTMLAttributes,
  type ReactNode,
  type ReactElement,
} from "react";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { Dropdown } from "../Dropdown";
import { NavigationSelectOption } from "../NavigationSelectOption";
import type { BreadcrumbItemSize } from "../BreadcrumbItem";
import itemStyles from "../BreadcrumbItem/BreadcrumbItem.module.css";
import styles from "./Breadcrumb.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ── Context ── */

interface BreadcrumbContextValue {
  size: BreadcrumbItemSize;
  basic: boolean;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  size: "lg",
  basic: false,
});

export function useBreadcrumbContext() {
  return useContext(BreadcrumbContext);
}

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
  /** Custom separator (defaults to chevron_right icon) */
  separator?: ReactNode;
  children: ReactNode;
  className?: string;
}

/* ── Collapsed button (internal) ── */

const ICON_SIZE: Record<BreadcrumbItemSize, number> = { lg: 20, md: 16, sm: 16 };

const CollapsedButton = forwardRef<
  HTMLButtonElement,
  {
    size: BreadcrumbItemSize;
    basic: boolean;
    onClick: () => void;
    label: string;
    expanded?: boolean;
  }
>(function CollapsedButton({ size, basic, onClick, label, expanded }, ref) {
  if (basic) {
    return (
      <IconButton
        ref={ref}
        variant="neutral"
        emphasis="low"
        size={size}
        icon={<Icon name="more_horiz" size={ICON_SIZE[size]} />}
        aria-label={label}
        aria-expanded={expanded}
        aria-haspopup="listbox"
        onClick={onClick}
        hideTooltip={expanded}
      />
    );
  }

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
                basic={basic}
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
        result.push(
          <li
            key={(child as ReactElement).key ?? i}
            className={cx(styles.listItem, variantCls, basic && styles[size])}
          >
            {child}
            {!isLast && <span className={styles.chevron} aria-hidden="true">{chevron}</span>}
          </li>,
        );
      }

      return result;
    };

    return (
      <BreadcrumbContext.Provider value={{ size, basic }}>
        <nav
          ref={ref}
          aria-label="Breadcrumb"
          className={cx(styles.root, className)}
          {...rest}
        >
          <ol role="list" className={cx(styles.list, basic && styles.basicList)}>{renderItems()}</ol>
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
                    if (href) window.location.href = href;
                  }}
                />
              );
            })}
          </Dropdown>
        )}
      </BreadcrumbContext.Provider>
    );
  },
);

Breadcrumb.displayName = "Breadcrumb";
