import { Children, cloneElement, isValidElement, useMemo } from "react";
import {
  StepperContext,
  type StepperContextValue,
  type StepperOrientation,
} from "./StepperContext";
import type { StepProps } from "./Step";
import { cx } from "../../utils/cx";
import styles from "./Stepper.module.css";

export interface StepperProps {
  /** Zero-based index of the current active step */
  activeStep?: number;
  /** Layout direction */
  orientation?: StepperOrientation;
  /** When true, disables auto-completed/disabled derivation */
  nonLinear?: boolean;
  /** Makes steps clickable; called with step index */
  onChange?: (index: number) => void;
  /** Accessible label for the stepper region */
  "aria-label"?: string;
  className?: string;
  children: React.ReactNode;
}

export function Stepper({
  activeStep = 0,
  orientation = "horizontal",
  nonLinear = false,
  onChange,
  "aria-label": ariaLabel = "Progress",
  className,
  children,
}: StepperProps) {
  const ctxValue = useMemo<StepperContextValue>(
    () => ({ activeStep, orientation, nonLinear, onChange }),
    [activeStep, orientation, nonLinear, onChange]
  );

  const steps = Children.toArray(children).filter(isValidElement);
  const total = steps.length;

  return (
    <StepperContext.Provider value={ctxValue}>
      <ol
        role="list"
        aria-label={ariaLabel}
        className={cx(styles.stepper, styles[orientation], className)}
      >
        {steps.map((child, i) =>
          cloneElement(child as React.ReactElement<StepProps>, {
            _index: i,
            _last: i === total - 1,
            _total: total,
          })
        )}
      </ol>
    </StepperContext.Provider>
  );
}
