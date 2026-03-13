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
import { useFocusTrap } from "../../hooks/useFocusTrap";
import styles from "./Drawer.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export type DrawerDensity = "none" | "sm" | "lg";
export type DrawerMode = "overlay" | "push";
export type DrawerPlacement = "viewport" | "container";

export interface DrawerProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Whether the drawer is open */
  open: boolean;
  /** Called when the drawer requests to close (Escape, backdrop click) */
  onClose?: () => void;
  /** Density controls internal padding and header/footer density */
  density?: DrawerDensity;

  /** Header title */
  title?: string;
  /** Header description */
  description?: string;
  /** Header size — forwarded to the internal Header component */
  headerSize?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Custom slot content in the header */
  headerSlot?: ReactNode;
  /** Action buttons in the header */
  headerActions?: ReactNode;
  /** Show back button in header */
  onBack?: () => void;

  /** Footer primary actions (right side) */
  footerActions?: ReactNode;
  /** Footer secondary actions (left side) */
  footerExtraAction?: ReactNode;
  /** Footer slot content */
  footerSlot?: ReactNode;
  /** When true, footer action buttons stretch to full width */
  footerFullWidth?: boolean;

  /** Content rendered inside the scrollable area */
  children?: ReactNode;
  /** Enable ScrollFade on the content area — consumer wraps children in ScrollFade */
  scrollFade?: boolean;

  /** Overlay (default) floats above content; push shifts content to the left */
  mode?: DrawerMode;
  /** viewport renders at the page level; container renders within the nearest positioned parent */
  placement?: DrawerPlacement;

  /** Panel width (px or CSS value) */
  width?: number | string;
  /** Show resize handle on the left edge */
  resizable?: boolean;
  /** Minimum width in px when resizing (default 280) */
  minWidth?: number;
  /** Maximum width in px when resizing (default 960) */
  maxWidth?: number;
  /** Called with the new width (px) after a resize ends */
  onWidthChange?: (width: number) => void;
  /** Show a backdrop behind the drawer in overlay mode (default true) */
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
    const panelRef = useRef<HTMLElement>(null);
    const portalAnchorRef = useRef<HTMLSpanElement>(null);
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
    const [resizedWidth, setResizedWidth] = useState<number | null>(null);
    const [isResizing, setIsResizing] = useState(false);

    const isOverlay = mode === "overlay";
    const isContained = placement === "container";
    const headerFooterDensity = density === "lg" ? "lg" : "sm";
    const hasHeader = title != null;
    const hasFooter = footerActions != null || footerExtraAction != null;

    // Resolve portal target: nearest ancestor with data-theme, or body
    useEffect(() => {
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
    }, []);

    // Focus trap for overlay mode
    useFocusTrap(panelRef, isOverlay && open);

    // Escape to close
    useEffect(() => {
      if (!open || !onClose) return;
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    // Body scroll lock for viewport overlay
    useEffect(() => {
      if (!isOverlay || !open || isContained) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [isOverlay, open, isContained]);

    // Reset resized width when the controlled `width` prop changes
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
            const clamped = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));
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

    const anchor = <span ref={portalAnchorRef} style={{ display: "none" }} />;

    const resolvedWidth = resizedWidth ?? width;
    const panelStyle = {
      ...style,
      ...(resolvedWidth != null
        ? { width: typeof resolvedWidth === "number" ? `${resolvedWidth}px` : resolvedWidth }
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
          (panelRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        role="dialog"
        aria-modal={isOverlay || undefined}
        aria-labelledby={hasHeader ? titleId : undefined}
        aria-hidden={!open}
        inert={!open || undefined}
        tabIndex={-1}
        className={cx(
          styles.panel,
          open && styles.open,
          isResizing && styles.resizing,
          isContained && styles.contained,
          mode === "push" && styles.push,
          className,
        )}
        style={panelStyle}
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
      const backdrop = showBackdrop ? (
        <div
          className={cx(
            styles.backdrop,
            open && styles.open,
            isContained && styles.contained,
          )}
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null;

      if (isContained) {
        return (
          <>
            {anchor}
            {backdrop}
            {panel}
          </>
        );
      }

      return (
        <>
          {anchor}
          {portalTarget &&
            createPortal(
              <>
                {backdrop}
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
