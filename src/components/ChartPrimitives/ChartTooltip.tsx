import { Entity } from "../Entity";
import { Badge } from "../Badge";
import styles from "./ChartContainer.module.css";

export interface TooltipEntry {
  label: string;
  value: string;
  color: string;
  axis?: "left" | "right";
}

export interface ChartTooltipContentProps {
  header: string;
  entries: TooltipEntry[];
  yLeftTitle?: string;
  yRightTitle?: string;
}

export function ChartTooltipContent({ header, entries, yLeftTitle, yRightTitle }: ChartTooltipContentProps) {
  const hasDualAxis = yLeftTitle && yRightTitle && entries.some((e) => e.axis === "right");

  const leftEntries = hasDualAxis ? entries.filter((e) => e.axis !== "right") : entries;
  const rightEntries = hasDualAxis ? entries.filter((e) => e.axis === "right") : [];

  return (
    <div className={styles.tooltipBox}>
      <div className={styles.tooltipHeader}>
        <Entity title={header} className={styles.tooltipEntity} />
      </div>

      {hasDualAxis ? (
        <>
          <div className={styles.tooltipLegends}>
            <span className={styles.tooltipAxisTitle}>{yLeftTitle}</span>
            {leftEntries.map((entry, i) => (
              <div key={i} className={styles.tooltipRow}>
                <Badge
                  size="sm"
                  variant="neutral"
                  emphasis="low"
                  className={styles.tooltipBadge}
                  leadingIcon={
                    <span
                      className={styles.tooltipDot}
                      style={{ background: entry.color }}
                    />
                  }
                >
                  {entry.label}
                </Badge>
                <span className={styles.tooltipValue}>{entry.value}</span>
              </div>
            ))}
          </div>
          <div className={styles.tooltipLegends}>
            <span className={styles.tooltipAxisTitle}>{yRightTitle}</span>
            {rightEntries.map((entry, i) => (
              <div key={i} className={styles.tooltipRow}>
                <Badge
                  size="sm"
                  variant="neutral"
                  emphasis="low"
                  className={styles.tooltipBadge}
                  leadingIcon={
                    <span
                      className={styles.tooltipDot}
                      style={{ background: entry.color }}
                    />
                  }
                >
                  {entry.label}
                </Badge>
                <span className={styles.tooltipValue}>{entry.value}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.tooltipLegends}>
          {entries.map((entry, i) => (
            <div key={i} className={styles.tooltipRow}>
              <Badge
                size="sm"
                variant="neutral"
                emphasis="low"
                className={styles.tooltipBadge}
                leadingIcon={
                  <span
                    className={styles.tooltipDot}
                    style={{ background: entry.color }}
                  />
                }
              >
                {entry.label}
              </Badge>
              <span className={styles.tooltipValue}>{entry.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
