import type { CSSProperties } from "react";
import styles from "./spacing.module.css";

export type SpacingSize =
  | "2xs"
  | "xs"
  | "sm-minus"
  | "sm"
  | "sm-plus"
  | "sm-extra"
  | "md-minus"
  | "md"
  | "lg"
  | "xl"
  | "xl-plus"
  | "2xl"
  | "3xl";

export interface SpacingProps {
  paddingTop?: SpacingSize;
  paddingBottom?: SpacingSize;
  insetLeft?: SpacingSize;
  insetRight?: SpacingSize;
}

const VAR_MAP: Record<keyof SpacingProps, { cls: string; var: string }> = {
  paddingTop:    { cls: styles.paddingTop,    var: "--_pt" },
  paddingBottom: { cls: styles.paddingBottom, var: "--_pb" },
  insetLeft:     { cls: styles.insetLeft,     var: "--_il" },
  insetRight:    { cls: styles.insetRight,    var: "--_ir" },
};

export function getSpacing(props: SpacingProps): {
  className: string;
  style: CSSProperties;
} {
  const classes: string[] = [];
  const vars: Record<string, string> = {};

  for (const key of Object.keys(VAR_MAP) as (keyof SpacingProps)[]) {
    const size = props[key];
    if (size) {
      const entry = VAR_MAP[key];
      classes.push(entry.cls);
      vars[entry.var] = `var(--spacing-${size})`;
    }
  }

  return {
    className: classes.join(" "),
    style: vars as CSSProperties,
  };
}

export function pickSpacingProps<T extends SpacingProps>(
  props: T
): { spacing: SpacingProps; rest: Omit<T, keyof SpacingProps> } {
  const { paddingTop, paddingBottom, insetLeft, insetRight, ...rest } = props;
  return {
    spacing: { paddingTop, paddingBottom, insetLeft, insetRight },
    rest: rest as Omit<T, keyof SpacingProps>,
  };
}
