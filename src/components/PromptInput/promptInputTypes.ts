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
 * // '/' shows commands, '@' shows mention targets
 * triggerMenus={[
 *   { char: "/", items: commandItems },
 *   { char: "@", items: mentionItems },
 * ]}
 */
export interface PromptInputTriggerConfig {
  /** The single character that opens this menu (e.g. '/', '@', ':'). */
  char: string;
  /**
   * Items to display when this trigger fires. When omitted, falls back to the
   * built-in attachment item list (all items shown for this trigger).
   */
  items?: readonly import("./promptInputAttachmentMenuData").AttachmentMenuItemDef[];
}
