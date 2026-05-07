import { forwardRef, type ReactNode, type CSSProperties } from "react";
import styles from "./TooltipContent.module.css";
import { cx } from "../../utils/cx";

export type TooltipType =
  | "inverse"
  | "neutral"
  | "brand"
  | "info"
  | "success"
  | "warning"
  | "alert";

export interface TooltipContentProps {
  type?: TooltipType;
  label?: string;
  description?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}


/**
 * Visual-only tooltip bubble. Renders the `.content` box (background, text,
 * padding, radius). The outer positioning wrapper is provided by `<Tooltip>`.
 */
export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  (
    {
      label,
      description,
      leadingIcon,
      trailingIcon,
      className,
      style,
    },
    ref
  ) => {
    const hasHeader = !!(label || leadingIcon || trailingIcon);

    return (
      <div
        ref={ref}
        className={cx(styles.content, className)}
        style={style}
      >
        {hasHeader && (
          <div className={styles.header}>
            {leadingIcon && (
              <span className={styles.iconSlot}>{leadingIcon}</span>
            )}
            {label && <span className={styles.headerText}>{label}</span>}
            {trailingIcon && (
              <span className={styles.iconSlot}>{trailingIcon}</span>
            )}
          </div>
        )}

        {description && (
          <span className={styles.description}>{description}</span>
        )}
      </div>
    );
  }
);

TooltipContent.displayName = "TooltipContent";
