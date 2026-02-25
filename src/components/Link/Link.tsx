import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Icon } from "../Icon";
import styles from "./Link.module.css";

export type LinkSize = "sm" | "md" | "lg";
export type LinkType = "neutral" | "brand";

const ICON_SIZE: Record<LinkSize, number> = {
  lg: 16,
  md: 14,
  sm: 12,
};

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "type"> {
  /** Visual size — ignored when `inline` is true (inherits from parent) */
  size?: LinkSize;
  /** Color variant */
  type?: LinkType;
  /** Medium font weight */
  strong?: boolean;
  /** Show trailing external-link icon */
  icon?: boolean;
  /** Open in new tab (`target="_blank"` + `rel="noopener noreferrer"`) */
  external?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Inherit font metrics from surrounding text for inline usage */
  inline?: boolean;
  /** Show text underline */
  underline?: boolean;
  children?: ReactNode;
}

export function Link({
  size = "lg",
  type = "neutral",
  strong = false,
  icon,
  external = false,
  disabled = false,
  inline = false,
  underline = false,
  className,
  children,
  ...rest
}: LinkProps) {
  const showIcon = icon ?? external;

  const cls = [
    styles.link,
    !inline && styles[size],
    inline && styles.inline,
    styles[type],
    strong && styles.strong,
    underline && styles.underline,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      className={cls}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      {...(external && !disabled
        ? { target: "_blank", rel: "noopener noreferrer" }
        : undefined)}
      {...rest}
    >
      {children}
      {showIcon && (
        <Icon
          name="open_in_new"
          size={inline ? ICON_SIZE.md : ICON_SIZE[size]}
          className={styles.icon}
        />
      )}
    </a>
  );
}
