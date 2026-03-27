import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import {
  buildTimeScale,
  buildLinearScale,
  getSeriesColor,
  type Series,
} from "./chartUtils";
import styles from "./LineChart.module.css";

const BRUSH_HEIGHT = 40;

export interface ChartBrushProps<D> {
  series: Series<D>[];
  xAccessor: (d: D) => Date | number;
  yAccessor: (d: D) => number;
  width: number;
  marginLeft: number;
  hiddenSeries?: Set<string>;
  domain: [Date, Date] | [number, number] | null;
  onChange: (domain: [Date, Date] | [number, number] | null) => void;
  xTickFormat?: (value: any) => string;
}

export function ChartBrush<D>({
  series,
  xAccessor,
  yAccessor,
  width,
  marginLeft,
  hiddenSeries,
  domain,
  onChange,
  xTickFormat,
}: ChartBrushProps<D>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerWidth = width - marginLeft;
  const [selection, setSelection] = useState<{ x0: number; x1: number } | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<"left" | "right" | null>(null);
  const dragRef = useRef<{ type: "move" | "left" | "right"; startX: number; startSel: { x0: number; x1: number } } | null>(null);

  const visibleSeries = useMemo(
    () => series.filter((s) => !hiddenSeries?.has(s.id)),
    [series, hiddenSeries]
  );

  const allXValues = useMemo(
    () => visibleSeries.flatMap((s) => s.data.map(xAccessor)),
    [visibleSeries, xAccessor]
  );
  const allYValues = useMemo(
    () => visibleSeries.flatMap((s) => s.data.map(yAccessor)),
    [visibleSeries, yAccessor]
  );

  const xScale = useMemo(() => {
    const isTime = allXValues.length > 0 && allXValues[0] instanceof Date;
    if (isTime) return buildTimeScale(allXValues as Date[], innerWidth);
    return buildLinearScale(allXValues as number[], innerWidth, true);
  }, [allXValues, innerWidth]);

  const yScale = useMemo(
    () => buildLinearScale(allYValues, BRUSH_HEIGHT - 8),
    [allYValues]
  );

  useEffect(() => {
    if (!domain) {
      setSelection(null);
      return;
    }
    const x0 = xScale(domain[0]) ?? 0;
    const x1 = xScale(domain[1]) ?? 0;
    if (!dragRef.current) {
      setSelection({ x0, x1 });
    }
  }, [domain, xScale]);

  const emitDomain = useCallback(
    (sel: { x0: number; x1: number } | null) => {
      if (!sel) {
        onChange(null);
        return;
      }
      const v0 = xScale.invert(sel.x0);
      const v1 = xScale.invert(sel.x1);
      const isTime = allXValues.length > 0 && allXValues[0] instanceof Date;
      if (isTime) {
        onChange([v0 as Date, v1 as Date]);
      } else {
        onChange([v0 as number, v1 as number]);
      }
    },
    [xScale, allXValues, onChange]
  );

  const clamp = (v: number) => Math.max(0, Math.min(innerWidth, v));

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: "move" | "left" | "right") => {
      e.preventDefault();
      e.stopPropagation();
      if (!selection) return;
      dragRef.current = { type, startX: e.clientX, startSel: { ...selection } };
      if (type === "left" || type === "right") setHoveredHandle(type);
    },
    [selection]
  );

  const handleBgMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left - marginLeft;
      const clamped = clamp(x);
      setSelection({ x0: clamped, x1: clamped });
      dragRef.current = { type: "right", startX: e.clientX, startSel: { x0: clamped, x1: clamped } };
    },
    [marginLeft, innerWidth]
  );

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      let { x0, x1 } = drag.startSel;

      if (drag.type === "move") {
        const w = x1 - x0;
        x0 = clamp(x0 + dx);
        x1 = clamp(x0 + w);
        if (x1 > innerWidth) { x1 = innerWidth; x0 = x1 - w; }
      } else if (drag.type === "left") {
        x0 = clamp(x0 + dx);
        if (x0 > x1) { const t = x0; x0 = x1; x1 = t; }
      } else {
        x1 = clamp(x1 + dx);
        if (x1 < x0) { const t = x0; x0 = x1; x1 = t; }
      }
      setSelection({ x0, x1 });
    };

    const handleUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        setSelection((sel) => {
          if (sel && Math.abs(sel.x1 - sel.x0) < 5) {
            emitDomain(null);
            return null;
          }
          emitDomain(sel);
          return sel;
        });
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [innerWidth, emitDomain]);

  if (innerWidth <= 0) return null;

  const selLeft = selection ? Math.min(selection.x0, selection.x1) : 0;
  const selWidth = selection ? Math.abs(selection.x1 - selection.x0) : 0;

  return (
    <div
      ref={containerRef}
      className={styles.brushContainer}
      style={{ height: BRUSH_HEIGHT, marginTop: 8 }}
      onMouseDown={handleBgMouseDown}
    >
      <svg
        width={width}
        height={BRUSH_HEIGHT}
        className={styles.brushSvg}
      >
        <Group left={marginLeft} top={4}>
          {visibleSeries.map((s) => {
            const seriesIndex = series.indexOf(s);
            const color = getSeriesColor(seriesIndex, s.color);
            return (
              <LinePath
                key={s.id}
                data={s.data}
                x={(d) => xScale(xAccessor(d)) ?? 0}
                y={(d) => yScale(yAccessor(d)) ?? 0}
                stroke={color}
                strokeWidth={1}
                strokeOpacity={0.4}
                strokeLinecap="round"
              />
            );
          })}
        </Group>
      </svg>

      {selection && selWidth > 0 && (
        <div
            className={styles.brushSelection}
            style={{
              left: marginLeft + selLeft,
              width: selWidth,
            }}
            onMouseDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const edge = 8;
              if (x < edge) handleMouseDown(e, "left");
              else if (x > rect.width - edge) handleMouseDown(e, "right");
              else handleMouseDown(e, "move");
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const edge = 8;
              if (x < edge) {
                e.currentTarget.style.cursor = "ew-resize";
                setHoveredHandle("left");
              } else if (x > rect.width - edge) {
                e.currentTarget.style.cursor = "ew-resize";
                setHoveredHandle("right");
              } else {
                e.currentTarget.style.cursor = "grab";
                setHoveredHandle(null);
              }
            }}
            onMouseLeave={() => setHoveredHandle(null)}
          >
            {selection && hoveredHandle === "left" && (
              <div className={styles.brushHandleTooltip} style={{ right: "100%", marginRight: 8, top: "50%", transform: "translateY(-50%)" }}>
                {(() => {
                  const val = xScale.invert(selection.x0);
                  return xTickFormat ? xTickFormat(val) : val instanceof Date ? val.toLocaleDateString() : String(Math.round(val as number));
                })()}
              </div>
            )}
            {selection && hoveredHandle === "right" && (
              <div className={styles.brushHandleTooltip} style={{ left: "100%", marginLeft: 8, top: "50%", transform: "translateY(-50%)" }}>
                {(() => {
                  const val = xScale.invert(selection.x1);
                  return xTickFormat ? xTickFormat(val) : val instanceof Date ? val.toLocaleDateString() : String(Math.round(val as number));
                })()}
              </div>
            )}
          </div>
      )}
    </div>
  );
}
