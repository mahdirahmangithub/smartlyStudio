import { useCallback, useRef } from "react";
import { localPoint } from "@visx/event";
import styles from "./LineChart.module.css";

export interface HoverPosition {
  x: number;
  y: number;
}

export interface HoverOverlayProps {
  width: number;
  height: number;
  marginLeft: number;
  marginTop: number;
  onHover: (pos: HoverPosition | null) => void;
}

export function HoverOverlay({ width, height, marginLeft, marginTop, onHover }: HoverOverlayProps) {
  const rectRef = useRef<SVGRectElement>(null);

  const handleMove = useCallback(
    (event: React.MouseEvent<SVGRectElement> | React.TouchEvent<SVGRectElement>) => {
      const point = localPoint(event);
      if (point) {
        onHover({ x: point.x - marginLeft, y: point.y - marginTop });
      }
    },
    [onHover, marginLeft, marginTop]
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
