import {
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SortableListContext,
  type SortableListContextValue,
  type DropPosition,
} from "./SortableListContext";
import styles from "./SortableList.module.css";
import { cx } from "../../utils/cx";


export interface SortableListProps {
  /** Called with (fromIndex, toIndex) when an item is reordered */
  onReorder: (fromIndex: number, toIndex: number) => void;
  /** Number of items in the list (required for DragHandleMenu disable logic) */
  total: number;
  /** Gap between items — any CSS length value (default: var(--spacing-sm)) */
  gap?: string;
  children: ReactNode;
  className?: string;
}

export function SortableList({
  onReorder,
  total,
  gap = "var(--spacing-sm)",
  children,
  className,
}: SortableListProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition>(null);
  const draggingRef = useRef<number | null>(null);
  const dropTargetRef = useRef<number | null>(null);
  const dropPositionRef = useRef<DropPosition>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = message;
    }
  }, []);

  /* ── keyboard reorder (via DragHandleMenu) ─────────────────────── */

  const onMoveUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      onReorder(index, index - 1);
      announce(`Item moved from position ${index + 1} to position ${index}`);
    },
    [onReorder, announce],
  );

  const onMoveDown = useCallback(
    (index: number) => {
      if (index >= total - 1) return;
      onReorder(index, index + 1);
      announce(`Item moved from position ${index + 1} to position ${index + 2}`);
    },
    [onReorder, total, announce],
  );

  const onMoveToTop = useCallback(
    (index: number) => {
      if (index <= 0) return;
      onReorder(index, 0);
      announce(`Item moved from position ${index + 1} to position 1`);
    },
    [onReorder, announce],
  );

  const onMoveToBottom = useCallback(
    (index: number) => {
      if (index >= total - 1) return;
      onReorder(index, total - 1);
      announce(`Item moved from position ${index + 1} to position ${total}`);
    },
    [onReorder, total, announce],
  );

  /* ── native HTML5 DnD ──────────────────────────────────────────── */

  const onDragStart = useCallback(
    (index: number, _handleEl: HTMLElement, e: React.DragEvent) => {
      draggingRef.current = index;
      dropTargetRef.current = index;
      setDraggingIndex(index);
      setDropTargetIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    [],
  );

  const onDragOver = useCallback(
    (index: number, e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const pos: DropPosition = e.clientY < midY ? "above" : "below";

      dropTargetRef.current = index;
      dropPositionRef.current = pos;
      setDropTargetIndex(index);
      setDropPosition(pos);
    },
    [],
  );

  const resetDragState = useCallback(() => {
    draggingRef.current = null;
    dropTargetRef.current = null;
    dropPositionRef.current = null;
    setDraggingIndex(null);
    setDropTargetIndex(null);
    setDropPosition(null);
  }, []);

  const finalizeDrop = useCallback(() => {
    const from = draggingRef.current;
    const hoverIndex = dropTargetRef.current;
    const pos = dropPositionRef.current;

    if (from != null && hoverIndex != null) {
      let to = pos === "below" ? hoverIndex + 1 : hoverIndex;
      if (from < to) to -= 1;
      if (from !== to) {
        onReorder(from, to);
        announce(
          `Item moved from position ${from + 1} to position ${to + 1}`,
        );
      }
    }

    resetDragState();
  }, [onReorder, announce, resetDragState]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      finalizeDrop();
    },
    [finalizeDrop],
  );

  const onDragEnd = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  const handleContainerDragOver = useCallback((e: React.DragEvent) => {
    if (draggingRef.current == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  /* ── context value ─────────────────────────────────────────────── */

  const ctxValue = useMemo<SortableListContextValue>(
    () => ({
      total,
      draggingIndex,
      dropTargetIndex,
      dropPosition,
      onMoveUp,
      onMoveDown,
      onMoveToTop,
      onMoveToBottom,
      onDragStart,
      onDragOver,
      onDragEnd,
      onDrop,
    }),
    [
      total,
      draggingIndex,
      dropTargetIndex,
      dropPosition,
      onMoveUp,
      onMoveDown,
      onMoveToTop,
      onMoveToBottom,
      onDragStart,
      onDragOver,
      onDragEnd,
      onDrop,
    ],
  );

  return (
    <SortableListContext.Provider value={ctxValue}>
      <div
        role="list"
        aria-roledescription="sortable list"
        className={cx(styles.root, className)}
        style={{ "--sortable-list-gap": gap } as React.CSSProperties}
        onDragOver={handleContainerDragOver}
        onDrop={onDrop}
      >
        {children}
      </div>
      <div
        ref={liveRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.liveRegion}
      />
    </SortableListContext.Provider>
  );
}
