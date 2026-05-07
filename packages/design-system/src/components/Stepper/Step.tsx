import { useMemo } from "react";
import {
  StepContext,
  useStepperContext,
  type StepStatus,
  type StepContextValue,
} from "./StepperContext";
import { StepIcon } from "./StepIcon";
import { StepLabel } from "./StepLabel";
import { StepConnector } from "./StepConnector";
import { cx } from "../../utils/cx";
import styles from "./Stepper.module.css";

export interface StepProps {
  /** Step title */
  label: string;
  /** Optional subtext below title */
  description?: string;
  /** Custom icon instead of step number */
  icon?: React.ReactNode;
  /** Override auto-derived status */
  status?: StepStatus;
  /** Override disabled state */
  disabled?: boolean;
  className?: string;
  /** Injected by Stepper via cloneElement */
  _index?: number;
  /** Injected by Stepper via cloneElement */
  _last?: boolean;
  /** Injected by Stepper via cloneElement */
  _total?: number;
}

function deriveStatus(
  index: number,
  activeStep: number,
  nonLinear: boolean
): { status: StepStatus; active: boolean; completed: boolean } {
  if (index === activeStep) {
    return { status: "active", active: true, completed: false };
  }
  if (!nonLinear && index < activeStep) {
    return { status: "success", active: false, completed: true };
  }
  return { status: "normal", active: false, completed: false };
}

export function Step({
  label,
  description,
  icon,
  status: statusOverride,
  disabled: disabledOverride,
  className,
  _index = 0,
  _last = false,
  _total = 1,
}: StepProps) {
  const { activeStep, orientation, nonLinear, onChange } = useStepperContext();

  const derived = deriveStatus(_index, activeStep, nonLinear);
  const status = statusOverride ?? derived.status;
  const active = statusOverride ? statusOverride === "active" : derived.active;
  const completed = statusOverride
    ? statusOverride === "success"
    : derived.completed;
  const disabled = disabledOverride ?? false;

  const ctxValue = useMemo<StepContextValue>(
    () => ({
      index: _index,
      active,
      completed,
      disabled,
      status,
      last: _last,
      icon,
    }),
    [_index, active, completed, disabled, status, _last, icon]
  );

  const stepContent = (
    <>
      <StepIcon icon={icon} />
      <StepLabel label={label} description={description} />
    </>
  );

  const srState = active
    ? ", Current"
    : completed
      ? ", Completed"
      : disabled
        ? ", Disabled"
        : status === "error"
          ? ", Error"
          : ", Incomplete";

  const srText = `Step ${_index + 1} of ${_total}${srState}`;

  return (
    <StepContext.Provider value={ctxValue}>
      <li
        className={cx(
          styles.step,
          styles[orientation],
          className
        )}
        aria-current={active ? "step" : undefined}
        aria-disabled={disabled || undefined}
      >
        {onChange ? (
          <button
            type="button"
            className={styles.stepButton}
            onClick={() => { if (!disabled) onChange(_index); }}
            aria-disabled={disabled || undefined}
          >
            {stepContent}
            <span className={styles.srOnly}>{srText}</span>
          </button>
        ) : (
          <span className={styles.stepInner}>
            {stepContent}
            <span className={styles.srOnly}>{srText}</span>
          </span>
        )}
        {!_last && <StepConnector />}
      </li>
    </StepContext.Provider>
  );
}
