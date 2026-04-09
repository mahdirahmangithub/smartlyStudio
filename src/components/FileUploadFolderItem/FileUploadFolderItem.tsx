import { forwardRef, type HTMLAttributes } from "react";
import { FileTypeThumbnail } from "../FileTypeThumbnail";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { Spinner } from "../Spinner";
import { Tooltip } from "../Tooltip";
import { useIsTruncated } from "../../hooks/useIsTruncated";
import styles from "./FileUploadFolderItem.module.css";
import { cx } from "../../utils/cx";

export type FileUploadFolderStatus = "loading" | "normal" | "error";

export interface FileUploadFolderItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onClick"> {
  folderName: string;
  /** Total number of files in the folder */
  fileCount?: number;
  /** Number of files uploaded so far (loading state) */
  uploadedFiles?: number;
  /** Total files to upload (loading state) */
  totalFiles?: number;
  status?: FileUploadFolderStatus;
  /** Error message — shown in error state alongside the file count */
  errorText?: string;
  /** Called when remove/cancel button is clicked */
  onRemove?: () => void;
  /** Called when retry button is clicked (error state only) */
  onRetry?: () => void;
  /** Called when the folder row is clicked (navigate into folder) */
  onClick?: () => void;
}

export const FileUploadFolderItem = forwardRef<
  HTMLDivElement,
  FileUploadFolderItemProps
>(
  (
    {
      folderName,
      fileCount,
      uploadedFiles,
      totalFiles,
      status = "normal",
      errorText = "Upload failed",
      onRemove,
      onRetry,
      onClick,
      className,
      ...rest
    },
    ref
  ) => {
    const isLoading = status === "loading";
    const isError = status === "error";

    const [nameRef, isNameTruncated] = useIsTruncated<HTMLParagraphElement>(folderName);

    const fileCountText =
      fileCount != null
        ? `${fileCount} file${fileCount !== 1 ? "s" : ""} uploaded`
        : undefined;

    const loadingText =
      uploadedFiles != null && totalFiles != null
        ? `Uploading (${uploadedFiles} of ${totalFiles})...`
        : "Uploading...";

    const handleClick = onClick
      ? (e: React.MouseEvent) => {
          e.stopPropagation();
          onClick();
        }
      : undefined;

    const handleKeyDown = onClick
      ? (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }
      : undefined;

    return (
      <div
        ref={ref}
        className={cx(
          styles.root,
          isLoading && styles.loading,
          onClick && styles.clickable,
          className
        )}
        role="listitem"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={onClick ? 0 : undefined}
        {...rest}
      >
        <div className={styles.leadingText}>
          <FileTypeThumbnail size="md" fileType="folder" />

          <div className={styles.textArea}>
            <Tooltip
              type="neutral"
              label={folderName}
              showTail={false}
              placement="top"
              disabled={!isNameTruncated}
            >
              <p ref={nameRef} className={styles.folderName}>
                {folderName}
              </p>
            </Tooltip>

            {isLoading && <p className={styles.secondary}>{loadingText}</p>}

            {status === "normal" && fileCountText && (
              <p className={styles.secondary}>{fileCountText}</p>
            )}

            {isError && (
              <div className={styles.errorRow}>
                {fileCountText && (
                  <span className={styles.errorRowCount}>
                    <span>{fileCountText}</span>
                    <span>•</span>
                  </span>
                )}
                <span className={styles.errorRowMessage}>{errorText}</span>
              </div>
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
                aria-label={isLoading ? "Cancel upload" : "Remove folder"}
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

FileUploadFolderItem.displayName = "FileUploadFolderItem";
