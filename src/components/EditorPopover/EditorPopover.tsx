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
import { Icon, type IconName } from "../Icon";
import { IconThumbnailRow, type IconThumbnailRowSize } from "../IconThumbnailRow";
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

  /** Selection label shown on the left */
  selectionLabel?: string;
  /** Secondary description below the selection label */
  selectionDescription?: string;
  /** Icons rendered as overlapping chips before the selection label */
  selectionIcons?: IconName[];
  /** Max visible selection icons; surplus shows as "+N" */
  selectionIconsMax?: number;
  /** Makes the selection zone clickable */
  onSelectionClick?: () => void;

  /** Consumer-provided toolbar items */
  children?: ReactNode;

  /** CTA button slot rendered on the right */
  cta?: ReactNode;
  /** Show a "more" icon button — fires callback on click */
  onMore?: () => void;

  /** Popover passthrough */
  offset?: number;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════ */

const BUTTON_SIZE: Record<EditorPopoverSize, "xs" | "sm"> = {
  lg: "sm",
  sm: "xs",
};

const ICON_SIZE: Record<EditorPopoverSize, number> = {
  lg: 16,
  sm: 16,
};

const THUMB_SIZE: Record<EditorPopoverSize, IconThumbnailRowSize> = {
  lg: "sm",
  sm: "sm",
};

const DRAG_THRESHOLD = 4;

/* ═══════════════════════════════════════════════════════════════════════
   Internal: ActionBarSelection
   ═══════════════════════════════════════════════════════════════════════ */

interface ActionBarSelectionProps {
  label: string;
  description?: string;
  icons?: IconName[];
  iconsMax?: number;
  interactive?: boolean;
  onClick?: () => void;
  size: EditorPopoverSize;
}

function ActionBarSelection({
  label,
  description,
  icons,
  iconsMax,
  interactive = false,
  onClick,
  size,
}: ActionBarSelectionProps) {
  const thumbSize = THUMB_SIZE[size];
  const Tag = interactive ? "button" : "div";

  return (
    <Tag
      className={cx(
        styles.selection,
        interactive && styles.selectionInteractive,
      )}
      onClick={interactive ? onClick : undefined}
      type={interactive ? "button" : undefined}
      aria-label={interactive ? label : undefined}
    >
      {icons && icons.length > 0 && (
        <IconThumbnailRow icons={icons} size={thumbSize} max={iconsMax} />
      )}
      <div className={styles.selectionText}>
        <span className={styles.selectionLabel}>{label}</span>
        {description && (
          <span className={styles.selectionDescription}>{description}</span>
        )}
      </div>
    </Tag>
  );
}

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

      selectionLabel,
      selectionDescription,
      selectionIcons,
      selectionIconsMax,
      onSelectionClick,

      children,
      cta,
      onMore,

      offset = 4,
      closeOnClickOutside = true,
      closeOnEscape = true,
      className,
      ...rest
    } = props;

    const btnSize = BUTTON_SIZE[size];
    const iconSize = ICON_SIZE[size];
    const hasSelection = selectionLabel != null;
    const hasRightActions = cta != null || onMore != null || onClose != null;

    /* ── Drag state ── */

    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const draggingRef = useRef(false);
    const startRef = useRef({ px: 0, py: 0, ox: 0, oy: 0 });

    useEffect(() => {
      if (!open) setDragOffset({ x: 0, y: 0 });
    }, [open]);

    const onPointerDown = useCallback(
      (e: ReactPointerEvent) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        startRef.current = {
          px: e.clientX,
          py: e.clientY,
          ox: dragOffset.x,
          oy: dragOffset.y,
        };
        draggingRef.current = false;
      },
      [dragOffset],
    );

    const onPointerMove = useCallback((e: ReactPointerEvent) => {
      const dx = e.clientX - startRef.current.px;
      const dy = e.clientY - startRef.current.py;

      if (!draggingRef.current) {
        if (Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
        draggingRef.current = true;
      }

      setDragOffset({
        x: startRef.current.ox + dx,
        y: startRef.current.oy + dy,
      });
    }, []);

    const onPointerUp = useCallback((e: ReactPointerEvent) => {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      draggingRef.current = false;
    }, []);

    const positionOffset =
      dragOffset.x !== 0 || dragOffset.y !== 0 ? dragOffset : undefined;

    return (
      <Popover
        ref={ref}
        open={open}
        onClose={onClose ?? (() => {})}
        anchorRef={anchorRef}
        placement={placement}
        density="none"
        role="toolbar"
        fixed={fixed}
        offset={offset}
        closeOnClickOutside={closeOnClickOutside}
        closeOnEscape={closeOnEscape}
        trapFocus={false}
        autoFocus={false}
        positionOffset={positionOffset}
        className={className}
        {...rest}
      >
        <div
          className={cx(
            styles.toolbar,
            styles[size],
            !expanded && styles.collapsed,
          )}
        >
          {/* Drag handle */}
          {draggable && (
            <DragHandle
              size="sm"
              type="dot"
              className={styles.dragHandle}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
          )}

          {/* Selection zone */}
          {hasSelection && (
            <div className={styles.selectionGroup}>
              <ActionBarSelection
                label={selectionLabel!}
                description={selectionDescription}
                icons={selectionIcons}
                iconsMax={selectionIconsMax}
                interactive={onSelectionClick != null}
                onClick={onSelectionClick}
                size={size}
              />
              {expanded && <Divider orientation="vertical" />}
            </div>
          )}

          {/* Items zone */}
          {expanded && children && (
            <div className={styles.items}>{children}</div>
          )}

          {/* Right actions */}
          {expanded && hasRightActions && (
            <div className={styles.rightActions}>
              {cta}
              {onMore && (
                <IconButton
                  size={btnSize}
                  variant="neutral"
                  emphasis="low"
                  icon={<Icon name="more_vert" size={iconSize} />}
                  aria-label="More actions"
                  onClick={onMore}
                  hideTooltip
                />
              )}
              {onClose && (
                <IconButton
                  size={btnSize}
                  variant="neutral"
                  emphasis="low"
                  icon={<Icon name="close" size={iconSize} />}
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
