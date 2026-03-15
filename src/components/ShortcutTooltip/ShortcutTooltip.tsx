import type { ReactElement } from "react";
import { Tooltip, type Placement } from "../Tooltip/Tooltip";
import { KeyboardShortcut } from "../KeyboardShortcut";
import styles from "./ShortcutTooltip.module.css";

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export type ShortcutTooltipType = "inverse" | "neutral";

export interface ShortcutTooltipProps {
  children: ReactElement;
  /** Descriptive label shown alongside the shortcut keys */
  label: string;
  /** Array of key labels, e.g. ["⌘", "K"] */
  shortcut: string[];
  type?: ShortcutTooltipType;
  placement?: Placement;
  offsetPx?: number;
  disabled?: boolean;
  className?: string;
}

export function ShortcutTooltip({
  children,
  label,
  shortcut,
  type = "inverse",
  placement = "top",
  offsetPx,
  disabled = false,
  className,
}: ShortcutTooltipProps) {
  const content = (
    <div className={cx(styles.content, styles[type])}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <div className={styles.keys}>
          {shortcut.map((key, i) => (
            <KeyboardShortcut key={i} keyText={key} size="sm" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Tooltip
      type={type}
      placement={placement}
      offsetPx={offsetPx}
      showTail={false}
      disabled={disabled}
      content={content}
      className={cx(styles.wrapper, className)}
    >
      {children}
    </Tooltip>
  );
}

ShortcutTooltip.displayName = "ShortcutTooltip";
