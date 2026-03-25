import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { Toast } from "./Toast";
import { toastState, type ToastData, type ToastToDismiss } from "./ToastState";
import styles from "./Toaster.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export type ToasterPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

export interface ToasterProps {
  /** Where toasts appear on screen */
  position?: ToasterPosition;
  /** Max toasts visible in the stack */
  visibleToasts?: number;
  /** Gap between expanded toasts in px */
  gap?: number;
  /** Vertical peek offset per stacked toast in collapsed mode (px) */
  stackOffset?: number;
  /** Scale reduction per stacked level (0.02 = 2% smaller each level) */
  stackScale?: number;
}

interface HeightEntry {
  toastId: number | string;
  height: number;
}

const UNMOUNT_DELAY = 200;

const positionClassMap: Record<ToasterPosition, string> = {
  "top-left": styles.topLeft,
  "top-right": styles.topRight,
  "top-center": styles.topCenter,
  "bottom-left": styles.bottomLeft,
  "bottom-right": styles.bottomRight,
  "bottom-center": styles.bottomCenter,
};

function isBottomPosition(pos: ToasterPosition) {
  return pos.startsWith("bottom");
}

export function Toaster({
  position = "bottom-left",
  visibleToasts = 3,
  gap = 16,
  stackOffset = 16,
  stackScale = 0.02,
}: ToasterProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [heights, setHeights] = useState<HeightEntry[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const removingRef = useRef(0);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const expand = useCallback(() => {
    clearTimeout(collapseTimerRef.current);
    setExpanded(true);
  }, []);

  const scheduleCollapse = useCallback(() => {
    clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = setTimeout(() => setExpanded(false), 200);
  }, []);

  const removeToast = useCallback((toastToRemove: ToastData) => {
    setToasts((prev) => {
      if (!prev.find((t) => t.id === toastToRemove.id)?.delete) {
        toastState.dismiss(toastToRemove.id);
      }
      return prev.filter((t) => t.id !== toastToRemove.id);
    });
  }, []);

  const onRemoveStart = useCallback(() => {
    removingRef.current += 1;
  }, []);

  const onRemoveEnd = useCallback(() => {
    removingRef.current -= 1;
    if (removingRef.current === 0) {
      scheduleCollapse();
    }
  }, [scheduleCollapse]);

  useEffect(() => {
    return toastState.subscribe((incoming) => {
      if ((incoming as ToastToDismiss).dismiss) {
        requestAnimationFrame(() => {
          setToasts((prev) =>
            prev.map((t) =>
              t.id === incoming.id ? { ...t, delete: true } : t
            )
          );
        });
        return;
      }

      setToasts((prev) => {
        const idx = prev.findIndex((t) => t.id === incoming.id);
        if (idx !== -1) {
          return [
            ...prev.slice(0, idx),
            { ...prev[idx], ...(incoming as ToastData) },
            ...prev.slice(idx + 1),
          ];
        }
        return [incoming as ToastData, ...prev];
      });
    });
  }, []);

  useEffect(() => {
    if (toasts.length <= 1) {
      clearTimeout(collapseTimerRef.current);
      setExpanded(false);
    }
  }, [toasts.length]);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    let el: HTMLElement | null = anchor.parentElement;
    while (el) {
      if (el.hasAttribute("data-theme")) {
        setPortalTarget(el);
        return;
      }
      el = el.parentElement;
    }
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    return () => clearTimeout(collapseTimerRef.current);
  }, []);

  if (toasts.length === 0 && portalTarget) return <span ref={anchorRef} hidden />;
  if (!portalTarget) return <span ref={anchorRef} hidden />;

  const isBottom = isBottomPosition(position);
  const liftDir = isBottom ? -1 : 1;

  return createPortal(
    <ol
      ref={listRef}
      className={cx(styles.toaster, positionClassMap[position])}
      style={{ "--toast-gap": `${gap}px` } as CSSProperties}
      data-toast-portal
      role="region"
      aria-label="Notifications"
      tabIndex={-1}
      onMouseEnter={expand}
      onMouseMove={expand}
      onMouseLeave={() => {
        if (!interacting && removingRef.current === 0) {
          scheduleCollapse();
        }
      }}
      onPointerDown={() => setInteracting(true)}
      onPointerUp={() => setInteracting(false)}
    >
      {toasts.map((toastData, index) => (
        <ToastItem
          key={toastData.id}
          toast={toastData}
          index={index}
          expanded={expanded}
          interacting={interacting}
          visibleToasts={visibleToasts}
          heights={heights}
          setHeights={setHeights}
          gap={gap}
          stackOffset={stackOffset}
          stackScale={stackScale}
          liftDir={liftDir}
          removeToast={removeToast}
          onRemoveStart={onRemoveStart}
          onRemoveEnd={onRemoveEnd}
        />
      ))}
    </ol>,
    portalTarget
  );
}

/* ── Individual toast wrapper with stacking logic ── */

interface ToastItemProps {
  toast: ToastData;
  index: number;
  expanded: boolean;
  interacting: boolean;
  visibleToasts: number;
  heights: HeightEntry[];
  setHeights: React.Dispatch<React.SetStateAction<HeightEntry[]>>;
  gap: number;
  stackOffset: number;
  stackScale: number;
  liftDir: number;
  removeToast: (t: ToastData) => void;
  onRemoveStart: () => void;
  onRemoveEnd: () => void;
}

function ToastItem({
  toast,
  index,
  expanded,
  interacting,
  visibleToasts,
  heights,
  setHeights,
  gap,
  stackOffset,
  stackScale,
  liftDir,
  removeToast,
  onRemoveStart,
  onRemoveEnd,
}: ToastItemProps) {
  const [mounted, setMounted] = useState(false);
  const [removed, setRemoved] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const remainingRef = useRef(toast.duration ?? 5000);
  const timerStartRef = useRef(0);
  const isDocHiddenRef = useRef(false);

  const isFront = index === 0;
  const isVisible = index < visibleToasts;
  const heightIndex = heights.findIndex((h) => h.toastId === toast.id);

  const toastsHeightBefore = heights.reduce((acc, curr, i) => {
    if (i >= heightIndex) return acc;
    return acc + curr.height;
  }, 0);

  const expandedOffset = heightIndex * gap + toastsHeightBefore;
  const frontHeight = heights[0]?.height ?? 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const height = el.getBoundingClientRect().height;
    setHeights((prev) => [
      { toastId: toast.id, height },
      ...prev.filter((h) => h.toastId !== toast.id),
    ]);
    return () => {
      setHeights((prev) => prev.filter((h) => h.toastId !== toast.id));
    };
  }, [toast.id, setHeights]);

  useLayoutEffect(() => {
    if (!mounted || !ref.current) return;
    const el = ref.current;
    const orig = el.style.height;
    el.style.height = "auto";
    const newH = el.getBoundingClientRect().height;
    el.style.height = orig;
    setHeights((prev) =>
      prev.map((h) =>
        h.toastId === toast.id ? { ...h, height: newH } : h
      )
    );
  }, [mounted, toast.title, toast.description, toast.id, setHeights]);

  const deleteToast = useCallback(() => {
    onRemoveStart();
    setRemoved(true);
    setTimeout(() => {
      setHeights((prev) => prev.filter((h) => h.toastId !== toast.id));
      removeToast(toast);
      onRemoveEnd();
    }, UNMOUNT_DELAY);
  }, [toast, removeToast, setHeights, onRemoveStart, onRemoveEnd]);

  useEffect(() => {
    if (toast.delete) {
      deleteToast();
      return;
    }
  }, [toast.delete, deleteToast]);

  // Auto-dismiss timer with pause/resume
  useEffect(() => {
    if (toast.duration === Infinity) return;

    const pause = () => {
      if (timerStartRef.current) {
        const elapsed = Date.now() - timerStartRef.current;
        remainingRef.current = Math.max(0, remainingRef.current - elapsed);
        timerStartRef.current = 0;
      }
      clearTimeout(timerRef.current);
    };

    const resume = () => {
      if (remainingRef.current <= 0) return;
      timerStartRef.current = Date.now();
      timerRef.current = setTimeout(deleteToast, remainingRef.current);
    };

    if (expanded || interacting || isDocHiddenRef.current) {
      pause();
    } else {
      resume();
    }

    return () => clearTimeout(timerRef.current);
  }, [expanded, interacting, toast.duration, deleteToast]);

  useEffect(() => {
    const handleVisibility = () => {
      isDocHiddenRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const offscreen = "translateY(calc(100% + var(--spacing-4xl)))";

  let transform: string;
  let height: number | undefined;
  let overflow: string | undefined;

  if (!mounted || removed) {
    transform = offscreen;
    height = undefined;
    overflow = undefined;
  } else if (expanded) {
    transform = `translateY(${liftDir * expandedOffset}px)`;
    height = undefined;
    overflow = undefined;
  } else if (isFront) {
    transform = "translateY(0)";
    height = undefined;
    overflow = undefined;
  } else {
    const scale = 1 - index * stackScale;
    transform = `translateY(${liftDir * index * stackOffset}px) scale(${scale})`;
    height = frontHeight;
    overflow = "hidden";
  }

  const style: CSSProperties = {
    transform,
    height,
    overflow,
    zIndex: 1000 - index,
  };

  return (
    <li
      ref={ref}
      className={cx(
        styles.toastWrapper,
        mounted && !removed && styles.mounted,
        !mounted && styles.unmounted,
        removed && styles.removed,
        !isVisible && styles.hidden,
        isVisible && !expanded && !isFront && styles.stackedBack,
        isVisible && !expanded && isFront && styles.stackedFront,
        isVisible && expanded && styles.expanded,
        isVisible && expanded && !isFront && styles.gapBridge
      )}
      style={style}
    >
      <Toast
        title={toast.title}
        description={toast.description}
        type={toast.type}
        layout={toast.layout}
        ctaAction={toast.ctaAction}
        undoAction={toast.undoAction}
        icon={toast.icon}
        onClose={deleteToast}
      />
    </li>
  );
}
