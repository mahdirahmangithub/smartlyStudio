import { type HTMLAttributes } from "react";
import { Divider } from "../Divider";
import styles from "./OptionSeparator.module.css";
import { cx } from "../../utils/cx";

export type OptionSeparatorType = "divider" | "group-label";

export interface OptionSeparatorProps
  extends HTMLAttributes<HTMLDivElement> {
  /** "divider" renders a horizontal line; "group-label" renders an optgroup title */
  type?: OptionSeparatorType;
  /** Label text shown when type is "group-label" */
  labelText?: string;
}


export function OptionSeparator({
  type = "divider",
  labelText = "Group label",
  className,
  ...rest
}: OptionSeparatorProps) {
  if (type === "divider") {
    return (
      <div role="separator" className={cx(styles.dividerWrapper, className)} {...rest}>
        <Divider padding />
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={labelText}
      className={cx(styles.groupLabel, className)}
      {...rest}
    >
      <span className={styles.labelText}>{labelText}</span>
    </div>
  );
}
