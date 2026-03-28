import { cx } from "../../utils/cx";
import { getSeriesColor, type Series } from "./chartUtils";
import styles from "./ChartContainer.module.css";

export interface ChartLegendProps<D> {
  series: Series<D>[];
  hiddenSeries?: Set<string>;
  onToggle?: (id: string) => void;
}

export function ChartLegend<D>({
  series,
  hiddenSeries,
  onToggle,
}: ChartLegendProps<D>) {
  return (
    <div className={styles.legend} role="list" aria-label="Chart legend">
      {series.map((s, i) => {
        const hidden = hiddenSeries?.has(s.id);
        const color = getSeriesColor(i, s.color);
        return (
          <button
            key={s.id}
            type="button"
            className={cx(styles.legendItem, hidden && styles.muted)}
            onClick={() => onToggle?.(s.id)}
            role="listitem"
            aria-pressed={!hidden}
          >
            <span
              className={styles.legendSwatch}
              style={{ background: color }}
            />
            <span className={styles.legendLabel}>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
