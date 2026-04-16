import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Popover,
  type PopoverPlacement,
  type PopoverAnchorRef,
} from "../Popover";
import { IconButton } from "../IconButton";
import { Icon } from "../Icon";
import { ScrollFade } from "../ScrollFade";
import { Divider } from "../Divider";
import { DragHandle } from "../DragHandle";
import styles from "./EditorPopover.module.css";
import { cx } from "../../utils/cx";

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */

export type EditorPopoverSize = "sm" | "lg";

export interface EditorPopoverProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "content"> {
  open: boolean;
  /** Dismiss callback — fired by click-outside, escape, and the close button */
  onClose?: () => void;
  anchorRef: PopoverAnchorRef;
  placement?: PopoverPlacement;
  /** Size variant — "lg" (64px tall) or "sm" (48px tall) */
  size?: EditorPopoverSize;
  /** Controlled expand/collapse */
  expanded?: boolean;
  /** Use fixed positioning — toolbar stays in place when the page scrolls */
  fixed?: boolean;
  /** Show drag handle and allow repositioning */
  draggable?: boolean;

  /** Optional selection slot rendered on the left, before the divider */
  selection?: ReactNode;

  /** Consumer-provided toolbar items */
  children?: ReactNode;

  /** CTA button slot rendered on the right */
  cta?: ReactNode;
  /** Show a "more" icon button — fires callback on click */
  onMore?: () => void;
  /** Show a close (X) button that calls onClose */
  showCloseButton?: boolean;

  /** Fixed width in px. When omitted the toolbar auto-sizes to its content. */
  width?: number;
  /** Popover passthrough */
  offset?: number;
  /** Fire onClose when clicking outside the popover (default: true) */
  closeOnClickOutside?: boolean;
  /** Fire onClose when pressing Escape (default: true) */
  closeOnEscape?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════ */

const ICON_SIZE = 16;
const DRAG_THRESHOLD = 4;
const GLIDE_FACTOR = 0.25;

/* ═══════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════ */

export const EditorPopover = forwardRef<HTMLDivElement, EditorPopoverProps>(
  function EditorPopover(props, ref) {
    const {
      open,
      onClose,
      anchorRef,
      placement = "bottom",
      size = "lg",
      expanded = true,
      fixed = false,
      draggable = false,

      selection,

      children,
      cta,
      onMore,
      showCloseButton = false,

      width,
      offset = 4,
      closeOnClickOutside = true,
      closeOnEscape = true,
      className,
      role: _role, // consumed here so it doesn't override Popover's typed role prop via ...rest
      ...rest
    } = props;

    const hasSelection = selection != null;
    const hasRightActions = cta != null || onMore != null || showCloseButton;

    /* ── Drag state ── */

    const toolbarRef = useRef<HTMLDivElement>(null);

    const [dragTarget, setDragTarget] = useState({ x: 0, y: 0 });
    const dragTargetRef = useRef(dragTarget);
    dragTargetRef.current = dragTarget;

    const [smoothOffset, setSmoothOffset] = useState({ x: 0, y: 0 });
    const smoothRef = useRef(smoothOffset);
    smoothRef.current = smoothOffset;

    const pendingDrag = useRef<{
      pointerId: number;
      startX: number;
      startY: number;
      ox: number;
      oy: number;
      baseX: number;
      baseY: number;
      panelW: number;
      panelH: number;
    } | null>(null);
    const draggingRef = useRef(false);
    const didDragRef = useRef(false);

    const handleToolbarPointerDown = useCallback(
      (e: ReactPointerEvent) => {
        if (!draggable) return;
        didDragRef.current = false;

        const el = toolbarRef.current;
        const rect = el?.getBoundingClientRect();
        const sx = smoothRef.current.x;
        const sy = smoothRef.current.y;

        pendingDrag.current = {
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          ox: dragTargetRef.current.x,
          oy: dragTargetRef.current.y,
          baseX: rect ? rect.left - sx : 0,
          baseY: rect ? rect.top - sy : 0,
          panelW: rect?.width ?? 0,
          panelH: rect?.height ?? 0,
        };
        draggingRef.current = false;
      },
      [draggable],
    );

    /* ── Window pointer listeners ── */

    useEffect(() => {
      if (!draggable || !open) return;

      const handleMove = (e: PointerEvent) => {
        const p = pendingDrag.current;
        if (!p) return;

        const dx = e.clientX - p.startX;
        const dy = e.clientY - p.startY;

        if (!draggingRef.current) {
          if (Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
          draggingRef.current = true;
          didDragRef.current = true;
          toolbarRef.current?.setPointerCapture(p.pointerId);
        }

        let nextX = p.ox + dx;
        let nextY = p.oy + dy;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const minX = -p.baseX;
        const minY = -p.baseY;
        const maxX = vw - p.panelW - p.baseX;
        const maxY = vh - p.panelH - p.baseY;

        nextX = Math.max(minX, Math.min(maxX, nextX));
        nextY = Math.max(minY, Math.min(maxY, nextY));

        setDragTarget({ x: nextX, y: nextY });
      };

      const handleUp = () => {
        if (draggingRef.current && toolbarRef.current && pendingDrag.current) {
          toolbarRef.current.releasePointerCapture(
            pendingDrag.current.pointerId,
          );
        }
        pendingDrag.current = null;
        draggingRef.current = false;
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
      return () => {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };
    }, [draggable, open]);

    /* ── Smooth glide (rAF lerp toward dragTarget) ── */

    useEffect(() => {
      if (!draggable) return;

      const s = smoothRef.current;
      const t = dragTargetRef.current;
      if (s.x === t.x && s.y === t.y) return;

      let running = true;
      const tick = () => {
        if (!running) return;
        const cur = smoothRef.current;
        const tgt = dragTargetRef.current;
        const nx = cur.x + (tgt.x - cur.x) * GLIDE_FACTOR;
        const ny = cur.y + (tgt.y - cur.y) * GLIDE_FACTOR;
        const settled =
          Math.abs(tgt.x - nx) < 0.5 && Math.abs(tgt.y - ny) < 0.5;
        const next = settled ? { x: tgt.x, y: tgt.y } : { x: nx, y: ny };
        smoothRef.current = next;
        setSmoothOffset(next);
        if (!settled) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      return () => { running = false; };
    }, [draggable, dragTarget]);

    const handleToolbarClick = useCallback(
      (e: React.MouseEvent) => {
        if (didDragRef.current) {
          e.stopPropagation();
          e.preventDefault();
          didDragRef.current = false;
        }
      },
      [],
    );

    const positionOffset =
      smoothOffset.x !== 0 || smoothOffset.y !== 0 ? smoothOffset : undefined;

    const canDismiss = onClose != null;

    return (
      <Popover
        ref={ref}
        open={open}
        onClose={onClose ?? (() => {})}
        anchorRef={anchorRef}
        placement={placement}
        width={width ?? "auto"}
        density="none"
        role="toolbar"
        fixed={fixed}
        offset={offset}
        closeOnClickOutside={canDismiss && closeOnClickOutside}
        closeOnEscape={canDismiss && closeOnEscape}
        trapFocus={false}
        autoFocus={false}
        positionOffset={positionOffset}
        className={className}
        {...rest}
      >
        <div
          ref={toolbarRef}
          className={cx(
            styles.toolbar,
            styles[size],
            !expanded && styles.collapsed,
          )}
          onPointerDown={draggable ? handleToolbarPointerDown : undefined}
          onClickCapture={draggable ? handleToolbarClick : undefined}
          style={draggable ? { touchAction: "none" } : undefined}
        >
          {/* Drag handle (visual indicator) */}
          {draggable && (
            <DragHandle
              size="sm"
              type="dot"
              className={styles.dragHandle}
            />
          )}

          {/* Selection slot */}
          {hasSelection && (
            <div className={styles.selectionGroup}>
              {selection}
              {expanded && <Divider orientation="vertical" />}
            </div>
          )}

          {/* Items zone */}
          {expanded && children && (
            width != null ? (
              <ScrollFade direction="horizontal" className={styles.items}>
                <div className={styles.itemsInner}>{children}</div>
              </ScrollFade>
            ) : (
              <div className={styles.itemsInner}>{children}</div>
            )
          )}

          {/* Right actions */}
          {expanded && hasRightActions && (
            <div className={styles.rightActions}>
              {cta}
              {onMore && (
                <IconButton
                  size="md"
                  variant="neutral"
                  emphasis="low"
                  icon={<Icon name="more_vert" size={ICON_SIZE} />}
                  aria-label="More actions"
                  onClick={onMore}
                  hideTooltip
                />
              )}
              {showCloseButton && onClose && (
                <IconButton
                  size="md"
                  variant="neutral"
                  emphasis="low"
                  icon={<Icon name="close" size={ICON_SIZE} />}
                  aria-label="Close"
                  onClick={onClose}
                  hideTooltip
                />
              )}
            </div>
          )}
        </div>
      </Popover>
    );
  },
);

EditorPopover.displayName = "EditorPopover";
