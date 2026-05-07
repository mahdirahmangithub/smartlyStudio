import { useContext, useId, useState, Children, cloneElement, isValidElement } from "react";
import { Icon } from "../Icon";
import { Spinner } from "../Spinner";
import { Expander } from "../Expander";
import { useCollapsible } from "../../hooks/useCollapsible";
import { cx } from "../../utils/cx";
import styles from "./CotItem.module.css";
import type { CotItemProps, CotItemStatus, CotItemVariant } from "./cotTypes";
import { CotContainerContext, CotItemContext, type CotContainerContextValue } from "./cotContext";

/**
 * Derive a CotItem's status from its enclosing CotContainer's state and the
 * item's index. Returns undefined when no derivation applies — the consumer's
 * explicit status (or the default "idle") is then used.
 *
 * Rules (only for type="task"):
 *   • container "completed"               → "complete" (every item)
 *   • container "running" + progress P:
 *       progress  >=  ((i+1)/total) * 100 → "complete"  (item finished)
 *       progress  >=  (i / total)   * 100 → "loading"   (in-progress item)
 *       otherwise                         → "idle"      (future item)
 *   • any other container status          → undefined   (no override)
 */
function deriveStatusFromContext(
  containerCtx: CotContainerContextValue | null,
  index: number | null,
  total: number | null,
): CotItemStatus | undefined {
  if (!containerCtx || index == null || total == null || total <= 0) return undefined;
  if (containerCtx.type !== "task") return undefined;
  const { status, progress } = containerCtx;
  if (status === "completed") return "complete";
  if (status === "running") {
    const lower = (index / total) * 100;
    const upper = ((index + 1) / total) * 100;
    if (progress >= upper) return "complete";
    if (progress >= lower) return "loading";
    return "idle";
  }
  return undefined;
}

function LeadingIcon({
  variant,
  status,
  icon,
}: {
  variant: CotItemVariant;
  status: CotItemStatus;
  icon?: React.ReactNode;
}) {
  if (status === "loading") {
    return <Spinner size="sm" type="neutral" aria-label="Loading" />;
  }

  if (variant === "todo") {
    if (status === "complete") return <Icon name="check_circle" size={16} aria-hidden />;
    if (status === "error") return <Icon name="cancel" size={16} aria-hidden />;
    return <Icon name="circle_dash" size={16} aria-hidden />;
  }

  if (variant === "icon") {
    return <>{icon ?? <Icon name="dot_fill" size={16} aria-hidden />}</>;
  }

  // dot
  return <Icon name="dot_fill" size={10} aria-hidden />;
}

export function CotItem({
  title,
  description,
  children,
  variant = "dot",
  icon,
  status: statusProp,
  expandable = false,
  defaultExpanded = false,
  expanded: expandedProp,
  onExpandedChange,
  connector,
  disabled = false,
  className,
  ...rest
}: CotItemProps) {
  // If the consumer didn't pass an explicit status, derive one from the
  // enclosing CotContainer's progress. Falls back to "idle" if no derivation
  // applies (e.g. no container, or container not in task/running state).
  const containerCtx = useContext(CotContainerContext);
  const itemCtx = useContext(CotItemContext);
  const derivedStatus = deriveStatusFromContext(
    containerCtx,
    itemCtx?.index ?? null,
    itemCtx?.total ?? null,
  );
  const status: CotItemStatus = statusProp ?? derivedStatus ?? "idle";

  const showConnector = connector ?? (status !== "idle");

  const slotChildren = disabled
    ? Children.map(children, (child) =>
        isValidElement(child)
          ? cloneElement(child as React.ReactElement<{ disabled?: boolean }>, { disabled: true })
          : child
      )
    : children;
  const slotId = useId();
  const isControlled = expandedProp !== undefined;
  const [expandedInternal, setExpandedInternal] = useState(defaultExpanded);
  const isExpanded = isControlled ? expandedProp! : expandedInternal;

  const { ref: collapsibleRef } = useCollapsible(isExpanded);

  const toggle = () => {
    if (!isControlled) setExpandedInternal((v) => !v);
    onExpandedChange?.(!isExpanded);
  };

  const statusLabel =
    status === "loading"
      ? "In progress"
      : status === "complete"
      ? "Complete"
      : status === "error"
      ? "Failed"
      : "Pending";

  const headerContent = (
    <>
      {/* Leading icon column */}
      <div className={styles.leading}>
        {/* Icon + optional chevron overlay on hover (expandable only) */}
        <div className={styles.leadingSlot}>
          <span
            className={cx(
              styles.leadingIcon,
              variant === "dot" && styles.leadingDot
            )}
          >
            <LeadingIcon variant={variant} status={status} icon={icon} />
          </span>

          {expandable && status !== "loading" && (
            <span className={styles.leadingChevron} aria-hidden="true">
              <Expander expanded={isExpanded} size="sm" emphasis="medium" />
            </span>
          )}
        </div>
      </div>

      {/* Title + description */}
      <div className={cx(styles.headerText, title == null && styles.headerTextDescOnly)}>
        {title != null && (
          <span className={styles.title}>{title}</span>
        )}
        {description != null && (
          <span className={styles.description}>{description}</span>
        )}
      </div>
    </>
  );

  return (
    <li
      className={cx(
        styles.root,
        showConnector && styles.withConnector,
        status === "idle" && styles.statusIdle,
        status === "error" && styles.statusError,
        disabled && styles.disabled,
        className
      )}
      aria-label={
        typeof title === "string"
          ? `${title} — ${statusLabel}`
          : undefined
      }
      aria-busy={status === "loading" || undefined}
      {...rest}
    >
      {/* ── Header row ── */}
      {expandable ? (
        <button
          type="button"
          className={styles.expandableHeader}
          onClick={toggle}
          aria-expanded={isExpanded}
          aria-controls={slotId}
        >
          {headerContent}
        </button>
      ) : (
        <div className={styles.headerRow}>{headerContent}</div>
      )}

      {/* ── Slot content ── */}
      {slotChildren != null && (
        expandable ? (
          <div
            id={slotId}
            ref={collapsibleRef}
            className={styles.slotCollapsible}
            aria-hidden={!isExpanded}
            inert={!isExpanded ? true : undefined}
          >
            <div className={styles.slotInner}>{slotChildren}</div>
          </div>
        ) : (
          <div className={styles.slotNormal}>
            <div className={styles.slotInner}>{slotChildren}</div>
          </div>
        )
      )}

    </li>
  );
}

CotItem.displayName = "CotItem";
