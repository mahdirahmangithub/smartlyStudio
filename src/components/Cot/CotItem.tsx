import { useId, useState } from "react";
import { Icon } from "../Icon";
import { Spinner } from "../Spinner";
import { Expander } from "../Expander";
import { useCollapsible } from "../../hooks/useCollapsible";
import { cx } from "../../utils/cx";
import styles from "./CotItem.module.css";
import type { CotItemProps, CotItemStatus, CotItemVariant } from "./cotTypes";

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
  status = "idle",
  expandable = false,
  defaultExpanded = false,
  expanded: expandedProp,
  onExpandedChange,
  connector = true,
  className,
  ...rest
}: CotItemProps) {
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
        connector && styles.withConnector,
        status === "error" && styles.statusError,
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
      {children != null && (
        expandable ? (
          <div
            id={slotId}
            ref={collapsibleRef}
            className={styles.slotCollapsible}
            aria-hidden={!isExpanded}
            inert={!isExpanded ? true : undefined}
          >
            <div className={styles.slotInner}>{children}</div>
          </div>
        ) : (
          <div className={styles.slotNormal}>
            <div className={styles.slotInner}>{children}</div>
          </div>
        )
      )}

    </li>
  );
}

CotItem.displayName = "CotItem";
