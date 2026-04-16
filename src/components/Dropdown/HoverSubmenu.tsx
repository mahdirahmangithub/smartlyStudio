import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useContext,
  type ReactNode,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Dropdown } from "./Dropdown";
import { GenericSelectOption } from "../GenericSelectOption";
import { MenuDepthContext, MenuGraceContext, SiblingSubmenuContext } from "./MenuContext";

const OPEN_DELAY_MS  = 100; // debounce: prevents panel flash when cursor passes through
const CLOSE_DELAY_MS = 150; // grace: gives cursor time to reach panel before closing
const GRACE_EXPIRE_MS = 300; // max lifetime of a grace polygon

const BASE_SUBMENU_Z = 10000;

/* ── Component ────────────────────────────────────────────────────────────── */

export interface HoverSubmenuProps {
  /** Row label */
  labelText: string;
  /** Optional leading icon or node */
  leading?: ReactNode;
  /** Submenu body — more `HoverSubmenu` or option rows */
  children: ReactNode;
  /** Submenu panel width */
  width?: number;
}

export function HoverSubmenu({
  labelText,
  leading,
  children,
  width = 220,
}: HoverSubmenuProps) {
  const depth          = useContext(MenuDepthContext);
  const graceCtx       = useContext(MenuGraceContext);
  const siblingManager = useContext(SiblingSubmenuContext);

  /** Stable per-mount identity for the sibling registry. */
  const idRef = useRef<symbol>(Symbol());

  const anchorRef      = useRef<HTMLDivElement>(null);
  const panelElRef     = useRef<HTMLDivElement | null>(null);
  /**
   * Points to the focusable inner element of the trigger row (the GenericSelectOption div
   * with tabIndex=0 / role="menuitem"). Used as the return-focus target when the submenu
   * closes via keyboard (ArrowLeft / Escape), since anchorRef itself is a non-focusable wrapper.
   */
  const triggerItemRef = useRef<HTMLElement | null>(null);

  const [open, setOpen]           = useState(false);
  const [autoFocus, setAutoFocus] = useState(false);

  /** Ref mirror of `open` so event handlers avoid stale closures. */
  const openRef = useRef(open);
  openRef.current = open;

  const openTimerRef  = useRef<ReturnType<typeof window.setTimeout> | undefined>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof window.setTimeout> | undefined>(undefined);
  const graceTimerRef = useRef<ReturnType<typeof window.setTimeout> | undefined>(undefined);

  const clearOpen  = useCallback(() => { window.clearTimeout(openTimerRef.current);  openTimerRef.current  = undefined; }, []);
  const clearClose = useCallback(() => { window.clearTimeout(closeTimerRef.current); closeTimerRef.current = undefined; }, []);
  const clearGrace = useCallback(() => { window.clearTimeout(graceTimerRef.current); graceTimerRef.current = undefined; }, []);

  useEffect(() => () => { clearOpen(); clearClose(); clearGrace(); }, [clearOpen, clearClose, clearGrace]);

  /* ── Sibling registry ─────────────────────────────────────────────────── */

  /**
   * Stable ref to this submenu's instant-close function.
   * The sibling manager holds a reference to this, so it can close us without
   * capturing a stale closure from an old render.
   */
  const closeSelfRef = useRef<() => void>(() => {});
  closeSelfRef.current = () => {
    clearOpen(); clearClose(); clearGrace();
    graceCtx?.setGraceIntent(null);
    setOpen(false);
    setAutoFocus(false);
  };

  useEffect(() => {
    if (!siblingManager) return;
    const id = idRef.current;
    return siblingManager.register(id, () => closeSelfRef.current());
  }, [siblingManager]);

  /* ── Open / close helpers ─────────────────────────────────────────────── */

  const onPanelMount = useCallback((el: HTMLDivElement | null) => {
    panelElRef.current = el;
  }, []);

  // Resolve the focusable trigger item once the anchor div is in the DOM.
  useEffect(() => {
    triggerItemRef.current =
      anchorRef.current?.querySelector<HTMLElement>('[tabindex="0"]') ?? null;
  }, []);

  /** Open the submenu immediately (called after the open-delay timer or via keyboard). */
  const openSubmenu = useCallback((focus: boolean) => {
    clearClose();
    clearGrace();
    graceCtx?.setGraceIntent(null);
    siblingManager?.notifyOpen(idRef.current);
    setAutoFocus(focus);
    setOpen(true);
  }, [clearClose, clearGrace, graceCtx, siblingManager]);

  const handleClose = useCallback(() => {
    clearOpen(); clearClose(); clearGrace();
    graceCtx?.setGraceIntent(null);
    setOpen(false);
    setAutoFocus(false);
  }, [clearOpen, clearClose, clearGrace, graceCtx]);

  /* ── Trigger row pointer events ───────────────────────────────────────── */

  /**
   * Cursor enters the trigger row.
   *
   * Grace check: if a sibling's grace polygon is active AND the cursor is moving
   * toward that sibling's panel, this row is being clipped by a diagonal traversal —
   * skip opening. The 100ms delay also prevents flash when cursor passes through quickly.
   */
  const onTriggerPointerEnter = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    clearClose();
    if (graceCtx?.isInGrace(e.clientX, e.clientY)) return;
    clearOpen();
    openTimerRef.current = window.setTimeout(() => openSubmenu(false), OPEN_DELAY_MS);
  }, [clearClose, clearOpen, graceCtx, openSubmenu]);

  /**
   * Cursor leaves the trigger row.
   *
   * If the submenu panel is open, compute the 5-point grace polygon:
   *   [cursorExitPoint, panel.topLeft, panel.topRight, panel.bottomRight, panel.bottomLeft]
   *
   * This polygon covers both the gap between the trigger and panel AND the panel itself.
   * Any sibling row entered while this polygon is active (and cursor is moving rightward)
   * will skip opening — the cursor is traversing toward this panel.
   *
   * The polygon expires after GRACE_EXPIRE_MS as a safety fallback.
   */
  const onTriggerPointerLeave = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    clearOpen();

    const panel = panelElRef.current;
    if (openRef.current && panel && graceCtx) {
      const pr   = panel.getBoundingClientRect();
      const side = pr.left < e.clientX ? "left" : "right";
      graceCtx.setGraceIntent({
        area: [
          { x: e.clientX - 5, y: e.clientY }, // exit point with slight bleed toward panel
          { x: pr.left,  y: pr.top    },
          { x: pr.right, y: pr.top    },
          { x: pr.right, y: pr.bottom },
          { x: pr.left,  y: pr.bottom },
        ],
        side,
      });
      clearGrace();
      graceTimerRef.current = window.setTimeout(() => {
        graceCtx.setGraceIntent(null);
      }, GRACE_EXPIRE_MS);
    }

    clearClose();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = undefined;
    }, CLOSE_DELAY_MS);
  }, [clearOpen, clearClose, clearGrace, graceCtx]);

  /* ── Panel content pointer events ────────────────────────────────────── */

  /** Cursor entered the submenu panel — cancel close and clear the grace polygon. */
  const onPanelPointerEnter = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    clearClose();
    clearGrace();
    graceCtx?.setGraceIntent(null);
  }, [clearClose, clearGrace, graceCtx]);

  /** Cursor left the submenu panel — start close timer. */
  const onPanelPointerLeave = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    clearClose();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = undefined;
    }, CLOSE_DELAY_MS);
  }, [clearClose]);

  /* ── Keyboard ─────────────────────────────────────────────────────────── */

  const handleTriggerKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      e.stopPropagation();
      openSubmenu(true); // immediate — no open-delay timer for keyboard
    }
  }, [openSubmenu]);

  /* ── Render ───────────────────────────────────────────────────────────── */

  const panelZ = BASE_SUBMENU_Z + depth * 2;

  return (
    // Provide depth + 1 so nested HoverSubmenus auto-increment without manual props.
    <MenuDepthContext.Provider value={depth + 1}>
      <div
        ref={anchorRef}
        onPointerEnter={onTriggerPointerEnter}
        onPointerLeave={onTriggerPointerLeave}
        onKeyDown={handleTriggerKeyDown}
      >
        <GenericSelectOption
          itemRole="menuitem"
          hideFocusRing
          subMenu
          labelText={labelText}
          description={false}
          leading={leading}
          onClick={() => {}}
        />
        <Dropdown
          open={open}
          onClose={handleClose}
          anchorRef={anchorRef}
          placement="right-start"
          role="menu"
          width={width}
          offset={8}
          autoFocus={autoFocus}
          closeOnClickOutside
          closeOnEscape
          returnFocusRef={triggerItemRef}
          zIndex={panelZ}
          onPanelMount={onPanelMount}
          panelKeyboardNav
          keyboardWrap
        >
          <div
            onPointerEnter={onPanelPointerEnter}
            onPointerLeave={onPanelPointerLeave}
          >
            {children}
          </div>
        </Dropdown>
      </div>
    </MenuDepthContext.Provider>
  );
}

HoverSubmenu.displayName = "HoverSubmenu";
