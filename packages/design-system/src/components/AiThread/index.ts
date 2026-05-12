export { AiThread } from "./AiThread";
export type { AiThreadProps, AiThreadHandle, AiThreadMessage, UserThreadMessage, AssistantThreadMessage } from "./aiThreadTypes";

export { AiThreadIntro, AiThreadIntroActions, AiThreadIntroEntities } from "./AiThreadIntro";
export type { AiThreadIntroProps, AiThreadIntroActionsProps, AiThreadIntroEntitiesProps, AiThreadIntroEntityItem } from "./AiThreadIntro";

// Dialog indicator — opt-in companion component for conversation navigation.
export { AiThreadDialogIndicator } from "./AiThreadDialogIndicator";
export type { AiThreadDialogIndicatorProps, AiThreadDialogIndicatorItem } from "./AiThreadDialogIndicator";
export { useAiThreadActiveMessage } from "./useAiThreadActiveMessage";
