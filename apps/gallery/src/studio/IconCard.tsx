import { forwardRef, type ButtonHTMLAttributes } from "react";
import { IconContainer } from "@sds/components/IconContainer";
import type { IconName } from "@sds/components/Icon";
import { Tooltip } from "@sds/components/Tooltip";
import { cx } from "@sds/utils/cx";
import styles from "./IconCard.module.css";

export interface IconCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Icon name from the design system icon set */
  name: IconName;
  /** Visible label rendered under the icon (also used for the tooltip + accessible name) */
  label: string;
  /** Active / selected state */
  active?: boolean;
}

export const IconCard = forwardRef<HTMLButtonElement, IconCardProps>(
  function IconCard({ name, label, active, className, type = "button", ...rest }, ref) {
    return (
      <Tooltip label={label} placement="top" showTail={false}>
        <button
          ref={ref}
          type={type}
          aria-pressed={active}
          className={cx(styles.root, active && styles.active, className)}
          {...rest}
        >
          <IconContainer name={name} size="xl" />
          <span className={styles.label}>{label}</span>
        </button>
      </Tooltip>
    );
  },
);

IconCard.displayName = "IconCard";
