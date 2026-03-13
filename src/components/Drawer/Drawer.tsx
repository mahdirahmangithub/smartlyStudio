import {
  forwardRef,
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

    const anchor = <span ref={portalAnchorRef} style={{ display: "none" }} />;

    const panelStyle = {
      ...style,
      ...(width != null
        ? { width: typeof width === "number" ? `${width}px` : width }
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
          isContained && styles.contained,
          mode === "push" && styles.push,
          className,
        )}
        style={panelStyle}
        {...rest}
      >
        {resizable && <div className={styles.resizeHandle} aria-hidden="true" />}

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
