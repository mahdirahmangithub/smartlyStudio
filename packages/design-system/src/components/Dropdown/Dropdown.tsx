import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useContext,
  type ReactNode,
  type CSSProperties,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Dropdown.module.css";
import { cx } from "../../utils/cx";
import { DropdownMenuTreeContext, DropdownMenuTreeProvider } from "./DropdownMenuTreeContext";
import {
  MenuDebugContext,
  MenuGraceContext,
  MenuItemRoleContext,
  SiblingSubmenuContext,
  type GraceIntent,
  type MenuGraceContextValue,
  type SiblingSubmenuManager,
} from "./MenuContext";
import { DrilldownProvider, DrilldownPanelContent } from "./DrilldownContext";

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */

export type DropdownPlacement =
  | "bottom-start"
  | "bottom-end"
  | "bottom"
  | "top-start"
  | "top-end"
  | "top"
  | "left-start"
  | "left-end"
  | "left"
  | "right-start"
  | "right-end"
  | "right";

export type DropdownRole = "listbox" | "menu";

export interface DropdownProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  placement?: DropdownPlacement;
  width?: number;
  maxHeight?: number;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  offset?: number;
  matchAnchorWidth?: boolean;
  autoFocus?: boolean;
  /** When ArrowUp from the first option, focus this element instead of doing nothing. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  id?: string;
  /** ARIA role for the panel — "listbox" (default) for selection, "menu" for action menus */
  role?: DropdownRole;
  /**
   * When this value changes while open, panel position is recomputed (e.g. caret anchor moves).
   */
  layoutRevision?: number | string;
  /**
   * Extra roots that count as “inside” for click-outside dismissal (e.g. the textarea when the
   * anchor is a 1px caret probe).
   */
  clickOutsideExtraRefs?: ReadonlyArray<RefObject<HTMLElement | null>>;
  /**
   * When false, the panel does not handle Arrow/Home/End/Tab roving (host owns keys, e.g. combobox in textarea).
   * Default true.
   */
  panelKeyboardNav?: boolean;
  /**
   * When true, ArrowDown on the last option focuses the first, and ArrowUp on the first focuses the last
   * (wraps within options; skips header input and returnFocusRef on ArrowUp from first). Default false.
   */
  keyboardWrap?: boolean;
  /** Stacking order; default 9999. Nested submenus should use higher values. */
  zIndex?: number;
  /** Fires when the panel element mounts/unmounts (e.g. submenu pointer bridges). */
  onPanelMount?: (el: HTMLDivElement | null) => void;
  /**
   * Accessible name for the panel. Required by WAI-ARIA for `role="listbox"` /
   * `role="menu"` to be properly announced by screen readers. If both this and
   * `aria-labelledby` are omitted the panel will be unlabelled (current
   * behaviour); supply a string or an element id to fix.
   */
  "aria-label"?: string;
  /** Element id whose visible text labels the panel. Mutually exclusive with `aria-label`. */
  "aria-labelledby"?: string;
  /**
   * When true, focus is restored to `returnFocusRef ?? anchorRef` after a
   * click-outside dismissal too (today, only Escape restores). Recommended
   * for action menus (`role="menu"`) so keyboard users aren't stranded on
   * `<body>` when they click away. Default `false` to preserve existing
   * listbox/combobox behaviour where the click-outside target may be
   * intentional.
   */
  restoreFocusOnOutsideClick?: boolean;
  /**
   * When `false`, the panel skips the exit animation and unmounts on the
   * next tick. Useful for snappy sibling-submenu hand-offs where two
   * overlapping animations would feel sluggish. Default `true`.
   */
  exitAnimation?: boolean;
  /**
   * When `false`, the panel skips the enter animation and is rendered in
   * its idle state immediately. Pair with `exitAnimation={false}` for
   * sibling submenus that hand off without any cross-fade. Default `true`.
   */
  enterAnimation?: boolean;
  /**
   * When true, every nested `HoverSubmenu` draws its pointer-bridge safety-triangle overlay.
   * Only meaningful on the root menu `Dropdown` (`role="menu"`); propagates automatically via
   * context — you do not need to pass this to child `HoverSubmenu` components.
   */
  debugSubmenuBridge?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Ray-casting point-in-polygon test (works for any simple polygon).
 * Cast a horizontal ray rightward from (x, y); count edge crossings — odd = inside.
 */
function isPointInPolygon(
  point: { x: number; y: number },
  polygon: Array<{ x: number; y: number }>,
): boolean {
  let inside = false;
  const { x, y } = point;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}


type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "end" | undefined;

function splitPlacement(p: DropdownPlacement): [Side, Align] {
  const i = p.indexOf("-");
  return i < 0
    ? [p as Side, undefined]
    : [p.slice(0, i) as Side, p.slice(i + 1) as Align];
}

const VP_PAD = 8;

function calcPosition(
  anchorRect: DOMRect,
  panelW: number,
  panelH: number,
  placement: DropdownPlacement,
  offset: number
): { x: number; y: number; side: Side } {
  const [preferredSide, align] = splitPlacement(placement);

  let x: number;
  let y: number;
  let side: Side;

  if (preferredSide === "left" || preferredSide === "right") {
    if (align === "start") {
      y = anchorRect.top;
    } else if (align === "end") {
      y = anchorRect.bottom - panelH;
    } else {
      y = anchorRect.top + anchorRect.height / 2 - panelH / 2;
    }

    const xLeft = anchorRect.left - panelW - offset;
    const xRight = anchorRect.right + offset;
    const overflowLeft = Math.max(0, VP_PAD - xLeft);
    const overflowRight = Math.max(0, xRight + panelW - window.innerWidth + VP_PAD);

    if (preferredSide === "right") {
      if (overflowRight > 0 && overflowLeft < overflowRight) {
        side = "left";
        x = xLeft;
      } else {
        side = "right";
        x = xRight;
      }
    } else {
      if (overflowLeft > 0 && overflowRight < overflowLeft) {
        side = "right";
        x = xRight;
      } else {
        side = "left";
        x = xLeft;
      }
    }
  } else {
    if (align === "start") {
      x = anchorRect.left;
    } else if (align === "end") {
      x = anchorRect.right - panelW;
    } else {
      x = anchorRect.left + anchorRect.width / 2 - panelW / 2;
    }

    const yBelow = anchorRect.bottom + offset;
    const yAbove = anchorRect.top - panelH - offset;
    const overflowBelow = Math.max(0, yBelow + panelH - window.innerHeight + VP_PAD);
    const overflowAbove = Math.max(0, VP_PAD - yAbove);

    if (preferredSide === "bottom") {
      if (overflowBelow > 0 && overflowAbove < overflowBelow) {
        side = "top";
        y = yAbove;
      } else {
        side = "bottom";
        y = yBelow;
      }
    } else {
      if (overflowAbove > 0 && overflowBelow < overflowAbove) {
        side = "bottom";
        y = yBelow;
      } else {
        side = "top";
        y = yAbove;
      }
    }
  }

  x = Math.max(VP_PAD, Math.min(x, window.innerWidth - panelW - VP_PAD));
  y = Math.max(VP_PAD, Math.min(y, window.innerHeight - panelH - VP_PAD));

  return { x, y, side };
}

const EXIT_MS = 200;
const DEFAULT_WIDTH = 320;
const DEFAULT_MAX_HEIGHT = 400;

const FOCUSABLE_SEL = [
  'input:not([disabled]):not([type="checkbox"]):not([type="radio"])',
  "button:not([disabled])",
  '[tabindex="0"]:not([aria-disabled="true"])',
].join(", ");

function focusVisible(el: HTMLElement | null | undefined) {
  el?.focus({ focusVisible: true } as FocusOptions);
}

/* ═══════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════ */

export function Dropdown({
  open,
  onClose,
  anchorRef,
  placement = "bottom-start",
  width = DEFAULT_WIDTH,
  maxHeight = DEFAULT_MAX_HEIGHT,
  header,
  footer,
  children,
  className,
  closeOnClickOutside = true,
  closeOnEscape = true,
  offset = 4,
  matchAnchorWidth = false,
  autoFocus = true,
  returnFocusRef,
  id,
  role: panelRole = "listbox",
  layoutRevision,
  clickOutsideExtraRefs,
  panelKeyboardNav = true,
  keyboardWrap = false,
  zIndex = 9999,
  onPanelMount,
  debugSubmenuBridge = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  restoreFocusOnOutsideClick = false,
  exitAnimation = true,
  enterAnimation = true,
}: DropdownProps) {
  const treeCtx = useContext(DropdownMenuTreeContext);
  /**
   * When this is the root of a menu tree (role="menu" with no ancestor tree provider),
   * we auto-provide the DropdownMenuTreeContext so consumers don't need to add it manually.
   */
  const isMenuRoot = panelRole === "menu" && treeCtx === null;

  /**
   * Registry for the root Dropdown only. Nested panels (HoverSubmenu portals) register
   * into this Set via DropdownMenuTreeProvider. The click-outside handler reads it
   * directly — the root's own treeCtx is null so it cannot use treeCtx.isInsideTreePanels.
   */
  const rootTreePanelsRef = useRef<Set<HTMLElement>>(new Set());

  /* ── Grace-area context (role="menu" panels only) ────────────────────────
     Tracks the active grace polygon + pointer direction so HoverSubmenu rows
     can skip opening when the cursor is traversing toward an open sibling panel.
     ─────────────────────────────────────────────────────────────────────────── */
  const graceIntentRef = useRef<GraceIntent | null>(null);
  const pointerDirRef = useRef<"left" | "right">("right");
  const lastPointerXRef = useRef<number>(0);

  const graceCtxRef = useRef<MenuGraceContextValue | null>(null);
  if (panelRole === "menu" && graceCtxRef.current === null) {
    graceCtxRef.current = {
      graceIntentRef,
      pointerDirRef,
      setGraceIntent(intent) { graceIntentRef.current = intent; },
      isInGrace(x, y) {
        const intent = graceIntentRef.current;
        if (!intent) return false;
        const movingToward =
          intent.side === "right"
            ? pointerDirRef.current === "right"
            : pointerDirRef.current === "left";
        return movingToward && isPointInPolygon({ x, y }, intent.area);
      },
    };
  }
  const graceCtx = graceCtxRef.current;

  /* ── Sibling coordinator (role="menu" panels only) ───────────────────────
     When one HoverSubmenu opens it calls notifyOpen; all registered siblings
     close immediately — preventing two submenus being open at once.
     ─────────────────────────────────────────────────────────────────────────── */
  const siblingManagerRef = useRef<SiblingSubmenuManager | null>(null);
  if (panelRole === "menu" && siblingManagerRef.current === null) {
    const registry = new Map<symbol, () => void>();
    siblingManagerRef.current = {
      register(id, closeNow) {
        registry.set(id, closeNow);
        return () => registry.delete(id);
      },
      notifyOpen(id) {
        let closedAny = false;
        for (const [sibId, sibClose] of registry) {
          if (sibId !== id) {
            sibClose();
            closedAny = true;
          }
        }
        return closedAny;
      },
    };
  }
  const siblingManager = siblingManagerRef.current;

  const handlePanelPointerMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    // Grace-area direction tracking (menu panels only).
    if (panelRole === "menu" && e.clientX !== lastPointerXRef.current) {
      pointerDirRef.current = e.clientX > lastPointerXRef.current ? "right" : "left";
      lastPointerXRef.current = e.clientX;
    }
    // When the mouse moves after keyboard navigation: restore pointer events on the
    // options scope and blur the keyboard-focused item so :focus-visible clears.
    // This ensures hover and keyboard focus never highlight two items simultaneously.
    if (keyboardNavRef.current) {
      keyboardNavRef.current = false;
      const panel = panelRef.current;
      if (panel) {
        const scope =
          panel.querySelector<HTMLElement>("[data-drill-active]") ?? panel;
        scope.style.pointerEvents = "";
        const focused = document.activeElement as HTMLElement | null;
        if (focused && panel.contains(focused)) focused.blur();
      }
    }
  }, [panelRole]);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const drillDepthRef = useRef(0);
  const drillPopRef = useRef<(() => void) | null>(null);
  const keyboardNavRef = useRef(false);

  /* ── Typeahead state — accumulating buffer + reset timer.
   * 1000ms window matches Radix Menu and React Aria useTypeSelect.
   * Held in refs (not state) because the rendered tree never reads them. */
  const typeaheadSearchRef = useRef("");
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Auto-activedescendant state.
   * When the panel handler detects an input is focused, ArrowUp/Down highlight
   * options via DOM mutation (`data-dropdown-active`) instead of moving DOM
   * focus, and `aria-activedescendant` is set on the input to announce the
   * highlighted option. The ref tracks the highlighted option's id across
   * re-renders so a `useLayoutEffect` can reapply the visual highlight after
   * the consumer's children re-render (e.g. when a filter narrows the list).
   * Consumers using `useDropdownCombobox` pass `panelKeyboardNav={false}` so
   * this code path never runs for them — they manage everything themselves. */
  const autoHighlightedIdRef = useRef<string | null>(null);
  const autoHighlightInputRef = useRef<HTMLElement | null>(null);
  const autoHighlightCounterRef = useRef(0);
  const rafRef = useRef<number>(undefined);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  type DismissReason = "escape" | "click-outside" | "programmatic";
  const dismissReasonRef = useRef<DismissReason>("programmatic");

  /* ── mount / unmount animation ────────────────── */

  const [isMounted, setIsMounted] = useState(open);
  const [anim, setAnim] = useState<"enter" | "exit" | "idle">(open ? "enter" : "idle");
  const exitTimerRef = useRef<number>(undefined);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    clearTimeout(exitTimerRef.current);

    if (open && !wasOpen) {
      setIsMounted(true);
      // Skip the enter animation when requested (e.g. sibling-submenu hand-off
      // where the predecessor was just dismissed without animation).
      setAnim(enterAnimation ? "enter" : "idle");
    } else if (!open && wasOpen) {
      if (exitAnimation) {
        setAnim("exit");
        exitTimerRef.current = window.setTimeout(
          () => setIsMounted(false),
          EXIT_MS + 50
        );
      } else {
        // Skip exit animation — unmount on next tick so React commits the
        // open=false state cleanly before the panel disappears.
        setAnim("idle");
        setIsMounted(false);
      }
      const reason = dismissReasonRef.current;
      const shouldRestoreFocus =
        reason === "escape" ||
        (reason === "click-outside" && restoreFocusOnOutsideClick);
      if (shouldRestoreFocus) {
        const el = returnFocusRef?.current ?? anchorRef.current;
        el?.focus({ preventScroll: true });
      }
      dismissReasonRef.current = "programmatic";
    }
    return () => clearTimeout(exitTimerRef.current);
  }, [open]);

  const animRef = useRef(anim);
  animRef.current = anim;

  const onAnimEnd = useCallback(() => {
    if (animRef.current === "enter") setAnim("idle");
    else if (animRef.current === "exit") {
      clearTimeout(exitTimerRef.current);
      setIsMounted(false);
      setAnim("idle");
    }
  }, []);

  /* ── scroll area max-height (measured) ────────── */

  const [scrollMaxH, setScrollMaxH] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (!isMounted) return;
    const hH = headerRef.current?.offsetHeight ?? 0;
    const fH = footerRef.current?.offsetHeight ?? 0;
    const next = maxHeight - hH - fH;
    setScrollMaxH((prev) => (prev === next ? prev : next));
  }, [isMounted, maxHeight]);

  /* ── positioning ──────────────────────────────── */

  const [pos, setPos] = useState({ x: 0, y: 0, side: "bottom" as Side, resolvedW: width });

  const updatePos = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;

    const anchorRect = anchor.getBoundingClientRect();
    const panelW = matchAnchorWidth ? anchorRect.width : width;
    const panelH = panel.offsetHeight;

    const vp = calcPosition(anchorRect, panelW, panelH, placement, offset);
    setPos({ x: vp.x + window.scrollX, y: vp.y + window.scrollY, side: vp.side, resolvedW: panelW });
  }, [anchorRef, placement, offset, width, matchAnchorWidth]);

  const updatePosRef = useRef(updatePos);
  updatePosRef.current = updatePos;

  useLayoutEffect(() => {
    if (isMounted) updatePosRef.current();
  }, [isMounted, placement, offset, width, matchAnchorWidth, layoutRevision]);

  useEffect(() => {
    if (!isMounted) return;
    const anchor = anchorRef.current;
    if (!anchor) return;

    const tick = () => {
      cancelAnimationFrame(rafRef.current!);
      rafRef.current = requestAnimationFrame(() => updatePosRef.current());
    };

    window.addEventListener("resize", tick);

    const ro = new ResizeObserver(tick);
    if (panelRef.current) ro.observe(panelRef.current);

    return () => {
      window.removeEventListener("resize", tick);
      ro.disconnect();
      cancelAnimationFrame(rafRef.current!);
    };
  }, [isMounted, anchorRef]);

  /* ── theme inheritance ────────────────────────── */

  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    setTheme(
      el.closest<HTMLElement>("[data-theme]")?.getAttribute("data-theme") ?? null
    );
  }, [anchorRef, isMounted]);

  useLayoutEffect(() => {
    if (!isMounted) {
      onPanelMount?.(null);
      return;
    }
    const el = panelRef.current;
    onPanelMount?.(el ?? null);
    if (!treeCtx || !el) return;
    return treeCtx.registerTreePanel(el);
  }, [isMounted, treeCtx, onPanelMount]);

  /* ── click outside ────────────────────────────── */

  useEffect(() => {
    if (!isMounted || !closeOnClickOutside) return;

    const handler = (e: MouseEvent) => {
      const panel = panelRef.current;
      const anchor = anchorRef.current;
      const target = e.target as Node;
      if (panel?.contains(target) || anchor?.contains(target)) return;
      if (
        clickOutsideExtraRefs?.some((r) => r.current && r.current.contains(target as Node))
      ) {
        return;
      }
      if (treeCtx?.isInsideTreePanels(target)) return;
      // Root menu (treeCtx === null): check the local registry that nested portals register into.
      if (isMenuRoot) {
        const el = target instanceof Element ? target : (target as Node).parentElement;
        if (el) {
          for (const p of rootTreePanelsRef.current) {
            if (p.contains(el)) return;
          }
        }
      }
      dismissReasonRef.current = "click-outside";
      onCloseRef.current();
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMounted, closeOnClickOutside, anchorRef, clickOutsideExtraRefs, treeCtx]);

  /* ── escape key ───────────────────────────────── */

  useEffect(() => {
    if (!isMounted || !closeOnEscape) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismissReasonRef.current = "escape";
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isMounted, closeOnEscape]);

  /* ── keyboard navigation ────────────────────────
     Manages arrow-key roving focus between options,
     focus-traps Tab within the panel, and auto-focuses
     the search input (or first option) on open.
     ─────────────────────────────────────────────── */

  const itemRole = panelRole === "menu" ? "menuitem" : "option";

  const getOptions = useCallback((): HTMLElement[] => {
    const panel = panelRef.current;
    if (!panel) return [];
    // When a drill level is active, scope to it only — avoids returning off-screen options
    // from other levels that would break arrow-key navigation and scroll-to-view.
    const scope: Element =
      panel.querySelector("[data-drill-active]") ?? panel;
    return Array.from(
      scope.querySelectorAll<HTMLElement>(
        `[role="${itemRole}"]:not([aria-disabled="true"])`
      )
    );
  }, [itemRole]);

  const getHeaderInput = useCallback((): HTMLElement | null => {
    // Per-level header-input parity with the top-level panel header: a search
    // input rendered inside a drilldown level (or root level when no drill is
    // active) should be discoverable too. The active level always carries
    // [data-drill-active], including the root level at depth 0.
    const panel = panelRef.current;
    const inputSel =
      'input:not([type="checkbox"]):not([type="radio"]):not([disabled]):not([readonly])';
    const drillActive = panel?.querySelector("[data-drill-active]") ?? null;
    const drillInput = drillActive?.querySelector<HTMLElement>(inputSel) ?? null;
    if (drillInput) return drillInput;
    return headerRef.current?.querySelector<HTMLElement>(inputSel) ?? null;
  }, []);

  const getFocusables = useCallback((): HTMLElement[] => {
    const panel = panelRef.current;
    if (!panel) return [];
    return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SEL));
  }, []);

  /** True when `el` is a text-typeable input/textarea (not checkbox/radio/hidden). */
  const isTextInputElement = useCallback((el: Element | null): el is HTMLElement => {
    if (!el) return false;
    if (el.tagName === "TEXTAREA") return true;
    if (el.tagName !== "INPUT") return false;
    const t = (el as HTMLInputElement).type;
    return t !== "checkbox" && t !== "radio" && t !== "hidden";
  }, []);

  /**
   * Walk visible options and ensure each has an `id` so we can target them
   * via `aria-activedescendant`. Generates ids only for options that don't
   * already have one (e.g. options rendered without `optionId`).
   */
  const ensureOptionIds = useCallback((opts: HTMLElement[]) => {
    for (const opt of opts) {
      if (!opt.id) {
        opt.id = `${id ?? "dd"}-auto-opt-${++autoHighlightCounterRef.current}`;
      }
    }
  }, [id]);

  /** Apply visual highlight + aria-activedescendant for the auto-activedescendant flow. */
  const applyAutoHighlight = useCallback(
    (opt: HTMLElement, inputEl: HTMLElement) => {
      const panel = panelRef.current;
      if (!panel) return;
      // Clear any prior highlight, then mark the new one.
      panel
        .querySelectorAll<HTMLElement>('[data-dropdown-active="true"]')
        .forEach((el) => el.removeAttribute("data-dropdown-active"));
      // If focus moved between inputs (e.g. from-to header), clear the stale
      // aria-activedescendant on the previous input.
      const prevInput = autoHighlightInputRef.current;
      if (prevInput && prevInput !== inputEl) {
        prevInput.removeAttribute("aria-activedescendant");
      }
      opt.setAttribute("data-dropdown-active", "true");
      autoHighlightedIdRef.current = opt.id;
      autoHighlightInputRef.current = inputEl;
      inputEl.setAttribute("aria-activedescendant", opt.id);
      opt.scrollIntoView({ block: "nearest" });
    },
    [],
  );

  /**
   * After every render, reconcile the visual highlight against
   * `autoHighlightedIdRef`. Necessary because the consumer's children re-render
   * on filter / list changes, and React doesn't preserve our DOM-mutated
   * `data-dropdown-active` attribute on freshly-rendered nodes. If the
   * previously-highlighted id is gone (option filtered out), re-anchor to the
   * first visible option.
   */
  useLayoutEffect(() => {
    if (!isMounted) return;
    const panel = panelRef.current;
    if (!panel) return;
    const inputEl = autoHighlightInputRef.current;
    // Clear any stale highlight markers (could be on a now-stale node).
    panel
      .querySelectorAll<HTMLElement>('[data-dropdown-active="true"]')
      .forEach((el) => el.removeAttribute("data-dropdown-active"));
    if (!autoHighlightedIdRef.current || !inputEl) return;
    // Look up the previously-highlighted option by id.
    const opt = panel.querySelector<HTMLElement>(
      `#${CSS.escape(autoHighlightedIdRef.current)}`,
    );
    if (opt) {
      opt.setAttribute("data-dropdown-active", "true");
      inputEl.setAttribute("aria-activedescendant", opt.id);
      return;
    }
    // Highlighted option vanished (e.g. filtered out) — re-anchor to first.
    const opts = getOptions();
    if (opts.length === 0) {
      autoHighlightedIdRef.current = null;
      inputEl.removeAttribute("aria-activedescendant");
      return;
    }
    ensureOptionIds(opts);
    applyAutoHighlight(opts[0], inputEl);
  });

  useEffect(() => {
    if (!isMounted || anim !== "enter" || !autoFocus) return;
    const timer = setTimeout(() => {
      const input = getHeaderInput();
      if (input) {
        input.focus();
        return;
      }
      const opts = getOptions();
      if (opts.length > 0) opts[0].focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [isMounted, anim, autoFocus, getHeaderInput, getOptions]);

  const handlePanelKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!panelKeyboardNav) return;
      // A consumer's onKeyDown on the input may already have claimed the key
      // (e.g. when wiring `useDropdownCombobox`). Bail so we don't double-handle.
      if (e.defaultPrevented) return;
      const panel = panelRef.current;
      if (!panel) return;
      const { key, shiftKey } = e;
      const active = document.activeElement as HTMLElement;
      const inputFocused = isTextInputElement(active) && panel.contains(active);

      /* ── Auto-activedescendant: when a search/text input inside the panel
       *    has focus, ArrowUp/Down/Home/End/Enter operate on a virtual
       *    highlight (`data-dropdown-active` + `aria-activedescendant`) so
       *    the input keeps DOM focus. Works for header inputs, drilldown
       *    levels with their own search, and HoverSubmenu panels. */
      if (inputFocused) {
        if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
          e.preventDefault();
          e.stopPropagation();
          const opts = getOptions();
          if (opts.length === 0) return;
          ensureOptionIds(opts);
          const currentId = autoHighlightedIdRef.current;
          const currentIdx = currentId
            ? opts.findIndex((o) => o.id === currentId)
            : -1;
          let nextIdx: number;
          if (key === "Home") nextIdx = 0;
          else if (key === "End") nextIdx = opts.length - 1;
          else if (key === "ArrowDown") {
            if (currentIdx === -1) nextIdx = 0;
            else if (currentIdx < opts.length - 1) nextIdx = currentIdx + 1;
            else if (keyboardWrap) nextIdx = 0;
            else return;
          } else {
            // ArrowUp
            if (currentIdx === -1) nextIdx = opts.length - 1;
            else if (currentIdx > 0) nextIdx = currentIdx - 1;
            else if (keyboardWrap) nextIdx = opts.length - 1;
            else return;
          }
          applyAutoHighlight(opts[nextIdx], active);
          return;
        }
        if (key === "Enter") {
          const id = autoHighlightedIdRef.current;
          if (!id) return;
          const opt = panel.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
          if (opt) {
            e.preventDefault();
            e.stopPropagation();
            opt.click();
          }
          return;
        }
        // Other keys (typing, Escape, Tab) fall through to the existing
        // handling below so the input still receives them naturally.
      } else if (autoHighlightedIdRef.current) {
        // Focus left the input (e.g. user clicked an option). Drop the
        // virtual highlight so the next interaction doesn't show two states.
        autoHighlightInputRef.current?.removeAttribute("aria-activedescendant");
        autoHighlightedIdRef.current = null;
        autoHighlightInputRef.current = null;
        panel
          .querySelectorAll<HTMLElement>('[data-dropdown-active="true"]')
          .forEach((el) => el.removeAttribute("data-dropdown-active"));
      }

      /* ── ArrowLeft: pop drill (any role), or close submenu at root (menu only) ──
       *
       * Drilldown is independent of `role` (works for both `menu` and `listbox`),
       * so the pop-drill action shouldn't be gated on role. Closing on
       * ArrowLeft at the root level is menu-only — listbox panels keep
       * ArrowLeft for native left-cursor / sibling-option intent.
       *
       * Skipped when focus is inside a text input so the input retains its
       * native horizontal-cursor behaviour (drill-level search inputs etc.). */
      if (key === "ArrowLeft" && !inputFocused) {
        if (drillDepthRef.current > 0 && drillPopRef.current) {
          e.preventDefault();
          e.stopPropagation();
          drillPopRef.current();
          return;
        }
        if (panelRole === "menu") {
          e.preventDefault();
          e.stopPropagation();
          dismissReasonRef.current = "escape"; // reuse escape path so returnFocusRef fires
          onCloseRef.current();
          return;
        }
      }

      /* ── Arrow Up / Down ── */
      if (key === "ArrowDown" || key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation(); // prevent bubbling to an ancestor menu panel via React portal tree
        // Enter keyboard-nav mode: suppress hover so only one item is highlighted.
        keyboardNavRef.current = true;
        const navScope = panel.querySelector<HTMLElement>("[data-drill-active]") ?? panel;
        navScope.style.pointerEvents = "none";
        const opts = getOptions();
        if (opts.length === 0) return;

        const hInput = getHeaderInput();
        const inHeader = hInput && headerRef.current?.contains(active);

        let idx = opts.indexOf(active);
        if (idx < 0) {
          const closest = active.closest(`[role="${itemRole}"]`) as HTMLElement;
          if (closest) idx = opts.indexOf(closest);
        }

        if (key === "ArrowDown") {
          if (inHeader || idx < 0) focusVisible(opts[0]);
          else if (idx < opts.length - 1) focusVisible(opts[idx + 1]);
          else if (keyboardWrap) focusVisible(opts[0]);
        } else {
          if (idx === 0) {
            if (keyboardWrap) focusVisible(opts[opts.length - 1]);
            else if (hInput) focusVisible(hInput);
            else if (returnFocusRef?.current) returnFocusRef.current.focus();
          } else if (idx > 0) focusVisible(opts[idx - 1]);
        }

        requestAnimationFrame(() => {
          const f = document.activeElement as HTMLElement;
          if (!f || !panel.contains(f)) return;
          const allOpts = getOptions();
          const focusedIdx = allOpts.indexOf(f);
          // Find the scroll container inside the active drill level (or full panel).
          const drillScope = panel.querySelector("[data-drill-active]") ?? panel;
          const sc = Array.from(drillScope.querySelectorAll<HTMLElement>("*")).find((el) => {
            const s = window.getComputedStyle(el);
            return s.overflowY === "auto" || s.overflowY === "scroll";
          }) ?? null;
          if (!sc) return;
          if (focusedIdx === 0) {
            sc.scrollTop = 0;
          } else if (focusedIdx === allOpts.length - 1) {
            sc.scrollTop = sc.scrollHeight;
          } else {
            const itemRect = f.getBoundingClientRect();
            const scRect = sc.getBoundingClientRect();
            if (itemRect.top < scRect.top) sc.scrollTop -= scRect.top - itemRect.top;
            else if (itemRect.bottom > scRect.bottom) sc.scrollTop += itemRect.bottom - scRect.bottom;
          }
        });
        return;
      }

      /* ── Home / End (skip when inside a text input) ── */
      if (key === "Home" || key === "End") {
        const isTextInput =
          active?.tagName === "INPUT" &&
          (active as HTMLInputElement).type !== "checkbox" &&
          (active as HTMLInputElement).type !== "radio";
        if (isTextInput) return;

        e.preventDefault();
        e.stopPropagation();
        keyboardNavRef.current = true;
        const navScope = panel.querySelector<HTMLElement>("[data-drill-active]") ?? panel;
        navScope.style.pointerEvents = "none";
        const opts = getOptions();
        if (opts.length === 0) return;
        const target = key === "Home" ? opts[0] : opts[opts.length - 1];
        focusVisible(target);
        target?.scrollIntoView?.({ block: "nearest" });
        return;
      }

      /* ── Typeahead — single printable character jumps to next matching option.
       * Skipped when focus is inside a text input (search header / inline drill
       * input) so the input owns typing. Buffer accumulates and resets after
       * 1000ms; repeated single-letter ("aaa") normalizes to "a" so each press
       * cycles to the next match. Matches Radix Menu + React Aria patterns. */
      if (
        key.length === 1 &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        const tag = active?.tagName;
        const inputType = (active as HTMLInputElement | null)?.type;
        const isInTextInput =
          tag === "TEXTAREA" ||
          (tag === "INPUT" &&
            inputType !== "checkbox" &&
            inputType !== "radio" &&
            inputType !== "hidden");
        if (isInTextInput) {
          // Let the input own the keystroke; fall through to Tab below.
        } else {
          if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
          typeaheadSearchRef.current += key.toLowerCase();
          typeaheadTimerRef.current = setTimeout(() => {
            typeaheadSearchRef.current = "";
          }, 1000);

          const opts = getOptions();
          if (opts.length === 0) return;

          // Same-letter cycling: "aaa" → "a", advances through matches.
          const buf = typeaheadSearchRef.current;
          const search =
            buf.length > 1 && buf.split("").every((c) => c === buf[0])
              ? buf[0]
              : buf;

          const currentIdx = opts.indexOf(active);
          // Single-letter cycle: start AFTER the focused item; multi-letter
          // (still building the search) starts from the focused item.
          const startIdx =
            search.length === 1 && currentIdx >= 0
              ? (currentIdx + 1) % opts.length
              : Math.max(currentIdx, 0);

          let match: HTMLElement | null = null;
          for (let i = 0; i < opts.length; i++) {
            const idx = (startIdx + i) % opts.length;
            const candidate = opts[idx];
            const text = (
              candidate.getAttribute("aria-label") ??
              candidate.textContent ??
              ""
            )
              .trim()
              .toLowerCase();
            if (text.startsWith(search)) {
              match = candidate;
              break;
            }
          }

          if (match && match !== active) {
            e.preventDefault();
            e.stopPropagation();
            keyboardNavRef.current = true;
            focusVisible(match);
            match.scrollIntoView?.({ block: "nearest" });
          }
          return;
        }
      }

      /* ── Tab ── */
      if (key === "Tab") {
        if (panelRole === "menu") {
          // Menus are not modal — Tab closes the menu and lets focus move naturally.
          e.preventDefault();
          e.stopPropagation();
          dismissReasonRef.current = "programmatic";
          onCloseRef.current();
        } else {
          // Listbox / non-menu: trap focus within the panel.
          const focusables = getFocusables();
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last  = focusables[focusables.length - 1];
          if (shiftKey) {
            if (active === first || !panel.contains(active)) {
              e.preventDefault();
              focusVisible(last);
            }
          } else {
            if (active === last || !panel.contains(active)) {
              e.preventDefault();
              focusVisible(first);
            }
          }
        }
      }
    },
    [
      getOptions,
      getHeaderInput,
      getFocusables,
      returnFocusRef,
      panelKeyboardNav,
      keyboardWrap,
      isTextInputElement,
      ensureOptionIds,
      applyAutoHighlight,
    ]
  );

  /* ── render ───────────────────────────────────── */

  if (!isMounted) return null;

  const capSide = pos.side.charAt(0).toUpperCase() + pos.side.slice(1);
  const animClass =
    anim === "enter"
      ? styles[`enter${capSide}`]
      : anim === "exit"
        ? styles[`exit${capSide}`]
        : "";

  const panelStyle: CSSProperties = {
    position: "absolute",
    top: Math.round(pos.y),
    left: Math.round(pos.x),
    width: pos.resolvedW,
    zIndex,
  };

  const panelNode = (
    <div
      ref={panelRef}
      id={id}
      role={panelRole}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-dropdown-tree-panel=""
      className={cx(styles.panel, animClass, className)}
      style={panelStyle}
      data-theme={theme || undefined}
      onAnimationEnd={onAnimEnd}
      onKeyDown={panelKeyboardNav ? handlePanelKeyDown : undefined}
      onPointerMove={handlePanelPointerMove}
    >
      {header && (
        <div ref={headerRef} className={styles.header}>{header}</div>
      )}

      <DrilldownProvider open={open}>
        <DrilldownPanelContent
          scrollMaxH={scrollMaxH}
          drillDepthRef={drillDepthRef}
          drillPopRef={drillPopRef}
        >
          {children}
        </DrilldownPanelContent>
      </DrilldownProvider>

      {footer && (
        <div ref={footerRef} className={styles.footer}>{footer}</div>
      )}
    </div>
  );

  // Wrap with item-role context so every child item gets the correct ARIA role
  // automatically, then with grace + sibling contexts for menu panels.
  const itemRoleValue: "menuitem" | "option" =
    panelRole === "menu" ? "menuitem" : "option";

  const maybeWrappedPanel =
    panelRole === "menu" && graceCtx && siblingManager ? (
      <MenuItemRoleContext.Provider value={itemRoleValue}>
        <MenuGraceContext.Provider value={graceCtx}>
          <SiblingSubmenuContext.Provider value={siblingManager}>
            {panelNode}
          </SiblingSubmenuContext.Provider>
        </MenuGraceContext.Provider>
      </MenuItemRoleContext.Provider>
    ) : (
      <MenuItemRoleContext.Provider value={itemRoleValue}>
        {panelNode}
      </MenuItemRoleContext.Provider>
    );

  return createPortal(
    isMenuRoot ? (
      <DropdownMenuTreeProvider panelsRef={rootTreePanelsRef}>
        <MenuDebugContext.Provider value={debugSubmenuBridge}>
          {maybeWrappedPanel}
        </MenuDebugContext.Provider>
      </DropdownMenuTreeProvider>
    ) : maybeWrappedPanel,
    document.body
  );
}

Dropdown.displayName = "Dropdown";
