import type { CSSProperties, ReactNode, RefObject } from "react";
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
  components?: Record<string, (attrs: Record<string, string>) => ReactNode>;
}

export type AiThreadMessage = UserThreadMessage | AssistantThreadMessage;

export interface AiThreadProps {
  messages: AiThreadMessage[];
  /**
   * External scroll container ref. When provided, the thread renders as plain
   * flow content and delegates all scrolling to this element (e.g. page scroll
   * or a drawer's scroll div). Omit to use the default self-contained scroll.
   */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  /**
   * Height in px of a fixed/overlapping PromptInput outside the thread.
   * Applied as FAB sticky offset and IntersectionObserver rootMargin so
   * "at bottom" excludes the covered zone. In external scroll mode this does
   * NOT add padding-bottom to the list since the PromptInput is in-flow below.
   * Default 0.
   */
  bottomOffset?: number;
  /**
   * Content shown when messages is empty. Disappears automatically once the
   * first message is added. Typically an EmptyState component.
   */
  introContent?: ReactNode;
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
  /**
   * Returns the element that owns the thread's scroll position — either the
   * internal scroll container (self-contained mode) or the external container
   * passed via `scrollContainerRef` (external-scroll mode).
   *
   * Useful for companion components such as `<AiThreadDialogIndicator>` that
   * need to observe scroll position without modifying the thread itself.
   */
  getScrollContainer: () => HTMLElement | null;
}
