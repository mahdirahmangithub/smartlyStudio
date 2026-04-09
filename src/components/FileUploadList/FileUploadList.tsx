import {
  forwardRef,
  useRef,
  useState,
  useMemo,
  useCallback,
  type HTMLAttributes,
} from "react";
import { Breadcrumb } from "../Breadcrumb";
import { BreadcrumbItem } from "../BreadcrumbItem";
import { Button } from "../Button";
import { FileUploadFileItem } from "../FileUploadFileItem";
import { FileUploadFolderItem } from "../FileUploadFolderItem";
import { Icon } from "../Icon";
import { toast } from "../Toast";
import { useScrollFade } from "../ScrollFade";
import type { FileUploadItem } from "../FileUpload/fileUploadUtils";
import {
  getItemsAtPath,
  getPathSegments,
  formatSummary,
  countFilesRecursive,
  deriveFolderStatus,
  deriveFolderProgress,
  deriveFolderErrorText,
} from "../FileUpload/fileUploadUtils";
import styles from "./FileUploadList.module.css";
import { cx } from "../../utils/cx";

// 8px padding-top + 40px thumbnail (md) + 8px padding-bottom
const ITEM_HEIGHT = 56;
// gap between items: --spacing-sm = 8px
const ITEM_GAP = 8;

export interface FileUploadListProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  items: FileUploadItem[];
  /** Maximum number of visible items before scrolling kicks in (default 6) */
  maxVisibleItems?: number;
  onItemRemove?: (id: string, path: string[]) => void;
  onItemRetry?: (id: string, path: string[]) => void;
  onDeleteAll?: () => void;
  /** Called when user clicks "Undo" in the delete-all toast. Receives the snapshot of items before deletion. */
  onUndoDeleteAll?: (items: FileUploadItem[]) => void;
}

export const FileUploadList = forwardRef<HTMLDivElement, FileUploadListProps>(
  (
    {
      items,
      maxVisibleItems = 6,
      onItemRemove,
      onItemRetry,
      onDeleteAll,
      onUndoDeleteAll,
      className,
      ...rest
    },
    ref
  ) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { showStart, showEnd, onScroll } = useScrollFade(scrollRef, "vertical");
    const maxHeight = maxVisibleItems * ITEM_HEIGHT + (maxVisibleItems - 1) * ITEM_GAP;

    const [currentPath, setCurrentPath] = useState<string[]>([]);

    const visibleItems = useMemo(
      () => getItemsAtPath(items, currentPath) ?? [],
      [items, currentPath]
    );

    const pathSegments = useMemo(
      () => getPathSegments(items, currentPath),
      [items, currentPath]
    );

    const summary = useMemo(() => formatSummary(visibleItems), [visibleItems]);

    const navigateToFolder = useCallback((folderId: string) => {
      setCurrentPath((prev) => [...prev, folderId]);
    }, []);

    const navigateToRoot = useCallback(() => {
      setCurrentPath([]);
    }, []);

    const navigateToSegment = useCallback((index: number) => {
      setCurrentPath((prev) => prev.slice(0, index + 1));
    }, []);

    const handleDeleteAll = useCallback(() => {
      const snapshot = [...items];
      const fileCount = snapshot.reduce(
        (sum, item) => sum + countFilesRecursive(item),
        0
      );

      setCurrentPath([]);
      onDeleteAll?.();

      const toastId = toast.alert(
        `${fileCount} file${fileCount !== 1 ? "s" : ""} have been deleted.`,
        {
          layout: "horizontal",
          undoAction: onUndoDeleteAll
            ? {
                label: "Undo",
                onClick: () => {
                  onUndoDeleteAll(snapshot);
                  toast.dismiss(toastId);
                },
              }
            : undefined,
        }
      );
    }, [items, onDeleteAll, onUndoDeleteAll]);

    const isEmpty = visibleItems.length === 0;
    const isInsideFolder = currentPath.length > 0;

    const hasFolders = useMemo(
      () => items.some((i) => i.type === "folder"),
      [items]
    );

    const showBreadcrumb = hasFolders || isInsideFolder;
    const showHeader = !isEmpty || isInsideFolder;

    const liveLabel =
      currentPath.length === 0
        ? `Showing root: ${summary}`
        : `Showing ${pathSegments[pathSegments.length - 1]?.name}: ${summary}`;

    return (
      <div
        ref={ref}
        className={cx(styles.root, className)}
        {...rest}
      >
        <div aria-live="polite" className={styles.srOnly} role="status">
          {liveLabel}
        </div>

        {/* header */}
        {showHeader ? (
          <div className={styles.header}>
            {showBreadcrumb && (
              <Breadcrumb size="sm" basic noWrap maxItems={4} itemsBeforeCollapse={1} itemsAfterCollapse={2}>
                <BreadcrumbItem
                  icon={<Icon name="home" size={16} />}
                  aria-label="Root"
                  href="#"
                  current={currentPath.length === 0}
                  onClick={
                    currentPath.length > 0
                      ? (e) => {
                          e.preventDefault();
                          navigateToRoot();
                        }
                      : undefined
                  }
                />
                {pathSegments.map((seg, i) => (
                  <BreadcrumbItem
                    key={seg.id}
                    href="#"
                    current={i === pathSegments.length - 1}
                    onClick={
                      i < pathSegments.length - 1
                        ? (e) => {
                            e.preventDefault();
                            navigateToSegment(i);
                          }
                        : undefined
                    }
                  >
                    {seg.name}
                  </BreadcrumbItem>
                ))}
              </Breadcrumb>
            )}

            <div className={styles.headerRight}>
              <p className={styles.summary}>{summary}</p>
              {onDeleteAll && !isEmpty && (
                <Button
                  size="sm"
                  variant="neutral"
                  emphasis="medium"
                  leadingIcon={<Icon name="delete" size={16} />}
                  onClick={handleDeleteAll}
                >
                  Delete all
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <p className={styles.summary}>{summary}</p>
          </div>
        )}

        {/* scrollable list */}
        {!isEmpty && (
          <div className={styles.listArea}>
            <div
              ref={scrollRef}
              className={styles.scrollContent}
              style={{ maxHeight }}
              onScroll={onScroll}
            >
              <div className={styles.listContent} role="list">
                {visibleItems.map((item) => {
                  if (item.type === "folder") {
                    const status = deriveFolderStatus(item);
                    const fileCount = countFilesRecursive(item);
                    const { uploaded, total } = deriveFolderProgress(item);
                    const errorText = deriveFolderErrorText(item);

                    return (
                      <FileUploadFolderItem
                        key={item.id}
                        folderName={item.name}
                        status={status}
                        fileCount={fileCount}
                        uploadedFiles={status === "loading" ? uploaded : undefined}
                        totalFiles={status === "loading" ? total : undefined}
                        errorText={errorText}
                        onClick={() => navigateToFolder(item.id)}
                        onRemove={
                          onItemRemove
                            ? () => onItemRemove(item.id, currentPath)
                            : undefined
                        }
                        onRetry={
                          onItemRetry
                            ? () => onItemRetry(item.id, currentPath)
                            : undefined
                        }
                      />
                    );
                  }

                  return (
                    <FileUploadFileItem
                      key={item.id}
                      fileName={item.name}
                      status={item.status ?? "normal"}
                      progress={item.progress}
                      fileSize={item.fileSize}
                      errorText={item.errorText}
                      onRemove={
                        onItemRemove
                          ? () => onItemRemove(item.id, currentPath)
                          : undefined
                      }
                      onRetry={
                        onItemRetry && item.status === "error"
                          ? () => onItemRetry(item.id, currentPath)
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>

            {/* fade overlays */}
            <div
              className={cx(styles.fade, styles.fadeTop, showStart && styles.fadeVisible)}
              aria-hidden="true"
            />
            <div
              className={cx(styles.fade, styles.fadeBottom, showEnd && styles.fadeVisible)}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    );
  }
);

FileUploadList.displayName = "FileUploadList";
