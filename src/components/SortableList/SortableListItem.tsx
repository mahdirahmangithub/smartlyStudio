import { type ReactNode, useCallback, useEffect, useRef } from "react";
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

  const isShift = ctx?.behavior === "shift";
  const isDragging = ctx != null && ctx.draggingIndex === index;
  const isSourcePlaceholder = !isShift && isDragging;
  const isShiftDragging = isShift && isDragging;
  const isDropTarget = !isShift && ctx != null && ctx.dropTargetIndex === index && ctx.draggingIndex !== index;
  const showDropAbove = isDropTarget && ctx!.dropPosition === "above";
  const showDropBelow = isDropTarget && ctx!.dropPosition === "below";

  useEffect(() => {
    if (!ctx) return;
    ctx.registerItem(index, itemRef.current);
    return () => ctx.registerItem(index, null);
  }, [ctx, index]);

  /* ── HTML5 DnD handlers (indicator mode) ───────────────────────── */

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (disabled || !ctx || isShift) {
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
    [ctx, disabled, index, isShift],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!ctx || disabled || isShift) return;
      ctx.onDragOver(index, e);
    },
    [ctx, disabled, index, isShift],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (!ctx || isShift) return;
      ctx.onDrop(e);
    },
    [ctx, isShift],
  );

  const handleDragEnd = useCallback(() => {
    if (isShift) return;
    ctx?.onDragEnd();
  }, [ctx, isShift]);

  /* ── pointer handler for shift mode ────────────────────────────── */

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!ctx || disabled || !isShift) return;
      ctx.onPointerDragStart(index, e);
    },
    [ctx, disabled, index, isShift],
  );

  return (
    <div
      ref={itemRef}
      role="listitem"
      aria-roledescription="sortable item"
      aria-disabled={disabled || undefined}
      draggable={!isShift && !disabled && ctx != null}
      onDragStart={!isShift ? handleDragStart : undefined}
      onDragOver={!isShift ? handleDragOver : undefined}
      onDrop={!isShift ? handleDrop : undefined}
      onDragEnd={!isShift ? handleDragEnd : undefined}
      onPointerDown={isShift ? handlePointerDown : undefined}
      className={cx(
        styles.root,
        outline && styles.outline,
        disabled && styles.disabled,
        isSourcePlaceholder && styles.placeholder,
        isShiftDragging && styles.dragging,
        showDropAbove && styles.dropAbove,
        showDropBelow && styles.dropBelow,
        isShift && !disabled && styles.shiftGrabbable,
        className,
      )}
      style={isShift ? { touchAction: "none" } : undefined}
    >
      {ctx && !disabled && (
        <div
          className={styles.handle}
        >
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
