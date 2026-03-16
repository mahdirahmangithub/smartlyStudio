import styles from "./Divider.module.css";
import { cx } from "../../utils/cx";

export type DividerType = "neutral" | "brand";
export type DividerVariant = "normal" | "dashed" | "dotted";
export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps {
  type?: DividerType;
  variant?: DividerVariant;
  orientation?: DividerOrientation;
  inset?: boolean;
  padding?: boolean;
  className?: string;
}


export function Divider({
  type = "neutral",
  variant = "normal",
  orientation = "horizontal",
  inset = false,
  padding = false,
  className,
}: DividerProps) {
  const cls = cx(
    styles.divider,
    styles[orientation],
    styles[type],
    styles[variant],
    inset && styles.inset,
    padding && styles.withPadding,
    className
  );

  if (orientation === "vertical") {
    return <div className={cls} role="separator" aria-orientation="vertical" />;
  }

  return <hr className={cls} />;
}
