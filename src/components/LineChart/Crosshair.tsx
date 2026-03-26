import styles from "./LineChart.module.css";

export interface CrosshairPoint {
  x: number;
  y: number;
  color: string;
}

export interface CrosshairProps {
  x: number;
  height: number;
  points: CrosshairPoint[];
}

export function Crosshair({ x, height, points }: CrosshairProps) {
  return (
    <g>
      <line
        x1={x}
        x2={x}
        y1={0}
        y2={height}
        className={styles.crosshairLine}
      />
      {points.map((pt, i) => (
        <g key={i} className={styles.crosshairDot}>
          <circle
            cx={pt.x}
            cy={pt.y}
            r={5}
            fill="var(--element-surface-over)"
            stroke="var(--element-divider-neutral-weak)"
            strokeWidth={0.5}
            className={styles.crosshairDotBg}
          />
          <circle
            cx={pt.x}
            cy={pt.y}
            r={3}
            fill={pt.color}
            className={styles.crosshairDotInner}
          />
        </g>
      ))}
    </g>
  );
}
