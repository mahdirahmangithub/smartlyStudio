import { createContext, useContext } from "react";

export type DropPosition = "above" | "below" | null;
export type SortBehavior = "indicator" | "shift";

export interface SortableListContextValue {
  behavior: SortBehavior;
  total: number;
  draggingIndex: number | null;
  dropTargetIndex: number | null;
  dropPosition: DropPosition;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onMoveToTop: (index: number) => void;
  onMoveToBottom: (index: number) => void;
  onDragStart: (index: number, handleEl: HTMLElement, e: React.DragEvent) => void;
  onDragOver: (index: number, e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
  registerItem: (index: number, el: HTMLElement | null) => void;
  onPointerDragStart: (index: number, e: React.PointerEvent) => void;
}

export const SortableListContext = createContext<SortableListContextValue | null>(null);

export function useSortableList() {
  return useContext(SortableListContext);
}
