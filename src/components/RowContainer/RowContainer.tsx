import { forwardRef, type HTMLAttributes, type ReactNode, type CSSProperties } from "react";
import { ScrollFade, type ScrollFadeSurface } from "../ScrollFade";
import { getSpacing, type SpacingSize, type SpacingProps } from "../../utils/spacing";
import styles from "./RowContainer.module.css";

export type RowContainerAlignment = "left" | "right" | "grow";
export type RowContainerDensity = "none" | "xs" | "sm" | "md" | "lg";

export interface RowContainerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    SpacingProps {
  alignment?: RowContainerAlignment;
  density?: RowContainerDensity;
  wrap?: boolean;
  /** Surface hint forwarded to ScrollFade for fade-overlay colours */
  surface?: ScrollFadeSurface;
  children: ReactNode;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const DENSITY_CLASS: Record<RowContainerDensity, string> = {
  none: styles.densityNone,
  xs: styles.densityXs,
  sm: styles.densitySm,
  md: styles.densityMd,
  lg: styles.densityLg,
};

const ALIGN_CLASS: Record<RowContainerAlignment, string | false> = {
  left: false,
  right: styles.alignRight,
  grow: styles.alignGrow,
};

function insetStyle(left?: SpacingSize, right?: SpacingSize): CSSProperties | undefined {
  if (!left && !right) return undefined;
  const s: Record<string, string> = {};
  if (left) s.paddingLeft = `var(--spacing-${left})`;
  if (right) s.paddingRight = `var(--spacing-${right})`;
  return s as CSSProperties;
}

export const RowContainer = forwardRef<HTMLDivElement, RowContainerProps>(
  (
    {
      alignment = "left",
      density = "none",
      wrap = false,
      surface = "auto",
      paddingTop,
      paddingBottom,
      insetLeft,
      insetRight,
      className,
      style,
      children,
      ...rest
    },
    ref
  ) => {
    const { className: spacingCls, style: spacingStyle } = getSpacing({
      paddingTop,
      paddingBottom,
    });

    const itemsClassName = cx(
      styles.items,
      wrap && styles.itemsWrap,
      DENSITY_CLASS[density],
      ALIGN_CLASS[alignment]
    );

    const innerInset = insetStyle(insetLeft, insetRight);

    const mergedStyle: CSSProperties | undefined =
      spacingStyle && Object.keys(spacingStyle).length
        ? { ...style, ...spacingStyle }
        : style;

    return (
      <div
        ref={ref}
        className={cx(styles.rowContainer, spacingCls, className)}
        style={mergedStyle}
        {...rest}
      >
        {wrap ? (
          <div className={styles.itemsBase}>
            <div className={itemsClassName} style={innerInset}>
              {children}
            </div>
          </div>
        ) : (
          <ScrollFade
            direction="horizontal"
            surface={surface}
            className={styles.scrollWrapper}
            scrollAreaClassName={itemsClassName}
            scrollAreaStyle={innerInset}
          >
            {children}
          </ScrollFade>
        )}
      </div>
    );
  }
);

RowContainer.displayName = "RowContainer";
