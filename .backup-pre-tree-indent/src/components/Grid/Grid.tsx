import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./Grid.module.css";
import { cx } from "../../utils/cx";


/* ── Container ── */

export type ContainerMaxWidth = "md" | "lg";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Constrains the container width — maps to --grid-column-width-max-width-* tokens. Omit for fluid (full-width). */
  maxWidth?: ContainerMaxWidth;
  children: ReactNode;
}

const maxWidthClass: Record<ContainerMaxWidth, string> = {
  md: styles.maxWidthMd,
  lg: styles.maxWidthLg,
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  function Container({ maxWidth, children, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cx(
          styles.container,
          maxWidth != null && maxWidthClass[maxWidth],
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

Container.displayName = "Container";

/* ── Grid ── */

export type GridGutter = "sm" | "md" | "lg";
export type GridInset = "none" | "sm" | "md" | "lg" | "xl";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between columns — maps to --grid-gutter-sm/md/lg tokens */
  gutter?: GridGutter;
  /** Horizontal padding on left and right of the grid — maps to --grid-offset-* tokens */
  inset?: GridInset;
  children: ReactNode;
}

const gutterClass: Record<GridGutter, string> = {
  sm: styles.gutterSm,
  md: styles.gutterMd,
  lg: styles.gutterLg,
};

const insetClass: Record<GridInset, string> = {
  none: styles.insetNone,
  sm: styles.insetSm,
  md: styles.insetMd,
  lg: styles.insetLg,
  xl: styles.insetXl,
};

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  function Grid({ gutter = "md", inset, children, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cx(
          styles.grid,
          gutterClass[gutter],
          inset != null && insetClass[inset],
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

Grid.displayName = "Grid";

/* ── Col ── */

export interface ColProps extends HTMLAttributes<HTMLDivElement> {
  /** Base column span (applies at all viewports, default 1) */
  span?: number;
  /** Override span from xs (376 px) and up */
  xs?: number;
  /** Override span from sm (521 px) and up */
  sm?: number;
  /** Override span from md (1025 px) and up — 12-column grid active */
  md?: number;
  /** Override span from lg (1281 px) and up */
  lg?: number;
  /** Override span from xl (1441 px) and up */
  xl?: number;
  /** Override span from 2xl (1921 px) and up */
  "2xl"?: number;
  /** Column offset — pushes the column start by N columns */
  offset?: number;
  children?: ReactNode;
}

export const Col = forwardRef<HTMLDivElement, ColProps>(
  function Col(
    {
      span,
      xs,
      sm,
      md,
      lg,
      xl,
      "2xl": xxl,
      offset,
      children,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const vars: Record<string, number> = {};
    if (span != null) vars["--col-span"] = span;
    if (xs != null) vars["--col-xs"] = xs;
    if (sm != null) vars["--col-sm"] = sm;
    if (md != null) vars["--col-md"] = md;
    if (lg != null) vars["--col-lg"] = lg;
    if (xl != null) vars["--col-xl"] = xl;
    if (xxl != null) vars["--col-2xl"] = xxl;
    if (offset != null) vars["--col-offset"] = offset;

    return (
      <div
        ref={ref}
        className={cx(
          styles.col,
          offset != null && styles.hasOffset,
          className,
        )}
        style={{ ...vars, ...style } as CSSProperties}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

Col.displayName = "Col";
