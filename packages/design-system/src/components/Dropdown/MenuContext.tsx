import { createContext } from "react";
import type { MutableRefObject } from "react";

/* ── Item role ────────────────────────────────────────────────────────────── */

/**
 * Provided by Dropdown to its children so every item automatically gets the
 * correct ARIA role without consumers needing to pass `itemRole` manually.
 *
 * "menu"    → "menuitem"   (role="menu" Dropdown)
 * "listbox" → "option"     (role="listbox" Dropdown, default)
 * null      → no override  (outside any Dropdown)
 */
export const MenuItemRoleContext = createContext<"menuitem" | "option" | null>(null);

/* ── Depth / Debug ────────────────────────────────────────────────────────── */

/**
 * Tracks the current submenu nesting depth.
 * The root menu Dropdown provides 0; each HoverSubmenu increments it for its children.
 */
export const MenuDepthContext = createContext(0);

/**
 * When true, HoverSubmenu can draw a debug overlay.
 * Set once via `debugSubmenuBridge` on the root menu Dropdown; propagates automatically.
 */
export const MenuDebugContext = createContext(false);

/* ── Grace area ───────────────────────────────────────────────────────────── */

type Point = { x: number; y: number };

/**
 * A convex polygon (5 points) computed when the cursor leaves a submenu trigger:
 *   [cursorExitPoint, panel.topLeft, panel.topRight, panel.bottomRight, panel.bottomLeft]
 *
 * Any sibling row whose onPointerEnter finds the cursor inside this polygon —
 * and confirms the cursor is moving in the correct direction — skips opening,
 * because the cursor is traversing toward the open submenu's panel.
 */
export interface GraceIntent {
  area: Point[];
  /** Which side the panel is on relative to the trigger (always "right" for right-start). */
  side: "left" | "right";
}

export interface MenuGraceContextValue {
  graceIntentRef: MutableRefObject<GraceIntent | null>;
  pointerDirRef: MutableRefObject<"left" | "right">;
  /** Set or clear the active grace intent. Called by the trigger on pointerLeave. */
  setGraceIntent(intent: GraceIntent | null): void;
  /**
   * Returns true if (x, y) is inside the grace polygon AND the pointer is moving
   * toward the submenu panel. Used by sibling rows in their onPointerEnter to decide
   * whether to skip opening.
   */
  isInGrace(x: number, y: number): boolean;
}

/** Provided by each `role="menu"` Dropdown to its direct children. */
export const MenuGraceContext = createContext<MenuGraceContextValue | null>(null);

/* ── Sibling submenu coordinator ─────────────────────────────────────────── */

/**
 * One instance per `role="menu"` Dropdown panel.
 * When one HoverSubmenu opens, it calls `notifyOpen` which immediately closes all
 * other registered siblings — preventing two submenus from being open at once.
 */
export interface SiblingSubmenuManager {
  /** Register a submenu's instant-close callback. Returns an unregister function. */
  register(id: symbol, closeNow: () => void): () => void;
  /** Immediately close every registered sibling whose id ≠ caller's id. */
  notifyOpen(id: symbol): void;
}

export const SiblingSubmenuContext = createContext<SiblingSubmenuManager | null>(null);
