import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import {
  FileUploadDropzone,
  type UploadOption,
} from "../FileUploadDropzone";
import { FileUploadList } from "../FileUploadList";
import type { FileUploadItem, DroppedEntry } from "./fileUploadUtils";
import styles from "./FileUpload.module.css";
import { cx } from "../../utils/cx";

export interface FileUploadProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
  /* ── dropzone props ──────────────────────────────────────────────── */
  accept?: string;
  multiple?: boolean;
  directory?: boolean;
  icon?: ReactNode;
  title?: string;
  description?: string;
  buttonLabel?: string;
  uploadOptions?: UploadOption[];
  hintText?: string;
  errorText?: string;
  disabled?: boolean;
  /** Height of the dropzone area */
  dropzoneHeight?: number | string;
  /** Called when files are selected or dropped (flat list) */
  onFiles?: (files: File[]) => void;
  /** Called when entries are dropped with folder hierarchy preserved */
  onDropEntries?: (entries: DroppedEntry[]) => void;

  /* ── list props ──────────────────────────────────────────────────── */
  /** File/folder tree to display */
  items?: FileUploadItem[];
  /** Maximum number of visible items in the list before scrolling (default 6) */
  listMaxVisibleItems?: number;
  /** Called when an item's remove/cancel button is clicked */
  onItemRemove?: (id: string, path: string[]) => void;
  /** Called when an item's retry button is clicked */
  onItemRetry?: (id: string, path: string[]) => void;
  /** Called when "Delete all" is clicked */
  onDeleteAll?: () => void;
  /** Called when user clicks "Undo" in the delete-all toast. Receives the snapshot of items before deletion. */
  onUndoDeleteAll?: (items: FileUploadItem[]) => void;
}

export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      accept,
      multiple = true,
      directory = false,
      icon,
      title,
      description,
      buttonLabel,
      uploadOptions,
      hintText,
      errorText,
      disabled = false,
      dropzoneHeight,
      onFiles,
      onDropEntries,
      items,
      listMaxVisibleItems,
      onItemRemove,
      onItemRetry,
      onDeleteAll,
      onUndoDeleteAll,
      className,
      ...rest
    },
    ref
  ) => {
    const hasItems = items && items.length > 0;

    return (
      <div ref={ref} className={cx(styles.root, className)} {...rest}>
        <FileUploadDropzone
          accept={accept}
          multiple={multiple}
          directory={directory}
          icon={icon}
          title={title}
          description={description}
          buttonLabel={buttonLabel}
          uploadOptions={uploadOptions}
          hintText={hintText}
          errorText={errorText}
          disabled={disabled}
          onFiles={onFiles}
          onDropEntries={onDropEntries}
          style={dropzoneHeight ? { height: dropzoneHeight } : undefined}
        />

        {!disabled && hasItems && (
          <FileUploadList
            items={items ?? []}
            maxVisibleItems={listMaxVisibleItems}
            onItemRemove={onItemRemove}
            onItemRetry={onItemRetry}
            onDeleteAll={hasItems ? onDeleteAll : undefined}
            onUndoDeleteAll={onUndoDeleteAll}
          />
        )}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
