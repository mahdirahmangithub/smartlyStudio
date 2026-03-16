import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import styles from "./Navbar.module.css";
import { cx } from "../../utils/cx";


export type NavbarPosition = "static" | "sticky" | "fixed";

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  /** Root element — `header` (default) for app bars, `nav` for pure navigation */
  as?: "header" | "nav";
  /** Optional logo element rendered at the leading edge */
  logo?: ReactNode;
  /** Positioning behaviour. Default `static`. */
  position?: NavbarPosition;
  children?: ReactNode;
}

export const Navbar = forwardRef<HTMLElement, NavbarProps>(
  function Navbar({ as: Tag = "header", logo, position = "static", children, className, ...rest }, ref) {
    return (
      <Tag
        ref={ref}
        className={cx(
          styles.root,
          position !== "static" && styles[position],
          className,
        )}
        {...rest}
      >
        {logo && <div className={styles.logo}>{logo}</div>}
        <div className={styles.content}>{children}</div>
      </Tag>
    );
  },
);

Navbar.displayName = "Navbar";
