import { forwardRef, useId, type ButtonHTMLAttributes } from "react";
import { Icon } from "../Icon";
import { cx } from "../../utils/cx";
import styles from "./AISideEntry.module.css";

export interface AISideEntryProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Label text displayed on the tab */
  label?: string;
  /** Show the leading icon */
  showIcon?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Whether the associated panel (drawer/popover) is currently open */
  panelOpen?: boolean;
  /**
   * Type of popup the button triggers — determines `aria-haspopup`.
   * Use `"dialog"` for Drawer, `"true"` for Popover/menu.
   */
  panelType?: "dialog" | "true";
  /** ID of the controlled panel element (sets `aria-controls`) */
  panelId?: string;
}

const TOP_PATH =
  "M6.78399 23.76C2.56376 26.3977 0 31.0233 0 36H32V0C32 4.97669 29.4362 9.60235 25.216 12.24L6.78399 23.76Z";
const BOTTOM_PATH =
  "M25.216 23.76C29.4362 26.3976 32 31.0233 32 36V0H0C0 4.97669 2.56376 9.60235 6.78399 12.24L25.216 23.76Z";

const TOP_BORDER_PATH =
  "M32 0C32 4.97669 29.4362 9.60235 25.216 12.24L6.78399 23.76C2.56376 26.3977 0 31.0233 0 36";
const BOTTOM_BORDER_PATH =
  "M0 0C0 4.97669 2.56376 9.60235 6.78399 12.24L25.216 23.76C29.4362 26.3976 32 31.0233 32 36";

/**
 * Floating tab button anchored to the right edge of the viewport.
 * Opens an AI assistant panel (Drawer or Popover) on click.
 */
export const AISideEntry = forwardRef<HTMLButtonElement, AISideEntryProps>(
  function AISideEntry(
    {
      label = "Ask Smartly",
      showIcon = true,
      disabled = false,
      panelOpen = false,
      panelType = "dialog",
      panelId,
      className,
      ...rest
    },
    ref,
  ) {
    const fallbackId = useId();
    const controlsId = panelId ?? `${fallbackId}-panel`;

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-expanded={panelOpen}
        aria-haspopup={panelType}
        aria-controls={controlsId}
        aria-label={label}
        className={cx(
          styles.root,
          panelOpen && styles.panelOpen,
          disabled && styles.disabled,
          className,
        )}
        {...rest}
      >
        {/* Glow behind the tab */}
        <div className={styles.glow} aria-hidden="true" />

        {/* Tab shape: top cap → content → bottom cap */}
        <div className={styles.tab}>
          <svg
            className={styles.cap}
            viewBox="0 0 32 36"
            aria-hidden="true"
          >
            <path className={styles.capPath} d={TOP_PATH} />
            <path className={styles.capBorderPath} d={TOP_BORDER_PATH} />
          </svg>

          <div className={styles.content}>
            {showIcon && (
              <span className={styles.icon}>
                <Icon name="forecasting" size={16} aria-hidden="true" />
              </span>
            )}
            <span className={styles.label}>{label}</span>
          </div>

          <svg
            className={styles.cap}
            viewBox="0 0 32 36"
            aria-hidden="true"
          >
            <path className={styles.capPath} d={BOTTOM_PATH} />
            <path className={styles.capBorderPath} d={BOTTOM_BORDER_PATH} />
          </svg>
        </div>
      </button>
    );
  },
);

AISideEntry.displayName = "AISideEntry";
