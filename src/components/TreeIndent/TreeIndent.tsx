import type { CSSProperties } from "react";
import styles from "./TreeIndent.module.css";
import type { ConnectorType } from "../../utils/treeConnectors";
import { cx } from "../../utils/cx";

export type TreeIndentLineStyle = "slope" | "square";

export interface TreeIndentProps {
  /** One entry per ancestor level: describes what connector to draw. */
  guide: ConnectorType[];
  /** Width of each depth-level cell in px (default 32). */
  cellWidth?: number;
  /** Render connector lines (default true). Set false for plain spacing. */
  showLines?: boolean;
  /**
   * Extend lines beyond cell bounds (px) to visually bridge row gaps
   * in layouts with margin/gap between items. Default 0.
   */
  lineOverflow?: number;
  /** Corner/curve size in px. Applies to both styles (default 18 for slope, 4 for square). */
  cornerRadius?: number;
  /** End connector style: "slope" (diagonal curve) or "square" (L-shape). Default "slope". */
  lineStyle?: TreeIndentLineStyle;
  /** Additional CSS class on root element. */
  className?: string;
}

function LineSvg({ w, overflow }: { w: number; overflow: number }) {
  const mid = w / 2;
  return (
    <svg className={styles.svg} overflow="visible">
      <line x1={mid} y1={-overflow} x2={mid} y2="100%" className={styles.stroke} />
      {overflow > 0 && (
        <line x1={mid} y1="100%" x2={mid} y2={`calc(100% + ${overflow})`} className={styles.stroke} />
      )}
    </svg>
  );
}

// Reference path from a 17×18 viewBox, normalized to 0..1 range then
// scaled to fit (half = cellWidth/2) wide × curveH tall.
const REF_W = 16; // 16.5 - 0.5
const REF_H = 17; // 17.5 - 0.5

function EndSvg({ w, overflow, r }: { w: number; overflow: number; r: number }) {
  const mid = w / 2;
  const half = w - mid;
  const curveH = Math.min(r, 40);

  const sx = (v: number) => mid + ((v - 0.5) / REF_W) * half;
  const sy = (v: number) => ((v - 0.5) / REF_H) * curveH;

  const d = [
    `M ${sx(0.5)} 0`,
    `V ${sy(4.55573)}`,
    `C ${sx(0.5)} ${sy(7.5859)} ${sx(2.21202)} ${sy(10.356)} ${sx(4.92229)} ${sy(11.7111)}`,
    `L ${sx(16.5)} ${sy(17.5)}`,
  ].join(" ");

  return (
    <>
      {/* Vertical segment: top → center */}
      <svg className={styles.svgTop} overflow="visible">
        <line x1={mid} y1={-overflow} x2={mid} y2="100%" className={styles.stroke} />
      </svg>
      {/* Curve + diagonal tail */}
      <svg
        className={styles.svgBottom}
        width={w}
        height={curveH}
        viewBox={`0 0 ${w} ${curveH}`}
        overflow="visible"
      >
        <path d={d} className={styles.stroke} fill="none" />
      </svg>
    </>
  );
}

function EndSquareSvg({ w, overflow, r }: { w: number; overflow: number; r: number }) {
  const mid = w / 2;
  const clampedR = Math.min(r, mid);
  const k = 0.5523;
  const cp1y = clampedR * k;
  const cp2x = mid + (w - mid - (w - mid - clampedR)) * (1 - k);

  return (
    <>
      {/* Vertical segment: top → center */}
      <svg className={styles.svgTop} overflow="visible">
        <line x1={mid} y1={-overflow} x2={mid} y2="100%" className={styles.stroke} />
      </svg>
      {/* Rounded L-corner + horizontal tail */}
      <svg
        className={styles.svgBottom}
        width={w}
        height={clampedR}
        viewBox={`0 0 ${w} ${clampedR}`}
        overflow="visible"
      >
        <path
          d={`M ${mid} 0 C ${mid} ${cp1y} ${mid + clampedR * (1 - k)} ${clampedR} ${mid + clampedR} ${clampedR}`}
          className={styles.stroke}
          fill="none"
        />
        <line
          x1={mid + clampedR}
          y1={clampedR}
          x2={w}
          y2={clampedR}
          className={styles.stroke}
        />
      </svg>
    </>
  );
}

export function TreeIndent({
  guide,
  cellWidth = 32,
  showLines = true,
  lineOverflow = 0,
  cornerRadius,
  lineStyle = "slope",
  className,
}: TreeIndentProps) {
  if (guide.length === 0) return null;

  const r = cornerRadius ?? (lineStyle === "slope" ? 18 : 6);

  return (
    <span
      className={cx(styles.root, className)}
      style={{
        "--tree-indent-cell-width": `${cellWidth}px`,
        "--_end-offset": lineStyle === "slope" ? "18px" : "6px",
      } as CSSProperties}
      aria-hidden="true"
    >
      {guide.map((type, i) => (
        <span key={i} className={styles.cell}>
          {showLines && type === "line" && (
            <LineSvg w={cellWidth} overflow={lineOverflow} />
          )}
          {showLines && type === "end" && lineStyle === "slope" && (
            <EndSvg w={cellWidth} overflow={lineOverflow} r={r} />
          )}
          {showLines && type === "end" && lineStyle === "square" && (
            <EndSquareSvg w={cellWidth} overflow={lineOverflow} r={r} />
          )}
        </span>
      ))}
    </span>
  );
}
