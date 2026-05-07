import type { CSSProperties, ReactNode } from "react";
import { Tooltip } from "../Tooltip";
import { IconContainer } from "../IconContainer";
import type { IconName } from "../Icon";
import { cx } from "../../utils/cx";
import styles from "./AiEntityPreviewInline.module.css";

export interface AiEntityPreviewInlineProps {
  /** Primary label — entity name */
  label: string;
  /** Entity type icon */
  icon?: IconName;
  /** Optional secondary text shown after a dot separator */
  status?: string;
  /** Renders as <a> — preferred for real navigation */
  href?: string;
  /** Renders as <button> when no href */
  onClick?: () => void;
  disabled?: boolean;
  /** Tooltip content shown on hover */
  tooltipContent?: ReactNode;
  /** Inline style applied to the label span — useful for typography overrides. */
  labelStyle?: CSSProperties;
  /** Inline style applied to the root element — useful for shape overrides. */
  style?: CSSProperties;
  className?: string;
}

function ChipContent({ icon, label, status, disabled, labelStyle }: {
  icon?: IconName;
  label: string;
  status?: string;
  disabled?: boolean;
  labelStyle?: CSSProperties;
}) {
  return (
    <>
      {icon && (
        <IconContainer
          size="xs"
          name={icon}
          className={cx(styles.icon, disabled && styles.iconDisabled)}
        />
      )}
      <span className={styles.content}>
        <span className={styles.label} style={labelStyle}>{label}</span>
        {status && (
          <>
            <span className={styles.dot}>.</span>
            <span className={styles.status}>{status}</span>
          </>
        )}
      </span>
    </>
  );
}

export function AiEntityPreviewInline({
  label,
  icon,
  status,
  href,
  onClick,
  disabled = false,
  tooltipContent,
  labelStyle,
  style,
  className,
}: AiEntityPreviewInlineProps) {
  const rootClass = cx(styles.root, disabled && styles.disabled, className);
  const content = <ChipContent icon={icon} label={label} status={status} disabled={disabled} labelStyle={labelStyle} />;

  const chip = href ? (
    <a
      href={disabled ? undefined : href}
      onClick={onClick}
      aria-disabled={disabled || undefined}
      className={rootClass}
      style={style}
    >
      {content}
    </a>
  ) : onClick ? (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={rootClass}
      style={style}
    >
      {content}
    </button>
  ) : (
    <span className={rootClass} aria-disabled={disabled || undefined} style={style}>
      {content}
    </span>
  );

  if (!tooltipContent || disabled) return chip;

  return (
    <Tooltip
      anchor="trigger"
      content={tooltipContent}
      type="neutral"
      showTail={false}
      placement="top"
      offsetPx={8}
    >
      {chip}
    </Tooltip>
  );
}

AiEntityPreviewInline.displayName = "AiEntityPreviewInline";
