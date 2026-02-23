import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import { InputClear } from "../InputClear";
import { Icon } from "../Icon";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./FileAttachment.module.css";

export type FileAttachmentState = "normal" | "loading" | "error";

export interface FileAttachmentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
  /** The thumbnail component (Thumbnail, FileTypeThumbnail, etc.) */
  thumbnail: ReactNode;
  state?: FileAttachmentState;
  /** File name — always used for tooltip; visible text in expanded mode */
  title?: string;
  /** When provided, switches to expanded layout with title + description */
  description?: string;
  /** Called when the remove/clear button is clicked */
  onRemove?: () => void;
  /** Called when the error retry overlay is clicked */
  onRetry?: () => void;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export const FileAttachment = forwardRef<HTMLDivElement, FileAttachmentProps>(
  (
    {
      thumbnail,
      state = "normal",
      title,
      description,
      onRemove,
      onRetry,
      className,
      ...rest
    },
    ref
  ) => {
    const isExpanded = !!description;
    const isError = state === "error";

    const [titleRef, titleTruncated] = useIsTruncated<HTMLParagraphElement>(title);
    const [descRef, descTruncated] = useIsTruncated<HTMLParagraphElement>(description);

    const showTooltip = isExpanded
      ? (titleTruncated || descTruncated) && !!title
      : !!title;

    const card = (
      <div
        ref={ref}
        className={cx(
          styles.card,
          isExpanded ? styles.expanded : styles.compact,
          state === "loading" && styles.loading,
          isError && styles.error,
          className
        )}
        {...rest}
      >
        {/* thumbnail + error retry overlay */}
        <div className={styles.thumbnailSlot}>
          {thumbnail}
          {isError && (
            <div
              className={styles.retryOverlay}
              onClick={(e) => {
                e.stopPropagation();
                onRetry?.();
              }}
              role="button"
              tabIndex={0}
              aria-label="Retry upload"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onRetry?.();
                }
              }}
            >
              <span className={styles.refreshIcon}>
                <Icon name="refresh" size={24} />
              </span>
            </div>
          )}
        </div>

        {/* text area (expanded layout only) */}
        {isExpanded && (
          <div className={styles.textArea}>
            {title && <p ref={titleRef} className={styles.title}>{title}</p>}
            <p ref={descRef} className={styles.description}>{description}</p>
          </div>
        )}

        {/* remove button (visible on hover, always in light mode) */}
        {onRemove && (
          <div className={styles.removeWrap} data-theme="light">
            <InputClear
              size="2xs"
              variant="inverse"
              round
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              aria-label="Remove file"
            />
          </div>
        )}
      </div>
    );

    return (
      <Tooltip
        type="neutral"
        label={title}
        showTail={false}
        placement="top"
        disabled={!showTooltip}
      >
        {card}
      </Tooltip>
    );
  }
);

FileAttachment.displayName = "FileAttachment";
