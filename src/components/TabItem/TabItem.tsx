import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "../Icon";
import styles from "./TabItem.module.css";
import { cx } from "../../utils/cx";

export interface TabItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "value"> {
  /** Unique value identifying this tab within a TabBar */
  value?: string;
  /** Leading icon name from the icon set */
  icon?: IconName;
  /** @internal Injected by TabBar — whether this tab is currently selected */
  checked?: boolean;
  /** @internal Injected by TabBar — whether tabs fill available width */
  fullWidth?: boolean;
}

const ICON_SIZE = 20;

export const TabItem = forwardRef<HTMLButtonElement, TabItemProps>(
  (
    {
      value,
      icon,
      checked = false,
      fullWidth = false,
      disabled,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={checked}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        data-value={value}
        className={cx(
          styles.tabItem,
          checked && styles.checked,
          fullWidth && styles.fullWidth,
          className
        )}
        {...rest}
      >
        <span className={styles.base}>
          {icon && (
            <span className={styles.iconSlot}>
              <Icon name={icon} size={ICON_SIZE} />
            </span>
          )}
          {children != null && <span className={styles.label}>{children}</span>}
        </span>
      </button>
    );
  }
);

TabItem.displayName = "TabItem";
