import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { Dimmer } from "../Dimmer";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import styles from "./Modal.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export type ModalSize = "sm" | "md" | "lg" | "xl";
export type ModalDensity = "none" | "sm" | "lg";

type ModalPhase = "idle" | "entering" | "open" | "exiting";

export interface ModalProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  open: boolean;
  onClose?: () => void;
  size?: ModalSize;
  density?: ModalDensity;

  title?: string;
  description?: string;
  headerSize?: "sm" | "md" | "lg" | "xl" | "2xl";
  headerSlot?: ReactNode;
  headerActions?: ReactNode;

  footerActions?: ReactNode;
  footerExtraAction?: ReactNode;
  footerSlot?: ReactNode;
  footerFullWidth?: boolean;

  children?: ReactNode;
  /** Accessible label — used when no `title` is provided */
  ariaLabel?: string;

  maxHeight?: string | number;
  height?: string | number;
}

const sizeClass: Record<ModalSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
};

const contentClass: Record<ModalDensity, string> = {
  none: styles.contentNone,
  sm: styles.contentSm,
  lg: styles.contentLg,
};

export const Modal = forwardRef<HTMLElement, ModalProps>(
  function Modal(
    {
      open,
      onClose,
      size = "md",
      density = "sm",
      title,
      description,
      headerSize = "lg",
      headerSlot,
      headerActions,
      footerActions,
      footerExtraAction,
      footerSlot,
      footerFullWidth,
      children,
      ariaLabel,
      maxHeight,
      height,
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
    const mouseDownOnOverlayRef = useRef(false);

    const headerFooterDensity = density === "lg" ? "lg" : "sm";
    const hasHeader = title != null;
    const hasFooter = footerActions != null || footerExtraAction != null;

    /* ────────────────────────────────────────────
     * Phase state machine (JS-controlled transitions)
     * idle → entering → open → exiting → idle
     * ──────────────────────────────────────────── */

    const [phase, setPhase] = useState<ModalPhase>("idle");
    const prevOpenRef = useRef(false);

    useEffect(() => {
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
    }, [open]);

    useEffect(() => {
      const panel = panelRef.current;
      if (!panel) return;

      if (phase === "entering") {
        const isHidden =
          !panel.style.visibility || panel.style.visibility === "hidden";

        if (isHidden) {
          panel.style.transition = "none";
          panel.style.transform = "scale(0.94)";
          panel.style.opacity = "0";
          panel.style.visibility = "visible";
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          panel.scrollTop;
        }

        panel.style.transition = [
          "transform var(--animation-modal-enter-duration) var(--animation-modal-enter-easing)",
          "opacity var(--animation-modal-enter-duration) var(--animation-modal-enter-easing)",
        ].join(", ");
        panel.style.transform = "none";
        panel.style.opacity = "1";
      } else if (phase === "exiting") {
        panel.style.transition = [
          "transform var(--animation-modal-exit-duration) var(--animation-modal-exit-easing)",
          "opacity var(--animation-modal-exit-duration) var(--animation-modal-exit-easing)",
        ].join(", ");
        panel.style.transform = "scale(0.94)";
        panel.style.opacity = "0";
      } else if (phase === "idle") {
        panel.style.transition = "none";
        panel.style.transform = "scale(0.94)";
        panel.style.opacity = "0";
        panel.style.visibility = "hidden";
      } else if (phase === "open") {
        panel.style.transition = "";
      }
    }, [phase]);

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

    const isActive = phase === "entering" || phase === "open";

    /* ──────────────── Portal target ──────────────── */

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

    /* ──────────────── Focus trap ──────────────── */

    useFocusTrap(panelRef, isActive);

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
      if (phase === "idle") return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [phase]);

    /* ──────────────── Backdrop click guard ──────────────── */

    const handleOverlayMouseDown = useCallback(
      (e: React.MouseEvent) => {
        mouseDownOnOverlayRef.current = e.target === e.currentTarget;
      },
      [],
    );

    const handleOverlayClick = useCallback(
      (e: React.MouseEvent) => {
        if (
          e.target === e.currentTarget &&
          mouseDownOnOverlayRef.current &&
          onClose
        ) {
          onClose();
        }
        mouseDownOnOverlayRef.current = false;
      },
      [onClose],
    );

    /* ──────────────── Ref merging ──────────────── */

    const mergedRef = useCallback(
      (node: HTMLElement | null) => {
        (panelRef as React.MutableRefObject<HTMLElement | null>).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      },
      [ref],
    );

    /* ──────────────── Sizing styles ──────────────── */

    const panelStyle: CSSProperties = { ...style };
    if (maxHeight != null) panelStyle.maxHeight = maxHeight;
    if (height != null) {
      panelStyle.height = height;
      panelStyle.maxHeight = panelStyle.maxHeight ?? "none";
    }

    /* ──────────────── Render ──────────────── */

    const anchor = (
      <span
        ref={portalAnchorRef}
        style={{ display: "none" }}
        aria-hidden="true"
      />
    );

    const panel = (
      <aside
        ref={mergedRef}
        className={cx(
          styles.panel,
          sizeClass[size],
          className,
        )}
        style={panelStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasHeader ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        aria-label={!hasHeader ? ariaLabel : undefined}
        tabIndex={-1}
        onTransitionEnd={handlePanelTransitionEnd}
        {...rest}
      >
        {hasHeader && (
          <Header
            id={titleId}
            size={headerSize}
            density={headerFooterDensity}
            title={title!}
            description={description}
            descriptionId={description ? descId : undefined}
            divider
            actions={headerActions}
            slot={headerSlot}
            onClose={onClose}
          />
        )}

        <div className={cx(styles.content, contentClass[density])}>
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

    return (
      <>
        {anchor}
        {portalTarget &&
          createPortal(
            <>
              <Dimmer
                open={isActive}
                position="fixed"
                enterDuration="var(--animation-modal-scrim-duration)"
                enterEasing="var(--animation-modal-scrim-easing)"
                exitDuration="var(--animation-modal-scrim-duration)"
                exitEasing="var(--animation-modal-scrim-easing)"
                onClick={onClose}
              />
              <div
                className={cx(
                  styles.overlay,
                  isActive && styles.active,
                )}
                onMouseDown={handleOverlayMouseDown}
                onClick={handleOverlayClick}
              >
                {panel}
              </div>
            </>,
            portalTarget,
          )}
      </>
    );
  },
);

Modal.displayName = "Modal";
