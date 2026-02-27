import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  Fragment,
  type ReactNode,
  type Key,
  type CSSProperties,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import styles from "./DataTable.module.css";

/* ═══════════════════════════════════════════════════════════════
   Utilities
   ═══════════════════════════════════════════════════════════════ */

function cx(...c: (string | false | undefined | null)[]) {
  return c.filter(Boolean).join(" ");
}

const DEFAULT_COL_WIDTH = 100;

/* ═══════════════════════════════════════════════════════════════
   Public Types
   ═══════════════════════════════════════════════════════════════ */

export interface ColumnDef<T = any> {
  key: string;
  title: ReactNode;
  dataIndex?: string | string[];
  render?: (value: any, record: T, index: number) => ReactNode;
  width?: number | string;
  flex?: number;
  minWidth?: number;
  maxWidth?: number;
  fixed?: "left" | "right";
  align?: "left" | "center" | "right";
  sortable?: boolean;
  resizable?: boolean;
  children?: ColumnDef<T>[];
  onCell?: (
    record: T,
    index: number
  ) => TdHTMLAttributes<HTMLTableCellElement>;
  onHeaderCell?: () => ThHTMLAttributes<HTMLTableHeaderCellElement>;
}

export interface RowSelection<T = any> {
  type?: "checkbox" | "radio";
  selectedRowKeys?: Key[];
  onChange?: (selectedRowKeys: Key[], selectedRows: T[]) => void;
  getCheckboxProps?: (record: T) => { disabled?: boolean };
}

export interface ExpandableConfig<T = any> {
  expandedRowKeys?: Key[];
  defaultExpandedRowKeys?: Key[];
  onExpand?: (expanded: boolean, record: T) => void;
  onExpandedRowKeysChange?: (keys: Key[]) => void;
  expandedRowRender?: (
    record: T,
    index: number,
    expanded: boolean
  ) => ReactNode;
  rowExpandable?: (record: T) => boolean;
  indentSize?: number;
  childrenColumnName?: string;
}

export interface SortState {
  columnKey: string;
  direction: "asc" | "desc";
}

export interface RowDragAndDropConfig<T = any> {
  onReorder?: (fromIndex: number, toIndex: number, data: T[]) => void;
}

export interface ColumnDragAndDropConfig {
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

export interface ColumnResizeConfig {
  /** "fixed" keeps total table width constant (neighbor compensates). "overflow" lets the table grow. Default: "fixed". */
  mode?: "fixed" | "overflow";
  onResize?: (columnKey: string, width: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

export interface DataTableProps<T = any> {
  columns: ColumnDef<T>[];
  dataSource: T[];
  rowKey: string | ((record: T) => Key);
  rowSelection?: RowSelection<T>;
  expandable?: ExpandableConfig<T>;
  sortState?: SortState | null;
  onSort?: (state: SortState | null) => void;
  stickyHeader?: boolean;
  stickyHeaderOffset?: number;
  rowDragAndDrop?: RowDragAndDropConfig<T>;
  columnDragAndDrop?: ColumnDragAndDropConfig;
  columnResize?: ColumnResizeConfig;
  keyboardNavigation?: boolean;
  className?: string;
  style?: CSSProperties;
  emptyContent?: ReactNode;
  loading?: boolean;
  onRow?: (
    record: T,
    index: number
  ) => HTMLAttributes<HTMLTableRowElement>;
}

/* ═══════════════════════════════════════════════════════════════
   Internal Helpers
   ═══════════════════════════════════════════════════════════════ */

function getRowKey<T>(
  record: T,
  rowKey: string | ((record: T) => Key)
): Key {
  return typeof rowKey === "function"
    ? rowKey(record)
    : (record as Record<string, any>)[rowKey];
}

function getValueByPath(
  record: Record<string, any>,
  path?: string | string[]
): any {
  if (!path) return undefined;
  const parts = Array.isArray(path) ? path : [path];
  let v: any = record;
  for (const p of parts) v = v?.[p];
  return v;
}

function flattenLeafColumns<T>(columns: ColumnDef<T>[]): ColumnDef<T>[] {
  const out: ColumnDef<T>[] = [];
  for (const c of columns) {
    if (c.children?.length) out.push(...flattenLeafColumns(c.children));
    else out.push(c);
  }
  return out;
}

function getMaxDepth<T>(columns: ColumnDef<T>[]): number {
  let d = 1;
  for (const c of columns)
    if (c.children?.length) d = Math.max(d, 1 + getMaxDepth(c.children));
  return d;
}

function getLeafCount<T>(col: ColumnDef<T>): number {
  if (!col.children?.length) return 1;
  return col.children.reduce((s, c) => s + getLeafCount(c), 0);
}

interface HeaderCell<T = any> {
  column: ColumnDef<T>;
  colSpan: number;
  rowSpan: number;
  isLeaf: boolean;
}

function buildHeaderRows<T>(
  columns: ColumnDef<T>[],
  maxDepth: number
): HeaderCell<T>[][] {
  const rows: HeaderCell<T>[][] = Array.from(
    { length: maxDepth },
    () => []
  );
  function walk(cols: ColumnDef<T>[], depth: number) {
    for (const col of cols) {
      if (col.children?.length) {
        rows[depth].push({
          column: col,
          colSpan: getLeafCount(col),
          rowSpan: 1,
          isLeaf: false,
        });
        walk(col.children, depth + 1);
      } else {
        rows[depth].push({
          column: col,
          colSpan: 1,
          rowSpan: maxDepth - depth,
          isLeaf: true,
        });
      }
    }
  }
  walk(columns, 0);
  return rows;
}

interface FlatRow<T = any> {
  record: T;
  key: Key;
  depth: number;
  hasChildren: boolean;
  parent: Key | null;
}

function flattenTree<T>(
  data: T[],
  rowKey: string | ((r: T) => Key),
  childField: string,
  expanded: Set<Key>,
  depth = 0,
  parent: Key | null = null
): FlatRow<T>[] {
  const out: FlatRow<T>[] = [];
  for (const r of data) {
    const k = getRowKey(r, rowKey);
    const ch = (r as Record<string, any>)[childField] as T[] | undefined;
    const hasKids = !!ch?.length;
    out.push({ record: r, key: k, depth, hasChildren: hasKids, parent });
    if (hasKids && expanded.has(k))
      out.push(
        ...flattenTree(ch!, rowKey, childField, expanded, depth + 1, k)
      );
  }
  return out;
}

function calcStickyOffsets<T>(
  cols: ColumnDef<T>[],
  widths: Map<string, number>,
  extraLeftOffset: number
): Map<string, { side: "left" | "right"; offset: number }> {
  const map = new Map<
    string,
    { side: "left" | "right"; offset: number }
  >();
  let l = extraLeftOffset;
  for (const c of cols) {
    if (c.fixed === "left") {
      map.set(c.key, { side: "left", offset: l });
      l += widths.get(c.key) ?? 0;
    }
  }
  let r = 0;
  for (let i = cols.length - 1; i >= 0; i--) {
    if (cols[i].fixed === "right") {
      map.set(cols[i].key, { side: "right", offset: r });
      r += widths.get(cols[i].key) ?? 0;
    }
  }
  return map;
}

/* ═══════════════════════════════════════════════════════════════
   DataTable Component
   ═══════════════════════════════════════════════════════════════ */

export function DataTable<T extends Record<string, any>>({
  columns,
  dataSource,
  rowKey,
  rowSelection,
  expandable,
  sortState,
  onSort,
  stickyHeader = false,
  stickyHeaderOffset = 0,
  rowDragAndDrop,
  columnDragAndDrop,
  columnResize,
  keyboardNavigation = false,
  className,
  style,
  emptyContent = "No data",
  loading = false,
  onRow,
}: DataTableProps<T>) {
  const tableRef = useRef<HTMLTableElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /* ── Container width (for flex columns) ── */
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Scroll state (for sticky shadows) ── */
  const [scrollState, setScrollState] = useState({
    top: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const t = el.scrollTop > 0;
      const l = el.scrollLeft > 0;
      const r = el.scrollWidth - el.scrollLeft - el.clientWidth > 1;
      setScrollState((prev) =>
        prev.top === t && prev.left === l && prev.right === r
          ? prev
          : { top: t, left: l, right: r }
      );
    };
    el.addEventListener("scroll", update, { passive: true });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  /* ── Feature flags ── */
  const hasSelection = !!rowSelection;
  const selType = rowSelection?.type ?? "checkbox";
  const hasExpandRender = !!expandable?.expandedRowRender;
  const hasRowDnD = !!rowDragAndDrop;
  const childField = expandable?.childrenColumnName ?? "children";
  const indentSize = expandable?.indentSize ?? 24;

  const isTreeData = useMemo(
    () =>
      dataSource.some(
        (r) => ((r as Record<string, any>)[childField] as any[])?.length > 0
      ),
    [dataSource, childField]
  );

  const showExpandCol = hasExpandRender && !isTreeData;
  const internalColCount =
    (hasRowDnD ? 1 : 0) + (hasSelection ? 1 : 0) + (showExpandCol ? 1 : 0);
  const internalColWidth = 40;

  /* ── Column order (for column DnD) ── */
  const [colOrder, setColOrder] = useState<string[] | null>(null);

  const orderedColumns = useMemo(() => {
    if (!colOrder) return columns;
    const hasGroups = columns.some((c) => c.children?.length);
    if (hasGroups) return columns;
    const map = new Map<string, ColumnDef<T>>();
    for (const c of columns) map.set(c.key, c);
    return colOrder.map((k) => map.get(k)!).filter(Boolean);
  }, [columns, colOrder]);

  const leafCols = useMemo(
    () => flattenLeafColumns(orderedColumns),
    [orderedColumns]
  );
  const totalColCount = internalColCount + leafCols.length;

  /* ── Header rows for grouped headers ── */
  const maxDepth = useMemo(
    () => getMaxDepth(orderedColumns),
    [orderedColumns]
  );
  const headerRows = useMemo(
    () => buildHeaderRows(orderedColumns, maxDepth),
    [orderedColumns, maxDepth]
  );

  /* ── Column width computation (fixed + flex) ── */
  const [widthOverrides, setWidthOverrides] = useState<Map<string, number>>(
    () => new Map()
  );

  const computedWidths = useMemo(() => {
    const result = new Map<string, number | string>();

    let fixedTotal = internalColCount * internalColWidth;
    let flexTotal = 0;
    const flexCols: ColumnDef<T>[] = [];

    for (const col of leafCols) {
      const override = widthOverrides.get(col.key);
      if (override != null) {
        result.set(col.key, override);
        fixedTotal += override;
      } else if (col.flex != null && col.flex > 0) {
        flexCols.push(col);
        flexTotal += col.flex;
      } else if (typeof col.width === "string") {
        result.set(col.key, col.width);
      } else {
        const w = typeof col.width === "number" ? col.width : DEFAULT_COL_WIDTH;
        result.set(col.key, w);
        fixedTotal += w;
      }
    }

    const available =
      containerWidth > 0 ? Math.max(0, containerWidth - fixedTotal) : 0;

    if (flexCols.length > 0) {
      for (const col of flexCols) {
        let w =
          available > 0 && flexTotal > 0
            ? (col.flex! / flexTotal) * available
            : typeof col.width === "number"
              ? col.width
              : DEFAULT_COL_WIDTH;
        if (col.minWidth != null) w = Math.max(w, col.minWidth);
        if (col.maxWidth != null) w = Math.min(w, col.maxWidth);
        result.set(col.key, w);
      }
    } else if (available > 0 && containerWidth > 0) {
      const stretchable = leafCols.filter(
        (c) =>
          !widthOverrides.has(c.key) && typeof result.get(c.key) === "number"
      );
      const stretchTotal = stretchable.reduce(
        (s, c) => s + (result.get(c.key) as number),
        0
      );
      if (stretchTotal > 0) {
        for (const col of stretchable) {
          const base = result.get(col.key) as number;
          result.set(col.key, base + (base / stretchTotal) * available);
        }
      }
    }

    return result;
  }, [leafCols, widthOverrides, containerWidth, internalColCount]);

  /* ── Active widths (frozen during resize to prevent redistribution) ── */
  const [resizingCol, setResizingCol] = useState<string | null>(null);
  const frozenWidths = useRef<Map<string, number> | null>(null);
  const resizeNeighborKey = useRef<string | null>(null);

  const activeWidths = useMemo(() => {
    const result = new Map<string, number | string>();
    const nKey = resizeNeighborKey.current;
    for (const col of leafCols) {
      if (
        frozenWidths.current &&
        col.key !== resizingCol &&
        col.key !== nKey
      ) {
        result.set(
          col.key,
          frozenWidths.current.get(col.key) ?? DEFAULT_COL_WIDTH
        );
      } else {
        result.set(col.key, computedWidths.get(col.key) ?? DEFAULT_COL_WIDTH);
      }
    }
    return result;
  }, [leafCols, computedWidths, resizingCol]);

  const numericWidth = useCallback(
    (col: ColumnDef<T>): number => {
      const w = activeWidths.get(col.key);
      return typeof w === "number" ? w : DEFAULT_COL_WIDTH;
    },
    [activeWidths]
  );

  const tableWidth = useMemo(() => {
    let total = internalColCount * internalColWidth;
    for (const col of leafCols) {
      const w = activeWidths.get(col.key);
      total += typeof w === "number" ? w : DEFAULT_COL_WIDTH;
    }
    return total;
  }, [leafCols, activeWidths, internalColCount]);

  /* ══════════════════════════════════════════════════════════
     Selection
     ══════════════════════════════════════════════════════════ */

  const [intSelKeys, setIntSelKeys] = useState<Key[]>([]);
  const selControlled = rowSelection?.selectedRowKeys !== undefined;
  const selKeys = useMemo(
    () =>
      new Set(selControlled ? rowSelection!.selectedRowKeys! : intSelKeys),
    [selControlled, rowSelection?.selectedRowKeys, intSelKeys]
  );

  const allRowKeys = useMemo(
    () => dataSource.map((r) => getRowKey(r, rowKey)),
    [dataSource, rowKey]
  );
  const selectableKeys = useMemo(() => {
    if (!rowSelection) return [];
    return allRowKeys.filter((_, i) => {
      const props = rowSelection.getCheckboxProps?.(dataSource[i]);
      return !props?.disabled;
    });
  }, [allRowKeys, dataSource, rowSelection]);

  const allSelected =
    selectableKeys.length > 0 && selectableKeys.every((k) => selKeys.has(k));
  const someSelected = selectableKeys.some((k) => selKeys.has(k));

  const fireSelection = useCallback(
    (keys: Key[]) => {
      if (!rowSelection) return;
      if (!selControlled) setIntSelKeys(keys);
      const set = new Set(keys);
      const rows = dataSource.filter((r) => set.has(getRowKey(r, rowKey)));
      rowSelection.onChange?.(keys, rows);
    },
    [rowSelection, selControlled, dataSource, rowKey]
  );

  const toggleRow = useCallback(
    (key: Key) => {
      if (selType === "radio") {
        fireSelection([key]);
        return;
      }
      const next = selKeys.has(key)
        ? [...selKeys].filter((k) => k !== key)
        : [...selKeys, key];
      fireSelection(next);
    },
    [selType, selKeys, fireSelection]
  );

  const toggleAll = useCallback(() => {
    fireSelection(allSelected ? [] : [...selectableKeys]);
  }, [allSelected, selectableKeys, fireSelection]);

  /* ══════════════════════════════════════════════════════════
     Expansion
     ══════════════════════════════════════════════════════════ */

  const [intExpKeys, setIntExpKeys] = useState<Key[]>(
    expandable?.defaultExpandedRowKeys ?? []
  );
  const expControlled = expandable?.expandedRowKeys !== undefined;
  const expKeys = useMemo(
    () =>
      new Set(expControlled ? expandable!.expandedRowKeys! : intExpKeys),
    [expControlled, expandable?.expandedRowKeys, intExpKeys]
  );

  const toggleExpand = useCallback(
    (key: Key, record: T) => {
      const was = expKeys.has(key);
      const next = was
        ? [...expKeys].filter((k) => k !== key)
        : [...expKeys, key];
      if (!expControlled) setIntExpKeys(next);
      expandable?.onExpand?.(!was, record);
      expandable?.onExpandedRowKeysChange?.(next);
    },
    [expKeys, expControlled, expandable]
  );

  /* ══════════════════════════════════════════════════════════
     Flat rows (tree-aware)
     ══════════════════════════════════════════════════════════ */

  const flatRows = useMemo<FlatRow<T>[]>(() => {
    if (isTreeData)
      return flattenTree(dataSource, rowKey, childField, expKeys);
    return dataSource.map((r) => ({
      record: r,
      key: getRowKey(r, rowKey),
      depth: 0,
      hasChildren: false,
      parent: null,
    }));
  }, [dataSource, rowKey, childField, expKeys, isTreeData]);

  /* ══════════════════════════════════════════════════════════
     Sorting
     ══════════════════════════════════════════════════════════ */

  const cycleSort = useCallback(
    (colKey: string) => {
      if (!onSort) return;
      if (sortState?.columnKey === colKey) {
        if (sortState.direction === "asc")
          onSort({ columnKey: colKey, direction: "desc" });
        else onSort(null);
      } else {
        onSort({ columnKey: colKey, direction: "asc" });
      }
    },
    [sortState, onSort]
  );

  /* ══════════════════════════════════════════════════════════
     Column Resize
     ══════════════════════════════════════════════════════════ */

  const resizeX0 = useRef(0);
  const resizeW0 = useRef(0);
  const resizeMinW = useRef(50);
  const resizeMaxW = useRef(9999);
  const didResize = useRef(false);
  const resizeNeighborW0 = useRef(0);
  const resizeNeighborMinW = useRef(50);
  const resizeNeighborMaxW = useRef(9999);

  const resizeMode = columnResize?.mode ?? "fixed";

  const onResizeStart = useCallback(
    (colKey: string, e: ReactMouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const frozen = new Map<string, number>();
      for (const c of leafCols) frozen.set(c.key, numericWidth(c));
      frozenWidths.current = frozen;
      didResize.current = true;

      setResizingCol(colKey);
      resizeX0.current = e.clientX;
      resizeW0.current = frozen.get(colKey) ?? DEFAULT_COL_WIDTH;

      const col = leafCols.find((c) => c.key === colKey);
      resizeMinW.current = col?.minWidth ?? columnResize?.minWidth ?? 50;
      resizeMaxW.current = col?.maxWidth ?? columnResize?.maxWidth ?? 9999;

      if (resizeMode === "fixed") {
        const idx = leafCols.findIndex((c) => c.key === colKey);
        const neighbor =
          idx < leafCols.length - 1 ? leafCols[idx + 1] : null;
        resizeNeighborKey.current = neighbor?.key ?? null;
        resizeNeighborW0.current = neighbor
          ? (frozen.get(neighbor.key) ?? DEFAULT_COL_WIDTH)
          : 0;
        resizeNeighborMinW.current =
          neighbor?.minWidth ?? columnResize?.minWidth ?? 50;
        resizeNeighborMaxW.current =
          neighbor?.maxWidth ?? columnResize?.maxWidth ?? 9999;
      } else {
        resizeNeighborKey.current = null;
      }
    },
    [leafCols, numericWidth, columnResize, resizeMode]
  );

  useEffect(() => {
    if (!resizingCol) return;
    const neighborKey = resizeNeighborKey.current;

    const onMove = (e: globalThis.MouseEvent) => {
      const delta = e.clientX - resizeX0.current;

      if (neighborKey) {
        let newW = Math.max(
          resizeMinW.current,
          Math.min(resizeMaxW.current, resizeW0.current + delta)
        );
        let neighborW =
          resizeNeighborW0.current - (newW - resizeW0.current);

        if (neighborW < resizeNeighborMinW.current) {
          neighborW = resizeNeighborMinW.current;
          newW =
            resizeW0.current + resizeNeighborW0.current - neighborW;
        } else if (neighborW > resizeNeighborMaxW.current) {
          neighborW = resizeNeighborMaxW.current;
          newW =
            resizeW0.current + resizeNeighborW0.current - neighborW;
        }
        newW = Math.max(
          resizeMinW.current,
          Math.min(resizeMaxW.current, newW)
        );
        neighborW =
          resizeNeighborW0.current - (newW - resizeW0.current);

        setWidthOverrides((prev) => {
          const m = new Map(prev);
          m.set(resizingCol, newW);
          m.set(neighborKey, neighborW);
          return m;
        });
        columnResize?.onResize?.(resizingCol, newW);
        columnResize?.onResize?.(neighborKey, neighborW);
      } else {
        const w = Math.max(
          resizeMinW.current,
          Math.min(resizeMaxW.current, resizeW0.current + delta)
        );
        setWidthOverrides((prev) => {
          const m = new Map(prev);
          m.set(resizingCol, w);
          return m;
        });
        columnResize?.onResize?.(resizingCol, w);
      }
    };

    const onUp = () => {
      const frozen = frozenWidths.current;
      if (!neighborKey && frozen) {
        setWidthOverrides((prev) => {
          const m = new Map(prev);
          for (const [key, val] of frozen) {
            if (key !== resizingCol) m.set(key, val);
          }
          return m;
        });
      }
      frozenWidths.current = null;
      resizeNeighborKey.current = null;
      setResizingCol(null);
      requestAnimationFrame(() => { didResize.current = false; });
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [resizingCol, columnResize]);

  /* ══════════════════════════════════════════════════════════
     Row Drag & Drop
     ══════════════════════════════════════════════════════════ */

  const [dragRow, setDragRow] = useState<number | null>(null);
  const [overRow, setOverRow] = useState<number | null>(null);

  const rowDropProps = useCallback(
    (idx: number) =>
      hasRowDnD
        ? {
            onDragOver: (e: ReactDragEvent<HTMLTableRowElement>) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setOverRow(idx);
            },
            onDragLeave: () => setOverRow(null),
            onDrop: (e: ReactDragEvent<HTMLTableRowElement>) => {
              e.preventDefault();
              if (dragRow !== null && dragRow !== idx)
                rowDragAndDrop!.onReorder?.(dragRow, idx, dataSource);
              setDragRow(null);
              setOverRow(null);
            },
          }
        : {},
    [hasRowDnD, dragRow, rowDragAndDrop, dataSource]
  );

  /* ══════════════════════════════════════════════════════════
     Column Drag & Drop
     ══════════════════════════════════════════════════════════ */

  const [dragCol, setDragCol] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);

  const colDragProps = useCallback(
    (colKey: string) =>
      columnDragAndDrop
        ? {
            draggable: true,
            onDragStart: (e: ReactDragEvent<HTMLTableCellElement>) => {
              setDragCol(colKey);
              e.dataTransfer.effectAllowed = "move";
            },
            onDragOver: (e: ReactDragEvent<HTMLTableCellElement>) => {
              e.preventDefault();
              setOverCol(colKey);
            },
            onDragLeave: () => setOverCol(null),
            onDrop: (e: ReactDragEvent<HTMLTableCellElement>) => {
              e.preventDefault();
              if (dragCol && dragCol !== colKey) {
                const keys = leafCols.map((c) => c.key);
                const fi = keys.indexOf(dragCol);
                const ti = keys.indexOf(colKey);
                if (fi !== -1 && ti !== -1) {
                  const next = [...keys];
                  next.splice(fi, 1);
                  next.splice(ti, 0, dragCol);
                  setColOrder(next);
                  columnDragAndDrop.onReorder?.(fi, ti);
                }
              }
              setDragCol(null);
              setOverCol(null);
            },
            onDragEnd: () => {
              setDragCol(null);
              setOverCol(null);
            },
          }
        : {},
    [dragCol, columnDragAndDrop, leafCols]
  );

  /* ══════════════════════════════════════════════════════════
     Keyboard Navigation (grid pattern)
     ══════════════════════════════════════════════════════════ */

  const [focusPos, setFocusPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!focusPos || !tableRef.current) return;
    const [r, c] = focusPos;
    const el = tableRef.current.querySelector(
      `[data-row="${r}"][data-col="${c}"]`
    ) as HTMLElement | null;
    el?.focus();
  }, [focusPos]);

  const handleGridKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      if (!keyboardNavigation) return;
      const t = e.target as HTMLElement;
      const r = Number(t.dataset.row);
      const c = Number(t.dataset.col);
      if (Number.isNaN(r) || Number.isNaN(c)) return;

      let next: [number, number] | null = null;
      switch (e.key) {
        case "ArrowUp":
          if (r > 0) next = [r - 1, c];
          break;
        case "ArrowDown":
          if (r < flatRows.length - 1) next = [r + 1, c];
          break;
        case "ArrowLeft":
          if (c > 0) next = [r, c - 1];
          break;
        case "ArrowRight":
          if (c < totalColCount - 1) next = [r, c + 1];
          break;
        case "Home":
          next = [r, 0];
          break;
        case "End":
          next = [r, totalColCount - 1];
          break;
      }
      if (next) {
        e.preventDefault();
        setFocusPos(next);
      }
    },
    [keyboardNavigation, flatRows.length, totalColCount]
  );

  /* ══════════════════════════════════════════════════════════
     Sticky offsets
     ══════════════════════════════════════════════════════════ */

  const stickyMap = useMemo(() => {
    const w = new Map<string, number>();
    for (const c of leafCols) w.set(c.key, numericWidth(c));
    const extraLeft = internalColCount * internalColWidth;
    return calcStickyOffsets(leafCols, w, extraLeft);
  }, [leafCols, numericWidth, internalColCount]);

  const lastLeftKey = useMemo(() => {
    let last: string | null = null;
    for (const c of leafCols) if (c.fixed === "left") last = c.key;
    return last;
  }, [leafCols]);

  const firstRightKey = useMemo(() => {
    for (const c of leafCols) if (c.fixed === "right") return c.key;
    return null;
  }, [leafCols]);

  /* ── Cell style helper ── */
  const cellStickyStyle = useCallback(
    (col: ColumnDef<T>): CSSProperties | undefined => {
      const sticky = stickyMap.get(col.key);
      if (!sticky) return undefined;
      return {
        position: "sticky",
        [sticky.side]: sticky.offset,
        zIndex: 1,
      };
    },
    [stickyMap]
  );

  const cellStickyClass = useCallback(
    (col: ColumnDef<T>): string | false => {
      if (!stickyMap.has(col.key)) return false;
      if (col.key === lastLeftKey) return styles.stickyLeftEdge;
      if (col.key === firstRightKey) return styles.stickyRightEdge;
      return styles.stickyCell;
    },
    [stickyMap, lastLeftKey, firstRightKey]
  );

  /* ══════════════════════════════════════════════════════════
     Render: Header
     ══════════════════════════════════════════════════════════ */

  const thead = (
    <thead
      className={stickyHeader ? styles.stickyHead : undefined}
      style={stickyHeader ? { top: stickyHeaderOffset } : undefined}
    >
      {headerRows.map((row, ri) => (
        <tr key={ri}>
          {ri === 0 && hasRowDnD && (
            <th
              rowSpan={maxDepth}
              className={styles.headerCell}
              style={{ width: internalColWidth }}
              aria-label="Drag handle"
            />
          )}

          {ri === 0 && hasSelection && (
            <th
              rowSpan={maxDepth}
              className={styles.headerCell}
              style={{ width: internalColWidth }}
            >
              {selType === "checkbox" && (
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={toggleAll}
                  aria-label="Select all rows"
                />
              )}
            </th>
          )}

          {ri === 0 && showExpandCol && (
            <th
              rowSpan={maxDepth}
              className={styles.headerCell}
              style={{ width: internalColWidth }}
              aria-label="Expand"
            />
          )}

          {row.map((cell) => {
            const col = cell.column;
            const isSortable = cell.isLeaf && col.sortable;
            const isLastLeaf =
              cell.isLeaf &&
              leafCols[leafCols.length - 1]?.key === col.key;
            const isResizable =
              cell.isLeaf &&
              col.resizable !== false &&
              !!columnResize &&
              !(resizeMode === "fixed" && isLastLeaf);
            const sortDir =
              sortState?.columnKey === col.key
                ? sortState.direction
                : null;

            const stickyS =
              cell.isLeaf && stickyMap.has(col.key)
                ? {
                    position: "sticky" as const,
                    [stickyMap.get(col.key)!.side]:
                      stickyMap.get(col.key)!.offset,
                    zIndex: stickyHeader ? 4 : 2,
                  }
                : undefined;

            return (
              <th
                key={col.key}
                colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                scope={cell.isLeaf ? "col" : "colgroup"}
                aria-sort={
                  isSortable
                    ? sortDir === "asc"
                      ? "ascending"
                      : sortDir === "desc"
                        ? "descending"
                        : "none"
                    : undefined
                }
                className={cx(
                  styles.headerCell,
                  isSortable && styles.sortableHeader,
                  overCol === col.key && styles.dragOver,
                  cell.isLeaf && cellStickyClass(col)
                )}
                style={{
                  width: cell.isLeaf ? activeWidths.get(col.key) : undefined,
                  textAlign: col.align,
                  ...stickyS,
                }}
                onClick={isSortable ? () => { if (!didResize.current) cycleSort(col.key); } : undefined}
                {...(cell.isLeaf ? col.onHeaderCell?.() : {})}
                {...(cell.isLeaf ? colDragProps(col.key) : {})}
              >
                <span>{col.title}</span>
                {isSortable && (
                  <span aria-hidden="true" className={styles.sortIndicator}>
                    {sortDir === "asc"
                      ? " ▲"
                      : sortDir === "desc"
                        ? " ▼"
                        : " ⇅"}
                  </span>
                )}
                {isResizable && (
                  <span
                    className={styles.resizeHandle}
                    onMouseDown={(e) => onResizeStart(col.key, e)}
                    role="separator"
                    aria-orientation="vertical"
                  />
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );

  /* ══════════════════════════════════════════════════════════
     Render: Body
     ══════════════════════════════════════════════════════════ */

  const tbody =
    flatRows.length === 0 ? (
      <tbody>
        <tr>
          <td colSpan={totalColCount} className={styles.emptyCell}>
            {loading ? "Loading…" : emptyContent}
          </td>
        </tr>
      </tbody>
    ) : (
      <tbody>
        {flatRows.map((fr, rowIdx) => {
          const { record, key: rk, depth, hasChildren } = fr;
          const isExpanded = expKeys.has(rk);
          const isSelected = selKeys.has(rk);
          const canExpand = hasExpandRender
            ? expandable?.rowExpandable
              ? expandable.rowExpandable(record)
              : true
            : false;
          const treeCanExpand = isTreeData && hasChildren;
          const userRowProps = onRow?.(record, rowIdx) ?? {};
          const checkProps = rowSelection?.getCheckboxProps?.(record) ?? {};

          let colIdx = 0;

          return (
            <Fragment key={rk}>
              <tr
                aria-selected={hasSelection ? isSelected : undefined}
                aria-rowindex={rowIdx + 1}
                className={cx(
                  overRow === rowIdx && styles.dragOver,
                  dragRow === rowIdx && styles.dragging
                )}
                {...userRowProps}
                {...rowDropProps(rowIdx)}
              >
                {/* ── Drag handle ── */}
                {hasRowDnD && (
                  <td
                    className={styles.dragHandle}
                    style={{ width: internalColWidth }}
                    data-row={rowIdx}
                    data-col={colIdx++}
                    tabIndex={keyboardNavigation ? -1 : undefined}
                    draggable
                    onDragStart={(e) => {
                      setDragRow(rowIdx);
                      e.dataTransfer.effectAllowed = "move";
                      const tr = (
                        e.target as HTMLElement
                      ).closest("tr");
                      if (tr) e.dataTransfer.setDragImage(tr, 0, 0);
                    }}
                    onDragEnd={() => {
                      setDragRow(null);
                      setOverRow(null);
                    }}
                  >
                    ⠿
                  </td>
                )}

                {/* ── Selection ── */}
                {hasSelection && (
                  <td
                    style={{ width: internalColWidth }}
                    data-row={rowIdx}
                    data-col={colIdx++}
                    tabIndex={keyboardNavigation ? -1 : undefined}
                  >
                    <input
                      type={selType}
                      checked={isSelected}
                      onChange={() => toggleRow(rk)}
                      name={
                        selType === "radio"
                          ? "dt-row-select"
                          : undefined
                      }
                      aria-label={`Select row ${rowIdx + 1}`}
                      {...checkProps}
                    />
                  </td>
                )}

                {/* ── Expand column (non-tree) ── */}
                {showExpandCol && (
                  <td
                    style={{ width: internalColWidth }}
                    data-row={rowIdx}
                    data-col={colIdx++}
                    tabIndex={keyboardNavigation ? -1 : undefined}
                  >
                    {canExpand && (
                      <button
                        className={styles.expandButton}
                        onClick={() => toggleExpand(rk, record)}
                        aria-expanded={isExpanded}
                        aria-label={
                          isExpanded ? "Collapse row" : "Expand row"
                        }
                      >
                        {isExpanded ? "▼" : "▶"}
                      </button>
                    )}
                  </td>
                )}

                {/* ── Data cells ── */}
                {leafCols.map((col, ci) => {
                  const val = getValueByPath(record, col.dataIndex);
                  const rendered = col.render
                    ? col.render(val, record, rowIdx)
                    : val;
                  const cellProps = col.onCell?.(record, rowIdx) ?? {};
                  const currentCol = colIdx++;

                  if (cellProps.colSpan === 0 || cellProps.rowSpan === 0)
                    return null;

                  const isFirst = ci === 0;

                  return (
                    <td
                      key={col.key}
                      style={{
                        textAlign: col.align,
                        ...cellStickyStyle(col),
                      }}
                      data-row={rowIdx}
                      data-col={currentCol}
                      tabIndex={keyboardNavigation ? -1 : undefined}
                      className={cx(
                        cellStickyClass(col),
                        focusPos?.[0] === rowIdx &&
                          focusPos?.[1] === currentCol &&
                          styles.focusedCell
                      )}
                      {...cellProps}
                    >
                      {isFirst && isTreeData && (
                        <span
                          className={styles.treeIndent}
                          style={{ width: depth * indentSize }}
                        >
                          {/* spacer for indentation */}
                        </span>
                      )}
                      {isFirst && treeCanExpand && (
                        <button
                          className={styles.expandButton}
                          onClick={() => toggleExpand(rk, record)}
                          aria-expanded={isExpanded}
                          aria-label={
                            isExpanded ? "Collapse row" : "Expand row"
                          }
                        >
                          {isExpanded ? "▼" : "▶"}
                        </button>
                      )}
                      {isFirst && isTreeData && !treeCanExpand && (
                        <span className={styles.treeLeafSpacer} />
                      )}
                      {rendered != null ? rendered : ""}
                    </td>
                  );
                })}
              </tr>

              {/* ── Expanded detail row ── */}
              {showExpandCol && isExpanded && canExpand && (
                <tr>
                  <td colSpan={totalColCount} className={styles.expandedCell}>
                    {expandable!.expandedRowRender!(record, rowIdx, true)}
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    );

  /* ══════════════════════════════════════════════════════════
     Render: Table
     ══════════════════════════════════════════════════════════ */

  return (
    <div
      ref={wrapperRef}
      className={cx(
        styles.root,
        resizingCol != null && styles.resizing,
        scrollState.top && styles.scrolledTop,
        scrollState.left && styles.scrolledLeft,
        scrollState.right && styles.scrolledRight,
        className
      )}
      style={style}
    >
      <table
        ref={tableRef}
        className={styles.table}
        style={{
          width:
            resizeMode === "overflow"
              ? tableWidth
              : Math.max(tableWidth, containerWidth || 0),
        }}
        role={keyboardNavigation ? "grid" : undefined}
        onKeyDown={keyboardNavigation ? handleGridKeyDown : undefined}
      >
        <colgroup>
          {hasRowDnD && <col style={{ width: internalColWidth }} />}
          {hasSelection && <col style={{ width: internalColWidth }} />}
          {showExpandCol && <col style={{ width: internalColWidth }} />}
          {leafCols.map((c) => (
            <col key={c.key} style={{ width: activeWidths.get(c.key) }} />
          ))}
        </colgroup>
        {thead}
        {tbody}
      </table>
    </div>
  );
}
