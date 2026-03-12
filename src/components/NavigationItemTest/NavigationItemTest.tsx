import {
  forwardRef,
  useLayoutEffect,
  useRef,
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
import styles from "./NavigationItemTest.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface NavigationItemTestProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  label: string;
  leadingIcon?: ReactNode;
  iconOnly?: boolean;
  checked?: boolean;
  badgeCount?: number | string;
  locked?: boolean;
  externalLink?: boolean;
  pinned?: boolean;
  actionIcon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  onClick?: () => void;
}

export const NavigationItemTest = forwardRef<HTMLDivElement, NavigationItemTestProps>(
  function NavigationItemTest(
    {
      label,
      leadingIcon,
      iconOnly = false,
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
    const [labelRef, isLabelTruncated] =
      useIsTruncated<HTMLSpanElement>(iconOnly ? undefined : label);

    const badgeInlineRef = useRef<HTMLSpanElement>(null);
    const badgeAbsoluteRef = useRef<HTMLSpanElement>(null);
    const prevIconOnlyRef = useRef(iconOnly);
    const flipFirstRef = useRef<{ x: number; y: number } | null>(null);

    const hasBadge = badgeCount != null;
    const hasAction = actionIcon != null;

    if (hasBadge && prevIconOnlyRef.current && !iconOnly) {
      const abs = badgeAbsoluteRef.current;
      if (abs) {
        flipFirstRef.current = { x: abs.offsetLeft, y: abs.offsetTop };
      }
    }

    useLayoutEffect(() => {
      const wasIconOnly = prevIconOnlyRef.current;
      prevIconOnlyRef.current = iconOnly;

      const first = flipFirstRef.current;
      flipFirstRef.current = null;

      if (!hasBadge) return;

      const abs = badgeAbsoluteRef.current;
      const inline = badgeInlineRef.current;

      // EXPAND: icon-only → expanded
      if (first && wasIconOnly && !iconOnly && abs && inline) {
        const dx = inline.offsetLeft - first.x - 2;
        const dy = inline.offsetTop - first.y - 2;

        abs.style.left = `${first.x}px`;
        abs.style.top = `${first.y}px`;
        abs.style.right = "auto";
        abs.style.opacity = "1";
        abs.style.pointerEvents = "none";
        abs.style.transition = "none";
        abs.style.transform = "none";
        abs.style.willChange = "transform";
        inline.style.opacity = "0";

        void abs.offsetHeight;

        abs.style.transition =
          "transform var(--animation-state-expand-duration) var(--animation-state-expand-easing)";
        abs.style.transform = `translate(${dx}px, ${dy}px)`;

        const cleanup = () => {
          inline.style.cssText = "";
          abs.style.opacity = "0";
        };
        abs.addEventListener("transitionend", cleanup, { once: true });

        return () => {
          abs.removeEventListener("transitionend", cleanup);
          inline.style.cssText = "";
          abs.style.opacity = "0";
        };
      }

      // COLLAPSE: expanded → icon-only
      if (wasIconOnly === false && iconOnly && abs && abs.style.transform) {
        if (inline) inline.style.opacity = "0";
        abs.style.opacity = "1";
        abs.style.transition = "none";

        void abs.offsetHeight;

        abs.style.transition =
          "transform var(--animation-state-collapse-duration) var(--animation-state-collapse-easing)";
        abs.style.transform = "none";

        const cleanup = () => {
          abs.style.cssText = "";
          if (inline) inline.style.cssText = "";
        };
        abs.addEventListener("transitionend", cleanup, { once: true });

        return () => {
          abs.removeEventListener("transitionend", cleanup);
          abs.style.cssText = "";
          if (inline) inline.style.cssText = "";
        };
      }
    }, [iconOnly, hasBadge]);


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
          <span className={styles.expandableClip}>
            <span className={styles.expandableInner}>
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

              {badge && (
                <span ref={badgeInlineRef} className={styles.badgeInline}>
                  {badge}
                </span>
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

        {badge && (
          <span
            ref={badgeAbsoluteRef}
            className={styles.badgeAbsolute}
            aria-hidden={!iconOnly}
          >
            {badge}
          </span>
        )}
      </div>
    );
  },
);

NavigationItemTest.displayName = "NavigationItemTest";
