import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { Dimmer } from "../Dimmer";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import styles from "./Drawer.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export type DrawerDensity = "none" | "sm" | "lg";
export type DrawerMode = "overlay" | "push";
export type DrawerPlacement = "viewport" | "container";

type SlidePhase = "idle" | "entering" | "open" | "exiting";

export interface DrawerProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  open: boolean;
  onClose?: () => void;
  density?: DrawerDensity;

  title?: string;
  description?: string;
  headerSize?: "sm" | "md" | "lg" | "xl" | "2xl";
  headerSlot?: ReactNode;
  headerActions?: ReactNode;
  onBack?: () => void;

  footerActions?: ReactNode;
  footerExtraAction?: ReactNode;
  footerSlot?: ReactNode;
  footerFullWidth?: boolean;

  children?: ReactNode;
  scrollFade?: boolean;

  mode?: DrawerMode;
  placement?: DrawerPlacement;

  /** Accessible label — used when no `title` is provided */
  ariaLabel?: string;

  width?: number | string;
  resizable?: boolean;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number) => void;
  backdrop?: boolean;
}

export const Drawer = forwardRef<HTMLElement, DrawerProps>(
  function Drawer(
    {
      open,
      onClose,
      density = "sm",
      title,
      description,
      headerSize = "lg",
      headerSlot,
      headerActions,
      onBack,
      footerActions,
      footerExtraAction,
      footerSlot,
      footerFullWidth,
      children,
      ariaLabel,
      mode = "overlay",
      placement = "viewport",
      width,
      resizable = false,
      minWidth = 280,
      maxWidth = 960,
      onWidthChange,
      backdrop: showBackdrop = true,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const titleId = useId();
    const descId = useId();
    const panelRef = useRef<HTMLElement>(null);
    const portalAnchorRef = useRef<HTMLSpanElement>(null);
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
    const [resizedWidth, setResizedWidth] = useState<number | null>(null);
    const [isResizing, setIsResizing] = useState(false);

    const isOverlay = mode === "overlay";
    const isContained = placement === "container";
    const isContainedOverlay = isContained && isOverlay;
    const headerFooterDensity = density === "lg" ? "lg" : "sm";
    const hasHeader = title != null;
    const hasFooter = footerActions != null || footerExtraAction != null;

    /* ────────────────────────────────────────────
     * Phase state machine (JS-controlled transitions)
     * Only used for viewport overlay + push modes.
     * Contained overlay uses a wrapper + pure CSS transitions.
     * ──────────────────────────────────────────── */

    const [phase, setPhase] = useState<SlidePhase>("idle");
    const prevOpenRef = useRef(false);

    useEffect(() => {
      if (isContainedOverlay) return;
      if (open !== prevOpenRef.current) {
        if (open) {
          setPhase((p) =>
            p === "idle" || p === "exiting" ? "entering" : p,
          );
        } else {
          setPhase((p) =>
            p === "entering" || p === "open" ? "exiting" : p,
          );
        }
        prevOpenRef.current = open;
      }
    }, [open, isContainedOverlay]);

    useEffect(() => {
      if (isContainedOverlay) return;
      const panel = panelRef.current;
      if (!panel) return;

      if (phase === "entering") {
        const isHidden =
          !panel.style.visibility || panel.style.visibility === "hidden";

        if (isHidden) {
          panel.style.transition = "none";
          panel.style.transform = "translateX(100%)";
          panel.style.visibility = "visible";
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          panel.scrollTop; // forced reflow — commit off-screen position before transition
        }

        panel.style.transition =
          "transform var(--animation-drawer-enter-duration) var(--animation-drawer-enter-easing)";
        panel.style.transform = "none";
      } else if (phase === "exiting") {
        panel.style.transition =
          "transform var(--animation-drawer-exit-duration) var(--animation-drawer-exit-easing)";
        panel.style.transform = "translateX(100%)";
      } else if (phase === "idle") {
        panel.style.transition = "none";
        panel.style.transform = "translateX(100%)";
        panel.style.visibility = "hidden";
      } else if (phase === "open") {
        panel.style.transition = "";
      }
    }, [phase, isContainedOverlay]);

    const handlePanelTransitionEnd = useCallback(
      (e: React.TransitionEvent) => {
        if (e.target !== panelRef.current || e.propertyName !== "transform")
          return;
        setPhase((p) => {
          if (p === "entering") return "open";
          if (p === "exiting") return "idle";
          return p;
        });
      },
      [],
    );

    const isActive = isContainedOverlay
      ? open
      : phase === "entering" || phase === "open";

    /* ──────────────── Portal target ──────────────── */

    useEffect(() => {
      if (isContainedOverlay) return;
      const anchor = portalAnchorRef.current;
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
    }, [isContainedOverlay]);

    /* ──────────────── Focus trap ──────────────── */

    const [containedFocusReady, setContainedFocusReady] = useState(false);

    useEffect(() => {
      if (!isContainedOverlay) {
        setContainedFocusReady(false);
        return;
      }
      if (!open) {
        setContainedFocusReady(false);
        return;
      }
      let id1: number;
      let id2: number;
      id1 = requestAnimationFrame(() => {
        id2 = requestAnimationFrame(() => {
          setContainedFocusReady(true);
        });
      });
      return () => {
        cancelAnimationFrame(id1);
        cancelAnimationFrame(id2);
      };
    }, [open, isContainedOverlay]);

    const shouldTrapFocus =
      isOverlay &&
      (isContainedOverlay
        ? containedFocusReady && showBackdrop
        : isActive);

    useFocusTrap(panelRef, shouldTrapFocus);

    /* ──────────────── Escape to close ──────────────── */

    useEffect(() => {
      if (!isActive || !onClose) return;
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }, [isActive, onClose]);

    /* ──────────────── Body scroll lock ──────────────── */

    useEffect(() => {
      if (!isOverlay || isContained || phase === "idle") return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [isOverlay, isContained, phase]);

    /* ──────────────── Resize ──────────────── */

    useEffect(() => {
      setResizedWidth(null);
    }, [width]);

    const rafId = useRef(0);

    const handleResizePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        const panel = panelRef.current;
        const handle = e.currentTarget;
        if (!panel) return;

        const startX = e.clientX;
        const startWidth = panel.getBoundingClientRect().width;

        setIsResizing(true);
        handle.setPointerCapture(e.pointerId);

        const onMove = (ev: PointerEvent) => {
          cancelAnimationFrame(rafId.current);
          rafId.current = requestAnimationFrame(() => {
            const delta = startX - ev.clientX;
            const clamped = Math.min(
              maxWidth,
              Math.max(minWidth, startWidth + delta),
            );
            panel.style.width = `${clamped}px`;
          });
        };

        const onUp = () => {
          cancelAnimationFrame(rafId.current);
          setIsResizing(false);
          const finalWidth = panel.getBoundingClientRect().width;
          setResizedWidth(finalWidth);
          onWidthChange?.(finalWidth);
          handle.removeEventListener("pointermove", onMove);
          handle.removeEventListener("pointerup", onUp);
          handle.removeEventListener("lostpointercapture", onUp);
        };

        handle.addEventListener("pointermove", onMove);
        handle.addEventListener("pointerup", onUp);
        handle.addEventListener("lostpointercapture", onUp);
      },
      [minWidth, maxWidth, onWidthChange],
    );

    /* ──────────────── Render ──────────────── */

    const anchor = <span ref={portalAnchorRef} style={{ display: "none" }} />;

    const resolvedWidth = resizedWidth ?? width;
    const panelStyle = {
      ...style,
      ...(resolvedWidth != null
        ? {
            width:
              typeof resolvedWidth === "number"
                ? `${resolvedWidth}px`
                : resolvedWidth,
          }
        : undefined),
    };

    const contentClass = cx(
      styles.content,
      density === "none" && styles.contentNone,
      density === "sm" && styles.contentSm,
      density === "lg" && styles.contentLg,
    );

    const panel = (
      <aside
        ref={(node) => {
          (panelRef as React.MutableRefObject<HTMLElement | null>).current =
            node;
          if (typeof ref === "function") ref(node);
          else if (ref)
            (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        role={isOverlay ? "dialog" : "complementary"}
        aria-modal={(isOverlay && !isContained) || undefined}
        aria-labelledby={hasHeader ? titleId : undefined}
        aria-label={!hasHeader ? ariaLabel : undefined}
        aria-describedby={description ? descId : undefined}
        aria-hidden={!isActive}
        inert={!isActive || undefined}
        tabIndex={-1}
        className={cx(
          styles.panel,
          isResizing && styles.resizing,
          mode === "push" && styles.push,
          className,
        )}
        style={panelStyle}
        data-open={isContainedOverlay && open ? "" : undefined}
        onTransitionEnd={isContainedOverlay ? undefined : handlePanelTransitionEnd}
        {...rest}
      >
        {resizable && (
          <div
            className={styles.resizeHandle}
            aria-hidden="true"
            onPointerDown={handleResizePointerDown}
          />
        )}

        {hasHeader && (
          <Header
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

        <div className={contentClass}>
          <div className={styles.contentInner}>{children}</div>
        </div>

        {hasFooter && (
          <Footer
            density={headerFooterDensity}
            divider
            actions={footerActions}
            extraAction={footerExtraAction}
            slot={footerSlot}
            fullWidth={footerFullWidth}
          />
        )}
      </aside>
    );

    if (isOverlay) {
      if (isContained) {
        return (
          <>
            {showBackdrop && (
              <Dimmer
                open={open}
                position="absolute"
                enterDuration="var(--animation-drawer-enter-duration)"
                enterEasing="var(--animation-drawer-enter-easing)"
                exitDuration="var(--animation-drawer-exit-duration)"
                exitEasing="var(--animation-drawer-exit-easing)"
                onClick={onClose}
              />
            )}
            <div className={styles.containedSlot}>{panel}</div>
          </>
        );
      }

      return (
        <>
          {anchor}
          {portalTarget &&
            createPortal(
              <>
                {showBackdrop && (
                  <Dimmer
                    open={isActive}
                    position="fixed"
                    enterDuration="var(--animation-drawer-enter-duration)"
                    enterEasing="var(--animation-drawer-enter-easing)"
                    exitDuration="var(--animation-drawer-exit-duration)"
                    exitEasing="var(--animation-drawer-exit-easing)"
                    onClick={onClose}
                  />
                )}
                {panel}
              </>,
              portalTarget,
            )}
        </>
      );
    }

    return (
      <>
        {anchor}
        {panel}
      </>
    );
  },
);

Drawer.displayName = "Drawer";
