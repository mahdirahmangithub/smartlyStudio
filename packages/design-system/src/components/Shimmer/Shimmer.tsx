import { type ReactNode, type ElementType, type HTMLAttributes } from "react";
import { useShimmer } from "./useShimmer";
import { cx } from "../../utils/cx";

export interface ShimmerProps extends HTMLAttributes<HTMLElement> {
  /** Whether the shimmer effect is active. */
  active?: boolean;
  /** Inverts the mask so the centre is the brightest part. @default false */
  inverse?: boolean;
  /** Enable the opacity pulse animation. @default true */
  pulse?: boolean;
  /** HTML element to render. @default "span" */
  as?: ElementType;
  children?: ReactNode;
}

export function Shimmer({
  active = true,
  inverse = false,
  pulse = true,
  as: Tag = "span",
  children,
  className,
  style,
  ...rest
}: ShimmerProps) {
  const shimmerClass = useShimmer(active, inverse, pulse);

  return (
    <Tag
      className={cx(shimmerClass, className)}
      style={active ? { display: "inline-block", ...style } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
