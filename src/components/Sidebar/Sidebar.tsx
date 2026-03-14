import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Divider } from "../Divider";
import { Icon, type IconName } from "../Icon";
import { IconButton } from "../IconButton";
import { TitleText } from "../TitleText";
import styles from "./Sidebar.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ── Context ── */

const SidebarContext = createContext<{ expanded: boolean }>({
  expanded: false,
});

/** Returns `true` when the enclosing Sidebar is in expanded state */
export function useSidebarExpanded(): boolean {
  return useContext(SidebarContext).expanded;
}

/* ── Types ── */

export type SidebarExpandBehavior = "push" | "overlay";

type SlidePhase = "idle" | "entering" | "open" | "exiting";

export interface SidebarProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Whether the sidebar is visible. Persistent = always true. Toggleable = controlled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** Expanded (wide) vs collapsed (icon-only). Default false */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;

  /** Allow toggling between collapsed and expanded via header trigger. Default false */
  collapsible?: boolean;

  /** How the expanded sidebar affects page layout. Default "push" */
  expandBehavior?: SidebarExpandBehavior;

  /** Allow resizing when expanded. Default false */
  resizable?: boolean;

  /** Width when expanded (px). Default 240 */
  expandedWidth?: number;
  /** Minimum resize width (px). Default 240 */
  minWidth?: number;
  /** Maximum resize width (px). Default 350 */
  maxWidth?: number;
  /** Callback when user finishes resizing */
  onWidthChange?: (width: number) => void;

  /** Title shown in header when expanded */
  title?: string;
  /** Description shown below title when expanded */
  description?: string;
  /** Icon before the title */
  titleIcon?: ReactNode;
  /** Actions rendered in the header row when expanded */
  headerActions?: ReactNode;

  children?: ReactNode;
}

const COLLAPSED_WIDTH = 72; // var(--spacing-7xl)

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  function Sidebar(
    {
      open = true,
      onOpenChange,
      expanded = false,
      onExpandedChange,
      collapsible = false,
      expandBehavior = "push",
      resizable = false,
      expandedWidth = 240,
      minWidth = 240,
      maxWidth = 350,
      onWidthChange,
      title,
      description,
      titleIcon,
      headerActions,
      children,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const rootRef = useRef<HTMLElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [resizedWidth, setResizedWidth] = useState<number | null>(null);
    const [isResizing, setIsResizing] = useState(false);

    useImperativeHandle(ref, () => rootRef.current!, []);

    /* ── Toggleable slide phase machine (drawer-like) ── */

    const [phase, setPhase] = useState<SlidePhase>(open ? "open" : "idle");
    const prevOpenRef = useRef(open);

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
          panel.style.transform = "translateX(-100%)";
          panel.style.visibility = "visible";
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          panel.scrollTop;
        }

        panel.style.transition = [
          "transform var(--animation-drawer-enter-duration) var(--animation-drawer-enter-easing)",
          "width var(--animation-drawer-enter-duration) var(--animation-drawer-enter-easing)",
        ].join(", ");
        panel.style.transform = "none";
      } else if (phase === "exiting") {
        panel.style.transition = [
          "transform var(--animation-drawer-exit-duration) var(--animation-drawer-exit-easing)",
          "width var(--animation-drawer-exit-duration) var(--animation-drawer-exit-easing)",
        ].join(", ");
        panel.style.transform = "translateX(-100%)";
      } else if (phase === "idle") {
        if (!open) {
          panel.style.transition = "none";
          panel.style.transform = "translateX(-100%)";
          panel.style.visibility = "hidden";
        }
      } else if (phase === "open") {
        panel.style.transition = "";
        panel.style.transform = "";
        panel.style.visibility = "";
      }
    }, [phase, open]);

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

    const isToggleable = open !== undefined && onOpenChange !== undefined;
    const usePhase = isToggleable && !open;
    const isVisible = phase !== "idle" || open;

    /* ── Expand/collapse direction tracking ── */

    const prevExpandedRef = useRef(expanded);
    const [isCollapsing, setIsCollapsing] = useState(false);

    useEffect(() => {
      if (prevExpandedRef.current && !expanded) {
        setIsCollapsing(true);
      } else {
        setIsCollapsing(false);
      }
      prevExpandedRef.current = expanded;
    }, [expanded]);

    useEffect(() => {
      if (!isCollapsing) return;
      const panel = panelRef.current;
      if (!panel) return;
      const onEnd = () => setIsCollapsing(false);
      panel.addEventListener("transitionend", onEnd, { once: true });
      return () => panel.removeEventListener("transitionend", onEnd);
    }, [isCollapsing]);

    /* ── Reset resized width when expandedWidth prop changes ── */

    useEffect(() => {
      setResizedWidth(null);
    }, [expandedWidth]);

    /* ── Computed widths ── */

    const effectiveExpandedWidth = resizedWidth ?? expandedWidth;
    const visualWidth = expanded ? effectiveExpandedWidth : COLLAPSED_WIDTH;
    const isOverlay = expandBehavior === "overlay";
    const HORIZONTAL_PADDING = 32; // 16px left + 16px right (--spacing-md * 2)
    const navExpandedWidth = effectiveExpandedWidth - HORIZONTAL_PADDING;

    let pushWidth: number;
    if (!isVisible) {
      pushWidth = 0;
    } else if (usePhase && (phase === "idle" || phase === "exiting")) {
      pushWidth = 0;
    } else if (collapsible && isOverlay && expanded) {
      pushWidth = COLLAPSED_WIDTH;
    } else if (isOverlay && !collapsible) {
      pushWidth = 0;
    } else {
      pushWidth = visualWidth;
    }

    /* ── Resize ── */

    const rafId = useRef(0);

    const handleResizePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        const panel = panelRef.current;
        const root = rootRef.current;
        const handle = e.currentTarget;
        if (!panel) return;

        const startX = e.clientX;
        const startWidth = panel.getBoundingClientRect().width;
        const shouldPushRoot =
          root && expandBehavior === "push" && expanded;

        setIsResizing(true);
        handle.setPointerCapture(e.pointerId);

        const onMove = (ev: PointerEvent) => {
          cancelAnimationFrame(rafId.current);
          rafId.current = requestAnimationFrame(() => {
            const delta = ev.clientX - startX;
            const clamped = Math.min(
              maxWidth,
              Math.max(minWidth, startWidth + delta),
            );
            panel.style.width = `${clamped}px`;
            panel.style.setProperty(
              "--nav-expanded-width",
              `${clamped - HORIZONTAL_PADDING}px`,
            );
            if (shouldPushRoot && root) {
              root.style.width = `${clamped}px`;
            }
          });
        };

        const onUp = () => {
          cancelAnimationFrame(rafId.current);
          setIsResizing(false);
          const finalWidth = panel.getBoundingClientRect().width;
          if (shouldPushRoot && root) {
            root.style.width = "";
          }
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
      [minWidth, maxWidth, onWidthChange, expandBehavior, expanded],
    );

    /* ── Handlers ── */

    const handleToggle = useCallback(() => {
      if (collapsible) {
        onExpandedChange?.(!expanded);
      } else if (onOpenChange) {
        onOpenChange(false);
      }
    }, [collapsible, expanded, onExpandedChange, onOpenChange]);

    const showTrigger = collapsible || (isToggleable && !collapsible);

    const triggerIcon = collapsible
      ? expanded
        ? "dock_collapsed"
        : "dock_expanded"
      : "dock_collapsed";

    const hasHeaderContent = title || headerActions;

    return (
      <SidebarContext.Provider value={{ expanded }}>
        <aside
          ref={rootRef}
          aria-label="Sidebar"
          className={cx(
            styles.root,
            isCollapsing && styles.collapsing,
            isResizing && styles.resizing,
            className,
          )}
          style={{ width: pushWidth, ...style }}
          {...rest}
        >
          <div
            ref={panelRef}
            className={cx(
              styles.panel,
              isCollapsing && styles.collapsing,
              isResizing && styles.resizing,
            )}
            style={{
              width: visualWidth,
              "--nav-expanded-width": `${navExpandedWidth}px`,
            } as React.CSSProperties}
            onTransitionEnd={handlePanelTransitionEnd}
          >
            <div className={styles.panelInner}>
              {/* ── Header ── */}
              <div className={styles.header}>
                {hasHeaderContent && (
                  <div className={cx(styles.headerContent, expanded && styles.expanded)}>
                    <div className={styles.headerContentInner}>
                      {title && (
                        <div className={styles.titleArea}>
                          <TitleText
                            size="xs"
                            as="h2"
                            title={title}
                            description={description}
                            leadingIcon={titleIcon}
                          />
                        </div>
                      )}
                      {headerActions && (
                        <div className={styles.actionsArea}>{headerActions}</div>
                      )}
                    </div>
                  </div>
                )}

                {showTrigger && (
                  <div
                    className={styles.trigger}
                    style={{ cursor: expanded ? "w-resize" : "e-resize" }}
                  >
                    <IconButton
                      size="lg"
                      variant="neutral"
                      emphasis="low"
                      hideTooltip
                      icon={<Icon name={triggerIcon as IconName} size={20} />}
                      aria-label={
                        collapsible
                          ? expanded
                            ? "Collapse sidebar"
                            : "Expand sidebar"
                          : "Close sidebar"
                      }
                      onClick={handleToggle}
                    />
                  </div>
                )}
              </div>

              {/* ── Content ── */}
              <div className={styles.content}>{children}</div>
            </div>

            {/* ── Right-edge divider ── */}
            <div className={styles.edgeDivider}>
              <Divider orientation="vertical" />
            </div>

            {/* ── Resize handle ── */}
            {resizable && expanded && (
              <div
                className={styles.resizeHandle}
                aria-hidden="true"
                onPointerDown={handleResizePointerDown}
              />
            )}
          </div>
        </aside>
      </SidebarContext.Provider>
    );
  },
);

Sidebar.displayName = "Sidebar";
