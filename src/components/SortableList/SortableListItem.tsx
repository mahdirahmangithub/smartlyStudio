import { type ReactNode, useCallback, useRef } from "react";
import { DragHandleMenu } from "../DragHandleMenu";
import { useSortableList } from "./SortableListContext";
import styles from "./SortableListItem.module.css";
import { cx } from "../../utils/cx";


export interface SortableListItemProps {
  /** 0-based position in the list */
  index: number;
  /** Show border around item */
  outline?: boolean;
  /** Disable drag and interactions */
  disabled?: boolean;
  /** Content to render (typically Entity, but accepts any ReactNode) */
  children: ReactNode;
  className?: string;
}

export function SortableListItem({
  index,
  outline = false,
  disabled = false,
  children,
  className,
}: SortableListItemProps) {
  const ctx = useSortableList();
  const handleRef = useRef<HTMLButtonElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  const isSourcePlaceholder = ctx != null && ctx.draggingIndex === index;
  const isDropTarget = ctx != null && ctx.dropTargetIndex === index && ctx.draggingIndex !== index;
  const showDropAbove = isDropTarget && ctx!.dropPosition === "above";
  const showDropBelow = isDropTarget && ctx!.dropPosition === "below";

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (disabled || !ctx) {
        e.preventDefault();
        return;
      }

      const el = itemRef.current!;
      const clone = el.cloneNode(true) as HTMLElement;
      clone.classList.remove(styles.placeholder);
      clone.style.position = "fixed";
      clone.style.top = "-9999px";
      clone.style.left = "-9999px";
      clone.style.width = `${el.offsetWidth}px`;
      clone.style.background = "var(--element-surface-over)";
      clone.style.borderRadius = "var(--radius-xl)";
      clone.style.pointerEvents = "none";

      const handleEl = clone.querySelector(`.${styles.handle}`) as HTMLElement | null;
      if (handleEl) handleEl.style.display = "none";

      const themeRoot = el.closest("[data-theme]") ?? document.body;
      themeRoot.appendChild(clone);
      e.dataTransfer.setDragImage(clone, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setTimeout(() => themeRoot.removeChild(clone));

      ctx.onDragStart(index, el, e);
    },
    [ctx, disabled, index],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!ctx || disabled) return;
      ctx.onDragOver(index, e);
    },
    [ctx, disabled, index],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!ctx) return;
      ctx.onDrop(e);
    },
    [ctx],
  );

  const handleDragEnd = useCallback(() => {
    ctx?.onDragEnd();
  }, [ctx]);

  return (
    <div
      ref={itemRef}
      role="listitem"
      aria-roledescription="sortable item"
      aria-disabled={disabled || undefined}
      draggable={!disabled && ctx != null}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      className={cx(
        styles.root,
        outline && styles.outline,
        disabled && styles.disabled,
        isSourcePlaceholder && styles.placeholder,
        showDropAbove && styles.dropAbove,
        showDropBelow && styles.dropBelow,
        className,
      )}
    >
      {ctx && !disabled && (
        <div className={styles.handle}>
          <DragHandleMenu
            ref={handleRef}
            type="dot"
            size="sm"
            index={index}
            total={ctx.total}
            onMoveUp={() => ctx.onMoveUp(index)}
            onMoveDown={() => ctx.onMoveDown(index)}
            onMoveToTop={() => ctx.onMoveToTop(index)}
            onMoveToBottom={() => ctx.onMoveToBottom(index)}
          />
        </div>
      )}

      <div className={styles.content}>{children}</div>
    </div>
  );
}
