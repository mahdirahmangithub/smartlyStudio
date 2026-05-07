import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { Dimmer } from "../Dimmer";
import { useScrollFade } from "../ScrollFade/ScrollFade";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import styles from "./Drawer.module.css";
import { cx } from "../../utils/cx";


export type DrawerDensity = "none" | "sm" | "lg";
export type DrawerMode = "overlay" | "push";
export type DrawerPlacement = "viewport" | "container";
export type DrawerSide = "right" | "bottom";

type SlidePhase = "idle" | "entering" | "open" | "exiting";

export interface DrawerProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  open: boolean;
  onClose?: () => void;
  density?: DrawerDensity;

  title?: string;
  description?: string;
  headerSize?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Show the bottom divider in the drawer header. Defaults to `true`. */
  headerDivider?: boolean;
  headerSlot?: ReactNode;
  headerActions?: ReactNode;
  onBack?: () => void;

  footerActions?: ReactNode;
  footerExtraAction?: ReactNode;
  footerSlot?: ReactNode;
  footerFullWidth?: boolean;
  /** Show the top divider in the drawer footer. Defaults to `true`. */
  footerDivider?: boolean;

  children?: ReactNode;
  /** Render fade overlays at the top/bottom of the scrollable content. */
  scrollFade?: boolean;

  /** Which edge the drawer slides in from. `"bottom"` only supports overlay mode. */
  side?: DrawerSide;
  mode?: DrawerMode;
  placement?: DrawerPlacement;

  /** Accessible label — used when no `title` is provided */
  ariaLabel?: string;

  width?: number | string;
  height?: number | string;
  resizable?: boolean;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number) => void;
  minHeight?: number;
  maxHeight?: number;
  onHeightChange?: (height: number) => void;
  backdrop?: boolean;
  /** Lock page scroll while the drawer is open (overlay mode only). Defaults to `true`. */
  lockScroll?: boolean;
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
      headerDivider = true,
      headerSlot,
      headerActions,
      onBack,
      footerActions,
      footerExtraAction,
      footerSlot,
      footerFullWidth,
      footerDivider = true,
      children,
      scrollFade = false,
      ariaLabel,
      side = "right",
      mode = "overlay",
      placement = "viewport",
      width,
      height,
      resizable = false,
      minWidth = 280,
      maxWidth = 960,
      onWidthChange,
      minHeight = 200,
      maxHeight = 800,
      onHeightChange,
      backdrop: showBackdrop = true,
      lockScroll = true,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const titleId = useId();
    const descId = useId();
    const panelRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const portalAnchorRef = useRef<HTMLSpanElement>(null);
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
    const [resizedSize, setResizedSize] = useState<number | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    const isBottom = side === "bottom";
    const resolvedMode = isBottom ? "overlay" : mode;
    const isOverlay = resolvedMode === "overlay";
    const isContained = placement === "container";
    const isContainedOverlay = isContained && isOverlay;
    const headerFooterDensity = density === "lg" ? "lg" : "sm";
    const hasHeader = title != null;
    const hasFooter = footerActions != null || footerExtraAction != null;
    const offScreen = isBottom ? "translateY(100%)" : "translateX(100%)";

    const {
      showStart: showContentStart,
      showEnd: showContentEnd,
      onScroll: onContentScroll,
    } = useScrollFade(contentRef, "vertical");

    /* ────────────────────────────────────────────
     * Phase state machine (JS-controlled transitions)
     * Only used for viewport overlay + push modes.
     * Contained overlay uses pure CSS transitions
     * via the .containedSlot wrapper + data-open.
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
          panel.style.transform = offScreen;
          panel.style.visibility = "visible";
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          panel.scrollTop;
        }

        panel.style.transition =
          "transform var(--animation-drawer-enter-duration) var(--animation-drawer-enter-easing)";
        panel.style.transform = "none";
      } else if (phase === "exiting") {
        panel.style.transition =
          "transform var(--animation-drawer-exit-duration) var(--animation-drawer-exit-easing)";
        panel.style.transform = offScreen;
      } else if (phase === "idle") {
        panel.style.transition = "none";
        panel.style.transform = offScreen;
        panel.style.visibility = "hidden";
      } else if (phase === "open") {
        panel.style.transition = "";
      }
    }, [phase, isContainedOverlay, offScreen]);

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
    const isPhaseVisible = phase !== "idle";

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
      if (!isContainedOverlay || !showBackdrop) {
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
    }, [open, isContainedOverlay, showBackdrop]);

    const shouldTrapFocus =
      isOverlay &&
      (isContainedOverlay
        ? containedFocusReady && showBackdrop
        : isActive);

    useFocusTrap(panelRef, shouldTrapFocus);

    /* ──────────────── Escape to close ──────────────── */

    useEffect(() => {
      if (!isActive) return;
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onCloseRef.current?.();
        }
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }, [isActive]);

    /* ──────────────── Body scroll lock ──────────────── */

    useEffect(() => {
      if (!lockScroll || !isOverlay || isContained || !isPhaseVisible) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [lockScroll, isOverlay, isContained, isPhaseVisible]);

    /* ──────────────── Resize ──────────────── */

    useEffect(() => {
      setResizedSize(null);
    }, [isBottom ? height : width]);

    const rafId = useRef(0);

    const handleResizePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        const panel = panelRef.current;
        const handle = e.currentTarget;
        if (!panel) return;

        const rect = panel.getBoundingClientRect();
        setIsResizing(true);
        handle.setPointerCapture(e.pointerId);

        const startPos = isBottom ? e.clientY : e.clientX;
        const startSize = isBottom ? rect.height : rect.width;
        const min = isBottom ? minHeight : minWidth;
        const max = isBottom ? maxHeight : maxWidth;
        const prop = isBottom ? "height" : "width";
        const onSizeChange = isBottom ? onHeightChange : onWidthChange;

        const onMove = (ev: PointerEvent) => {
          cancelAnimationFrame(rafId.current);
          rafId.current = requestAnimationFrame(() => {
            const delta = startPos - (isBottom ? ev.clientY : ev.clientX);
            const clamped = Math.min(max, Math.max(min, startSize + delta));
            panel.style[prop] = `${clamped}px`;
          });
        };

        const onUp = () => {
          cancelAnimationFrame(rafId.current);
          setIsResizing(false);
          const finalSize = panel.getBoundingClientRect()[prop];
          setResizedSize(finalSize);
          onSizeChange?.(finalSize);
          handle.removeEventListener("pointermove", onMove);
          handle.removeEventListener("pointerup", onUp);
          handle.removeEventListener("lostpointercapture", onUp);
        };

        handle.addEventListener("pointermove", onMove);
        handle.addEventListener("pointerup", onUp);
        handle.addEventListener("lostpointercapture", onUp);
      },
      [isBottom, minWidth, maxWidth, onWidthChange, minHeight, maxHeight, onHeightChange],
    );

    /* ──────────────── Render ──────────────── */

    const anchor = <span ref={portalAnchorRef} style={{ display: "none" }} />;

    const panelStyle = useMemo(() => {
      const sizeOverride: React.CSSProperties = {};
      if (isBottom) {
        const resolvedHeight = resizedSize ?? height;
        if (resolvedHeight != null) {
          sizeOverride.height =
            typeof resolvedHeight === "number" ? `${resolvedHeight}px` : resolvedHeight;
        }
      } else {
        const resolvedWidth = resizedSize ?? width;
        if (resolvedWidth != null) {
          sizeOverride.width =
            typeof resolvedWidth === "number" ? `${resolvedWidth}px` : resolvedWidth;
        }
      }
      return { ...style, ...sizeOverride };
    }, [style, isBottom, resizedSize, height, width]);

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
          resolvedMode === "push" && styles.push,
          className,
        )}
        style={panelStyle}
        data-side={side}
        data-open={isContainedOverlay && open ? "" : undefined}
        onTransitionEnd={isContainedOverlay ? undefined : handlePanelTransitionEnd}
        {...rest}
      >
        {resizable && (
          <div
            className={isBottom ? styles.resizeHandleTop : styles.resizeHandle}
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
            divider={headerDivider}
            slot={headerSlot}
            actions={headerActions}
            onBack={onBack}
            onClose={onClose}
          />
        )}

        <div className={styles.contentWrap}>
          <div
            ref={contentRef}
            className={contentClass}
            onScroll={scrollFade ? onContentScroll : undefined}
          >
            <div className={styles.contentInner}>{children}</div>
          </div>
          {scrollFade && (
            <>
              <div
                className={cx(
                  styles.contentFadeTop,
                  showContentStart && styles.contentFadeVisible,
                )}
                aria-hidden="true"
              />
              <div
                className={cx(
                  styles.contentFadeBottom,
                  showContentEnd && styles.contentFadeVisible,
                )}
                aria-hidden="true"
              />
            </>
          )}
        </div>

        {hasFooter && (
          <Footer
            density={headerFooterDensity}
            divider={footerDivider}
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
