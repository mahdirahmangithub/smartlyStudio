/**
 * Pure utility for computing tree connector guides.
 *
 * Given a flat list of tree rows (already ordered parent-before-child,
 * with collapsed subtrees omitted), produces a parallel array of
 * ConnectorType[] guides that tell a renderer which connector glyph
 * to draw at each ancestor column.
 */

export type ConnectorType = "line" | "end" | "blank";

export interface TreeConnectorRow {
  depth: number;
  isLastChild: boolean;
}

/**
 * For each row, build a guide array of length `depth`.
 * Index 0 = outermost ancestor column, index depth-1 = the row's own level.
 *
 * - `"line"` — a vertical pass-through line (ancestor still has siblings below)
 * - `"end"`  — an L-shaped connector (last child at this level)
 * - `"blank"`— empty spacer (ancestor was the last child, no line continues)
 */
export function computeConnectorGuides(
  rows: TreeConnectorRow[]
): ConnectorType[][] {
  const result: ConnectorType[][] = [];

  // ancestorIsLast[level] tracks whether the most recent ancestor at
  // that level was the last child of its parent. When true, deeper rows
  // should render a blank at that column instead of a continuing line.
  const ancestorIsLast: boolean[] = [];

  for (let i = 0; i < rows.length; i++) {
    const { depth, isLastChild } = rows[i];
    const guide: ConnectorType[] = [];

    if (depth === 0) {
      result.push(guide);
      ancestorIsLast[0] = isLastChild;
      continue;
    }

    // Columns 0 .. depth-2: ancestor pass-through columns
    for (let level = 0; level < depth - 1; level++) {
      guide.push(ancestorIsLast[level] ? "blank" : "line");
    }

    // Column depth-1: this row's own connector
    guide.push(isLastChild ? "end" : "line");

    result.push(guide);

    // Update ancestor tracking for this row's level
    ancestorIsLast[depth - 1] = isLastChild;
  }

  return result;
}
