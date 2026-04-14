import type { CSSProperties } from "react";
import styles from "./TreeIndent.module.css";
import type { ConnectorType } from "../../utils/treeConnectors";
import { cx } from "../../utils/cx";

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
  /** Radius of the L-shaped corner in px (default 4). */
  cornerRadius?: number;
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

function EndSvg({ w, overflow, r }: { w: number; overflow: number; r: number }) {
  const mid = w / 2;
  const clampedR = Math.min(r, mid);
  return (
    <>
      {/* Vertical segment: top → center */}
      <svg className={styles.svgTop} overflow="visible">
        <line x1={mid} y1={-overflow} x2={mid} y2="100%" className={styles.stroke} />
      </svg>
      {/* L-corner + horizontal: center → right */}
      <svg
        className={styles.svgBottom}
        width={w}
        height={clampedR}
        viewBox={`0 0 ${w} ${clampedR}`}
        overflow="visible"
      >
        <path
          d={`M ${mid} 0 Q ${mid} ${clampedR} ${mid + clampedR} ${clampedR}`}
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
  cornerRadius = 4,
  className,
}: TreeIndentProps) {
  if (guide.length === 0) return null;

  return (
    <span
      className={cx(styles.root, className)}
      style={{ "--tree-indent-cell-width": `${cellWidth}px` } as CSSProperties}
      aria-hidden="true"
    >
      {guide.map((type, i) => (
        <span key={i} className={styles.cell}>
          {showLines && type === "line" && (
            <LineSvg w={cellWidth} overflow={lineOverflow} />
          )}
          {showLines && type === "end" && (
            <EndSvg w={cellWidth} overflow={lineOverflow} r={cornerRadius} />
          )}
        </span>
      ))}
    </span>
  );
}
