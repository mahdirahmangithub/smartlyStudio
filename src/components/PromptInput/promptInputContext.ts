import { createContext, useContext, type RefObject } from "react";
import type { PromptAttachedFile, PromptInputAttachmentKind } from "./promptInputTypes";

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
}

export const PromptInputContext = createContext<PromptInputContextValue | null>(null);

export function usePromptInput(): PromptInputContextValue {
  const ctx = useContext(PromptInputContext);
  if (!ctx) throw new Error("PromptInput compound components must be used inside <PromptInput>");
  return ctx;
}
