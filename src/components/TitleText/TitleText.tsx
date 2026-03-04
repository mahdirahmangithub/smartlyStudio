import type { CSSProperties, ElementType, ReactNode } from "react";
import { getSpacing, type SpacingProps } from "../../utils/spacing";
import styles from "./TitleText.module.css";

export type TitleTextSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl";

const defaultHeadingLevel: Record<TitleTextSize, ElementType> = {
  xl: "h1",
  lg: "h2",
  md: "h3",
  sm: "h4",
  xs: "h5",
  "2xs": "h6",
};

const sizeClass: Record<TitleTextSize, string> = {
  xl: styles.xl,
  lg: styles.lg,
  md: styles.md,
  sm: styles.sm,
  xs: styles.xs,
  "2xs": styles.xxs,
};

export interface TitleTextProps extends SpacingProps {
  /** Visual size */
  size?: TitleTextSize;
  /** Title content */
  title: ReactNode;
  /** Optional description below the title */
  description?: ReactNode;
  /** Leading icon element (e.g. `<Icon name="favorite_fill" size={24} />`) */
  leadingIcon?: ReactNode;
  /** HTML element for the title — defaults to h1–h6 based on size */
  as?: ElementType;
  /** Additional class on the root element */
  className?: string;
  style?: CSSProperties;
}

export function TitleText({
  size = "lg",
  title,
  description,
  leadingIcon,
  as,
  className,
  style,
  paddingTop,
  paddingBottom,
  insetLeft,
  insetRight,
}: TitleTextProps) {
  const Heading = as ?? defaultHeadingLevel[size];
  const { className: spacingCls, style: spacingStyle } = getSpacing({
    paddingTop,
    paddingBottom,
    insetLeft,
    insetRight,
  });

  const cls = [styles.root, sizeClass[size], spacingCls, className]
    .filter(Boolean)
    .join(" ");

  const mergedStyle =
    style || Object.keys(spacingStyle).length
      ? { ...style, ...spacingStyle }
      : undefined;

  return (
    <div className={cls} style={mergedStyle}>
      {leadingIcon && (
        <span className={styles.icon}>{leadingIcon}</span>
      )}

      <div className={styles.textArea}>
        <Heading className={styles.title}>{title}</Heading>
        {description !== undefined && (
          <p className={styles.description}>{description}</p>
        )}
      </div>
    </div>
  );
}
