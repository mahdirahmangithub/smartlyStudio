import styles from "./LineChart.module.css";

export interface CrosshairPoint {
  x: number;
  y: number;
  color: string;
}

export interface CrosshairLineProps {
  x: number;
  height: number;
}

export function CrosshairLine({ x, height }: CrosshairLineProps) {
  return (
    <line
      x1={x}
      x2={x}
      y1={0}
      y2={height}
      className={styles.crosshairLine}
    />
  );
}

export interface CrosshairDotsProps {
  points: CrosshairPoint[];
  offsetLeft: number;
  offsetTop: number;
}

export function CrosshairDots({ points, offsetLeft, offsetTop }: CrosshairDotsProps) {
  return (
    <>
      {points.map((pt, i) => (
        <div
          key={i}
          className={styles.indicator}
          style={{
            left: offsetLeft + pt.x,
            top: offsetTop + pt.y,
          }}
        >
          <div className={styles.indicatorBase}>
            <div className={styles.indicatorBg} />
            <div
              className={styles.indicatorDot}
              style={{ background: pt.color }}
            />
          </div>
        </div>
      ))}
    </>
  );
}
