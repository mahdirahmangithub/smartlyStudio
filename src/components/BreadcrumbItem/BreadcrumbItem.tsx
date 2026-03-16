import { forwardRef, type ReactNode } from "react";
import { Icon } from "../Icon";
import { Link } from "../Link";
import type { LinkSize } from "../Link";
import styles from "./BreadcrumbItem.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export type BreadcrumbItemSize = "sm" | "md" | "lg";

export interface BreadcrumbItemProps {
  /** Visual size */
  size?: BreadcrumbItemSize;
  /** Leading icon */
  icon?: ReactNode;
  /** Marks this item as the current page (last item) */
  current?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Flat style without pill container */
  basic?: boolean;
  /** Link destination */
  href?: string;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  /** Accessible label — required for icon-only items */
  "aria-label"?: string;
  children?: ReactNode;
  className?: string;
}

const ICON_SIZE: Record<BreadcrumbItemSize, number> = {
  lg: 20,
  md: 16,
  sm: 16,
};

const PILL_LINK_SIZE: Record<BreadcrumbItemSize, LinkSize> = {
  lg: "md",
  md: "md",
  sm: "sm",
};

const BASIC_LINK_SIZE: Record<BreadcrumbItemSize, LinkSize> = {
  lg: "lg",
  md: "md",
  sm: "sm",
};

export const BreadcrumbItem = forwardRef<HTMLSpanElement, BreadcrumbItemProps>(
  function BreadcrumbItem(
    {
      size = "lg",
      icon,
      current = false,
      disabled = false,
      basic = false,
      children,
      className,
      href,
      onClick,
      "aria-label": ariaLabel,
    },
    ref,
  ) {
    const variant = basic ? styles.flat : styles.pill;
    const isIconOnly = !!icon && !children;

    const cls = cx(
      styles.root,
      variant,
      styles[size],
      current && styles.current,
      disabled && styles.disabled,
      isIconOnly && styles.iconOnly,
      className,
    );

    const linkSize = basic ? BASIC_LINK_SIZE[size] : PILL_LINK_SIZE[size];

    const iconEl = icon && (
      <span className={styles.icon}>
        {typeof icon === "string" ? (
          <Icon name={icon as any} size={ICON_SIZE[size]} />
        ) : (
          icon
        )}
      </span>
    );

    const linkProps = {
      href: current ? undefined : href,
      onClick: current ? undefined : onClick,
      disabled,
      size: linkSize,
      strong: !current && !basic,
      className: styles.link,
      "aria-current": current ? ("page" as const) : undefined,
    };

    return (
      <span ref={ref} className={cls}>
        {isIconOnly ? (
          <Link {...linkProps} aria-label={ariaLabel}>
            {iconEl}
          </Link>
        ) : (
          <>
            {iconEl}
            {children && (
              <Link {...linkProps} aria-label={ariaLabel}>
                {children}
              </Link>
            )}
          </>
        )}
      </span>
    );
  },
);

BreadcrumbItem.displayName = "BreadcrumbItem";
