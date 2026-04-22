import { createContext, useContext } from "react";

export interface PromptOptionInputContextValue {
  /** True when the inline text input has a non-empty value */
  optionsDisabled: boolean;
}

export const PromptOptionInputContext =
  createContext<PromptOptionInputContextValue>({ optionsDisabled: false });

export function usePromptOptionInput(): PromptOptionInputContextValue {
  return useContext(PromptOptionInputContext);
}
