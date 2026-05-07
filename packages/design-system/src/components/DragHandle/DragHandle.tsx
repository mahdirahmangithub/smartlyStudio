import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./DragHandle.module.css";
import { cx } from "../../utils/cx";


export type DragHandleSize = "sm" | "lg";
export type DragHandleType = "dot" | "line";

export interface DragHandleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** Visual variant */
  type?: DragHandleType;
  /** Size variant */
  size?: DragHandleSize;
}

const sizeTypeClass: Record<string, string> = {
  "sm-dot": styles.smDot,
  "sm-line": styles.smLine,
  "lg-dot": styles.lgDot,
  "lg-line": styles.lgLine,
};

export const DragHandle = forwardRef<HTMLButtonElement, DragHandleProps>(
  ({ type = "dot", size = "lg", className, ...rest }, ref) => {
    const variantClass = sizeTypeClass[`${size}-${type}`];
    const typeClass = type === "dot" ? styles.dot : styles.line;

    return (
      <button
        ref={ref}
        type="button"
        className={cx(styles.root, typeClass, variantClass, className)}
        aria-label="Drag handle"
        {...rest}
      />
    );
  },
);

DragHandle.displayName = "DragHandle";
