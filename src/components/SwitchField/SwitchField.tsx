import type { ReactNode } from "react";
import { Label, type LabelProps } from "../Label";
import styles from "./SwitchField.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export type SwitchFieldSize = "sm" | "lg";

export interface SwitchFieldProps
  extends Omit<LabelProps, "htmlFor" | "size" | "className"> {
  size?: SwitchFieldSize;
  htmlFor: string;
  control: ReactNode;
  className?: string;
}

export function SwitchField({
  size = "sm",
  htmlFor,
  control,
  className,
  ...labelProps
}: SwitchFieldProps) {
  return (
    <div className={cx(styles.field, styles[size], className)}>
      <span className={styles.control}>{control}</span>
      <Label {...labelProps} size={size} htmlFor={htmlFor} />
    </div>
  );
}
