import { forwardRef, type HTMLAttributes } from "react";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { Button } from "../Button";
import { ProgressBar } from "../ProgressBar";
import { cx } from "../../utils/cx";
import styles from "./PromptInputInfo.module.css";

export type PromptInputInfoType = "edit" | "error" | "warning" | "length-limit" | "cook-book";

export interface PromptInputInfoProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  type: PromptInputInfoType;
  /** Label shown next to the icon (edit / error / warning / cook-book). */
  title?: string;
  /** Left label for the length-limit variant. @default "Video length limit" */
  limitLabel?: string;
  /** Right time display for the length-limit variant, e.g. "32secs / 5mins". */
  limitText?: string;
  /** Progress value (0–100) for the length-limit variant. @default 75 */
  progressValue?: number;
  /** Called when the X icon button is clicked (error / warning). */
  onClose?: () => void;
  /** Called when the action button is clicked (edit → Cancel, cook-book → Learn more). */
  onAction?: () => void;
  /** Override the default action button label. */
  actionLabel?: string;
}

const TYPE_CLASS: Record<PromptInputInfoType, string> = {
  edit: styles.edit,
  error: styles.error,
  warning: styles.warning,
  "length-limit": styles.lengthLimit,
  "cook-book": styles.cookBook,
};

const ICON_COLOR: Partial<Record<PromptInputInfoType, string>> = {
  edit: "var(--text-neutral-tertiary-default)",
  error: "var(--text-alert-default)",
  warning: "var(--text-warning-default)",
  "cook-book": "var(--text-info-default)",
};

export const PromptInputInfo = forwardRef<HTMLDivElement, PromptInputInfoProps>(
  (
    {
      type,
      title,
      limitLabel = "Video length limit",
      limitText = "32secs / 5mins",
      progressValue = 75,
      onClose,
      onAction,
      actionLabel,
      className,
      ...rest
    },
    ref,
  ) => {
    const isLengthLimit = type === "length-limit";
    const isCookBook = type === "cook-book";
    const isEdit = type === "edit";
    const isError = type === "error";
    const isWarning = type === "warning";

    return (
      <div ref={ref} className={cx(styles.root, TYPE_CLASS[type], className)} {...rest}>
        {isLengthLimit ? (
          <ProgressBar
            value={progressValue}
            type="brand"
            label={limitLabel}
            formatValue={() => limitText}
            className={styles.limitBar}
          />
        ) : (
          <div className={styles.iconLabel}>
            <span className={styles.leadingIcon} aria-hidden="true">
              {isEdit && <Icon name="edit" size={16} color={ICON_COLOR.edit} />}
              {(isError || isWarning) && <Icon name="warning" size={16} color={ICON_COLOR[type]} />}
              {isCookBook && <Icon name="article_forecasting" size={16} color={ICON_COLOR["cook-book"]} />}
            </span>
            {title && <span className={cx(styles.title, styles[`title_${type.replace("-", "_")}`])}>{title}</span>}
          </div>
        )}

        {(isEdit || isCookBook) && (
          <Button
            variant={isCookBook ? "info" : "neutral"}
            emphasis={isCookBook ? "medium" : "low"}
            size="sm"
            onClick={onAction}
          >
            {actionLabel ?? (isCookBook ? "Learn more" : "Cancel")}
          </Button>
        )}

        {(isError || isWarning) && onClose && (
          <IconButton
            aria-label="Dismiss"
            variant={isError ? "alert" : "warning"}
            emphasis="low"
            size="md"
            icon={<Icon name="close" size={16} />}
            onClick={onClose}
          />
        )}
      </div>
    );
  },
);

PromptInputInfo.displayName = "PromptInputInfo";
