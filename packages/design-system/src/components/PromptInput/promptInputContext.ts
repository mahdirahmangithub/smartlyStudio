import { createContext, useContext, useCallback, type RefObject } from "react";
import { $getSelection, $isRangeSelection, type LexicalEditor } from "lexical";
import type { PromptAttachedFile, PromptInputAttachmentKind, PromptInputContextItem } from "./promptInputTypes";
import type { ActiveTextareaTrigger } from "../../utils/textareaTrigger";
import { $createChipNode } from "../RichTextEditor";
import type { IconName } from "../Icon";

/** Source of the shared attachment `Dropdown` (inline trigger vs + button). */
export type PromptInputAttachmentMenuSource = "none" | "button" | "caret";

export interface PromptInputContextValue {
  value: string;
  setValue: (v: string) => void;
  loading: boolean;
  disabled: boolean;
  hasAttachments: boolean;
  error: boolean;
  attachedFiles: PromptAttachedFile[];
  removeAttachedFile: (id: string) => void;
  openAttachmentPicker: (kind: PromptInputAttachmentKind) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  submit: () => void;
  stop: () => void;
  syncAttachmentMenuFromTextarea: () => void;
  /**
   * Editor-path equivalent of syncAttachmentMenuFromTextarea.
   * Pass the Lexical match (or null when no trigger is active) and the caret's
   * viewport-relative DOMRect (used to position the dropdown anchor element).
   */
  syncAttachmentMenuFromEditor: (
    match: ActiveTextareaTrigger | null,
    caretRect: DOMRect | null,
  ) => void;
  /** Trigger characters currently configured (derived from triggerMenus). */
  triggerCharsSet: ReadonlySet<string>;
  /**
   * The Lexical editor instance when PromptInputRichTextEditor is used.
   * Null when using the plain textarea surface.
   * Useful for compound components rendered outside the LexicalComposer tree
   * (e.g. renderContent dropdowns) that need to mutate editor state.
   */
  lexicalEditor: LexicalEditor | null;
  /** Called by PromptInputRichTextEditor to register/unregister its editor instance. */
  _registerLexicalEditor: (editor: LexicalEditor | null) => void;
  openAttachmentMenuAtCaret: () => void;
  openAttachmentMenuFromButton: () => void;
  pickAttachmentKind: (kind: PromptInputAttachmentKind) => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  addMenuOnSelectRef: RefObject<((kind: PromptInputAttachmentKind) => void) | null>;
  attachmentMenuOpenForButton: boolean;
  attachmentMenuId: string;
  attachmentMenuOpen: boolean;
  attachmentMenuSource: PromptInputAttachmentMenuSource;
  closeAttachmentMenu: () => void;
  /** Caret `/` `@` listbox: keyboard highlight index; meaningful when combobox mode. */
  caretAttachmentActiveIndex: number;
  setCaretAttachmentActiveIndex: (index: number | ((prev: number) => number)) => void;
  /** `+` button menu: highlight index (mirrors caret styling; synced via focus/hover). */
  buttonAttachmentActiveIndex: number;
  setButtonAttachmentActiveIndex: (index: number | ((prev: number) => number)) => void;
  /** Number of filtered attachment options (for arrow clamp). */
  caretAttachmentItemCount: number;
  /** True when caret menu is open with listbox (not the + button menu). */
  attachmentMenuCombobox: boolean;
  /** Picks the currently highlighted `/` `@` option (keyboard/mouse). */
  pickHighlightedCaretAttachment: () => void;
  // ── Context row ──
  contextItems: PromptInputContextItem[];
  addContextItem: (item: PromptInputContextItem) => void;
  removeContextItem: (id: string) => void;
  /** When true, the context row is always visible (even with no items). */
  showContextRow: boolean;
  /** Called when the "Add context" chip is clicked. */
  onAddContext?: () => void;
}

export const PromptInputContext = createContext<PromptInputContextValue | null>(null);

export function usePromptInput(): PromptInputContextValue {
  const ctx = useContext(PromptInputContext);
  if (!ctx) throw new Error("PromptInput compound components must be used inside <PromptInput>");
  return ctx;
}

/**
 * Returns the surface this PromptInput is mounted on:
 * - `"rte"` when used inside `<PromptInputRichTextEditor>` (a Lexical editor
 *   has registered itself with the context).
 * - `"textarea"` when used with the plain textarea surface.
 *
 * Trigger menus use this to route a picked item to the right sink: an inline
 * chip (RTE) vs the prompt's external context row (textarea).
 */
export function usePromptInputSurface(): "textarea" | "rte" {
  const { lexicalEditor } = usePromptInput();
  return lexicalEditor ? "rte" : "textarea";
}

/**
 * Returns a function that inserts an inline chip into the rich-text editor
 * at the current selection, deleting the trigger character + the user's
 * query that produced it.
 *
 * No-op when the surface is the plain textarea (no Lexical editor registered).
 *
 * Use inside a custom trigger `onSelect` handler — e.g. when picking an `@`
 * item should materialize as a chip in the RTE rather than land in an
 * external context row. `deleteCount` is the number of characters to remove
 * before the caret; usually `query.length + 1` to consume the trigger char
 * + everything typed after it.
 *
 * Encapsulates the Lexical boilerplate (`editor.update` + `$getSelection` +
 * `deleteCharacter` × deleteCount + `insertNodes([$createChipNode(...)])`)
 * that consumers used to reimplement per playground.
 */
export function useInsertChip(): (label: string, icon: IconName, deleteCount: number) => void {
  const { lexicalEditor } = usePromptInput();
  return useCallback(
    (label, icon, deleteCount) => {
      if (!lexicalEditor) return;
      lexicalEditor.update(() => {
        const sel = $getSelection();
        if (!$isRangeSelection(sel)) return;
        for (let i = 0; i < deleteCount; i++) sel.deleteCharacter(true);
        sel.insertNodes([
          $createChipNode(label, icon as Parameters<typeof $createChipNode>[1]),
        ]);
      });
    },
    [lexicalEditor],
  );
}
