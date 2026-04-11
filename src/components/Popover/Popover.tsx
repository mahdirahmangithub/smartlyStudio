import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useId,
  type ReactNode,
  type CSSProperties,
  type RefObject,
  type HTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { Header, type HeaderSize } from "../Header";
import { Footer } from "../Footer";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import styles from "./Popover.module.css";
import { cx } from "../../utils/cx";

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */

export type PopoverPlacement =
  | "bottom-start"
  | "bottom-end"
  | "bottom"
  | "top-start"
  | "top-end"
  | "top"
  | "left-start"
  | "left-end"
  | "left"
  | "right-start"
  | "right-end"
  | "right";

export type PopoverDensity = "none" | "sm" | "lg";

/** A virtual positioning anchor — any object that can report its bounding rect. */
export interface VirtualAnchor {
  getBoundingClientRect: () => DOMRect;
}

export type PopoverAnchorRef =
  | RefObject<HTMLElement | null>
  | RefObject<VirtualAnchor | null>;

export interface PopoverProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "content"> {
  open: boolean;
  onClose: () => void;
  anchorRef: PopoverAnchorRef;
  placement?: PopoverPlacement;
  density?: PopoverDensity;
  width?: number | "auto";
  maxHeight?: number;
  offset?: number;

  title?: string;
  description?: string;
  headerSize?: HeaderSize;
  headerSlot?: ReactNode;
  headerActions?: ReactNode;
  onBack?: () => void;

  footerActions?: ReactNode;
  footerExtraAction?: ReactNode;
  footerSlot?: ReactNode;
  footerFullWidth?: boolean;

  children?: ReactNode;

  /** Use fixed positioning — popover stays in place when the page scrolls */
  fixed?: boolean;

  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  autoFocus?: boolean;
  trapFocus?: boolean;

  /** ARIA role — "dialog" for general popovers, "toolbar" for selection toolbars */
  role?: "dialog" | "toolbar";

  /** Additional pixel offset applied after positioning (useful for drag) */
  positionOffset?: { x: number; y: number };
}

/* ═══════════════════════════════════════════════════════════════════════
   Positioning helpers (copied from Dropdown)
   ═══════════════════════════════════════════════════════════════════════ */

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "end" | undefined;

function splitPlacement(p: PopoverPlacement): [Side, Align] {
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
  placement: PopoverPlacement,
  offset: number,
): { x: number; y: number; side: Side } {
  const [preferredSide, align] = splitPlacement(placement);

  let x: number;
  let y: number;
  let side: Side;

  if (preferredSide === "left" || preferredSide === "right") {
    if (align === "start") {
      y = anchorRect.top;
    } else if (align === "end") {
      y = anchorRect.bottom - panelH;
    } else {
      y = anchorRect.top + anchorRect.height / 2 - panelH / 2;
    }

    const xLeft = anchorRect.left - panelW - offset;
    const xRight = anchorRect.right + offset;
    const overflowLeft = Math.max(0, VP_PAD - xLeft);
    const overflowRight = Math.max(
      0,
      xRight + panelW - window.innerWidth + VP_PAD,
    );

    if (preferredSide === "right") {
      if (overflowRight > 0 && overflowLeft < overflowRight) {
        side = "left";
        x = xLeft;
      } else {
        side = "right";
        x = xRight;
      }
    } else {
      if (overflowLeft > 0 && overflowRight < overflowLeft) {
        side = "right";
        x = xRight;
      } else {
        side = "left";
        x = xLeft;
      }
    }
  } else {
    if (align === "start") {
      x = anchorRect.left;
    } else if (align === "end") {
      x = anchorRect.right - panelW;
    } else {
      x = anchorRect.left + anchorRect.width / 2 - panelW / 2;
    }

    const yBelow = anchorRect.bottom + offset;
    const yAbove = anchorRect.top - panelH - offset;
    const overflowBelow = Math.max(
      0,
      yBelow + panelH - window.innerHeight + VP_PAD,
    );
    const overflowAbove = Math.max(0, VP_PAD - yAbove);

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
  }

  x = Math.max(VP_PAD, Math.min(x, window.innerWidth - panelW - VP_PAD));
  y = Math.max(VP_PAD, Math.min(y, window.innerHeight - panelH - VP_PAD));

  return { x, y, side };
}

/* ═══════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════ */

const EXIT_MS = 200;
const DEFAULT_WIDTH = 382;
const DEFAULT_MAX_HEIGHT = 484;

const FOCUSABLE_SEL =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isElement(
  anchor: HTMLElement | VirtualAnchor | null,
): anchor is HTMLElement {
  return anchor != null && "focus" in anchor;
}

/* ═══════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════ */

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  function Popover(
    {
      open,
      onClose,
      anchorRef,
      placement = "bottom-start",
      density = "sm",
      width = DEFAULT_WIDTH,
      maxHeight = DEFAULT_MAX_HEIGHT,
      offset = 4,

      title,
      description,
      headerSize = "md",
      headerSlot,
      headerActions,
      onBack,

      footerActions,
      footerExtraAction,
      footerSlot,
      footerFullWidth,

      children,

      fixed = false,
      closeOnClickOutside = true,
      closeOnEscape = true,
      autoFocus = true,
      trapFocus = false,

      role: panelRole = "dialog",
      positionOffset,
      id: idProp,
      className,
      ...rest
    },
    ref,
  ) {
    const autoId = useId();
    const id = idProp ?? autoId;
    const titleId = `${id}-title`;
    const descId = `${id}-desc`;

    const panelRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(undefined);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    type DismissReason = "escape" | "click-outside" | "programmatic";
    const dismissReasonRef = useRef<DismissReason>("programmatic");

    const hasHeader = title != null;
    const hasFooter =
      footerActions != null || footerExtraAction != null || footerSlot != null;
    const headerFooterDensity = density === "lg" ? "lg" : "sm";

    /* ── mount / unmount animation ────────────────── */

    const [isMounted, setIsMounted] = useState(open);
    const [anim, setAnim] = useState<"enter" | "exit" | "idle">(
      open ? "enter" : "idle",
    );
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
          EXIT_MS + 50,
        );
        if (dismissReasonRef.current === "escape") {
          const anchor = anchorRef.current;
          if (isElement(anchor)) anchor.focus({ preventScroll: true });
        }
        dismissReasonRef.current = "programmatic";
      }
      return () => clearTimeout(exitTimerRef.current);
    }, [open, anchorRef]);

    const animRef = useRef(anim);
    animRef.current = anim;

    const onAnimEnd = useCallback(() => {
      if (animRef.current === "enter") setAnim("idle");
      else if (animRef.current === "exit") {
        clearTimeout(exitTimerRef.current);
        setIsMounted(false);
        setAnim("idle");
      }
    }, []);

    /* ── content max-height (measured) ────────────── */

    const headerMeasureRef = useRef<HTMLElement>(null);
    const footerMeasureRef = useRef<HTMLElement>(null);
    const [contentMaxH, setContentMaxH] = useState<number | undefined>(
      undefined,
    );

    useLayoutEffect(() => {
      if (!isMounted) return;
      const hH = headerMeasureRef.current?.offsetHeight ?? 0;
      const fH = footerMeasureRef.current?.offsetHeight ?? 0;
      const next = maxHeight - hH - fH;
      setContentMaxH((prev) => (prev === next ? prev : next));
    }, [isMounted, maxHeight]);

    /* ── positioning ──────────────────────────────── */

    const [pos, setPos] = useState({
      x: 0,
      y: 0,
      side: "bottom" as Side,
    });

    const updatePos = useCallback(() => {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;

      const anchorRect = anchor.getBoundingClientRect();
      const panelH = panel.offsetHeight;
      const panelW = typeof width === "number" ? width : panel.offsetWidth;

      const vp = calcPosition(anchorRect, panelW, panelH, placement, offset);
      setPos({
        x: fixed ? vp.x : vp.x + window.scrollX,
        y: fixed ? vp.y : vp.y + window.scrollY,
        side: vp.side,
      });
    }, [anchorRef, placement, offset, width, fixed]);

    const updatePosRef = useRef(updatePos);
    updatePosRef.current = updatePos;

    useLayoutEffect(() => {
      if (isMounted) updatePosRef.current();
    }, [isMounted, placement, offset, width, fixed]);

    useEffect(() => {
      if (!isMounted) return;

      const tick = () => {
        cancelAnimationFrame(rafRef.current!);
        rafRef.current = requestAnimationFrame(() => updatePosRef.current());
      };

      window.addEventListener("resize", tick);

      const ro = new ResizeObserver(tick);
      if (panelRef.current) ro.observe(panelRef.current);

      return () => {
        window.removeEventListener("resize", tick);
        ro.disconnect();
        cancelAnimationFrame(rafRef.current!);
      };
    }, [isMounted]);

    /* ── theme inheritance ────────────────────────── */

    const themeAnchorRef = useRef<HTMLSpanElement>(null);
    const [theme, setTheme] = useState<string | null>(null);

    useEffect(() => {
      const node = themeAnchorRef.current;
      if (!node) return;
      const themed = node.closest<HTMLElement>("[data-theme]");
      setTheme(themed?.getAttribute("data-theme") ?? null);
      if (!themed) return;
      const obs = new MutationObserver(() =>
        setTheme(themed.getAttribute("data-theme")),
      );
      obs.observe(themed, { attributes: true, attributeFilter: ["data-theme"] });
      return () => obs.disconnect();
    }, [isMounted]);

    /* ── click outside ────────────────────────────── */

    useEffect(() => {
      if (!isMounted || !closeOnClickOutside) return;

      const handler = (e: MouseEvent) => {
        const panel = panelRef.current;
        const anchor = anchorRef.current;
        const target = e.target as Node;
        if (panel?.contains(target)) return;
        if (isElement(anchor) && anchor.contains(target)) return;
        dismissReasonRef.current = "click-outside";
        onCloseRef.current();
      };

      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [isMounted, closeOnClickOutside, anchorRef]);

    /* ── escape key ───────────────────────────────── */

    useEffect(() => {
      if (!isMounted || !closeOnEscape) return;

      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          dismissReasonRef.current = "escape";
          onCloseRef.current();
        }
      };

      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }, [isMounted, closeOnEscape]);

    /* ── focus management ─────────────────────────── */

    useFocusTrap(panelRef, isMounted && trapFocus);

    useEffect(() => {
      if (!isMounted || anim !== "enter" || !autoFocus) return;
      const timer = setTimeout(() => {
        const panel = panelRef.current;
        if (!panel) return;

        const firstFocusable = panel.querySelector<HTMLElement>(FOCUSABLE_SEL);
        if (firstFocusable) {
          firstFocusable.focus({ preventScroll: true });
        } else {
          panel.focus({ preventScroll: true });
        }
      }, 0);
      return () => clearTimeout(timer);
    }, [isMounted, anim, autoFocus]);

    /* ── focus return on close ────────────────────── */

    useEffect(() => {
      if (!open && prevOpenRef.current === false) return;
      return () => {
        if (dismissReasonRef.current !== "escape") {
          const anchor = anchorRef.current;
          if (isElement(anchor)) anchor.focus({ preventScroll: true });
        }
      };
    }, [open, anchorRef]);

    /* ── ref merge ────────────────────────────────── */

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        (panelRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref],
    );

    /* ── render ───────────────────────────────────── */

    const themeSpan = <span ref={themeAnchorRef} hidden />;

    if (!isMounted) return themeSpan;

    const capSide =
      pos.side.charAt(0).toUpperCase() + pos.side.slice(1);
    const animClass =
      anim === "enter"
        ? styles[`enter${capSide}`]
        : anim === "exit"
          ? styles[`exit${capSide}`]
          : "";

    const contentDensityClass =
      density === "lg"
        ? styles.contentLg
        : density === "sm"
          ? styles.contentSm
          : styles.contentNone;

    const panelStyle: CSSProperties = {
      position: fixed ? "fixed" : "absolute",
      top: Math.round(pos.y + (positionOffset?.y ?? 0)),
      left: Math.round(pos.x + (positionOffset?.x ?? 0)),
      width: width ?? "auto",
      maxHeight,
      zIndex: 9999,
    };

    return (
      <>
        {themeSpan}
        {createPortal(
          <div
            ref={setRefs}
            id={id}
            role={panelRole}
            aria-modal={panelRole === "dialog" ? false : undefined}
            aria-labelledby={hasHeader ? titleId : undefined}
            aria-describedby={hasHeader && description ? descId : undefined}
            tabIndex={-1}
            className={cx(styles.panel, animClass, className)}
            style={panelStyle}
            data-theme={theme || undefined}
            onAnimationEnd={onAnimEnd}
            {...rest}
          >
            {hasHeader && (
              <Header
                ref={headerMeasureRef}
                id={titleId}
                size={headerSize}
                density={headerFooterDensity}
                title={title!}
                description={description}
                descriptionId={description ? descId : undefined}
                divider
                slot={headerSlot}
                actions={headerActions}
                onBack={onBack}
                onClose={onClose}
              />
            )}

            <div
              className={cx(styles.content, contentDensityClass)}
              style={
                contentMaxH != null ? { maxHeight: contentMaxH } : undefined
              }
            >
              <div className={styles.contentInner}>{children}</div>
            </div>

            {hasFooter && (
              <Footer
                ref={footerMeasureRef}
                density={headerFooterDensity}
                divider
                actions={footerActions}
                extraAction={footerExtraAction}
                slot={footerSlot}
                fullWidth={footerFullWidth}
              />
            )}
          </div>,
          document.body,
        )}
      </>
    );
  },
);

Popover.displayName = "Popover";
