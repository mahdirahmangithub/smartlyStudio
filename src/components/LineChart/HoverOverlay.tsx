import { useCallback, useRef } from "react";
import { localPoint } from "@visx/event";
import styles from "./LineChart.module.css";

export interface HoverOverlayProps {
  width: number;
  height: number;
  marginLeft: number;
  onHover: (x: number | null) => void;
}

export function HoverOverlay({ width, height, marginLeft, onHover }: HoverOverlayProps) {
  const rectRef = useRef<SVGRectElement>(null);

  const handleMove = useCallback(
    (event: React.MouseEvent<SVGRectElement> | React.TouchEvent<SVGRectElement>) => {
      const point = localPoint(event);
      if (point) {
        onHover(point.x - marginLeft);
      }
    },
    [onHover, marginLeft]
  );

  const handleLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  return (
    <rect
      ref={rectRef}
      width={width}
      height={height}
      className={styles.hoverRect}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onTouchMove={handleMove}
      onTouchEnd={handleLeave}
    />
  );
}
