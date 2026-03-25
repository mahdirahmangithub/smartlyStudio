import { type ReactNode } from "react";
import { Icon } from "../Icon";
import type { IconName } from "../Icon";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import type { ButtonType } from "../Button";
import styles from "./Toast.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export type ToastType = "neutral" | "success" | "alert";
export type ToastLayout = "horizontal" | "vertical";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  /** Title text displayed prominently */
  title: string;
  /** Optional description (only visible in vertical layout) */
  description?: string;
  /** Visual type — controls background, icon, and text color */
  type?: ToastType;
  /** Layout direction — horizontal (title only) or vertical (title + description) */
  layout?: ToastLayout;
  /** Primary CTA action button */
  ctaAction?: ToastAction;
  /** Undo action button with leading undo icon */
  undoAction?: ToastAction;
  /** Called when close button is clicked */
  onClose?: () => void;
  /** Additional class on root element */
  className?: string;
  /** Optional custom icon override */
  icon?: ReactNode;
}

const typeIconMap: Record<ToastType, IconName> = {
  neutral: "info_fill",
  success: "check_circle_fill",
  alert: "warning_fill",
};

const typeButtonVariant: Record<ToastType, ButtonType> = {
  neutral: "neutral",
  success: "neutral",
  alert: "neutral",
};

const typeRole: Record<ToastType, "status" | "alert"> = {
  neutral: "status",
  success: "status",
  alert: "alert",
};

export function Toast({
  title,
  description,
  type = "neutral",
  layout = "vertical",
  ctaAction,
  undoAction,
  onClose,
  className,
  icon,
}: ToastProps) {
  const isHorizontal = layout === "horizontal";
  const buttonVariant = typeButtonVariant[type];
  const hasActions = !!(ctaAction || undoAction);

  const actionsNode = hasActions && (
    <div
      className={cx(
        styles.actions,
        !isHorizontal && styles.fullWidth
      )}
    >
      {undoAction && (
        <Button
          size="md"
          variant={buttonVariant}
          emphasis="low"
          leadingIcon={<Icon name="undo" size={16} />}
          onClick={undoAction.onClick}
        >
          {undoAction.label}
        </Button>
      )}
      {ctaAction && (
        <Button
          size="md"
          variant={buttonVariant}
          emphasis="medium"
          onClick={ctaAction.onClick}
        >
          {ctaAction.label}
        </Button>
      )}
    </div>
  );

  const closeNode = onClose && (
    <IconButton
      size="md"
      variant={buttonVariant}
      emphasis="low"
      icon={<Icon name="close" size={16} />}
      aria-label="Close notification"
      hideTooltip
      onClick={onClose}
    />
  );

  return (
    <div
      className={cx(styles.toast, styles[type], className)}
      role={typeRole[type]}
    >
      <div className={styles.icon} aria-hidden="true">
        {icon ?? <Icon name={typeIconMap[type]} size={24} />}
      </div>

      <div className={cx(styles.contentAction, styles[layout])}>
        <div className={styles.content}>
          <div className={cx(styles.text, styles[layout])}>
            <div className={styles.title}>
              <span className={styles.titleText}>{title}</span>
            </div>
            {!isHorizontal && description && (
              <p className={styles.description}>{description}</p>
            )}
          </div>

          {isHorizontal && actionsNode}
          {closeNode}
        </div>

        {!isHorizontal && actionsNode}
      </div>
    </div>
  );
}
