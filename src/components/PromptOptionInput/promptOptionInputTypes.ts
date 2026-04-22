import type { CSSProperties, ReactNode } from "react";

export interface PromptOptionInputSteps {
  current: number;
  total: number;
  onPrev?: () => void;
  onNext?: () => void;
}

export interface PromptOptionInputSearch {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export interface PromptOptionInputInput {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export interface PromptOptionInputProps {
  /** Header label text */
  label: string;
  /** Step navigation — omit to hide */
  steps?: PromptOptionInputSteps;
  /** Show close button */
  onClose?: () => void;
  /** Search input — omit to hide */
  search?: PromptOptionInputSearch;
  /** Inline text input row — omit to hide */
  input?: PromptOptionInputInput;
  /** Whether any option is currently selected — drives the action button state */
  hasValue?: boolean;
  /** Changes the submit button to brand/purple (last step) */
  isLastStep?: boolean;
  /** Called when Skip is clicked */
  onSkip?: () => void;
  /** Called when next/submit icon button is clicked */
  onSubmit?: () => void;
  /** Options slot — rendered in the scrollable area */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  id?: string;
}
