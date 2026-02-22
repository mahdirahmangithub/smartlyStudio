import type { ReactNode } from "react";
import { Icon } from "../Icon";
import { Tooltip, type Placement, type TooltipType } from "../Tooltip";
import styles from "./Hint.module.css";

export type HintSize = "xs" | "sm" | "md" | "lg";

export interface HintProps {
  size?: HintSize;
  disabled?: boolean;
  /** Icon name from the icon library (default: "info") */
  iconName?: string;
  /** Override with a custom icon ReactNode */
  icon?: ReactNode;

  /** Tooltip content – at minimum provide a label */
  label?: string;
  description?: string;
  tooltipType?: TooltipType;
  placement?: Placement;
  showTail?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  offsetPx?: number;
  showDelay?: number;
  hideDelay?: number;

  className?: string;
}

const ICON_SIZE: Record<HintSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
};

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Hint({
  size = "md",
  disabled = false,
  iconName = "info",
  icon,
  label,
  description,
  tooltipType = "neutral",
  placement = "top",
  showTail = true,
  leadingIcon,
  trailingIcon,
  offsetPx,
  showDelay,
  hideDelay,
  className,
}: HintProps) {
  const iconNode = icon ?? <Icon name={iconName} size={ICON_SIZE[size]} />;

  return (
    <Tooltip
      type={tooltipType}
      placement={placement}
      showTail={showTail}
      label={label}
      description={description}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
      offsetPx={offsetPx}
      showDelay={showDelay}
      hideDelay={hideDelay}
      disabled={disabled}
    >
      <span
        className={cx(styles.hint, disabled && styles.disabled, className)}
        aria-label={label}
        role="img"
      >
        {iconNode}
      </span>
    </Tooltip>
  );
}
