import styles from "./ChartContainer.module.css";

export interface ChartZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ChartZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
}: ChartZoomControlsProps) {
  return (
    <div className={styles.zoomControls}>
      <button
        type="button"
        className={styles.zoomButton}
        onClick={onZoomIn}
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        className={styles.zoomButton}
        onClick={onZoomOut}
        aria-label="Zoom out"
      >
        −
      </button>
      <button
        type="button"
        className={styles.zoomButton}
        onClick={onReset}
        aria-label="Reset zoom"
      >
        ↺
      </button>
    </div>
  );
}
