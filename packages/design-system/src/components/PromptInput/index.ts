export {
  PromptInput,
  PromptInputAttachments,
  PromptInputTextarea,
  PromptInputRichTextEditor,
  PromptInputFooter,
  PromptInputFooterStart,
  PromptInputAddMenu,
  PromptInputToolsButton,
  PromptInputSubmit,
  DEFAULT_TRIGGER_MENUS,
} from "./PromptInput";
export { PromptInputInfo } from "./PromptInputInfo";
export { PromptInputRecommendations } from "./PromptInputRecommendations";
export type { PromptInputRecommendationsProps, RecommendationItem } from "./PromptInputRecommendations";
export type { PromptInputInfoProps, PromptInputInfoType } from "./PromptInputInfo";
export {
  usePromptInput,
  usePromptInputSurface,
  useInsertChip,
} from "./promptInputContext";
export type {
  PromptInputContextValue,
  PromptInputAttachmentMenuSource,
} from "./promptInputContext";
// Shared menu data — single source of truth for the canonical attachment
// items and `@` mention categories.
export {
  ATTACHMENT_MENU_ITEMS,
  SUGGESTED_CONTEXT_ITEMS,
  CONTEXT_CATEGORIES,
  MENTION_MENU_ITEMS,
} from "./menuData";
// New trigger-menu engine — replaces the legacy `PromptInputContextMenu`.
export { TriggerMenu } from "./TriggerMenu";
export type { TriggerMenuProps, TriggerMenuRenderItemProps } from "./TriggerMenu";
export { useTriggerMenu } from "./useTriggerMenu";
export type {
  UseTriggerMenuConfig,
  UseTriggerMenuReturn,
  TriggerSelectHelpers,
  TriggerMenuOptionProps,
  TriggerMenuBackRowProps,
} from "./useTriggerMenu";
// Canonical menu data shape — shared by Dropdown drilldown and TriggerMenu.
export type { MenuNode } from "../../types/MenuNode";
export type {
  PromptInputProps,
  PromptInputHandle,
  PromptInputAttachmentsProps,
  PromptAttachedFile,
  PromptInputTextareaProps,
  PromptInputRichTextEditorProps,
  PromptInputFooterProps,
  PromptInputFooterStartProps,
  PromptInputAddMenuProps,
  PromptInputAttachmentKind,
  PromptInputToolsButtonProps,
  PromptInputSubmitProps,
  PromptInputTriggerConfig,
} from "./PromptInput";
export type { PromptInputContextItem } from "./promptInputTypes";
