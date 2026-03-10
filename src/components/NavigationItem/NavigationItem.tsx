import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Badge } from "../Badge";
import { Icon } from "../Icon";
import { IconBadge } from "../IconBadge";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./NavigationItem.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface NavigationItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The text label — always present, truncated to 1 line with tooltip on overflow */
  label: string;
  /** Icon displayed before the label (e.g. `<Icon name="home" size={20} />`) */
  leadingIcon?: ReactNode;
  /** Compact mode — shows only the leading icon */
  iconOnly?: boolean;
  /** Active / selected state */
  checked?: boolean;
  /** Badge count — renders a Badge (brand, high, sm, round) */
  badgeCount?: number | string;
  /** Shows a lock icon-badge (neutral, medium, sm, round) */
  locked?: boolean;
  /** Shows the external-link arrow icon */
  externalLink?: boolean;
  onClick?: () => void;
}

export const NavigationItem = forwardRef<HTMLDivElement, NavigationItemProps>(
  function NavigationItem(
    {
      label,
      leadingIcon,
      iconOnly = false,
      checked = false,
      badgeCount,
      locked = false,
      externalLink = false,
      onClick,
      className,
      ...rest
    },
    ref,
  ) {
    const [labelRef, isLabelTruncated] =
      useIsTruncated<HTMLSpanElement>(iconOnly ? undefined : label);
    const clipRef = useRef<HTMLSpanElement>(null);
    const innerRef = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
      const clip = clipRef.current;
      const inner = innerRef.current;
      if (!clip || !inner || iconOnly) return;

      const w = clip.getBoundingClientRect().width;
      if (w > 0) {
        inner.style.setProperty("--_content-width", `${w}px`);
      }
    }, [iconOnly]);

    useEffect(() => {
      const clip = clipRef.current;
      const inner = innerRef.current;
      if (!clip || !inner || iconOnly) return;

      let locked = true;
      const grid = clip.parentElement;

      const unlock = () => { locked = false; };
      grid?.addEventListener("transitionend", unlock, { once: true });

      const ro = new ResizeObserver(() => {
        if (locked) return;
        const w = clip.getBoundingClientRect().width;
        if (w > 0) {
          inner.style.setProperty("--_content-width", `${w}px`);
        }
      });
      ro.observe(clip);

      return () => {
        grid?.removeEventListener("transitionend", unlock);
        ro.disconnect();
      };
    }, [iconOnly]);

    const hasBadge = badgeCount != null;

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.();
      }
    };

    const badge = hasBadge ? (
      <Badge size="sm" variant="brand" emphasis="high" round>
        {badgeCount}
      </Badge>
    ) : null;

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
        {leadingIcon && (
          <span className={styles.leadingIcon}>{leadingIcon}</span>
        )}

        <span className={styles.expandable}>
          <span ref={clipRef} className={styles.expandableClip}>
            <span ref={innerRef} className={styles.expandableInner}>
              <span className={styles.labelGroup}>
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

                {externalLink && (
                  <span className={styles.externalLinkIcon}>
                    <Icon name="arrow_outward" size={16} />
                  </span>
                )}
              </span>

              {badge && (
                <span className={styles.badgeInline}>{badge}</span>
              )}

              {locked && (
                <span className={styles.lockBadge}>
                  <IconBadge size="sm" variant="neutral" emphasis="medium" round>
                    <Icon name="lock" size={12} />
                  </IconBadge>
                </span>
              )}
            </span>
          </span>
        </span>

        {/* Absolute badge for icon-only mode (top-right corner) */}
        {badge && (
          <span className={styles.badgeAbsolute} aria-hidden={!iconOnly}>
            {badge}
          </span>
        )}
      </div>
    );
  },
);

NavigationItem.displayName = "NavigationItem";
