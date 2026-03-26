import { Icon } from "../Icon";
import { useStepContext } from "./StepperContext";
import type { StepStatus } from "./StepperContext";
import { cx } from "../../utils/cx";
import styles from "./Stepper.module.css";

export interface StepIconProps {
  /** Custom icon to render instead of the step number */
  icon?: React.ReactNode;
  className?: string;
}

const statusIconMap: Partial<Record<StepStatus, { name: "check" | "error"; size: number }>> = {
  success: { name: "check", size: 16 },
  error: { name: "error", size: 16 },
};

export function StepIcon({ icon, className }: StepIconProps) {
  const { index, status, disabled } = useStepContext();

  const statusIcon = statusIconMap[status];

  let content: React.ReactNode;
  if (statusIcon && icon) {
    content = (
      <span className={styles.stepIconContent}>
        <Icon name={statusIcon.name} size={statusIcon.size} />
      </span>
    );
  } else if (icon) {
    content = <span className={styles.stepIconContent}>{icon}</span>;
  } else {
    content = <span className={styles.stepNumber}>{index + 1}</span>;
  }

  return (
    <span
      className={cx(
        styles.stepIcon,
        styles[status],
        disabled && styles.disabled,
        className
      )}
      aria-hidden="true"
    >
      {content}
    </span>
  );
}
