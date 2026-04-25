import type { ReactNode } from "react";
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
  className?: string;
}

function ChipContent({ icon, label, status, disabled }: {
  icon?: IconName;
  label: string;
  status?: string;
  disabled?: boolean;
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
        <span className={styles.label}>{label}</span>
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
  className,
}: AiEntityPreviewInlineProps) {
  const rootClass = cx(styles.root, disabled && styles.disabled, className);
  const content = <ChipContent icon={icon} label={label} status={status} disabled={disabled} />;

  const chip = href ? (
    <a
      href={disabled ? undefined : href}
      onClick={onClick}
      aria-disabled={disabled || undefined}
      className={rootClass}
    >
      {content}
    </a>
  ) : onClick ? (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={rootClass}
    >
      {content}
    </button>
  ) : (
    <span className={rootClass} aria-disabled={disabled || undefined}>
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
