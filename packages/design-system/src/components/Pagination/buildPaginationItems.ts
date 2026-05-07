export type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

/**
 * Returns the ordered list of items to render between the prev / next arrows.
 * Numbers are page buttons; "start-ellipsis" / "end-ellipsis" are gaps where
 * a `more_horiz` glyph should be shown. Algorithm matches MUI's `usePagination`
 * so the layout maps 1:1 onto the Figma states.
 */
export function buildPaginationItems(
  count: number,
  page: number,
  boundaryCount = 1,
  siblingCount = 1,
): PaginationItem[] {
  if (count <= 0) return [];

  // If everything fits, just list every page — no ellipses needed.
  if (count <= boundaryCount * 2 + siblingCount * 2 + 3) {
    return range(1, count);
  }

  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  );

  const items: PaginationItem[] = [...startPages];

  if (siblingsStart > boundaryCount + 2) {
    items.push("start-ellipsis");
  } else if (boundaryCount + 1 < count - boundaryCount) {
    items.push(boundaryCount + 1);
  }

  items.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < count - boundaryCount - 1) {
    items.push("end-ellipsis");
  } else if (count - boundaryCount > boundaryCount) {
    items.push(count - boundaryCount);
  }

  items.push(...endPages);

  return items;
}
