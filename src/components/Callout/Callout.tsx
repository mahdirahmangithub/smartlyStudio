import { type ReactNode } from "react";
import { Icon } from "../Icon";
import type { IconName } from "../Icon";
import { IconButton } from "../IconButton";
import styles from "./Callout.module.css";

export type CalloutType = "brand" | "info" | "success" | "warning" | "alert";
export type CalloutSize = "sm" | "md" | "lg";
export type CalloutLayout = "vertical" | "horizontal";

export interface CalloutProps {
  type?: CalloutType;
  size?: CalloutSize;
  layout?: CalloutLayout;
  title: string;
  description?: string;
  onClose?: () => void;
  actions?: ReactNode;
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

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Callout({
  type = "info",
  size = "lg",
  layout = "vertical",
  title,
  description,
  onClose,
  actions,
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
        className
      )}
      role="status"
    >
      {/* status icon — grid col 1, row 1, vertically centered */}
      <div className={cx(styles.iconWrap, styles.statusIcon)}>
        <Icon name={TYPE_ICON[type]} size={ICON_SIZE[size]} />
      </div>

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
