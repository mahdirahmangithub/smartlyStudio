import type { IconName } from "../Icon";

/** A single context item shown as a chip in the context row. */
export interface PromptInputContextItem {
  id: string;
  icon: IconName;
  label: string;
}

/**
 * Attachment entry points from the add (+) menu and inline trigger menus.
 * - `photos-files` — combined picker (images + any file); opens the native file dialog (unrestricted accept).
 * - `context` / `google-drive` — notify only via `onAddAttachmentSelect`; host wires UI (no built-in picker).
 */
export type PromptInputAttachmentKind =
  | "file"
  | "image"
  | "photos-files"
  | "link"
  | "context"
  | "google-drive";

export interface PromptAttachedFile {
  id: string;
  file: File;
  /** Object URL for image/video preview; revoked when the attachment is removed. */
  previewUrl?: string;
}

/**
 * Maps a single trigger character to the menu items it should display.
 *
 * @example
 * // '/' shows commands, '@' shows a custom context menu
 * triggerMenus={[
 *   { char: "/", items: commandItems },
 *   { char: "@", renderContent: ({ query, onClose }) => <ContextMenu query={query} onClose={onClose} /> },
 * ]}
 */
export interface PromptInputTriggerConfig {
  /** The single character that opens this menu (e.g. '/', '@', ':'). */
  char: string;
  /**
   * Items to display when this trigger fires. When omitted, falls back to the
   * built-in attachment item list (all items shown for this trigger).
   * Ignored when `renderContent` is provided.
   */
  items?: readonly import("./promptInputAttachmentMenuData").AttachmentMenuItemDef[];
  /**
   * Render custom content inside the Dropdown when this trigger fires.
   * When provided, overrides `items` — the host is responsible for rendering
   * and selection handling but receives keyboard-nav state so it can match
   * the combobox experience of the built-in attachment menu:
   *
   * - `query` — text typed after the trigger character (use to filter items).
   * - `onClose` — call to dismiss the menu.
   * - `activeIndex` — currently highlighted row index (0-based, across all rows).
   * - `setItemCount` — **call this (via useEffect) whenever your visible item count changes**
   *   so arrow-key wrapping stays correct.
   * - `registerPickHandler` — **call this (via useEffect) with a function that selects
   *   `activeIndex`** so Enter/click picks the right item.
   * - `menuId` — base id for option elements; use `${menuId}-opt-${index}` as the
   *   `id` on each row so `aria-activedescendant` points to the right element.
   */
  renderContent?: (props: {
    query: string;
    /** Dismiss the menu without removing the trigger character (Escape / click-outside). */
    onClose: () => void;
    /**
     * Call when the user accepts a selection — removes the trigger character + typed
     * query from the textarea, then closes the menu.
     */
    onAccept: () => void;
    activeIndex: number;
    setItemCount: (n: number) => void;
    registerPickHandler: (fn: () => void) => void;
    menuId: string;
  }) => import("react").ReactNode;
}
