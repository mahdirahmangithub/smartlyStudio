export { RichTextEditor } from "./RichTextEditor";
export type { RichTextEditorHandle, RichTextEditorProps, RichTextEditorSize } from "./RichTextEditor";

/* Plugin exports — consumers can use these when building Lexical extensions */
export { ControlledValuePlugin } from "./plugins/ControlledValuePlugin";
export { SubmitPlugin } from "./plugins/SubmitPlugin";
export { DisabledPlugin } from "./plugins/DisabledPlugin";
export { ScrollFadesPlugin } from "./plugins/ScrollFadesPlugin";
export { TriggerMenuPlugin } from "./plugins/TriggerMenuPlugin";
export type { TriggerMenuPluginProps } from "./plugins/TriggerMenuPlugin";

/* Node exports */
export { ChipNode, $createChipNode, $isChipNode } from "./nodes/ChipNode";
export type { SerializedChipNode } from "./nodes/ChipNode";
