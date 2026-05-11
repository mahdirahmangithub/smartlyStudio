import type { IconName } from "../Icon";
import type { MenuNode } from "../../types/MenuNode";
import type { MenuNodeFilter } from "../../utils/filterMenuTree";

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

/** Helpers passed to a trigger config's `onSelect` handler. */
export interface TriggerSelectHelpers {
  /**
   * Insert this item as an inline chip in the rich-text editor and remove
   * the trigger char + typed query. **No-op when the surface is the plain
   * textarea** (see `surface`).
   */
  insertChip: () => void;
  /** Add this item to the prompt's external context row. Works on both surfaces. */
  addContextItem: () => void;
  /** Close the menu without removing the trigger character. */
  close: () => void;
  /** Close the menu and remove the typed trigger + query from the input. */
  accept: () => void;
  /** Surface the input is mounted on — `"rte"` for rich-text, `"textarea"` for plain. */
  surface: "textarea" | "rte";
}

/** Props passed to a trigger config's optional `renderContent` escape hatch. */
export interface PromptInputRenderContentProps {
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
}

/**
 * Maps a single trigger character to the menu it should display.
 *
 * Three modes — pick the one that fits your use case:
 *
 * 1. **Data-driven** (recommended): pass `items` (a recursive `MenuNode` tree).
 *    `<PromptInput>` renders them via `<TriggerMenu>` automatically — filter,
 *    drill, keyboard nav, default item routing all handled.
 *    Optional `onSelect` overrides the default (insert chip in RTE / add to
 *    context row in textarea); optional `filter` overrides the default
 *    label/keywords substring match.
 *
 * 2. **Custom rendering**: pass `renderContent`. You drive the entire UI
 *    inside the Dropdown. Useful for one-off layouts. `items`/`onSelect`/
 *    `filter` are ignored when `renderContent` is provided.
 *
 * 3. **Built-in defaults**: omit both `items` and `renderContent` — the
 *    built-in attachment menu (`/`-style) renders with the canonical
 *    attachment kinds.
 *
 * @example
 * triggerMenus={[
 *   { char: "/", items: SLASH_COMMANDS, onSelect: (item) => runCommand(item.kind) },
 *   { char: "@", items: CONTEXT_CATEGORIES }, // default onSelect
 *   { char: "#", renderContent: (props) => <CustomTagPicker {...props} /> },
 * ]}
 */
export interface PromptInputTriggerConfig {
  /** The single character that opens this menu (e.g. `'/'`, `'@'`, `':'`). */
  char: string;
  /**
   * Recursive menu data. When provided, `<PromptInput>` renders it via
   * `<TriggerMenu>` (filter + drill + keyboard nav handled automatically).
   * Ignored when `renderContent` is provided.
   */
  items?: readonly MenuNode[];
  /**
   * Called when the user picks a leaf item. Receives surface-aware helpers
   * so the same config works for textarea and RTE consumers without per-
   * surface glue. Default when omitted: `helpers.insertChip()` + close (RTE)
   * or `helpers.addContextItem()` + accept (textarea).
   */
  onSelect?: (item: MenuNode, helpers: TriggerSelectHelpers) => void;
  /**
   * Override the default filter (case-insensitive substring against label,
   * subtitle, keywords).
   */
  filter?: MenuNodeFilter;
  /**
   * Escape hatch — fully custom rendering. When provided, `items` /
   * `onSelect` / `filter` are ignored; the consumer drives everything.
   * Use only when the data-driven path can't express your UI.
   */
  renderContent?: (props: PromptInputRenderContentProps) => import("react").ReactNode;
}
