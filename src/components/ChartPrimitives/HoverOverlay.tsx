import { useCallback, useRef } from "react";
import { localPoint } from "@visx/event";
import styles from "./ChartContainer.module.css";

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
  onPan?: (dx: number) => void;
  panEnabled?: boolean;
}

export function HoverOverlay({
  width,
  height,
  marginLeft,
  marginTop,
  onHover,
  onPan,
  panEnabled = false,
}: HoverOverlayProps) {
  const onPanRef = useRef(onPan);
  onPanRef.current = onPan;
  const lastXRef = useRef(0);

  const handleMove = useCallback(
    (event: React.MouseEvent<SVGRectElement>) => {
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
      width={width}
      height={height}
      className={styles.hoverRect}
      style={{ cursor: panEnabled ? "grab" : undefined }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseDown={(e) => {
        if (!panEnabled) return;
        e.preventDefault();
        lastXRef.current = e.clientX;
        const move = (ev: MouseEvent) => {
          const dx = ev.clientX - lastXRef.current;
          lastXRef.current = ev.clientX;
          onPanRef.current?.(dx);
        };
        const up = () => {
          window.removeEventListener("mousemove", move);
          window.removeEventListener("mouseup", up);
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      }}
      onTouchMove={handleMove as any}
      onTouchEnd={handleLeave}
    />
  );
}
