import { forwardRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { Badge, type BadgeSize, type BadgeType } from "../Badge";
import { Icon, type IconName } from "../Icon";
import { cx } from "../../utils/cx";
import {
  StatValueAnimator,
  type StatAnimationStyle,
} from "./StatValueAnimator";
import styles from "./Stat.module.css";

/* ─────────────────────────── Types ─────────────────────────── */

export type StatSize = "xs" | "sm" | "md" | "lg";
export type StatTrendDirection = "up" | "down" | "neutral";
export type { StatAnimationStyle };

export interface StatTrend {
  /** Text rendered as the badge label, e.g. "245.65" or "+12%". */
  value: ReactNode;
  /** Drives default badge variant + icon. */
  direction: StatTrendDirection;
  /** Override the default Badge variant ("success" | "alert" | "info"). */
  variant?: BadgeType;
  /** Override the default trailing icon. */
  icon?: IconName;
  /**
   * Override the default direction phrase used in the screen-reader mirror
   * (e.g. for i18n). Defaults to "Increased by" / "Decreased by" / "Unchanged".
   */
  ariaLabel?: string;
}

export interface StatProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  size?: StatSize;
  pretitle?: string;
  /**
   * Optional color for a `dot_fill` indicator rendered before the pretitle.
   * Setting any value (e.g. a chart series color) renders the indicator;
   * omit to render the pretitle without one.
   */
  pretitleIndicatorColor?: string;
  /** Numeric value (animated) or pre-formatted string (rendered statically). */
  value: number | string;
  prefix?: string;
  suffix?: string;
  caption?: string;
  trend?: StatTrend;
  /** Render the value in a monospace family. Default true. */
  monospace?: boolean;
  /** Animation style for numeric values. Default "flip". */
  animationStyle?: StatAnimationStyle;
  /** Animation duration in ms. Default 1200. */
  animationDurationMs?: number;
  /** Locale for `Intl.NumberFormat`. */
  locale?: string;
  /** `Intl.NumberFormat` options applied when `value` is a number. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Override the composed screen-reader label entirely. */
  "aria-label"?: string;
}

/* ─────────────────────────── Mappings ─────────────────────────── */

const SIZE_CLASS: Record<StatSize, string> = {
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const BADGE_SIZE_FOR_STAT: Record<StatSize, BadgeSize> = {
  xs: "sm",
  sm: "md",
  md: "lg",
  lg: "lg",
};

const TREND_ICON_SIZE_FOR_BADGE: Record<BadgeSize, number> = {
  sm: 12,
  md: 16,
  lg: 16,
};

const PRETITLE_INDICATOR_SIZE: Record<StatSize, number> = {
  xs: 12,
  sm: 12,
  md: 16,
  lg: 16,
};

const DEFAULT_TREND_VARIANT: Record<StatTrendDirection, BadgeType> = {
  up: "success",
  down: "alert",
  neutral: "info",
};

const DEFAULT_TREND_ICON: Record<StatTrendDirection, IconName> = {
  up: "trending_up",
  down: "trending_down",
  neutral: "remove",
};

const DEFAULT_TREND_PHRASE: Record<StatTrendDirection, string> = {
  up: "Increased by",
  down: "Decreased by",
  neutral: "Unchanged",
};

/* ─────────────────────────── Helpers ─────────────────────────── */

function formatForReader(
  value: number | string,
  locale: string | undefined,
  formatOptions: Intl.NumberFormatOptions | undefined,
): string {
  if (typeof value === "string") return value;
  try {
    return new Intl.NumberFormat(locale, formatOptions).format(value);
  } catch {
    return String(value);
  }
}

function composeReaderLabel({
  pretitle,
  formatted,
  prefix,
  suffix,
  caption,
  trend,
}: {
  pretitle?: string;
  formatted: string;
  prefix?: string;
  suffix?: string;
  caption?: string;
  trend?: StatTrend;
}): string {
  const valuePart = `${prefix ?? ""}${formatted}${suffix ?? ""}`.trim();
  const parts: string[] = [];
  if (pretitle) parts.push(`${pretitle}:`);
  parts.push(valuePart);
  if (caption) parts.push(caption);
  let label = parts.join(" ");
  if (trend) {
    const phrase = trend.ariaLabel ?? DEFAULT_TREND_PHRASE[trend.direction];
    const trendValue =
      typeof trend.value === "string" || typeof trend.value === "number"
        ? String(trend.value)
        : "";
    const trendSuffix = trendValue ? `${phrase} ${trendValue}` : phrase;
    label += `. ${trendSuffix}.`;
  }
  return label;
}

/* ─────────────────────────── Component ───────────────────────── */

export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  {
    size = "md",
    pretitle,
    pretitleIndicatorColor,
    value,
    prefix,
    suffix,
    caption,
    trend,
    monospace = true,
    animationStyle = "flip",
    animationDurationMs = 1200,
    locale,
    formatOptions,
    className,
    "aria-label": ariaLabelOverride,
    ...rest
  },
  ref,
) {
  const initialFormatted = formatForReader(value, locale, formatOptions);
  const [settledFormatted, setSettledFormatted] = useState(initialFormatted);

  const composedLabel =
    ariaLabelOverride ??
    composeReaderLabel({
      pretitle,
      formatted: settledFormatted,
      prefix,
      suffix,
      caption,
      trend,
    });

  const badgeSize = BADGE_SIZE_FOR_STAT[size];
  const trendVariant = trend
    ? trend.variant ?? DEFAULT_TREND_VARIANT[trend.direction]
    : undefined;
  const trendIcon = trend
    ? trend.icon ?? DEFAULT_TREND_ICON[trend.direction]
    : undefined;

  return (
    <div
      ref={ref}
      role="group"
      aria-label={composedLabel}
      className={cx(
        styles.root,
        SIZE_CLASS[size],
        monospace && styles.monospace,
        className,
      )}
      {...rest}
    >
      {pretitle && (
        <span className={styles.pretitleRow}>
          {pretitleIndicatorColor && (
            <Icon
              name="dot_fill"
              size={PRETITLE_INDICATOR_SIZE[size]}
              color={pretitleIndicatorColor}
              aria-hidden="true"
            />
          )}
          <span className={styles.pretitle}>{pretitle}</span>
        </span>
      )}
      <div className={styles.main}>
        <span className={styles.number} aria-hidden="true">
          {prefix && <span className={styles.affix}>{prefix}</span>}
          <StatValueAnimator
            value={value}
            animationStyle={animationStyle}
            durationMs={animationDurationMs}
            locale={locale}
            formatOptions={formatOptions}
            onSettle={setSettledFormatted}
          />
          {suffix && <span className={styles.affix}>{suffix}</span>}
          {/*
           * Invisible, selectable copy of the resting value. The animated
           * visuals are user-select: none, so mouse selection / Cmd-C lands
           * here and copies a clean "$18.96M"-style string instead of the
           * stacked digits 0–9 inside each flip column.
           */}
          <span className={styles.numberCopy} aria-hidden="true">
            {`${prefix ?? ""}${settledFormatted}${suffix ?? ""}`}
          </span>
        </span>
        {caption && <span className={styles.caption}>{caption}</span>}
      </div>
      <span className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {composedLabel}
      </span>
      {trend && trendVariant && trendIcon && (
        <span className={styles.trendBadgeRow}>
          <Badge
            size={badgeSize}
            variant={trendVariant}
            emphasis="low"
            trailingIcon={
              <Icon
                name={trendIcon}
                size={TREND_ICON_SIZE_FOR_BADGE[badgeSize]}
                aria-hidden="true"
              />
            }
          >
            {trend.value}
          </Badge>
        </span>
      )}
    </div>
  );
});

Stat.displayName = "Stat";
