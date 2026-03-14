import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { Icon } from "../Icon";
import { NotificationBadge } from "../NotificationBadge";
import styles from "./NavigationBrandItem.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface NavigationBrandItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Compact mode — shows only the logo circle */
  iconOnly?: boolean;
  /** Completely removes the logotype section (not just hidden/clipped) */
  hideLogotype?: boolean;
  /** Shows a notification dot badge on the logo */
  badge?: boolean;
  onClick?: () => void;
}

export const NavigationBrandItem = forwardRef<HTMLDivElement, NavigationBrandItemProps>(
  function NavigationBrandItem(
    {
      iconOnly = false,
      hideLogotype = false,
      badge = false,
      onClick,
      className,
      ...rest
    },
    ref,
  ) {
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.();
      }
    };

    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={0}
        className={cx(
          styles.root,
          iconOnly && styles.iconOnly,
          className,
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <span className={styles.logo}>
          <Icon name="smartly" size={28} />
          {badge && (
            <span className={styles.notificationBadge}>
              <NotificationBadge
                size="sm"
                variant="alert"
                emphasis="high"
                outline
              />
            </span>
          )}
        </span>

        {!hideLogotype && (
          <span className={styles.expandable}>
            <span className={styles.expandableClip}>
              <span className={styles.expandableInner}>
                <span className={styles.logotype}>
                  <Icon name="smartly-type" width={54} height={8} />
                </span>
              </span>
            </span>
          </span>
        )}
      </div>
    );
  },
);

NavigationBrandItem.displayName = "NavigationBrandItem";
