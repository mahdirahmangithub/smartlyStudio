import { type ReactNode } from "react";
import { Icon } from "../Icon";
import type { IconName } from "../Icon";
import { IconButton } from "../IconButton";
import styles from "./Callout.module.css";
import { cx } from "../../utils/cx";

export type CalloutType = "brand" | "info" | "success" | "warning" | "alert";
export type CalloutSize = "sm" | "md" | "lg";
export type CalloutLayout = "vertical" | "horizontal";

export interface CalloutProps {
  type?: CalloutType;
  size?: CalloutSize;
  layout?: CalloutLayout;
  title: React.ReactNode;
  description?: string;
  onClose?: () => void;
  actions?: ReactNode;
  /** Whether to show the status icon. @default true */
  showIcon?: boolean;
  /** Custom icon to replace the default type icon. */
  customIcon?: ReactNode;
  className?: string;
}

const TYPE_ICON: Record<CalloutType, IconName> = {
  brand: "forecasting",
  info: "info_fill",
  success: "check_circle_fill",
  warning: "error_fill",
  alert: "warning_fill",
};

const ICON_SIZE: Record<CalloutSize, number> = { lg: 24, md: 20, sm: 20 };
const CLOSE_BTN_SIZE: Record<CalloutSize, "sm" | "md"> = { lg: "md", md: "md", sm: "sm" };


export function Callout({
  type = "info",
  size = "lg",
  layout = "vertical",
  title,
  description,
  onClose,
  actions,
  showIcon = true,
  customIcon,
  className,
}: CalloutProps) {
  const isHorizontal = layout === "horizontal";

  return (
    <div
      className={cx(
        styles.callout,
        styles[type],
        styles[size],
        isHorizontal && styles.horizontal,
        !showIcon && styles.noIcon,
        className
      )}
      role="status"
    >
      {showIcon && (
        <div className={cx(styles.iconWrap, styles.statusIcon)}>
          {customIcon ?? <Icon name={TYPE_ICON[type]} size={ICON_SIZE[size]} />}
        </div>
      )}

      {/* header — grid col 2, row 1: title + close, all center-aligned */}
      <div className={styles.header}>
        <div className={styles.titleWrap}>
          <span className={styles.title}>{title}</span>
        </div>

        {isHorizontal && actions && (
          <div className={styles.actionsInline}>{actions}</div>
        )}

        {onClose && (
          <IconButton
            size={CLOSE_BTN_SIZE[size]}
            variant="neutral"
            emphasis="low"
            icon={<Icon name="close" size={16} />}
            aria-label="Close"
            onClick={onClose}
            className={styles.closeBtn}
          />
        )}
      </div>

      {/* description — grid col 2, auto row */}
      {!isHorizontal && description && (
        <div className={styles.description}>{description}</div>
      )}

      {/* actions — grid col 2, auto row */}
      {!isHorizontal && actions && (
        <div className={styles.actions}>{actions}</div>
      )}
    </div>
  );
}
