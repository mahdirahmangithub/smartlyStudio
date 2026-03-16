import {
  Children,
  Fragment,
  isValidElement,
  cloneElement,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type ReactElement,
} from "react";
import { Icon } from "../Icon";
import type { IconName } from "../Icon";
import { IconButton } from "../IconButton";
import { IconBadge } from "../IconBadge";
import { Dropdown } from "../Dropdown";
import { GenericSelectOption } from "../GenericSelectOption";
import { NavBarCompactProvider } from "./NavBarCompactContext";
import styles from "./NavBarContent.module.css";

/* ═══════════════════════════════════════════════════════════════════════
   Compact-mode tree transformers
   ═══════════════════════════════════════════════════════════════════════ */

const SIZE_COMPONENTS = new Set([
  "Button",
  "IconButton",
  "SelectButton",
  "Toggle",
]);

function getComponentName(el: ReactElement): string | undefined {
  const type = el.type as any;
  return type?.displayName || type?.name;
}

function badgeToIconBadge(child: ReactElement): ReactNode {
  const p = child.props as Record<string, unknown>;
  if (!p.leadingIcon) return cloneElement(child, { size: "sm" } as any);
  const label =
    typeof p.children === "string" || typeof p.children === "number"
      ? String(p.children)
      : undefined;
  return (
    <IconBadge
      size={(p.size as any) ?? "md"}
      variant={(p.variant as any) ?? "neutral"}
      emphasis={(p.emphasis as any) ?? "medium"}
      round={(p.round as boolean) ?? false}
      aria-label={label}
      className={p.className as string | undefined}
    >
      {p.leadingIcon as ReactNode}
    </IconBadge>
  );
}

/**
 * Shallow-walk a ReactNode tree. For each recognized DS component:
 * - Breadcrumb → size="sm" + collapse to last item only
 * - Button / IconButton / SelectButton / Toggle → size="sm"
 * - Badge with leadingIcon → IconBadge with tooltip
 */
function compactifyNode(node: ReactNode): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child;

    if (child.type === Fragment) {
      return <>{compactifyNode((child.props as any).children)}</>;
    }

    const name = getComponentName(child);

    if (name === "Breadcrumb") {
      return cloneElement(child, {
        size: "sm",
        maxItems: 1,
        itemsBeforeCollapse: 0,
        itemsAfterCollapse: 1,
      } as any);
    }

    if (name === "Badge") {
      return badgeToIconBadge(child);
    }

    if (name && SIZE_COMPONENTS.has(name)) {
      return cloneElement(child, { size: "sm" } as any);
    }

    return child;
  });
}

/** compactifyNode covers all transforms; description uses the same logic. */
const compactifyDescription = compactifyNode;

/**
 * Actions only get Badge→IconBadge transformation, no size overrides.
 */
function compactifyAction(node: ReactNode): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child;

    if (child.type === Fragment) {
      return <>{compactifyAction((child.props as any).children)}</>;
    }

    const name = getComponentName(child);

    if (name === "Badge") {
      return badgeToIconBadge(child);
    }

    return child;
  });
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */

export type NavBarAction = {
  id: string;
  /** Element rendered in the right section */
  element: ReactNode;
  /** Alternate element rendered in compact mode (e.g. smaller button) */
  compactElement?: ReactNode;
  /** When true, this action moves into the overflow dropdown in compact mode */
  overflow?: boolean;
  /** Label shown in the overflow dropdown */
  overflowLabel?: string;
  /** Leading icon in the overflow dropdown row */
  overflowIcon?: IconName;
  /** Destructive styling in the overflow dropdown */
  overflowAlert?: boolean;
  /** Click handler — used in the overflow dropdown option */
  onClick?: () => void;
  /** Render a divider instead of an action */
  type?: "divider";
};

export interface NavBarContentProps {
  /** Left-side content (Breadcrumb, TitleText, IconButtons, toggles, etc.) */
  children?: ReactNode;
  /** Optional description row rendered below the left content */
  description?: ReactNode;
  /** Right-side actions */
  actions?: NavBarAction[];
  /** Manual compact mode override. When undefined, auto-detected via ResizeObserver. */
  compact?: boolean;
  /** Width threshold (px) below which compact mode activates. Default 768. */
  compactBreakpoint?: number;
  /** Additional CSS class on the root element */
  className?: string;
}

const DEFAULT_COMPACT_BREAKPOINT = 768;

/* ═══════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════ */

export function NavBarContent({
  children,
  description,
  actions,
  compact: compactProp,
  compactBreakpoint = DEFAULT_COMPACT_BREAKPOINT,
  className,
}: NavBarContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [autoCompact, setAutoCompact] = useState(false);
  const isCompact = compactProp ?? autoCompact;

  /* ── ResizeObserver for auto compact detection ── */
  useEffect(() => {
    if (compactProp !== undefined) return;
    const el = rootRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setAutoCompact(entry.contentRect.width < compactBreakpoint);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [compactProp, compactBreakpoint]);

  /* ── Overflow dropdown state ── */
  const moreRef = useRef<HTMLButtonElement>(null);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const toggleOverflow = useCallback(() => setOverflowOpen((o) => !o), []);
  const closeOverflow = useCallback(() => setOverflowOpen(false), []);

  /* ── Partition actions into visible vs overflow ── */
  const visibleActions: NavBarAction[] = [];
  const overflowActions: NavBarAction[] = [];

  if (actions) {
    for (const action of actions) {
      if (isCompact && action.overflow) {
        overflowActions.push(action);
      } else {
        visibleActions.push(action);
      }
    }
  }

  const hasOverflow = isCompact && overflowActions.length > 0;

  return (
    <NavBarCompactProvider value={isCompact}>
      <div
        ref={rootRef}
        className={cx(styles.root, isCompact && styles.compact, className)}
      >
        {/* ── Left section ── */}
        <div className={styles.left}>
          {children && (
            <div className={styles.titleRow}>
              {isCompact ? compactifyNode(children) : children}
            </div>
          )}
          {description && (
            <div className={cx(styles.description, isCompact && styles.descriptionCompact)}>
              {isCompact ? compactifyDescription(description) : description}
            </div>
          )}
        </div>

        {/* ── Right section ── */}
        {(visibleActions.length > 0 || hasOverflow) && (
          <div className={styles.right}>
            {hasOverflow && (
              <>
                <IconButton
                  ref={moreRef}
                  size="sm"
                  variant="neutral"
                  emphasis="low"
                  icon={<Icon name="more_horiz" size={16} />}
                  aria-label="More actions"
                  aria-expanded={overflowOpen}
                  aria-haspopup="true"
                  onClick={toggleOverflow}
                />
                <Dropdown
                  open={overflowOpen}
                  onClose={closeOverflow}
                  anchorRef={moreRef}
                  placement="bottom-end"
                  width={220}
                >
                  {overflowActions.map((action) => {
                    if (action.type === "divider") return null;
                    return (
                      <GenericSelectOption
                        key={action.id}
                        labelText={action.overflowLabel || action.id}
                        description={false}
                        alert={action.overflowAlert}
                        leading={
                          action.overflowIcon ? (
                            <Icon name={action.overflowIcon} size={16} />
                          ) : undefined
                        }
                        onClick={() => {
                          action.onClick?.();
                          closeOverflow();
                        }}
                      />
                    );
                  })}
                </Dropdown>
              </>
            )}
            {visibleActions.map((action) => {
              if (action.type === "divider") {
                return <span key={action.id} aria-hidden="true" />;
              }
              const el =
                isCompact && action.compactElement
                  ? action.compactElement
                  : isCompact
                    ? compactifyAction(action.element)
                    : action.element;
              return <span key={action.id}>{el}</span>;
            })}
          </div>
        )}
      </div>
    </NavBarCompactProvider>
  );
}

NavBarContent.displayName = "NavBarContent";
