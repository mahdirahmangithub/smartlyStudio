import { Divider } from "../Divider";
import { useStepperContext } from "./StepperContext";
import { cx } from "../../utils/cx";
import styles from "./Stepper.module.css";

export interface StepConnectorProps {
  className?: string;
}

export function StepConnector({ className }: StepConnectorProps) {
  const { orientation } = useStepperContext();

  return (
    <span
      className={cx(
        styles.connector,
        styles[orientation],
        className
      )}
      aria-hidden="true"
    >
      <Divider
        orientation={orientation === "horizontal" ? "horizontal" : "vertical"}
      />
    </span>
  );
}
