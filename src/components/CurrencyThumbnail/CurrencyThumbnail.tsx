import { forwardRef, type HTMLAttributes } from "react";
import styles from "./CurrencyThumbnail.module.css";

export type CurrencyThumbnailSize = "sm" | "md" | "lg";
export type CurrencyType = "eur" | "usd" | "gbp" | "yen";

export interface CurrencyThumbnailProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  size?: CurrencyThumbnailSize;
  currency?: CurrencyType;
}

const CURRENCY_SYMBOL: Record<CurrencyType, string> = {
  eur: "€",
  usd: "$",
  gbp: "£",
  yen: "¥",
};

const SIZE_CLASS: Record<CurrencyThumbnailSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export const CurrencyThumbnail = forwardRef<
  HTMLDivElement,
  CurrencyThumbnailProps
>(({ size = "md", currency = "eur", className, ...rest }, ref) => (
  <div
    ref={ref}
    className={cx(styles.currencyThumbnail, SIZE_CLASS[size], className)}
    {...rest}
  >
    <span className={styles.symbol}>{CURRENCY_SYMBOL[currency]}</span>
  </div>
));

CurrencyThumbnail.displayName = "CurrencyThumbnail";
