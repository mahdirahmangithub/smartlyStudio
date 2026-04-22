import type { CSSProperties, ReactNode } from "react";
import type { AiResponseBubblePhase } from "../AiResponseBubble";
import type { UserBubbleAttachment, UserBubbleContextItem } from "../UserBubble";
import type { FeedbackValue } from "../FeedbackBoolean";

export interface UserThreadMessage {
  id: string;
  role: "user";
  message: string;
  attachments?: UserBubbleAttachment[];
  contextItems?: UserBubbleContextItem[];
  replyLabel?: string;
  onCopy?: (value: string) => void;
  onEdit?: () => void;
}

export interface AssistantThreadMessage {
  id: string;
  role: "assistant";
  phase: AiResponseBubblePhase;
  loadingLabel?: string;
  text?: string;
  cotContent?: ReactNode;
  cotTitle?: string;
  cotExpanded?: boolean;
  cotDefaultExpanded?: boolean;
  onCotExpandedChange?: (expanded: boolean) => void;
  copyValue?: string;
  onRegenerate?: () => void;
  showFeedback?: boolean;
  feedbackValue?: FeedbackValue;
  onFeedbackChange?: (value: FeedbackValue) => void;
  slot?: ReactNode;
}

export type AiThreadMessage = UserThreadMessage | AssistantThreadMessage;

export interface AiThreadProps {
  messages: AiThreadMessage[];
  /**
   * Height in px of a fixed/overlapping PromptInput outside the thread.
   * Applied as padding-bottom on the message list, FAB sticky offset, and
   * IntersectionObserver rootMargin so "at bottom" excludes the covered zone.
   * Default 0 — not needed when PromptInput is in-flow (drawer/popup/flex mode).
   */
  bottomOffset?: number;
  /** When true, shows a top loading indicator for upward history paging. */
  hasMore?: boolean;
  /** Called when the user scrolls near the top and hasMore is true. */
  onLoadMore?: () => void;
  className?: string;
  style?: CSSProperties;
}

export interface AiThreadHandle {
  /** Scroll to the bottom and enter auto-follow mode. Call on new user message submit. */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  /**
   * Scroll a specific message to the top of the visible area and enter auto-follow mode.
   * Use on submit: flushSync the new messages first, then call this with the new user message id.
   */
  scrollToMessage: (id: string, behavior?: ScrollBehavior) => void;
}
