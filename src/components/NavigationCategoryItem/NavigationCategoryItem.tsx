import {
  forwardRef,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Badge } from "../Badge";
import { Expander } from "../Expander";
import { Icon } from "../Icon";
import { IconBadge } from "../IconBadge";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import { useCollapsible } from "../../hooks/useCollapsible";
import styles from "./NavigationCategoryItem.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface NavigationCategoryItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onClick"> {
  /** The text label — always present, truncated to 1 line with tooltip on overflow */
  label: string;
  /** Icon displayed before the label (e.g. `<Icon name="home" size={20} />`) */
  leadingIcon?: ReactNode;
  /** Compact mode — shows only the leading icon */
  iconOnly?: boolean;
  /** Active / selected state */
  checked?: boolean;
  /** Whether the accordion panel is expanded */
  expanded?: boolean;
  /** Badge count — renders a Badge (brand, high, sm, round) */
  badgeCount?: number | string;
  /** Shows a lock icon-badge (neutral, medium, sm, round) */
  locked?: boolean;
  /** Content rendered inside the collapsible panel (e.g. NavigationSubItems) */
  children?: ReactNode;
  onClick?: () => void;
}

export const NavigationCategoryItem = forwardRef<
  HTMLDivElement,
  NavigationCategoryItemProps
>(function NavigationCategoryItem(
  {
    label,
    leadingIcon,
    iconOnly = false,
    checked = false,
    expanded = false,
    badgeCount,
    locked = false,
    children,
    onClick,
    className,
    ...rest
  },
  ref,
) {
  const [labelRef, isLabelTruncated] =
    useIsTruncated<HTMLSpanElement>(iconOnly ? undefined : label);

  const { ref: contentRef } = useCollapsible(expanded && !iconOnly);

  const badgeInlineRef = useRef<HTMLSpanElement>(null);
  const badgeAbsoluteRef = useRef<HTMLSpanElement>(null);
  const prevIconOnlyRef = useRef(iconOnly);
  const flipFirstRef = useRef<{ x: number; y: number } | null>(null);

  const hasBadge = badgeCount != null;

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

  const badge = hasBadge ? (
    <Badge size="sm" variant="brand" emphasis="high" round>
      {badgeCount}
    </Badge>
  ) : null;

  const panelId = rest.id ? `${rest.id}-panel` : undefined;

  return (
    <div ref={ref} className={cx(styles.wrapper, className)} {...rest}>
      <div
        role="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        tabIndex={0}
        className={cx(
          styles.root,
          checked && styles.checked,
          iconOnly && styles.iconOnly,
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
      >
        {leadingIcon && (
          <span className={styles.leadingIcon}>{leadingIcon}</span>
        )}

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

              <span className={styles.expander}>
                <Expander size="lg" expanded={expanded} />
              </span>
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

      {children && (
        <div
          ref={contentRef}
          id={panelId}
          role="region"
          className={styles.contentPanel}
          aria-hidden={!expanded || iconOnly}
        >
          <div className={styles.contentInner}>{children}</div>
        </div>
      )}
    </div>
  );
});

NavigationCategoryItem.displayName = "NavigationCategoryItem";
