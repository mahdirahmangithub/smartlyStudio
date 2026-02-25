import type { ElementType, ReactNode } from "react";
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

export interface TitleTextProps {
  /** Visual size */
  size?: TitleTextSize;
  /** Title content */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Leading icon element (e.g. `<Icon name="favorite_fill" size={24} />`) */
  leadingIcon?: ReactNode;
  /** HTML element for the title — defaults to h1–h6 based on size */
  as?: ElementType;
  /** Additional class on the root element */
  className?: string;
}

export function TitleText({
  size = "lg",
  title,
  description,
  leadingIcon,
  as,
  className,
}: TitleTextProps) {
  const Heading = as ?? defaultHeadingLevel[size];

  return (
    <div className={`${styles.root} ${sizeClass[size]}${className ? ` ${className}` : ""}`}>
      {leadingIcon !== undefined && (
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
