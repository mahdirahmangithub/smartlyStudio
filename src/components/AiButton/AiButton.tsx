import { type CSSProperties, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./AiButton.module.css";

export type AiButtonSize = "sm" | "md" | "lg";

export interface AiButtonProps {
  /** Controls the container's border-radius to match the inner button size. */
  size?: AiButtonSize;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function AiButton({ size = "md", className, style, children }: AiButtonProps) {
  return (
    <div className={cx(styles.container, styles[size], className)} style={style}>
      {children}
    </div>
  );
}
