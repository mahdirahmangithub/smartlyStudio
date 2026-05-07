import { forwardRef, type HTMLAttributes } from "react";
import { FileTypeThumbnail, type FileType } from "../FileTypeThumbnail";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { Spinner } from "../Spinner";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import { inferFileTypeFromFileName } from "../../utils/inferFileType";
import styles from "./FileUploadFileItem.module.css";
import { cx } from "../../utils/cx";

export type FileUploadFileStatus = "loading" | "normal" | "error";

export interface FileUploadFileItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  fileName: string;
  /** File size display (e.g. "10MB") — shown in normal state */
  fileSize?: string;
  /** File type for the thumbnail icon. Auto-detected from fileName if omitted. */
  fileType?: FileType;
  status?: FileUploadFileStatus;
  /** Upload progress 0–100 — shown in loading state */
  progress?: number;
  /** Error message — shown in error state */
  errorText?: string;
  /** Called when remove/cancel button is clicked */
  onRemove?: () => void;
  /** Called when retry button is clicked (error state only) */
  onRetry?: () => void;
}

export const FileUploadFileItem = forwardRef<
  HTMLDivElement,
  FileUploadFileItemProps
>(
  (
    {
      fileName,
      fileSize,
      fileType,
      status = "normal",
      progress,
      errorText = "Upload failed",
      onRemove,
      onRetry,
      className,
      ...rest
    },
    ref
  ) => {
    const resolvedFileType = fileType ?? inferFileTypeFromFileName(fileName);
    const isLoading = status === "loading";
    const isError = status === "error";

    const [nameRef, isNameTruncated] = useIsTruncated<HTMLParagraphElement>(fileName);

    const progressText =
      progress != null ? `Uploading (${progress}%)...` : "Uploading...";

    const secondaryText = isLoading
      ? progressText
      : isError
        ? errorText
        : fileSize;

    return (
      <div
        ref={ref}
        className={cx(
          styles.root,
          isLoading && styles.loading,
          className
        )}
        role="listitem"
        {...rest}
      >
        <div className={styles.leadingText}>
          <FileTypeThumbnail size="md" fileType={resolvedFileType} />

          <div className={styles.textArea}>
            <Tooltip
              type="neutral"
              label={fileName}
              showTail={false}
              placement="top"
              disabled={!isNameTruncated}
            >
              <p ref={nameRef} className={styles.fileName}>
                {fileName}
              </p>
            </Tooltip>
            {secondaryText && (
              <p className={cx(styles.secondary, isError && styles.errorText)}>
                {secondaryText}
              </p>
            )}
          </div>
        </div>

        <div className={cx(styles.trailing, isError && styles.trailingGap)}>
          {/* hover actions */}
          <div className={styles.actions}>
            {isError && onRetry && (
              <IconButton
                size="sm"
                variant="neutral"
                emphasis="low"
                icon={<Icon name="refresh" size={16} />}
                aria-label="Retry upload"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry();
                }}
              />
            )}
            {onRemove && (
              <IconButton
                size="sm"
                variant="neutral"
                emphasis="low"
                icon={<Icon name={isLoading ? "close" : "delete"} size={16} />}
                aria-label={isLoading ? "Cancel upload" : "Remove file"}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              />
            )}
          </div>

          {/* status indicators (hidden on hover) */}
          {isLoading && (
            <div className={styles.statusIcon}>
              <Spinner size="md" type="neutral" aria-label="Uploading" />
            </div>
          )}
          {status === "normal" && (
            <div className={cx(styles.statusIcon, styles.successIcon)}>
              <Icon name="check_circle_fill" size={20} aria-hidden="true" />
            </div>
          )}
          {isError && (
            <div className={cx(styles.statusIcon, styles.warningIcon)}>
              <Icon name="warning_fill" size={20} aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    );
  }
);

FileUploadFileItem.displayName = "FileUploadFileItem";
