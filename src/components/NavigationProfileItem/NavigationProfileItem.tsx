import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { Avatar } from "../Avatar";
import { Icon } from "../Icon";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./NavigationProfileItem.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface NavigationProfileItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The text label — always present, truncated to 1 line with tooltip on overflow */
  label: string;
  /** Image URL for the avatar */
  avatarSrc?: string;
  /** Up to 2-character initials (fallback when no src) */
  avatarInitials?: string;
  /** Accessible alt text for the avatar */
  avatarAlt?: string;
  /** Compact mode — shows only the avatar */
  iconOnly?: boolean;
  /** Active / selected state */
  checked?: boolean;
  /** Shows a chevron arrow on the right */
  chevron?: boolean;
  onClick?: () => void;
}

export const NavigationProfileItem = forwardRef<
  HTMLDivElement,
  NavigationProfileItemProps
>(function NavigationProfileItem(
  {
    label,
    avatarSrc,
    avatarInitials,
    avatarAlt = label,
    iconOnly = false,
    checked = false,
    chevron = true,
    onClick,
    className,
    ...rest
  },
  ref,
) {
  const [labelRef, isLabelTruncated] =
    useIsTruncated<HTMLSpanElement>(iconOnly ? undefined : label);

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
      aria-pressed={checked}
      tabIndex={0}
      className={cx(
        styles.root,
        checked && styles.checked,
        iconOnly && styles.iconOnly,
        className,
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <span className={styles.avatar}>
        <Avatar
          size="sm"
          round
          src={avatarSrc}
          initials={avatarInitials}
          alt={avatarAlt}
        />
      </span>

      <span className={styles.expandable}>
        <span className={styles.expandableClip}>
          <span className={styles.expandableInner}>
            <Tooltip
              label={label}
              disabled={!isLabelTruncated || iconOnly}
              placement="top"
              type="neutral"
              showTail={false}
            >
              <span ref={labelRef} className={styles.label}>
                {label}
              </span>
            </Tooltip>

            {chevron && (
              <span className={styles.chevron}>
                <Icon name="chevron_right" size={20} />
              </span>
            )}
          </span>
        </span>
      </span>
    </div>
  );
});

NavigationProfileItem.displayName = "NavigationProfileItem";
