import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  type ReactNode,
  type CSSProperties,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { ScrollFade } from "../ScrollFade";
import styles from "./Dropdown.module.css";

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */

export type DropdownPlacement =
  | "bottom-start"
  | "bottom-end"
  | "bottom"
  | "top-start"
  | "top-end"
  | "top";

export interface DropdownProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  placement?: DropdownPlacement;
  width?: number;
  maxHeight?: number;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  offset?: number;
  matchAnchorWidth?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════ */

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

type Side = "top" | "bottom";
type Align = "start" | "end" | undefined;

function splitPlacement(p: DropdownPlacement): [Side, Align] {
  const i = p.indexOf("-");
  return i < 0
    ? [p as Side, undefined]
    : [p.slice(0, i) as Side, p.slice(i + 1) as Align];
}

const VP_PAD = 8;

function calcPosition(
  anchorRect: DOMRect,
  panelW: number,
  panelH: number,
  placement: DropdownPlacement,
  offset: number
): { x: number; y: number; side: Side } {
  const [preferredSide, align] = splitPlacement(placement);

  let x: number;
  if (align === "start") {
    x = anchorRect.left;
  } else if (align === "end") {
    x = anchorRect.right - panelW;
  } else {
    x = anchorRect.left + anchorRect.width / 2 - panelW / 2;
  }

  const yBelow = anchorRect.bottom + offset;
  const yAbove = anchorRect.top - panelH - offset;

  const overflowBelow = Math.max(0, yBelow + panelH - window.innerHeight + VP_PAD);
  const overflowAbove = Math.max(0, VP_PAD - yAbove);

  let side: Side;
  let y: number;

  if (preferredSide === "bottom") {
    if (overflowBelow > 0 && overflowAbove < overflowBelow) {
      side = "top";
      y = yAbove;
    } else {
      side = "bottom";
      y = yBelow;
    }
  } else {
    if (overflowAbove > 0 && overflowBelow < overflowAbove) {
      side = "bottom";
      y = yBelow;
    } else {
      side = "top";
      y = yAbove;
    }
  }

  x = Math.max(VP_PAD, Math.min(x, window.innerWidth - panelW - VP_PAD));
  y = Math.max(VP_PAD, Math.min(y, window.innerHeight - panelH - VP_PAD));

  return { x, y, side };
}

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

const EXIT_MS = 200;
const DEFAULT_WIDTH = 320;
const DEFAULT_MAX_HEIGHT = 400;

const FOCUSABLE_SEL = [
  'input:not([disabled]):not([type="checkbox"]):not([type="radio"])',
  "button:not([disabled])",
  '[tabindex="0"]:not([aria-disabled="true"])',
].join(", ");

function focusVisible(el: HTMLElement | null | undefined) {
  el?.focus({ focusVisible: true } as FocusOptions);
}

/* ═══════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════ */

export function Dropdown({
  open,
  onClose,
  anchorRef,
  placement = "bottom-start",
  width = DEFAULT_WIDTH,
  maxHeight = DEFAULT_MAX_HEIGHT,
  header,
  footer,
  children,
  className,
  closeOnClickOutside = true,
  closeOnEscape = true,
  offset = 4,
  matchAnchorWidth = false,
}: DropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(undefined);

  /* ── mount / unmount animation ────────────────── */

  const [isMounted, setIsMounted] = useState(open);
  const [anim, setAnim] = useState<"enter" | "exit" | "idle">(open ? "enter" : "idle");
  const exitTimerRef = useRef<number>(undefined);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    clearTimeout(exitTimerRef.current);

    if (open && !wasOpen) {
      setIsMounted(true);
      setAnim("enter");
    } else if (!open && wasOpen) {
      setAnim("exit");
      exitTimerRef.current = window.setTimeout(
        () => setIsMounted(false),
        EXIT_MS + 50
      );
      anchorRef.current?.focus();
    }
    return () => clearTimeout(exitTimerRef.current);
  }, [open]);

  const onAnimEnd = useCallback(() => {
    if (anim === "enter") setAnim("idle");
    else if (anim === "exit") {
      clearTimeout(exitTimerRef.current);
      setIsMounted(false);
      setAnim("idle");
    }
  }, [anim]);

  /* ── scroll area max-height (measured) ────────── */

  const [scrollMaxH, setScrollMaxH] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (!isMounted) return;
    const hH = headerRef.current?.offsetHeight ?? 0;
    const fH = footerRef.current?.offsetHeight ?? 0;
    setScrollMaxH(maxHeight - hH - fH);
  }, [isMounted, maxHeight, header, footer]);

  /* ── positioning ──────────────────────────────── */

  const [pos, setPos] = useState({ x: 0, y: 0, side: "bottom" as Side });

  const updatePos = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;

    const anchorRect = anchor.getBoundingClientRect();
    const panelW = matchAnchorWidth ? anchorRect.width : width;
    const panelH = panel.offsetHeight;

    setPos(calcPosition(anchorRect, panelW, panelH, placement, offset));
  }, [anchorRef, placement, offset, width, matchAnchorWidth]);

  const updatePosRef = useRef(updatePos);
  updatePosRef.current = updatePos;

  useLayoutEffect(() => {
    if (isMounted) updatePosRef.current();
  }, [isMounted, placement, offset, width, matchAnchorWidth]);

  useEffect(() => {
    if (!isMounted) return;
    const anchor = anchorRef.current;
    if (!anchor) return;

    const tick = () => {
      cancelAnimationFrame(rafRef.current!);
      rafRef.current = requestAnimationFrame(() => updatePosRef.current());
    };

    const ancestors = getScrollAncestors(anchor);
    for (const a of ancestors)
      a.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);

    const ro = new ResizeObserver(tick);
    ro.observe(anchor);
    if (panelRef.current) ro.observe(panelRef.current);

    return () => {
      for (const a of ancestors) a.removeEventListener("scroll", tick);
      window.removeEventListener("resize", tick);
      ro.disconnect();
      cancelAnimationFrame(rafRef.current!);
    };
  }, [isMounted, anchorRef]);

  /* ── theme inheritance ────────────────────────── */

  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    setTheme(
      el.closest<HTMLElement>("[data-theme]")?.getAttribute("data-theme") ?? null
    );
  }, [anchorRef, isMounted]);

  /* ── click outside ────────────────────────────── */

  useEffect(() => {
    if (!isMounted || !closeOnClickOutside) return;

    const handler = (e: MouseEvent) => {
      const panel = panelRef.current;
      const anchor = anchorRef.current;
      const target = e.target as Node;
      if (panel?.contains(target) || anchor?.contains(target)) return;
      onClose();
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMounted, closeOnClickOutside, onClose, anchorRef]);

  /* ── escape key ───────────────────────────────── */

  useEffect(() => {
    if (!isMounted || !closeOnEscape) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isMounted, closeOnEscape, onClose]);

  /* ── keyboard navigation ────────────────────────
     Manages arrow-key roving focus between options,
     focus-traps Tab within the panel, and auto-focuses
     the search input (or first option) on open.
     ─────────────────────────────────────────────── */

  const getOptions = useCallback((): HTMLElement[] => {
    const panel = panelRef.current;
    if (!panel) return [];
    return Array.from(
      panel.querySelectorAll<HTMLElement>(
        '[role="option"]:not([aria-disabled="true"])'
      )
    );
  }, []);

  const getHeaderInput = useCallback((): HTMLElement | null => {
    return (
      headerRef.current?.querySelector<HTMLElement>(
        'input:not([type="checkbox"]):not([type="radio"])'
      ) ?? null
    );
  }, []);

  const getFocusables = useCallback((): HTMLElement[] => {
    const panel = panelRef.current;
    if (!panel) return [];
    return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SEL));
  }, []);

  useEffect(() => {
    if (!isMounted || anim !== "enter") return;
    const timer = setTimeout(() => {
      const input = getHeaderInput();
      if (input) {
        input.focus();
        return;
      }
      const opts = getOptions();
      if (opts.length > 0) opts[0].focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [isMounted, anim, getHeaderInput, getOptions]);

  const handlePanelKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      const { key, shiftKey } = e;

      /* ── Arrow Up / Down ── */
      if (key === "ArrowDown" || key === "ArrowUp") {
        e.preventDefault();
        const opts = getOptions();
        if (opts.length === 0) return;

        const active = document.activeElement as HTMLElement;
        const hInput = getHeaderInput();
        const inHeader = hInput && headerRef.current?.contains(active);

        let idx = opts.indexOf(active);
        if (idx < 0) {
          const closest = active.closest('[role="option"]') as HTMLElement;
          if (closest) idx = opts.indexOf(closest);
        }

        if (key === "ArrowDown") {
          if (inHeader || idx < 0) focusVisible(opts[0]);
          else if (idx < opts.length - 1) focusVisible(opts[idx + 1]);
        } else {
          if (idx === 0 && hInput) focusVisible(hInput);
          else if (idx > 0) focusVisible(opts[idx - 1]);
        }

        requestAnimationFrame(() => {
          const f = document.activeElement as HTMLElement;
          if (f && panel.contains(f))
            f.scrollIntoView?.({ block: "nearest" });
        });
      }

      /* ── Home / End (skip when inside a text input) ── */
      const isTextInput =
        (document.activeElement as HTMLElement)?.tagName === "INPUT" &&
        (document.activeElement as HTMLInputElement)?.type !== "checkbox" &&
        (document.activeElement as HTMLInputElement)?.type !== "radio";

      if (key === "Home" && !isTextInput) {
        e.preventDefault();
        const opts = getOptions();
        focusVisible(opts[0]);
        opts[0]?.scrollIntoView?.({ block: "nearest" });
      }
      if (key === "End" && !isTextInput) {
        e.preventDefault();
        const opts = getOptions();
        const last = opts[opts.length - 1];
        focusVisible(last);
        last?.scrollIntoView?.({ block: "nearest" });
      }

      /* ── Focus trap (Tab / Shift-Tab) ── */
      if (key === "Tab") {
        const focusables = getFocusables();
        if (focusables.length === 0) return;

        const active = document.activeElement as HTMLElement;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (shiftKey) {
          if (active === first || !panel.contains(active)) {
            e.preventDefault();
            focusVisible(last);
          }
        } else {
          if (active === last || !panel.contains(active)) {
            e.preventDefault();
            focusVisible(first);
          }
        }
      }
    },
    [getOptions, getHeaderInput, getFocusables]
  );

  /* ── computed width ───────────────────────────── */

  const resolvedWidth = matchAnchorWidth
    ? anchorRef.current?.getBoundingClientRect().width ?? width
    : width;

  /* ── render ───────────────────────────────────── */

  if (!isMounted) return null;

  const capSide = pos.side.charAt(0).toUpperCase() + pos.side.slice(1);
  const animClass =
    anim === "enter"
      ? styles[`enter${capSide}`]
      : anim === "exit"
        ? styles[`exit${capSide}`]
        : "";

  const panelStyle: CSSProperties = {
    position: "fixed",
    top: Math.round(pos.y),
    left: Math.round(pos.x),
    width: resolvedWidth,
    zIndex: 9999,
  };

  return createPortal(
    <div
      ref={panelRef}
      role="listbox"
      className={cx(styles.panel, animClass, className)}
      style={panelStyle}
      data-theme={theme || undefined}
      onAnimationEnd={onAnimEnd}
      onKeyDown={handlePanelKeyDown}
    >
      {header && (
        <div ref={headerRef} className={styles.header}>{header}</div>
      )}

      <ScrollFade
        direction="vertical"
        surface="over"
        scrollAreaClassName={styles.options}
        scrollAreaStyle={scrollMaxH != null ? { maxHeight: scrollMaxH } : undefined}
      >
        {children}
      </ScrollFade>

      {footer && (
        <div ref={footerRef} className={styles.footer}>{footer}</div>
      )}
    </div>,
    document.body
  );
}

Dropdown.displayName = "Dropdown";
