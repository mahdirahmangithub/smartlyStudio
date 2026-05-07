import { createContext, useContext } from "react";

export type StepStatus = "normal" | "active" | "success" | "error";
export type StepperOrientation = "horizontal" | "vertical";

export interface StepperContextValue {
  activeStep: number;
  orientation: StepperOrientation;
  nonLinear: boolean;
  onChange?: (index: number) => void;
}

export interface StepContextValue {
  index: number;
  active: boolean;
  completed: boolean;
  disabled: boolean;
  status: StepStatus;
  last: boolean;
  icon?: React.ReactNode;
}

export const StepperContext = createContext<StepperContextValue>({
  activeStep: 0,
  orientation: "horizontal",
  nonLinear: false,
});

export const StepContext = createContext<StepContextValue>({
  index: 0,
  active: false,
  completed: false,
  disabled: false,
  status: "normal",
  last: false,
});

export function useStepperContext(): StepperContextValue {
  return useContext(StepperContext);
}

export function useStepContext(): StepContextValue {
  return useContext(StepContext);
}
