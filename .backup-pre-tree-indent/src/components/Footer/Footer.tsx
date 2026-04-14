import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Divider } from "../Divider";
import { RowContainer } from "../RowContainer";
import styles from "./Footer.module.css";
import { cx } from "../../utils/cx";


export type FooterDensity = "sm" | "lg";

export interface FooterProps
  extends Omit<HTMLAttributes<HTMLElement>, "slot"> {
  /** Density — sm is compact (16px padding), lg is spacious (24px padding) */
  density?: FooterDensity;
  /** Show top divider — also adds top padding when true */
  divider?: boolean;
  /** Primary action area on the right (typically Button components) */
  actions?: ReactNode;
  /** Secondary action area on the left */
  extraAction?: ReactNode;
  /** Custom slot content on the left, between extraAction and right group */
  slot?: ReactNode;
  /** When true, action buttons stretch to fill the full width */
  fullWidth?: boolean;
}

export const Footer = forwardRef<HTMLElement, FooterProps>(
  function Footer(
    {
      density = "sm",
      divider = false,
      actions,
      extraAction,
      slot,
      fullWidth = false,
      className,
      ...rest
    },
    ref,
  ) {
    const hasLeft = extraAction != null || slot != null;

    return (
      <footer
        ref={ref}
        className={cx(
          styles.root,
          density === "lg" && styles.densityLg,
          divider && styles.hasDivider,
          className,
        )}
        {...rest}
      >
        <div className={fullWidth ? styles.contentFullWidth : styles.content}>
          {!fullWidth && hasLeft && (
            <div className={styles.left}>
              {extraAction && (
                <RowContainer density="md">{extraAction}</RowContainer>
              )}
              {slot}
            </div>
          )}

          <div className={styles.right}>
            {actions && (
              <RowContainer
                density="md"
                fullWidth={fullWidth}
                alignment={fullWidth ? undefined : "right"}
              >
                {actions}
              </RowContainer>
            )}
          </div>
        </div>

        {divider && (
          <div className={styles.divider}>
            <Divider />
          </div>
        )}
      </footer>
    );
  },
);

Footer.displayName = "Footer";
