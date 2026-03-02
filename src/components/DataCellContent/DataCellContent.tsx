import type { ReactNode } from "react";
import styles from "./DataCellContent.module.css";

export type DataCellContentState = "normal" | "normal-low" | "disable";
export type DataCellContentTextAlignment = "left" | "center" | "right";
export type DataCellContentCellAlignment = "left" | "center" | "right";

export interface DataCellContentProps {
  state?: DataCellContentState;
  textAlignment?: DataCellContentTextAlignment;
  cellAlignment?: DataCellContentCellAlignment;
  expandButton?: ReactNode;
  switchSlot?: ReactNode;
  leading?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const STATE_CLASS: Record<DataCellContentState, string> = {
  normal: styles.normal,
  "normal-low": styles.normalLow,
  disable: styles.disable,
};

const TEXT_ALIGN_CLASS: Record<DataCellContentTextAlignment, string> = {
  left: styles.textLeft,
  center: styles.textCenter,
  right: styles.textRight,
};

const CELL_ALIGN_CLASS: Record<DataCellContentCellAlignment, string> = {
  left: styles.cellLeft,
  center: styles.cellCenter,
  right: styles.cellRight,
};

export function DataCellContent({
  state = "normal",
  textAlignment = "left",
  cellAlignment = "left",
  expandButton,
  switchSlot,
  leading,
  title,
  description,
  trailing,
  className,
}: DataCellContentProps) {
  const hasText = title != null || description != null;

  return (
    <div
      className={cx(
        styles.root,
        STATE_CLASS[state],
        CELL_ALIGN_CLASS[cellAlignment],
        className
      )}
    >
      {expandButton && <span className={styles.slot}>{expandButton}</span>}

      {switchSlot && <span className={styles.slot}>{switchSlot}</span>}

      {leading && <span className={styles.slot}>{leading}</span>}

      {hasText && (
        <div className={cx(styles.text, TEXT_ALIGN_CLASS[textAlignment])}>
          {title != null && <p className={styles.title}>{title}</p>}
          {description != null && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
      )}

      {trailing && <span className={styles.slot}>{trailing}</span>}
    </div>
  );
}
