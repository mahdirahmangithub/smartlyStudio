import styles from "./LineChart.module.css";

export interface TooltipEntry {
  label: string;
  value: string;
  color: string;
}

export interface ChartTooltipContentProps {
  header: string;
  entries: TooltipEntry[];
}

export function ChartTooltipContent({ header, entries }: ChartTooltipContentProps) {
  return (
    <div className={styles.tooltipBox}>
      <div className={styles.tooltipHeader}>{header}</div>
      {entries.map((entry, i) => (
        <div key={i} className={styles.tooltipRow}>
          <span
            className={styles.tooltipSwatch}
            style={{ background: entry.color }}
          />
          <span className={styles.tooltipLabel}>{entry.label}</span>
          <span className={styles.tooltipValue}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
