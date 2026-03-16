import { Icon, type IconName } from "../Icon";
import styles from "./IconContainer.module.css";
import { cx } from "../../utils/cx";


export type IconContainerSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface IconContainerProps {
  /** Icon name from the design system icon set */
  name: IconName;
  /** Predefined size variant — controls both container and icon dimensions */
  size?: IconContainerSize;
  /** Icon color (defaults to currentColor) */
  color?: string;
  /** Additional CSS class on the root element */
  className?: string;
}

const SIZE_PX: Record<IconContainerSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
};

const SIZE_CLASS: Record<IconContainerSize, string> = {
  xs: styles.xs,
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
  xl: styles.xl,
  "2xl": styles.xxl,
};

export function IconContainer({
  name,
  size = "md",
  color,
  className,
}: IconContainerProps) {
  return (
    <span className={cx(styles.root, SIZE_CLASS[size], className)} aria-hidden="true">
      <Icon name={name} size={SIZE_PX[size]} color={color} />
    </span>
  );
}

IconContainer.displayName = "IconContainer";
