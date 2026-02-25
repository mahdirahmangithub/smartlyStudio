import { createContext, useContext } from "react";

export interface FieldContextValue {
  inputId?: string;
  hintId?: string;
  labelId?: string;
}

export const FieldContext = createContext<FieldContextValue>({});

export function useFieldContext(): FieldContextValue {
  return useContext(FieldContext);
}
