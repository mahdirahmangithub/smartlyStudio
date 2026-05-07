import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import { InputClear } from "../InputClear";
import { Icon } from "../Icon";
import { Tooltip } from "../Tooltip";
import { FileTypeThumbnail, type FileType } from "../FileTypeThumbnail";
import type { ThumbnailSize } from "../Thumbnail";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./FileAttachment.module.css";
import { cx } from "../../utils/cx";
import {
  inferFileTypeFromFile,
  inferFileTypeFromFileName,
} from "../../utils/inferFileType";

export type FileAttachmentState = "normal" | "loading" | "error";

export interface FileAttachmentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
  /**
   * Custom thumbnail (Thumbnail, FileTypeThumbnail, etc.).
   * When omitted, pass `file` and/or `fileName` to render {@link FileTypeThumbnail} from shared inference.
   */
  thumbnail?: ReactNode;
  /** When set without `thumbnail`, infers icon via MIME/name (see `inferFileTypeFromFile`). */
  file?: File;
  /** When set without `thumbnail`, infers icon from extension (see `inferFileTypeFromFileName`). */
  fileName?: string;
  /** Overrides inferred type for the auto {@link FileTypeThumbnail}. */
  fileType?: FileType;
  /** Size for the auto {@link FileTypeThumbnail} (default `md`). */
  autoThumbnailSize?: ThumbnailSize;
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


export const FileAttachment = forwardRef<HTMLDivElement, FileAttachmentProps>(
  (
    {
      thumbnail,
      file,
      fileName,
      fileType,
      autoThumbnailSize = "md",
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
    const resolvedThumbnail: ReactNode =
      thumbnail !== undefined
        ? thumbnail
        : file != null
          ? (
              <FileTypeThumbnail
                size={autoThumbnailSize}
                fileType={fileType ?? inferFileTypeFromFile(file)}
              />
            )
          : fileName != null && fileName !== ""
            ? (
                <FileTypeThumbnail
                  size={autoThumbnailSize}
                  fileType={fileType ?? inferFileTypeFromFileName(fileName)}
                />
              )
            : null;

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
          {resolvedThumbnail}
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
