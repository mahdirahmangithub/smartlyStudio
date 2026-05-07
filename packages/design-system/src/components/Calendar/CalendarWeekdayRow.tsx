import { cx } from "../../utils/cx";
import styles from "./CalendarWeekdayRow.module.css";

export interface CalendarWeekdayRowProps {
  labels: string[];
  /** id of element that labels this rowgroup for the grid */
  labelledBy?: string;
  /** Hide visually but keep for screen readers. */
  screenReaderOnly?: boolean;
  /** Mark row as presentational (e.g. duplicate of visible column headers). */
  decorative?: boolean;
}

export function CalendarWeekdayRow({
  labels,
  labelledBy,
  screenReaderOnly,
  decorative,
}: CalendarWeekdayRowProps) {
  return (
    <div
      role="row"
      className={cx(styles.row, screenReaderOnly && styles.srOnly)}
      aria-labelledby={labelledBy}
      aria-hidden={decorative ? true : undefined}
    >
      {labels.map((label) => (
        <div key={label} role="columnheader" className={styles.headerCell}>
          {label}
        </div>
      ))}
    </div>
  );
}
