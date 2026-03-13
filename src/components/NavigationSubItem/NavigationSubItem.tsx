import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Badge } from "../Badge";
import { Icon, type IconName } from "../Icon";
import { IconBadge } from "../IconBadge";
import { IconButton } from "../IconButton";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./NavigationSubItem.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface NavigationSubItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The text label — always present, truncated to 1 line with tooltip on overflow */
  label: string;
  /** Optional icon displayed before the label (e.g. `<Icon name="home" size={20} />`) */
  leadingIcon?: ReactNode;
  /** Active / selected state */
  checked?: boolean;
  /** Badge count — renders a Badge (brand, high, sm, round) */
  badgeCount?: number | string;
  /** Shows a lock icon-badge (neutral, medium, sm, round) */
  locked?: boolean;
  /** Shows the external-link arrow icon */
  externalLink?: boolean;
  /** Whether the item is pinned */
  pinned?: boolean;
  /** Icon name for the action button (e.g. "keep", "more_horiz") */
  actionIcon?: IconName;
  /** Accessible label for the action button */
  actionLabel?: string;
  /** Callback when the action button is clicked */
  onAction?: () => void;
  onClick?: () => void;
}

export const NavigationSubItem = forwardRef<HTMLDivElement, NavigationSubItemProps>(
  function NavigationSubItem(
    {
      label,
      leadingIcon,
      checked = false,
      badgeCount,
      locked = false,
      externalLink = false,
      pinned = false,
      actionIcon,
      actionLabel = "Action",
      onAction,
      onClick,
      className,
      ...rest
    },
    ref,
  ) {
    const [labelRef, isLabelTruncated] = useIsTruncated<HTMLSpanElement>(label);

    const hasBadge = badgeCount != null;
    const hasAction = actionIcon != null;

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.();
      }
    };

    const handleAction = (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.currentTarget.blur();
      onAction?.();
    };

    return (
      <div
        ref={ref}
        role="menuitem"
        aria-pressed={checked}
        tabIndex={0}
        className={cx(
          styles.root,
          checked && styles.checked,
          className,
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <span className={styles.inner}>
          {leadingIcon && (
            <span className={styles.leadingIcon}>{leadingIcon}</span>
          )}

          <span className={styles.content}>
          <span className={styles.labelGroup}>
            <Tooltip
              label={label}
              disabled={!isLabelTruncated}
              placement="top"
              type="neutral"
              showTail={false}
            >
              <span ref={labelRef} className={styles.label}>
                {label}
              </span>
            </Tooltip>

            {externalLink && (
              <span className={styles.externalLinkIcon}>
                <Icon name="arrow_outward" size={16} />
              </span>
            )}
          </span>

          {(hasAction || pinned) && (
            <span className={cx(styles.actionContainer, pinned && styles.pinned)}>
              {pinned && (
                <span className={styles.pinnedIndicator}>
                  <Icon name="keep_fill" size={16} />
                </span>
              )}
              {hasAction && (
                <span className={styles.actionButton}>
                  <IconButton
                    size="sm"
                    variant="neutral"
                    emphasis="low"
                    icon={<Icon name={actionIcon} size={16} />}
                    aria-label={actionLabel}
                    onClick={handleAction}
                  />
                </span>
              )}
            </span>
          )}

          {locked && (
            <span className={styles.lockBadge}>
              <IconBadge size="sm" variant="neutral" emphasis="medium" round>
                <Icon name="lock" size={12} />
              </IconBadge>
            </span>
          )}

          {hasBadge && (
            <span className={styles.badge}>
              <Badge size="md" variant="info" emphasis="high">
                {badgeCount}
              </Badge>
            </span>
          )}
        </span>
        </span>
      </div>
    );
  },
);

NavigationSubItem.displayName = "NavigationSubItem";
