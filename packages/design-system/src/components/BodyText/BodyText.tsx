import type { CSSProperties, ElementType, ReactNode } from "react";
import { getSpacing, type SpacingProps } from "../../utils/spacing";
import styles from "./BodyText.module.css";

export type BodyTextSize = "sm" | "md" | "lg";
export type BodyTextEmphasis = "low" | "medium" | "high";

export interface BodyTextProps extends SpacingProps {
  /** Visual size */
  size?: BodyTextSize;
  /** Color emphasis */
  emphasis?: BodyTextEmphasis;
  /** Use the strong (medium-weight) variant */
  strong?: boolean;
  /** HTML element — defaults to `p` */
  as?: ElementType;
  /** Clamp text to N lines with ellipsis overflow */
  lineClamp?: number;
  /** Additional class on the root element */
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function BodyText({
  size = "lg",
  emphasis = "high",
  strong = false,
  paddingTop,
  paddingBottom,
  insetLeft,
  insetRight,
  lineClamp,
  as: Tag = "p",
  className,
  style,
  children,
}: BodyTextProps) {
  const { className: spacingCls, style: spacingStyle } = getSpacing({
    paddingTop,
    paddingBottom,
    insetLeft,
    insetRight,
  });

  const cls = [
    styles.root,
    styles[size],
    styles[emphasis],
    strong && styles.strong,
    lineClamp != null && styles.clamp,
    spacingCls,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const clampVars = lineClamp != null
    ? { "--_line-clamp": lineClamp } as CSSProperties
    : undefined;

  const mergedStyle =
    style || Object.keys(spacingStyle).length || clampVars
      ? { ...style, ...spacingStyle, ...clampVars }
      : undefined;

  return <Tag className={cls} style={mergedStyle}>{children}</Tag>;
}
