import type { HTMLAttributes, ReactNode } from "react";
import type { FeedbackValue } from "../FeedbackBoolean";

export type AiResponseBubblePhase = "loading" | "generating" | "done";

export interface AiResponseBubbleProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Current rendering phase. */
  phase: AiResponseBubblePhase;

  /** Label shown next to the loading logo. */
  loadingLabel?: string;

  /**
   * When provided in "loading" phase, enables a chevron that expands a CoT
   * reasoning panel beneath the loading row.
   * In "generating" / "done" phases this content is shown inside a titled
   * CotContainer reasoning block.
   */
  cotContent?: ReactNode;
  /** Title for the CotContainer shown in generating/done phases. */
  cotTitle?: string;
  /** Whether the CoT block is expanded (generating/done, controlled). */
  cotExpanded?: boolean;
  /** Initial expanded state for CoT block (uncontrolled). */
  cotDefaultExpanded?: boolean;
  /** Called when CoT expanded state changes. */
  onCotExpandedChange?: (expanded: boolean) => void;

  /**
   * The HTML response text. During "generating" this is the partial HTML
   * streamed so far — update it as chunks arrive. During "done" it is the
   * full final HTML. Rendered through ResponseBody (DOMParser, no dangerouslySetInnerHTML).
   */
  text?: string;

  /** Arbitrary content rendered below the text (code blocks, cards, etc.). */
  slot?: ReactNode;

  /** When provided, shows a CopyButton. Should be the plain-text value to copy. */
  copyValue?: string;
  /** When provided, shows a regenerate icon button. */
  onRegenerate?: () => void;
  /** When true, shows the FeedbackBoolean (thumbs up/down). */
  showFeedback?: boolean;
  /** Controlled feedback value. */
  feedbackValue?: FeedbackValue;
  /** Called when feedback changes. */
  onFeedbackChange?: (value: FeedbackValue) => void;

  className?: string;
}
