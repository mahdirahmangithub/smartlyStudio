import {
  useId,
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
  /**
   * Optional sticky header for the submenu panel (e.g. a `SelectOptionHeader`
   * with a search input). Rendered above the scrollable option list so it
   * doesn't scroll with the items.
   */
  header?: ReactNode;
  /** Submenu panel width */
  width?: number;
  /**
   * When `true`, the submenu auto-closes (after a 150ms grace) once the
   * cursor leaves the trigger row or the panel. Snappy hover-menu UX, good
   * for pure option lists.
   *
   * When `false` (default), the submenu stays open until dismissed by
   * Escape, click-outside, sibling submenu opening, or selecting an option.
   * Recommended for submenus hosting inputs / forms (e.g. embedded search)
   * since the user may drift the cursor away while typing.
   */
  closeOnPointerLeave?: boolean;
}

export function HoverSubmenu({
  labelText,
  leading,
  header,
  children,
  width = 220,
  closeOnPointerLeave = false,
}: HoverSubmenuProps) {
  const depth          = useContext(MenuDepthContext);
  const graceCtx       = useContext(MenuGraceContext);
  const siblingManager = useContext(SiblingSubmenuContext);

  /** Stable per-mount identity for the sibling registry. */
  const idRef = useRef<symbol>(Symbol());

  /** Stable id for the submenu panel — wired to trigger's `aria-controls`. */
  const panelId = useId();

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
  /**
   * Set to true only when this submenu is being closed because a sibling is
   * opening. Skips the panel's exit animation so the sibling-to-sibling
   * hand-off feels instant rather than crossfaded. Reset on the next open.
   */
  const [instantClose, setInstantClose] = useState(false);
  /**
   * Set to true when this submenu is opening AS the replacement for a
   * sibling that was just instant-closed. Skips this panel's enter
   * animation so the hand-off feels truly instant on both sides.
   */
  const [instantOpen, setInstantOpen] = useState(false);

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
    // Sibling-triggered close: skip the exit animation. React batches both
    // state updates so the Dropdown sees `open=false` AND `exitAnimation=false`
    // in the same commit and unmounts immediately.
    setInstantClose(true);
    setOpen(false);
    setAutoFocus(false);
  };

  useEffect(() => {
    if (!siblingManager) return;
    const id = idRef.current;
    return siblingManager.register(id, () => closeSelfRef.current());
  }, [siblingManager]);

  /* ── Open / close helpers ─────────────────────────────────────────────── */

  /** Cleanup function for native pointer listeners attached in onPanelMount. */
  const panelListenerCleanupRef = useRef<(() => void) | null>(null);

  const onPanelMount = useCallback((el: HTMLDivElement | null) => {
    // Tear down any prior listeners (panel remount, e.g. across drill levels).
    panelListenerCleanupRef.current?.();
    panelListenerCleanupRef.current = null;
    panelElRef.current = el;
    if (!el) return;

    /* Attach pointer enter/leave to the PANEL element itself (not a div
     * wrapping children), so the boundary covers the whole panel — header
     * slot included. The previous wrapping-div approach fired pointerleave
     * when the cursor moved from the children area to a search input in
     * the header, which started the close timer and dismissed the submenu
     * unexpectedly when the user focused or typed in the search. */
    const handleEnter = (e: globalThis.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      clearClose();
      clearGrace();
      graceCtx?.setGraceIntent(null);
    };
    const handleLeave = (e: globalThis.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      clearClose();
      // Sticky mode: cursor leaving the panel doesn't dismiss. The user can
      // still close via Escape, click-outside, sibling submenu, or option select.
      if (!closeOnPointerLeave) return;
      closeTimerRef.current = window.setTimeout(() => {
        setOpen(false);
        closeTimerRef.current = undefined;
      }, CLOSE_DELAY_MS);
    };

    el.addEventListener("pointerenter", handleEnter);
    el.addEventListener("pointerleave", handleLeave);
    panelListenerCleanupRef.current = () => {
      el.removeEventListener("pointerenter", handleEnter);
      el.removeEventListener("pointerleave", handleLeave);
    };
  }, [clearClose, clearGrace, graceCtx, closeOnPointerLeave]);

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
    // `notifyOpen` returns true if any sibling was just instant-closed —
    // in that case skip our own enter animation so the hand-off is snappy.
    const replacedSibling = siblingManager?.notifyOpen(idRef.current) ?? false;
    setInstantOpen(replacedSibling);
    // Reset the instant-close flag before opening so the next close (e.g.
    // via Escape or click-outside) animates normally.
    setInstantClose(false);
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
    // Entering a trigger row always wins — clear any active grace polygon so a
    // sibling's open panel doesn't block this submenu from starting to open.
    clearGrace();
    graceCtx?.setGraceIntent(null);
    clearOpen();
    openTimerRef.current = window.setTimeout(() => openSubmenu(false), OPEN_DELAY_MS);
  }, [clearClose, clearOpen, clearGrace, graceCtx, openSubmenu]);

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
    // Sticky mode: leaving the trigger doesn't dismiss either. The grace
    // polygon above is still useful for sibling coordination during
    // diagonal cursor traversal even if we're not arming the close timer.
    if (!closeOnPointerLeave) return;
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = undefined;
    }, CLOSE_DELAY_MS);
  }, [clearOpen, clearClose, clearGrace, graceCtx, closeOnPointerLeave]);

  /* Panel pointer enter/leave are attached natively in `onPanelMount` above. */

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
          isActive={open}
          ariaHasPopup="menu"
          ariaExpanded={open}
          ariaControls={panelId}
          onClick={() => {}}
        />
        <Dropdown
          id={panelId}
          open={open}
          onClose={handleClose}
          anchorRef={anchorRef}
          header={header}
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
          exitAnimation={!instantClose}
          enterAnimation={!instantOpen}
        >
          {children}
        </Dropdown>
      </div>
    </MenuDepthContext.Provider>
  );
}

HoverSubmenu.displayName = "HoverSubmenu";
