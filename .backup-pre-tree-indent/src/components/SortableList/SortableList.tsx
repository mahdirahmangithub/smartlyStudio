import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SortableListContext,
  type SortableListContextValue,
  type DropPosition,
  type SortBehavior,
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
  /** "indicator" shows a drop line; "shift" reorders items in real-time */
  behavior?: SortBehavior;
  children: ReactNode;
  className?: string;
}

export function SortableList({
  onReorder,
  total,
  gap = "var(--spacing-sm)",
  behavior = "indicator",
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

  /* ── native HTML5 DnD (indicator mode) ─────────────────────────── */

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

  /* ── pointer-based shift mode ──────────────────────────────────── */

  const DRAG_THRESHOLD = 4;

  const itemEls = useRef<Map<number, HTMLElement>>(new Map());
  const pendingDrag = useRef<{
    index: number;
    pointerId: number;
    startX: number;
    startY: number;
  } | null>(null);
  const shiftState = useRef<{
    fromIndex: number;
    startY: number;
    rects: { index: number; top: number; height: number; midY: number }[];
    order: number[];
    gapPx: number;
  } | null>(null);

  const registerItem = useCallback((index: number, el: HTMLElement | null) => {
    if (el) itemEls.current.set(index, el);
    else itemEls.current.delete(index);
  }, []);

  const computeGapPx = useCallback(() => {
    const els = itemEls.current;
    if (els.size < 2) return 0;
    const sorted = [...els.entries()].sort((a, b) => a[0] - b[0]);
    const r0 = sorted[0][1].getBoundingClientRect();
    const r1 = sorted[1][1].getBoundingClientRect();
    return r1.top - r0.bottom;
  }, []);

  const applyShiftTransforms = useCallback((
    order: number[],
    fromIndex: number,
    rects: { index: number; top: number; height: number }[],
    gapPx: number,
  ) => {
    const rectByIndex = new Map<number, { top: number; height: number }>();
    rects.forEach((r) => rectByIndex.set(r.index, r));

    const baseTop = rects[0]?.top ?? 0;
    let accum = baseTop;
    const targetTop = new Map<number, number>();
    for (const idx of order) {
      targetTop.set(idx, accum);
      accum += (rectByIndex.get(idx)?.height ?? 0) + gapPx;
    }

    for (const idx of order) {
      if (idx === fromIndex) continue;
      const el = itemEls.current.get(idx);
      if (!el) continue;
      const orig = rectByIndex.get(idx)!;
      const displacement = targetTop.get(idx)! - orig.top;
      el.style.transform = displacement ? `translateY(${displacement}px)` : "";
    }
  }, []);

  const activateDrag = useCallback((index: number, startY: number) => {
    const el = itemEls.current.get(index);
    if (!el) return;

    const rects = [...itemEls.current.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([idx, itemEl]) => {
        const r = itemEl.getBoundingClientRect();
        return { index: idx, top: r.top, height: r.height, midY: r.top + r.height / 2 };
      });

    const gapPx = computeGapPx();
    const order = rects.map((r) => r.index);

    shiftState.current = { fromIndex: index, startY, rects, order, gapPx };
    setDraggingIndex(index);

    for (const [, itemEl] of itemEls.current) {
      if (itemEl !== el) {
        itemEl.style.transition = "transform 200ms ease";
      }
    }
    el.style.transition = "none";
    el.style.zIndex = "10";
    el.style.position = "relative";
  }, [computeGapPx]);

  const onPointerDragStart = useCallback((index: number, e: React.PointerEvent) => {
    if (behavior !== "shift") return;

    const el = itemEls.current.get(index);
    if (!el) return;

    pendingDrag.current = {
      index,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
    };
  }, [behavior]);

  useEffect(() => {
    if (behavior !== "shift") return;

    const handlePointerMove = (e: PointerEvent) => {
      const pending = pendingDrag.current;
      if (pending && !shiftState.current) {
        const dx = e.clientX - pending.startX;
        const dy = e.clientY - pending.startY;
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;

        const el = itemEls.current.get(pending.index);
        if (el) el.setPointerCapture(pending.pointerId);
        activateDrag(pending.index, pending.startY);
      }

      const s = shiftState.current;
      if (!s) return;

      const deltaY = e.clientY - s.startY;
      const grabbedEl = itemEls.current.get(s.fromIndex);
      if (grabbedEl) {
        grabbedEl.style.transform = `translateY(${deltaY}px)`;
      }

      const grabbedRect = s.rects.find((r) => r.index === s.fromIndex)!;
      const grabbedCenter = grabbedRect.midY + deltaY;

      const newOrder: { index: number; center: number }[] = s.rects.map((r) => ({
        index: r.index,
        center: r.index === s.fromIndex ? grabbedCenter : r.midY,
      }));
      newOrder.sort((a, b) => a.center - b.center);
      s.order = newOrder.map((o) => o.index);

      applyShiftTransforms(s.order, s.fromIndex, s.rects, s.gapPx);
    };

    const handlePointerUp = () => {
      pendingDrag.current = null;

      const s = shiftState.current;
      if (!s) return;

      const fromIndex = s.fromIndex;
      const toIndex = s.order.indexOf(fromIndex);

      for (const [, el] of itemEls.current) {
        el.style.transform = "";
        el.style.transition = "";
        el.style.zIndex = "";
        el.style.position = "";
      }

      shiftState.current = null;
      setDraggingIndex(null);

      if (fromIndex !== toIndex) {
        onReorder(fromIndex, toIndex);
        announce(`Item moved from position ${fromIndex + 1} to position ${toIndex + 1}`);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [behavior, onReorder, announce, applyShiftTransforms, activateDrag]);

  /* ── context value ─────────────────────────────────────────────── */

  const ctxValue = useMemo<SortableListContextValue>(
    () => ({
      behavior,
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
      registerItem,
      onPointerDragStart,
    }),
    [
      behavior,
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
      registerItem,
      onPointerDragStart,
    ],
  );

  return (
    <SortableListContext.Provider value={ctxValue}>
      <div
        role="list"
        aria-roledescription="sortable list"
        className={cx(styles.root, className)}
        style={{ "--sortable-list-gap": gap } as React.CSSProperties}
        onDragOver={behavior === "indicator" ? handleContainerDragOver : undefined}
        onDrop={behavior === "indicator" ? onDrop : undefined}
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
