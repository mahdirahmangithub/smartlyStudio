import { type ReactNode } from "react";
import type { ButtonType } from "../Button";
import styles from "./ButtonGroup.module.css";

export type ButtonGroupEmphasis = "high" | "medium";

export interface ButtonGroupProps {
  children: ReactNode;
  variant?: ButtonType;
  emphasis?: ButtonGroupEmphasis;
  className?: string;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function ButtonGroup({
  children,
  variant = "brand",
  emphasis = "high",
  className,
}: ButtonGroupProps) {
  return (
    <div
      className={cx(
        styles.group,
        styles[emphasis],
        styles[variant],
        className
      )}
      role="group"
    >
      {children}
    </div>
  );
}
