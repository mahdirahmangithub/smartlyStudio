import { type HTMLAttributes, type ReactNode } from "react";
import styles from "./OptionItemLeading.module.css";
import { cx } from "../../utils/cx";

export type OptionItemLeadingType =
  | "icon"
  | "social"
  | "counter"
  | "currency"
  | "thumbnail"
  | "avatar"
  | "1-action"
  | "2-action"
  | "3-action"
  | "button";

export interface OptionItemLeadingProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  type?: OptionItemLeadingType;
  disabled?: boolean;
  children: ReactNode;
}


const TYPE_CLASS: Record<OptionItemLeadingType, string> = {
  icon: styles.icon,
  social: styles.social,
  counter: styles.counter,
  currency: styles.currency,
  thumbnail: styles.thumbnail,
  avatar: styles.avatar,
  "1-action": styles.action,
  "2-action": styles.action,
  "3-action": styles.action,
  button: styles.button,
};

export function OptionItemLeading({
  type = "icon",
  disabled = false,
  children,
  className,
  ...rest
}: OptionItemLeadingProps) {
  return (
    <div
      className={cx(
        styles.leading,
        TYPE_CLASS[type],
        disabled && styles.disabled,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ── convenience sub-components for common patterns ───────────────────── */

export interface ThumbnailBoxProps
  extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
}

export function ThumbnailBox({
  src,
  alt,
  className,
  ...rest
}: ThumbnailBoxProps) {
  return (
    <div className={cx(styles.thumbnailBox, className)} {...rest}>
      <img src={src} alt={alt} />
    </div>
  );
}
