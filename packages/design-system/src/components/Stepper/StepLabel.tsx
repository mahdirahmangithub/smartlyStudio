import { useStepContext } from "./StepperContext";
import { cx } from "../../utils/cx";
import styles from "./Stepper.module.css";

export interface StepLabelProps {
  label: string;
  description?: string;
  className?: string;
}

export function StepLabel({ label, description, className }: StepLabelProps) {
  const { disabled } = useStepContext();

  return (
    <span
      className={cx(
        styles.stepLabel,
        disabled && styles.disabled,
        className
      )}
    >
      <span className={styles.stepTitle}>{label}</span>
      {description && (
        <span className={styles.stepDescription}>{description}</span>
      )}
    </span>
  );
}
