import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  useId,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { TooltipContent, type TooltipType } from "./TooltipContent";
import { useTooltipConfig, useTooltipGroup } from "./TooltipProvider";
import contentStyles from "./TooltipContent.module.css";

/* ═══════════════════════════════════════════════════════════════════ */
/* Types                                                              */
/* ═══════════════════════════════════════════════════════════════════ */

export type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export type TooltipAnchor = "trigger" | "cursor";

export interface TooltipProps {
  children: ReactElement;
  type?: TooltipType;
  label?: string;
  description?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Custom content to render instead of the default TooltipContent */
  content?: ReactNode;
  placement?: Placement;
  offsetPx?: number;
  anchor?: TooltipAnchor;
  showDelay?: number;
  hideDelay?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTail?: boolean;
  className?: string;
  disabled?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════ */
/* Tail SVGs                                                          */
/* ═══════════════════════════════════════════════════════════════════ */

function TailUp() {
  return (
    <svg width="18" height="9" viewBox="0 0 18 9" fill="none">
      <path d="M7.59082 1.3992C8.3707 0.624828 9.6293 0.62483 10.4092 1.3992L15.4864 6.44045C15.861 6.81246 16.3676 7.02122 16.8956 7.02122H18V8.99999H1.72989e-07L0 7.02123H1.10444C1.63241 7.02123 2.13897 6.81246 2.51362 6.44045L7.59082 1.3992Z" fill="currentColor" />
      <path d="M18 9H8.74228e-08L0 8H18V9Z" fill="currentColor" />
    </svg>
  );
}

function TailDown() {
  return (
    <svg width="18" height="9" viewBox="0 0 18 9" fill="none">
      <path d="M10.4092 7.6008C9.6293 8.37516 8.3707 8.37516 7.59082 7.60079L2.51362 2.55954C2.13897 2.18753 1.63241 1.97876 1.10444 1.97876H0V0H18V1.97876H16.8956C16.3676 1.97876 15.861 2.18753 15.4864 2.55954L10.4092 7.6008Z" fill="currentColor" />
      <path d="M0 0H18V1H0V0Z" fill="currentColor" />
    </svg>
  );
}

function TailLeft() {
  return (
    <svg width="9" height="18" viewBox="0 0 9 18" fill="none">
      <path d="M1.39921 10.4092C0.624842 9.6293 0.624844 8.3707 1.39921 7.59082L6.44046 2.51362C6.81247 2.13897 7.02123 1.63241 7.02123 1.10444L7.02123 8.64945e-08L9 0L9 18H7.02124L7.02124 16.8956C7.02124 16.3676 6.81247 15.861 6.44046 15.4864L1.39921 10.4092Z" fill="currentColor" />
      <path d="M9 0L9 18H8L8 4.37115e-08L9 0Z" fill="currentColor" />
    </svg>
  );
}

function TailRight() {
  return (
    <svg width="9" height="18" viewBox="0 0 9 18" fill="none">
      <path d="M7.6008 7.59082C8.37516 8.3707 8.37516 9.6293 7.60079 10.4092L2.55954 15.4864C2.18753 15.861 1.97877 16.3676 1.97877 16.8956L1.97877 18H7.86805e-07L0 8.64945e-08L1.97876 0L1.97876 1.10444C1.97876 1.63241 2.18753 2.13897 2.55954 2.51362L7.6008 7.59082Z" fill="currentColor" />
      <path d="M7.86805e-07 18L0 4.37115e-08L1 0L1 18H7.86805e-07Z" fill="currentColor" />
    </svg>
  );
}

/* ── Neutral tail SVGs (with hairline border) ─────────────────────── */

function TailUpNeutral() {
  return (
    <svg width="18" height="9" viewBox="0 0 18 9" fill="none">
      <clipPath id="tail-up-n"><rect width="18" height="9" fill="white" /></clipPath>
      <g clipPath="url(#tail-up-n)">
        <path d="M7.59082 1.39921C8.3707 0.624843 9.6293 0.624845 10.4092 1.39921L15.4864 6.44046C15.861 6.81247 16.3676 7.02123 16.8956 7.02123H18V9H1.72989e-07L0 7.02124H1.10444C1.63241 7.02124 2.13897 6.81247 2.51362 6.44046L7.59082 1.39921Z" fill="currentColor" />
        <path d="M7.7666 1.57617C8.44899 0.898651 9.55101 0.898651 10.2334 1.57617L15.3105 6.61816C15.732 7.03647 16.3017 7.27147 16.8955 7.27148H17.75V8.75H0.25V7.27148H1.10449C1.6983 7.27147 2.26801 7.03647 2.68945 6.61816L7.7666 1.57617Z" style={{ stroke: "var(--util-border-weak)", strokeWidth: 0.5 }} />
        <path d="M18 9H8.74228e-08L0 7.5H18V9Z" fill="currentColor" />
      </g>
    </svg>
  );
}

function TailDownNeutral() {
  return (
    <svg width="18" height="9" viewBox="0 0 18 9" fill="none">
      <clipPath id="tail-down-n"><rect width="18" height="9" fill="white" /></clipPath>
      <g clipPath="url(#tail-down-n)">
        <path d="M10.4092 7.6008C9.6293 8.37516 8.3707 8.37516 7.59082 7.60079L2.51362 2.55954C2.13897 2.18753 1.63241 1.97876 1.10444 1.97876H0V0H18V1.97876H16.8956C16.3676 1.97876 15.861 2.18753 15.4864 2.55954L10.4092 7.6008Z" fill="currentColor" />
        <path d="M17.75 0.25V1.72852H16.8955C16.3017 1.72853 15.732 1.96353 15.3105 2.38184L10.2334 7.42383C9.55101 8.10135 8.44899 8.10135 7.7666 7.42383L2.68945 2.38184C2.26801 1.96353 1.6983 1.72853 1.10449 1.72852H0.25V0.25H17.75Z" style={{ stroke: "var(--util-border-weak)", strokeWidth: 0.5 }} />
        <path d="M0 0H18V1.5H0V0Z" fill="currentColor" />
      </g>
    </svg>
  );
}

function TailLeftNeutral() {
  return (
    <svg width="9" height="18" viewBox="0 0 9 18" fill="none">
      <clipPath id="tail-left-n"><rect width="9" height="18" fill="white" /></clipPath>
      <g clipPath="url(#tail-left-n)">
        <path d="M1.3992 10.4092C0.624828 9.6293 0.62483 8.3707 1.3992 7.59082L6.44045 2.51362C6.81246 2.13897 7.02122 1.63241 7.02122 1.10444V8.64945e-08L8.99999 0V18H7.02123V16.8956C7.02123 16.3676 6.81246 15.861 6.44045 15.4864L1.3992 10.4092Z" fill="currentColor" />
        <path d="M8.74999 0.25V17.75H7.27147V16.8955C7.27146 16.3017 7.03646 15.732 6.61815 15.3105L1.57616 10.2334C0.898644 9.55101 0.898644 8.44899 1.57616 7.7666L6.61815 2.68945C7.03646 2.26801 7.27146 1.6983 7.27147 1.10449V0.25H8.74999Z" style={{ stroke: "var(--util-border-weak)", strokeWidth: 0.5 }} />
        <path d="M9 0V18H7.5V4.37115e-08L9 0Z" fill="currentColor" />
      </g>
    </svg>
  );
}

function TailRightNeutral() {
  return (
    <svg width="9" height="18" viewBox="0 0 9 18" fill="none">
      <clipPath id="tail-right-n"><rect width="9" height="18" fill="white" /></clipPath>
      <g clipPath="url(#tail-right-n)">
        <path d="M7.6008 7.59082C8.37516 8.3707 8.37516 9.6293 7.60079 10.4092L2.55954 15.4864C2.18753 15.861 1.97877 16.3676 1.97877 16.8956V18H7.86805e-07L0 8.64945e-08L1.97876 0V1.10444C1.97876 1.63241 2.18753 2.13897 2.55954 2.51362L7.6008 7.59082Z" fill="currentColor" />
        <path d="M1.72852 0.25V1.10449C1.72853 1.6983 1.96354 2.26801 2.38184 2.68945L7.42383 7.7666C8.10135 8.44899 8.10135 9.55101 7.42383 10.2334L2.38184 15.3105C1.96353 15.732 1.72853 16.3017 1.72852 16.8955V17.75H0.25V0.25H1.72852Z" style={{ stroke: "var(--util-border-weak)", strokeWidth: 0.5 }} />
        <path d="M1.18021e-06 18L0 4.37115e-08L1.5 0V18H1.18021e-06Z" fill="currentColor" />
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/* Positioning engine                                                 */
/* ═══════════════════════════════════════════════════════════════════ */

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "end" | undefined;

const OPP: Record<Side, Side> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

function splitPlacement(p: Placement): [Side, Align] {
  const i = p.indexOf("-");
  return i < 0
    ? [p as Side, undefined]
    : [p.slice(0, i) as Side, p.slice(i + 1) as Align];
}

function baseCoords(
  side: Side,
  align: Align,
  r: DOMRect,
  fw: number,
  fh: number,
  off: number,
) {
  let x: number, y: number;

  if (side === "top") {
    y = r.top - fh - off;
    x =
      align === "start"
        ? r.left
        : align === "end"
          ? r.right - fw
          : r.left + r.width / 2 - fw / 2;
  } else if (side === "bottom") {
    y = r.bottom + off;
    x =
      align === "start"
        ? r.left
        : align === "end"
          ? r.right - fw
          : r.left + r.width / 2 - fw / 2;
  } else if (side === "left") {
    x = r.left - fw - off;
    y =
      align === "start"
        ? r.top
        : align === "end"
          ? r.bottom - fh
          : r.top + r.height / 2 - fh / 2;
  } else {
    x = r.right + off;
    y =
      align === "start"
        ? r.top
        : align === "end"
          ? r.bottom - fh
          : r.top + r.height / 2 - fh / 2;
  }

  return { x, y };
}

const VP_PAD = 8;
const TAIL_PAD = 4;
const TAIL_CROSS = 18;

function mainOverflow(
  side: Side,
  x: number,
  y: number,
  fw: number,
  fh: number,
) {
  if (side === "top") return Math.max(0, VP_PAD - y);
  if (side === "bottom")
    return Math.max(0, y + fh - window.innerHeight + VP_PAD);
  if (side === "left") return Math.max(0, VP_PAD - x);
  return Math.max(0, x + fw - window.innerWidth + VP_PAD);
}

interface Pos {
  x: number;
  y: number;
  placement: Placement;
  tailX?: number;
  tailY?: number;
}

function calcPos(
  r: DOMRect,
  fw: number,
  fh: number,
  placement: Placement,
  off: number,
): Pos {
  const [side, align] = splitPlacement(placement);
  let c = baseCoords(side, align, r, fw, fh, off);
  let res = side;

  // Flip to opposite side if overflowing on main axis
  const ov = mainOverflow(side, c.x, c.y, fw, fh);
  if (ov > 0) {
    const opp = OPP[side];
    const oc = baseCoords(opp, align, r, fw, fh, off);
    if (mainOverflow(opp, oc.x, oc.y, fw, fh) < ov) {
      res = opp;
      c = oc;
    }
  }

  // Shift on cross-axis to stay within viewport
  if (res === "top" || res === "bottom") {
    c.x = Math.max(VP_PAD, Math.min(c.x, window.innerWidth - fw - VP_PAD));
  } else {
    c.y = Math.max(VP_PAD, Math.min(c.y, window.innerHeight - fh - VP_PAD));
  }

  // Tail position (points to reference center, clamped within tooltip)
  let tailX: number | undefined;
  let tailY: number | undefined;
  if (res === "top" || res === "bottom") {
    tailX = r.left + r.width / 2 - c.x - TAIL_CROSS / 2;
    tailX = Math.max(
      TAIL_PAD,
      Math.min(tailX, fw - TAIL_CROSS - TAIL_PAD),
    );
  } else {
    tailY = r.top + r.height / 2 - c.y - TAIL_CROSS / 2;
    tailY = Math.max(
      TAIL_PAD,
      Math.min(tailY, fh - TAIL_CROSS - TAIL_PAD),
    );
  }

  return {
    x: c.x,
    y: c.y,
    placement: align ? (`${res}-${align}` as Placement) : res,
    tailX,
    tailY,
  };
}

/* ═══════════════════════════════════════════════════════════════════ */
/* Helpers                                                            */
/* ═══════════════════════════════════════════════════════════════════ */

function getScrollAncestors(el: HTMLElement) {
  const list: (HTMLElement | Window)[] = [];
  let cur = el.parentElement;
  while (cur) {
    const s = getComputedStyle(cur);
    if (/(auto|scroll|overlay)/.test(s.overflow + s.overflowX + s.overflowY)) {
      list.push(cur);
    }
    cur = cur.parentElement;
  }
  list.push(window);
  return list;
}

function mergeHandlers<E>(
  ours: (e: E) => void,
  theirs: unknown,
): (e: E) => void {
  if (typeof theirs === "function") {
    return (e: E) => {
      ours(e);
      (theirs as (e: E) => void)(e);
    };
  }
  return ours;
}

function mergeRefs(
  ...refs: unknown[]
): (node: HTMLElement | null) => void {
  return (node) => {
    for (const r of refs) {
      if (typeof r === "function") r(node);
      else if (r != null && typeof r === "object" && "current" in r) {
        (r as { current: unknown }).current = node;
      }
    }
  };
}

/* ═══════════════════════════════════════════════════════════════════ */
/* Constants & maps                                                   */
/* ═══════════════════════════════════════════════════════════════════ */

const TAIL_OFFSET = 4;

const SIDE_MAP = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
} as const;

const TAIL_MAP = {
  top: TailDown,
  bottom: TailUp,
  left: TailRight,
  right: TailLeft,
} as const;

const TAIL_MAP_NEUTRAL = {
  top: TailDownNeutral,
  bottom: TailUpNeutral,
  left: TailRightNeutral,
  right: TailLeftNeutral,
} as const;

const TAIL_FILL: Record<TooltipType, string> = {
  inverse: "var(--element-fill-neutral-primary-default)",
  neutral: "var(--element-surface-over)",
  brand: "var(--element-fill-brand-secondary-default)",
  info: "var(--element-fill-info-secondary-default)",
  success: "var(--element-fill-success-secondary-default)",
  warning: "var(--element-fill-warning-secondary-default)",
  alert: "var(--element-fill-alert-secondary-default)",
};

const EXIT_MS = 200; // matches --animation-tooltip-exit-duration (--motion-duration-fast-md)

/* ═══════════════════════════════════════════════════════════════════ */
/* Tooltip                                                            */
/* ═══════════════════════════════════════════════════════════════════ */

export function Tooltip({
  children,
  type = "inverse",
  label,
  description,
  leadingIcon,
  trailingIcon,
  content: customContent,
  placement = "top",
  offsetPx = 8,
  anchor = "trigger",
  showDelay: showDelayProp,
  hideDelay: hideDelayProp,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTail = true,
  className,
  disabled = false,
}: TooltipProps) {
  const tooltipId = useId();
  const config = useTooltipConfig();
  const group = useTooltipGroup();

  /* ── open / close state ─────────────────────── */

  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (disabled) return;
      if (!isControlled) setUncontrolledOpen(next);
      controlledOnOpenChange?.(next);
      if (next) group.markOpen();
      else group.markClosed();
    },
    [disabled, isControlled, controlledOnOpenChange, group],
  );

  useEffect(() => {
    if (disabled && !isControlled && uncontrolledOpen) {
      setUncontrolledOpen(false);
      group.markClosed();
    }
  }, [disabled, isControlled, uncontrolledOpen, group]);

  const effectiveShowDelay =
    showDelayProp ?? (group.shouldSkipDelay() ? 0 : config.showDelay);
  const effectiveHideDelay = hideDelayProp ?? config.hideDelay;

  /* ── refs ────────────────────────────────────── */

  const triggerRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const showTimerRef = useRef<number>(undefined);
  const hideTimerRef = useRef<number>(undefined);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(undefined);

  /* ── animation mount / unmount ───────────────── */

  const [isMounted, setIsMounted] = useState(isOpen);
  const [anim, setAnim] = useState<"enter" | "exit" | "idle">(
    isOpen ? "enter" : "idle",
  );
  const exitTimerRef = useRef<number>(undefined);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = isOpen;

    clearTimeout(exitTimerRef.current);

    if (isOpen && !wasOpen) {
      setIsMounted(true);
      setAnim("enter");
    } else if (!isOpen && wasOpen) {
      setAnim("exit");
      exitTimerRef.current = window.setTimeout(
        () => setIsMounted(false),
        EXIT_MS + 50,
      );
    }
    return () => clearTimeout(exitTimerRef.current);
  }, [isOpen]);

  const onAnimEnd = useCallback(() => {
    if (anim === "enter") {
      setAnim("idle");
    } else if (anim === "exit") {
      clearTimeout(exitTimerRef.current);
      setIsMounted(false);
      setAnim("idle");
    }
  }, [anim]);

  /* ── position ───────────────────────────────── */

  const [pos, setPos] = useState<Pos>({ x: 0, y: 0, placement });

  const updatePos = useCallback(() => {
    const ref = triggerRef.current;
    const fl = floatingRef.current;
    if (!ref || !fl) return;

    const off = offsetPx + (showTail ? TAIL_OFFSET : 0);
    const refRect =
      anchor === "cursor" && mouseRef.current
        ? new DOMRect(mouseRef.current.x, mouseRef.current.y, 0, 0)
        : ref.getBoundingClientRect();

    if (anchor !== "cursor" && refRect.width === 0 && refRect.height === 0) {
      setOpen(false);
      return;
    }

    setPos(calcPos(refRect, fl.offsetWidth, fl.offsetHeight, placement, off));
  }, [placement, offsetPx, showTail, anchor, setOpen]);

  const updatePosRef = useRef(updatePos);
  updatePosRef.current = updatePos;

  // Synchronous initial position + recalc on relevant prop changes
  useLayoutEffect(() => {
    if (isMounted) updatePosRef.current();
  }, [isMounted, placement, offsetPx, showTail, anchor]);

  // Auto-update: scroll, resize, ResizeObserver
  useEffect(() => {
    if (!isMounted) return;
    const ref = triggerRef.current;
    if (!ref) return;

    const tick = () => {
      cancelAnimationFrame(rafRef.current!);
      rafRef.current = requestAnimationFrame(() => updatePosRef.current());
    };

    const ancestors = getScrollAncestors(ref);
    for (const a of ancestors)
      a.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);

    const ro = new ResizeObserver(tick);
    ro.observe(ref);
    if (floatingRef.current) ro.observe(floatingRef.current);

    return () => {
      for (const a of ancestors) a.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
      ro.disconnect();
      cancelAnimationFrame(rafRef.current!);
    };
  }, [isMounted]);

  /* ── theme tracking ─────────────────────────── */

  const [theme, setTheme] = useState<string | null>(null);

  const setTriggerRef = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
    if (node) {
      setTheme(
        node
          .closest<HTMLElement>("[data-theme]")
          ?.getAttribute("data-theme") ?? null,
      );
    }
  }, []);

  useEffect(() => {
    const node = triggerRef.current;
    if (!node) return;
    const el = node.closest<HTMLElement>("[data-theme]");
    if (!el) return;
    const obs = new MutationObserver(() =>
      setTheme(el.getAttribute("data-theme")),
    );
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  /* ── interaction: show / hide scheduling ────── */

  const scheduleShow = useCallback(() => {
    clearTimeout(hideTimerRef.current);
    if (isOpen || isControlled) return;
    if (effectiveShowDelay <= 0) {
      setOpen(true);
    } else {
      showTimerRef.current = window.setTimeout(
        () => setOpen(true),
        effectiveShowDelay,
      );
    }
  }, [isOpen, isControlled, effectiveShowDelay, setOpen]);

  const scheduleHide = useCallback(() => {
    clearTimeout(showTimerRef.current);
    if (!isOpen || isControlled) return;
    if (effectiveHideDelay <= 0) {
      setOpen(false);
    } else {
      hideTimerRef.current = window.setTimeout(
        () => setOpen(false),
        effectiveHideDelay,
      );
    }
  }, [isOpen, isControlled, effectiveHideDelay, setOpen]);

  useEffect(
    () => () => {
      clearTimeout(showTimerRef.current);
      clearTimeout(hideTimerRef.current);
    },
    [],
  );

  /* ── event handlers ─────────────────────────── */

  const onMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      if (anchor === "cursor")
        mouseRef.current = { x: e.clientX, y: e.clientY };
      scheduleShow();
    },
    [disabled, anchor, scheduleShow],
  );

  const onMouseLeave = useCallback(() => {
    if (disabled) return;
    scheduleHide();
  }, [disabled, scheduleHide]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (anchor !== "cursor") return;
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (isOpen) {
        cancelAnimationFrame(rafRef.current!);
        rafRef.current = requestAnimationFrame(() => updatePosRef.current());
      }
    },
    [anchor, isOpen],
  );

  const onFocus = useCallback(() => {
    if (!disabled) scheduleShow();
  }, [disabled, scheduleShow]);

  const onBlur = useCallback(() => {
    if (!disabled) scheduleHide();
  }, [disabled, scheduleHide]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setOpen(false);
    },
    [isOpen, setOpen],
  );

  const onFloatEnter = useCallback(() => {
    if (!isControlled) clearTimeout(hideTimerRef.current);
  }, [isControlled]);

  const onFloatLeave = useCallback(() => {
    if (!isControlled) scheduleHide();
  }, [isControlled, scheduleHide]);

  /* ── render ─────────────────────────────────── */

  if (!isValidElement(children)) return null;

  const child = children as ReactElement<Record<string, unknown>>;
  const cp = child.props as Record<string, unknown>;

  const side = pos.placement.split("-")[0] as Side;
  const tailSide = SIDE_MAP[side];
  const TailSvg =
    type === "neutral" ? TAIL_MAP_NEUTRAL[side] : TAIL_MAP[side];
  const isH = side === "top" || side === "bottom";

  const capSide = side.charAt(0).toUpperCase() + side.slice(1);
  const animClass =
    anim === "enter"
      ? contentStyles[`enter${capSide}`] ?? ""
      : anim === "exit"
        ? contentStyles[`exit${capSide}`] ?? ""
        : "";

  const floatStyle: CSSProperties = {
    position: "fixed",
    top: Math.round(pos.y),
    left: Math.round(pos.x),
  };

  const tailStyle: CSSProperties = {
    position: "absolute",
    display: "flex",
    color: TAIL_FILL[type],
    lineHeight: 0,
    [tailSide]: 0,
    transform:
      tailSide === "bottom"
        ? "translateY(calc(100% - 2px))"
        : tailSide === "top"
          ? "translateY(calc(-100% + 2px))"
          : tailSide === "right"
            ? "translateX(calc(100% - 2px))"
            : "translateX(calc(-100% + 2px))",
    ...(isH
      ? { left: pos.tailX != null ? pos.tailX : undefined }
      : { top: pos.tailY != null ? pos.tailY : undefined }),
  };

  const triggerProps: Record<string, unknown> = {
    ref: mergeRefs(setTriggerRef, cp.ref),
    "aria-describedby": isOpen ? tooltipId : undefined,
    onMouseEnter: mergeHandlers(onMouseEnter, cp.onMouseEnter),
    onMouseLeave: mergeHandlers(onMouseLeave, cp.onMouseLeave),
    onFocus: mergeHandlers(onFocus, cp.onFocus),
    onBlur: mergeHandlers(onBlur, cp.onBlur),
    onKeyDown: mergeHandlers(onKeyDown, cp.onKeyDown),
  };
  if (anchor === "cursor") {
    triggerProps.onMouseMove = mergeHandlers(onMouseMove, cp.onMouseMove);
  }

  return (
    <>
      {cloneElement(child, triggerProps)}

      {isMounted &&
        createPortal(
          <div
            ref={floatingRef}
            id={tooltipId}
            role="tooltip"
            className={`${contentStyles.wrapper} ${contentStyles[type]}${animClass ? ` ${animClass}` : ""}${className ? ` ${className}` : ""}`}
            style={floatStyle}
            data-theme={theme || undefined}
            onAnimationEnd={onAnimEnd}
            onMouseEnter={onFloatEnter}
            onMouseLeave={onFloatLeave}
          >
            {customContent ?? (
              <TooltipContent
                type={type}
                label={label}
                description={description}
                leadingIcon={leadingIcon}
                trailingIcon={trailingIcon}
              />
            )}

            {showTail && (
              <div style={tailStyle}>
                <TailSvg />
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

Tooltip.displayName = "Tooltip";
