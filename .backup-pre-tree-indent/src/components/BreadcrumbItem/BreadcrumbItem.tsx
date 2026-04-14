import { forwardRef, type ReactNode } from "react";
import { Icon } from "../Icon";
import { Link } from "../Link";
import type { LinkSize } from "../Link";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./BreadcrumbItem.module.css";
import { cx } from "../../utils/cx";


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
  /** Max width of the label before truncation (default "20rem") */
  maxWidth?: string | number;
  children?: ReactNode;
  className?: string;
}

const ICON_SIZE: Record<BreadcrumbItemSize, number> = {
  lg: 20,
  md: 16,
  sm: 16,
};

const LINK_SIZE: Record<BreadcrumbItemSize, LinkSize> = {
  lg: "md",
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
      maxWidth,
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

    const childrenText = typeof children === "string" ? children : undefined;
    const [linkRef, isTruncated] = useIsTruncated<HTMLAnchorElement>(childrenText);

    const cls = cx(
      styles.root,
      variant,
      styles[size],
      current && styles.current,
      disabled && styles.disabled,
      isIconOnly && styles.iconOnly,
      className,
    );

    const linkSize = LINK_SIZE[size];

    const iconEl = icon && (
      <span className={styles.icon}>
        {typeof icon === "string" ? (
          <Icon name={icon as any} size={ICON_SIZE[size]} />
        ) : (
          icon
        )}
      </span>
    );

    const linkStyle = maxWidth
      ? ({ "--breadcrumb-label-max-width": typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth } as React.CSSProperties)
      : undefined;

    const linkProps = {
      href: current ? undefined : href,
      onClick: current ? undefined : onClick,
      disabled,
      size: linkSize,
      strong: !current,
      className: styles.link,
      style: linkStyle,
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
              <Tooltip
                type="neutral"
                label={childrenText ?? ""}
                showTail={false}
                placement="top"
                disabled={!isTruncated}
              >
                <Link ref={linkRef} {...linkProps} aria-label={ariaLabel}>
                  {children}
                </Link>
              </Tooltip>
            )}
          </>
        )}
      </span>
    );
  },
);

BreadcrumbItem.displayName = "BreadcrumbItem";
