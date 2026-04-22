import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  Fragment,
  isValidElement,
  cloneElement,
  type ReactNode,
  type ReactElement,
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
import { IconButton } from "../IconButton";
import { Expander } from "../Expander";
import { DataCellContent } from "../DataCellContent";
import { Checkbox } from "../Checkbox";
import { Radio } from "../Radio";
import { TreeIndent, type TreeIndentLineStyle } from "../TreeIndent";
import { computeConnectorGuides } from "../../utils/treeConnectors";
import { cx } from "../../utils/cx";

/* ═══════════════════════════════════════════════════════════════
   Utilities
   ═══════════════════════════════════════════════════════════════ */


const DEFAULT_COL_WIDTH = 100;

export type TableDensity = "none" | "sm" | "md" | "lg";

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
  density?: TableDensity;
  /** Override the table-level column divider for this column's cells. */
  dividerRight?: boolean;
  /** Override the table-level row divider for this column's cells. */
  dividerBottom?: boolean;
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
  /** Return true for rows that should appear in an error state. */
  rowError?: (record: T, index: number) => boolean;
  /** Return true for rows that should appear disabled (no hover, no interaction). */
  rowDisabled?: (record: T, index: number) => boolean;
  /** Controls cell padding. Columns can override via their own `density` prop. */
  density?: TableDensity;
  /** Show/hide the right border between columns table-wide. Columns can override via `dividerRight`. Default true. */
  columnDividers?: boolean;
  /** Show/hide the bottom border between rows table-wide. Columns can override via `dividerBottom`. Default true. */
  rowDividers?: boolean;
  /** Width per tree indent level in px (default 24). Forwarded to TreeIndent. */
  treeIndentWidth?: number;
  /** Show tree connector lines (default true). Set false for plain spacing. */
  treeConnectorLines?: boolean;
  /** End connector style: "slope" (diagonal curve) or "square" (L-shape). Default "slope". */
  treeLineStyle?: TreeIndentLineStyle;
}

/* ═══════════════════════════════════════════════════════════════
   Internal Helpers
   ═══════════════════════════════════════════════════════════════ */

const DENSITY_CLASS: Record<TableDensity, string | false> = {
  none: false,
  sm: styles.densitySm,
  md: styles.densityMd,
  lg: styles.densityLg,
};

const CELL_DENSITY_CLASS: Record<TableDensity, string> = {
  none: styles.cellDensityNone,
  sm: styles.cellDensitySm,
  md: styles.cellDensityMd,
  lg: styles.cellDensityLg,
};

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

function getDescendantLeafKeys<T>(col: ColumnDef<T>): string[] {
  if (!col.children?.length) return [col.key];
  const out: string[] = [];
  for (const c of col.children) out.push(...getDescendantLeafKeys(c));
  return out;
}

function findParentGroup<T>(
  columns: ColumnDef<T>[],
  leafKey: string,
  parent: ColumnDef<T> | null = null
): ColumnDef<T> | null {
  for (const col of columns) {
    if (col.key === leafKey) return parent;
    if (col.children?.length) {
      const found = findParentGroup(col.children, leafKey, col);
      if (found !== null) return found;
    }
  }
  return null;
}

function reorderWithinGroup<T>(
  columns: ColumnDef<T>[],
  fromKey: string,
  toKey: string
): ColumnDef<T>[] {
  const fi = columns.findIndex((c) => c.key === fromKey);
  const ti = columns.findIndex((c) => c.key === toKey);
  if (fi !== -1 && ti !== -1) {
    const next = [...columns];
    const [moved] = next.splice(fi, 1);
    next.splice(ti, 0, moved);
    return next;
  }
  return columns.map((col) => {
    if (!col.children?.length) return col;
    const recursed = reorderWithinGroup(col.children, fromKey, toKey);
    if (recursed !== col.children) return { ...col, children: recursed };
    return col;
  });
}

interface GroupResizeState {
  leafKeys: string[];
  initialWidths: Map<string, number>;
  totalW0: number;
  neighborLeafKeys: string[];
  neighborInitialWidths: Map<string, number>;
  neighborTotalW0: number;
}

/**
 * Distribute `targetTotal` across leaves proportionally to their initial widths
 * while respecting per-leaf min/max. Iteratively locks clamped leaves and
 * redistributes the remaining budget so the sum always equals `targetTotal`.
 */
function distributeProportional(
  keys: string[],
  initialWidths: Map<string, number>,
  initialTotal: number,
  targetTotal: number,
  getMin: (k: string) => number,
  getMax: (k: string) => number
): Map<string, number> {
  const result = new Map<string, number>();
  const locked = new Set<string>();
  let budget = targetTotal;
  let pool = initialTotal;

  for (let pass = 0; pass < keys.length; pass++) {
    let changed = false;
    for (const k of keys) {
      if (locked.has(k)) continue;
      const ratio = pool > 0 ? (initialWidths.get(k) ?? 0) / pool : 1 / (keys.length - locked.size);
      const raw = ratio * budget;
      const min = getMin(k);
      const max = getMax(k);
      if (raw < min) {
        result.set(k, min);
        locked.add(k);
        budget -= min;
        pool -= initialWidths.get(k) ?? 0;
        changed = true;
      } else if (raw > max) {
        result.set(k, max);
        locked.add(k);
        budget -= max;
        pool -= initialWidths.get(k) ?? 0;
        changed = true;
      }
    }
    if (!changed) break;
  }

  for (const k of keys) {
    if (locked.has(k)) continue;
    const ratio = pool > 0 ? (initialWidths.get(k) ?? 0) / pool : 1 / (keys.length - locked.size);
    result.set(k, ratio * budget);
  }

  return result;
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
  isLastChild: boolean;
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
  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    const k = getRowKey(r, rowKey);
    const ch = (r as Record<string, any>)[childField] as T[] | undefined;
    const hasKids = !!ch?.length;
    const isLast = i === data.length - 1;
    out.push({ record: r, key: k, depth, hasChildren: hasKids, parent, isLastChild: isLast });
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
  rowError,
  rowDisabled,
  density = "md",
  columnDividers = true,
  rowDividers = true,
  treeIndentWidth,
  treeConnectorLines,
  treeLineStyle,
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
    activeLeftEdge: null as string | null,
  });
  const leftFixedThresholdsRef = useRef<{ key: string; threshold: number }[]>([]);

  /* ── Visible container height (for resize handle indicator) ── */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const table = tableRef.current;
    if (!wrapper || !table) return;
    const ro = new ResizeObserver(() => {
      table.style.setProperty("--table-height", `${wrapper.clientHeight}px`);
    });
    ro.observe(wrapper);
    return () => ro.disconnect();
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
  const internalColCount = hasRowDnD ? 1 : 0;
  const internalColWidth = 40;

  /* ── Column order (for column DnD) ── */
  const [colOrder, setColOrder] = useState<string[] | null>(null);
  const [groupedColOverride, setGroupedColOverride] = useState<ColumnDef<T>[] | null>(null);

  const hasGroups = useMemo(
    () => columns.some((c) => c.children?.length),
    [columns]
  );

  const orderedColumns = useMemo(() => {
    if (hasGroups) return groupedColOverride ?? columns;
    if (!colOrder) return columns;
    const map = new Map<string, ColumnDef<T>>();
    for (const c of columns) map.set(c.key, c);
    return colOrder.map((k) => map.get(k)!).filter(Boolean);
  }, [columns, colOrder, hasGroups, groupedColOverride]);

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
  const resizeActiveKeys = useRef<Set<string>>(new Set());
  const groupResizeRef = useRef<GroupResizeState | null>(null);

  const activeWidths = useMemo(() => {
    const result = new Map<string, number | string>();
    for (const col of leafCols) {
      if (
        frozenWidths.current &&
        !resizeActiveKeys.current.has(col.key)
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
    return dataSource.map((r, i) => ({
      record: r,
      key: getRowKey(r, rowKey),
      depth: 0,
      hasChildren: false,
      parent: null,
      isLastChild: i === dataSource.length - 1,
    }));
  }, [dataSource, rowKey, childField, expKeys, isTreeData]);

  /* ── Tree connector guides ── */
  const connectorGuides = useMemo(
    () =>
      isTreeData
        ? computeConnectorGuides(
            flatRows.map((r) => ({ depth: r.depth, isLastChild: r.isLastChild }))
          )
        : [],
    [flatRows, isTreeData]
  );

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
    (
      colKey: string,
      e: ReactMouseEvent,
      groupLeafKeys?: string[],
      neighborLeafKeys?: string[]
    ) => {
      e.preventDefault();
      e.stopPropagation();

      const frozen = new Map<string, number>();
      for (const c of leafCols) frozen.set(c.key, numericWidth(c));
      frozenWidths.current = frozen;
      didResize.current = true;

      setResizingCol(colKey);
      resizeX0.current = e.clientX;

      resizeActiveKeys.current.clear();

      if (groupLeafKeys && groupLeafKeys.length > 0) {
        const initWidths = new Map<string, number>();
        let totalW0 = 0;
        for (const k of groupLeafKeys) {
          const w = frozen.get(k) ?? DEFAULT_COL_WIDTH;
          initWidths.set(k, w);
          totalW0 += w;
          resizeActiveKeys.current.add(k);
        }

        let nInitWidths = new Map<string, number>();
        let nTotalW0 = 0;
        const nKeys = resizeMode === "fixed" ? (neighborLeafKeys ?? []) : [];
        if (nKeys.length > 0) {
          for (const k of nKeys) {
            const w = frozen.get(k) ?? DEFAULT_COL_WIDTH;
            nInitWidths.set(k, w);
            nTotalW0 += w;
            resizeActiveKeys.current.add(k);
          }
        }

        groupResizeRef.current = {
          leafKeys: groupLeafKeys,
          initialWidths: initWidths,
          totalW0,
          neighborLeafKeys: nKeys,
          neighborInitialWidths: nInitWidths,
          neighborTotalW0: nTotalW0,
        };

        resizeW0.current = totalW0;
        resizeNeighborKey.current = null;
      } else {
        groupResizeRef.current = null;
        resizeW0.current = frozen.get(colKey) ?? DEFAULT_COL_WIDTH;

        const col = leafCols.find((c) => c.key === colKey);
        resizeMinW.current = col?.minWidth ?? columnResize?.minWidth ?? 50;
        resizeMaxW.current = col?.maxWidth ?? columnResize?.maxWidth ?? 9999;

        resizeActiveKeys.current.add(colKey);

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
          if (neighbor) resizeActiveKeys.current.add(neighbor.key);
        } else {
          resizeNeighborKey.current = null;
        }
      }
    },
    [leafCols, numericWidth, columnResize, resizeMode]
  );

  useEffect(() => {
    if (!resizingCol) return;
    const neighborKey = resizeNeighborKey.current;
    const grp = groupResizeRef.current;

    const onMove = (e: globalThis.MouseEvent) => {
      const delta = e.clientX - resizeX0.current;

      if (grp) {
        const { leafKeys, initialWidths, totalW0, neighborLeafKeys, neighborInitialWidths, neighborTotalW0 } = grp;
        const defaultMin = columnResize?.minWidth ?? 50;
        const defaultMax = columnResize?.maxWidth ?? 9999;

        const leafMin = (k: string) => leafCols.find((c) => c.key === k)?.minWidth ?? defaultMin;
        const leafMax = (k: string) => leafCols.find((c) => c.key === k)?.maxWidth ?? defaultMax;

        const groupMinTotal = leafKeys.reduce((s, k) => s + leafMin(k), 0);
        const groupMaxTotal = leafKeys.reduce((s, k) => s + leafMax(k), 0);

        let newTotal = Math.max(groupMinTotal, Math.min(groupMaxTotal, totalW0 + delta));

        if (neighborLeafKeys.length > 0) {
          const nMinTotal = neighborLeafKeys.reduce((s, k) => s + leafMin(k), 0);
          const nMaxTotal = neighborLeafKeys.reduce((s, k) => s + leafMax(k), 0);

          let neighborNewTotal = neighborTotalW0 - (newTotal - totalW0);
          if (neighborNewTotal < nMinTotal) {
            neighborNewTotal = nMinTotal;
            newTotal = totalW0 + neighborTotalW0 - neighborNewTotal;
          } else if (neighborNewTotal > nMaxTotal) {
            neighborNewTotal = nMaxTotal;
            newTotal = totalW0 + neighborTotalW0 - neighborNewTotal;
          }
          newTotal = Math.max(groupMinTotal, Math.min(groupMaxTotal, newTotal));
          neighborNewTotal = neighborTotalW0 - (newTotal - totalW0);

          const grpWidths = distributeProportional(leafKeys, initialWidths, totalW0, newTotal, leafMin, leafMax);
          const nbrWidths = distributeProportional(neighborLeafKeys, neighborInitialWidths, neighborTotalW0, neighborNewTotal, leafMin, leafMax);

          setWidthOverrides((prev) => {
            const m = new Map(prev);
            for (const [k, w] of grpWidths) {
              m.set(k, w);
              columnResize?.onResize?.(k, w);
            }
            for (const [k, w] of nbrWidths) {
              m.set(k, w);
              columnResize?.onResize?.(k, w);
            }
            return m;
          });
        } else {
          const grpWidths = distributeProportional(leafKeys, initialWidths, totalW0, newTotal, leafMin, leafMax);

          setWidthOverrides((prev) => {
            const m = new Map(prev);
            for (const [k, w] of grpWidths) {
              m.set(k, w);
              columnResize?.onResize?.(k, w);
            }
            return m;
          });
        }
      } else if (neighborKey) {
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
      const hasNeighbor = neighborKey || (grp && grp.neighborLeafKeys.length > 0);
      if (!hasNeighbor && frozen) {
        const activeSnapshot = new Set(resizeActiveKeys.current);
        setWidthOverrides((prev) => {
          const m = new Map(prev);
          for (const [key, val] of frozen) {
            if (!activeSnapshot.has(key)) m.set(key, val);
          }
          return m;
        });
      }
      frozenWidths.current = null;
      resizeNeighborKey.current = null;
      groupResizeRef.current = null;
      resizeActiveKeys.current.clear();
      setResizingCol(null);
      requestAnimationFrame(() => { didResize.current = false; });
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [resizingCol, columnResize, leafCols]);

  /* ══════════════════════════════════════════════════════════
     Row Drag & Drop
     ══════════════════════════════════════════════════════════ */

  const [dragRow, setDragRow] = useState<number | null>(null);
  const [overRow, setOverRow] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<"above" | "below">("below");

  const rowDropProps = useCallback(
    (idx: number) =>
      hasRowDnD
        ? {
            onDragOver: (e: ReactDragEvent<HTMLTableRowElement>) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              const isLastRow = idx === flatRows.length - 1;
              if (isLastRow) {
                const rect = e.currentTarget.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                setDropPosition(e.clientY < midY ? "above" : "below");
              } else {
                setDropPosition("above");
              }
              setOverRow(idx);
            },
            onDragLeave: () => setOverRow(null),
            onDrop: (e: ReactDragEvent<HTMLTableRowElement>) => {
              e.preventDefault();
              if (dragRow !== null && dragRow !== idx) {
                const targetIdx =
                  dropPosition === "above" && dragRow < idx
                    ? idx - 1
                    : idx;
                rowDragAndDrop!.onReorder?.(dragRow, targetIdx, dataSource);
              }
              setDragRow(null);
              setOverRow(null);
            },
          }
        : {},
    [hasRowDnD, dragRow, dropPosition, rowDragAndDrop, dataSource, flatRows.length]
  );

  /* ══════════════════════════════════════════════════════════
     Column Drag & Drop
     ══════════════════════════════════════════════════════════ */

  const [dragCol, setDragCol] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [colDropPosition, setColDropPosition] = useState<"before" | "after">("before");

  const dragColSiblingKeys = useRef<Set<string> | null>(null);
  const dragIsGroupRef = useRef(false);
  const dragGroupLeafKeysRef = useRef<Set<string> | null>(null);

  const colDragProps = useCallback(
    (col: ColumnDef<T>) => {
      const colKey = col.key;
      const isGroupCol = !!col.children?.length;
      if (!columnDragAndDrop) return {};
      return {
            draggable: true,
            onDragStart: (e: ReactDragEvent<HTMLTableCellElement>) => {
              setDragCol(colKey);
              e.dataTransfer.effectAllowed = "move";
              dragIsGroupRef.current = isGroupCol;

              if (isGroupCol) {
                dragGroupLeafKeysRef.current = new Set(
                  getDescendantLeafKeys(col)
                );
                const parent = findParentGroup(orderedColumns, colKey);
                const siblings = parent?.children ?? orderedColumns;
                dragColSiblingKeys.current = new Set(
                  siblings.map((c) => c.key)
                );
              } else if (hasGroups) {
                dragGroupLeafKeysRef.current = null;
                const parent = findParentGroup(orderedColumns, colKey);
                const siblings = parent?.children ?? orderedColumns;
                dragColSiblingKeys.current = new Set(
                  flattenLeafColumns(siblings).map((c) => c.key)
                );
              } else {
                dragGroupLeafKeysRef.current = null;
                dragColSiblingKeys.current = null;
              }

              const th = e.currentTarget;
              const clone = th.cloneNode(true) as HTMLElement;
              clone.classList.add(styles.colDragGhost);
              clone.style.position = "fixed";
              clone.style.top = "-9999px";
              clone.style.left = "-9999px";
              clone.style.display = "table-cell";
              clone.style.width = `${th.offsetWidth}px`;
              clone.style.height = `${th.offsetHeight}px`;
              const cs = getComputedStyle(th);
              clone.style.padding = cs.padding;
              const themeRoot = th.closest("[data-theme]") ?? document.body;
              themeRoot.appendChild(clone);
              e.dataTransfer.setDragImage(clone, th.offsetWidth / 2, th.offsetHeight / 2);
              setTimeout(() => themeRoot.removeChild(clone));
            },
            onDragOver: (e: ReactDragEvent<HTMLTableCellElement>) => {
              if (
                dragColSiblingKeys.current &&
                !dragColSiblingKeys.current.has(colKey)
              ) {
                e.dataTransfer.dropEffect = "none";
                return;
              }
              e.preventDefault();

              if (dragIsGroupRef.current) {
                const parent = findParentGroup(orderedColumns, colKey);
                const siblings = parent?.children ?? orderedColumns;
                const isLast = colKey === siblings[siblings.length - 1]?.key;
                if (isLast) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const midX = rect.left + rect.width / 2;
                  setColDropPosition(e.clientX < midX ? "before" : "after");
                } else {
                  setColDropPosition("before");
                }
              } else {
                const siblingKeys = dragColSiblingKeys.current;
                const pool = siblingKeys
                  ? leafCols.filter((c) => siblingKeys.has(c.key))
                  : leafCols;
                const isLastInScope = colKey === pool[pool.length - 1]?.key;
                if (isLastInScope) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const midX = rect.left + rect.width / 2;
                  setColDropPosition(e.clientX < midX ? "before" : "after");
                } else {
                  setColDropPosition("before");
                }
              }
              if (overCol !== colKey) setOverCol(colKey);
            },
            onDragLeave: (e: ReactDragEvent<HTMLTableCellElement>) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverCol(null);
            },
            onDrop: (e: ReactDragEvent<HTMLTableCellElement>) => {
              e.preventDefault();
              if (
                dragColSiblingKeys.current &&
                !dragColSiblingKeys.current.has(colKey)
              ) {
                setDragCol(null);
                setOverCol(null);
                dragColSiblingKeys.current = null;
                dragIsGroupRef.current = false;
                dragGroupLeafKeysRef.current = null;
                return;
              }
              if (dragCol && dragCol !== colKey) {
                if (hasGroups) {
                  const reordered = reorderWithinGroup(
                    orderedColumns,
                    dragCol,
                    colKey
                  );
                  setGroupedColOverride(reordered);
                  columnDragAndDrop.onReorder?.(
                    orderedColumns.findIndex((c) => c.key === dragCol),
                    orderedColumns.findIndex((c) => c.key === colKey)
                  );
                } else {
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
              }
              setDragCol(null);
              setOverCol(null);
              dragColSiblingKeys.current = null;
              dragIsGroupRef.current = false;
              dragGroupLeafKeysRef.current = null;
            },
            onDragEnd: () => {
              setDragCol(null);
              setOverCol(null);
              dragColSiblingKeys.current = null;
              dragIsGroupRef.current = false;
              dragGroupLeafKeysRef.current = null;
            },
          };
    },
    [dragCol, overCol, columnDragAndDrop, leafCols, hasGroups, orderedColumns]
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

  useEffect(() => {
    const thresholds: { key: string; threshold: number }[] = [];
    let naturalPos = internalColCount * internalColWidth;
    let stickyOff = internalColCount * internalColWidth;
    for (const c of leafCols) {
      if (c.fixed === "left") {
        thresholds.push({ key: c.key, threshold: naturalPos - stickyOff });
        stickyOff += numericWidth(c);
      }
      naturalPos += numericWidth(c);
    }
    leftFixedThresholdsRef.current = thresholds;
  }, [leafCols, numericWidth, internalColCount]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const t = el.scrollTop > 0;
      const l = el.scrollLeft > 0;
      const r = el.scrollWidth - el.scrollLeft - el.clientWidth > 1;
      const sx = el.scrollLeft;
      const thresholds = leftFixedThresholdsRef.current;

      let edge: string | null = null;
      for (let i = thresholds.length - 1; i >= 0; i--) {
        if (sx >= thresholds[i].threshold) {
          edge = thresholds[i].key;
          break;
        }
      }

      setScrollState((prev) =>
        prev.top === t && prev.left === l && prev.right === r && prev.activeLeftEdge === edge
          ? prev
          : { top: t, left: l, right: r, activeLeftEdge: edge }
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
  }, [leafCols, numericWidth, internalColCount]);

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
        zIndex: sticky.side === "left" ? 2 : 1,
      };
    },
    [stickyMap]
  );

  const cellStickyClass = useCallback(
    (col: ColumnDef<T>): string | false => {
      if (!stickyMap.has(col.key)) return false;
      if (col.key === scrollState.activeLeftEdge) return styles.stickyLeftEdge;
      if (col.key === firstRightKey) return styles.stickyRightEdge;
      return styles.stickyCell;
    },
    [stickyMap, scrollState.activeLeftEdge, firstRightKey]
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

          {row.map((cell, cellIdx) => {
            const col = cell.column;
            const isSortable = cell.isLeaf && col.sortable;
            const isLastLeaf =
              cell.isLeaf &&
              leafCols[leafCols.length - 1]?.key === col.key;
            const isLastInRow = cellIdx === row.length - 1;
            const isLeafResizable =
              cell.isLeaf &&
              col.resizable !== false &&
              !!columnResize &&
              !(resizeMode === "fixed" && isLastLeaf);
            const isGroupResizable =
              !cell.isLeaf &&
              col.resizable !== false &&
              !!columnResize &&
              !(resizeMode === "fixed" && isLastInRow);

            let groupLeafKeys: string[] | undefined;
            let neighborLeafKeys: string[] | undefined;
            if (isGroupResizable) {
              groupLeafKeys = getDescendantLeafKeys(col);
              const nextCell = row[cellIdx + 1];
              if (nextCell) {
                neighborLeafKeys = nextCell.isLeaf
                  ? [nextCell.column.key]
                  : getDescendantLeafKeys(nextCell.column);
              }
            }

            const canResize = isLeafResizable || isGroupResizable;
            const sortDir =
              sortState?.columnKey === col.key
                ? sortState.direction
                : null;

            const stickyEntry = cell.isLeaf ? stickyMap.get(col.key) : undefined;
            const stickyS = stickyEntry
                ? {
                    position: "sticky" as const,
                    [stickyEntry.side]: stickyEntry.offset,
                    zIndex: stickyHeader
                      ? (stickyEntry.side === "left" ? 5 : 4)
                      : (stickyEntry.side === "left" ? 3 : 2),
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
                  overCol === col.key && (colDropPosition === "before" ? styles.colDragOverBefore : styles.colDragOverAfter),
                  (dragCol === col.key || (cell.isLeaf && dragGroupLeafKeysRef.current?.has(col.key))) && styles.colBeingDragged,
                  cell.isLeaf && cellStickyClass(col),
                  hasSelection && allSelected && styles.cellChecked,
                  cell.isLeaf && col.density && CELL_DENSITY_CLASS[col.density],
                  cell.isLeaf && col.dividerRight === true && styles.dividerRightShow,
                  cell.isLeaf && col.dividerRight === false && styles.dividerRightHide,
                  cell.isLeaf && col.dividerBottom === true && styles.dividerBottomShow,
                  cell.isLeaf && col.dividerBottom === false && styles.dividerBottomHide,
                )}
                style={{
                  width: cell.isLeaf ? activeWidths.get(col.key) : undefined,
                  textAlign: col.align,
                  ...stickyS,
                }}
                onClick={isSortable ? () => { if (!didResize.current) cycleSort(col.key); } : undefined}
                {...(cell.isLeaf ? col.onHeaderCell?.() : {})}
                {...(columnDragAndDrop ? colDragProps(col) : {})}
              >
                <DataCellContent
                  title={col.title}
                  switchSlot={
                    ri === 0 && cellIdx === 0 && hasSelection && selType === "checkbox" ? (
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={toggleAll}
                        aria-label="Select all rows"
                      />
                    ) : undefined
                  }
                  trailing={
                    isSortable ? (
                      <span aria-hidden="true" className={styles.sortIndicator}>
                        {sortDir === "asc" ? " ▲" : sortDir === "desc" ? " ▼" : " ⇅"}
                      </span>
                    ) : undefined
                  }
                />
                {canResize && (
                  <span
                    className={styles.resizeHandle}
                    onMouseDown={(e) =>
                      onResizeStart(col.key, e, groupLeafKeys, neighborLeafKeys)
                    }
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
          const isRowError = rowError?.(record, rowIdx) ?? false;
          const isRowDisabled = rowDisabled?.(record, rowIdx) ?? false;

          let colIdx = 0;

          return (
            <Fragment key={rk}>
              <tr
                aria-selected={hasSelection ? isSelected : undefined}
                aria-rowindex={rowIdx + 1}
                className={cx(
                  overRow === rowIdx && (dropPosition === "above" ? styles.dragOverAbove : styles.dragOverBelow),
                  dragRow === rowIdx && styles.rowBeingDragged
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
                      const tr = (e.target as HTMLElement).closest("tr");
                      if (tr) {
                        const clone = tr.cloneNode(true) as HTMLElement;
                        clone.classList.add(styles.rowDragGhost);
                        clone.style.position = "fixed";
                        clone.style.top = "-9999px";
                        clone.style.left = "-9999px";
                        clone.style.display = "table";
                        clone.style.width = `${tr.offsetWidth}px`;
                        const origCells = tr.querySelectorAll("td");
                        const cloneCells = clone.querySelectorAll("td");
                        origCells.forEach((cell, i) => {
                          if (cloneCells[i]) {
                            const cs = getComputedStyle(cell);
                            cloneCells[i].style.padding = cs.padding;
                            cloneCells[i].style.width = `${cell.offsetWidth}px`;
                          }
                        });
                        const themeRoot = tr.closest("[data-theme]") ?? document.body;
                        themeRoot.appendChild(clone);
                        e.dataTransfer.setDragImage(clone, 0, 0);
                        setTimeout(() => themeRoot.removeChild(clone));
                      }
                    }}
                    onDragEnd={() => {
                      setDragRow(null);
                      setOverRow(null);
                    }}
                  >
                    ⠿
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
                          styles.focusedCell,
                        isSelected && styles.cellChecked,
                        isRowError && styles.cellError,
                        isRowDisabled && styles.cellDisabled,
                        col.density && CELL_DENSITY_CLASS[col.density],
                        col.dividerRight === true && styles.dividerRightShow,
                        col.dividerRight === false && styles.dividerRightHide,
                        col.dividerBottom === true && styles.dividerBottomShow,
                        col.dividerBottom === false && styles.dividerBottomHide,
                        (dragCol === col.key || dragGroupLeafKeysRef.current?.has(col.key)) && styles.colBeingDragged
                      )}
                      {...cellProps}
                    >
                      {(() => {
                        const raw: ReactNode = rendered != null ? rendered : "";
                        if (!isFirst || !(hasSelection || showExpandCol || isTreeData))
                          return raw;

                        const switchSlot = hasSelection ? (
                          selType === "radio" ? (
                            <Radio
                              checked={isSelected}
                              onChange={() => toggleRow(rk)}
                              name="dt-row-select"
                              aria-label={`Select row ${rowIdx + 1}`}
                              disabled={checkProps.disabled}
                            />
                          ) : (
                            <Checkbox
                              checked={isSelected}
                              onChange={() => toggleRow(rk)}
                              aria-label={`Select row ${rowIdx + 1}`}
                              disabled={checkProps.disabled}
                            />
                          )
                        ) : undefined;

                        const needsTreeIndent = isFirst && isTreeData;

                        let expandBtnSlot: ReactNode = undefined;
                        if (isTreeData || showExpandCol) {
                          const btn = ((showExpandCol && canExpand) || treeCanExpand) ? (
                            <IconButton
                              size="md"
                              variant="neutral"
                              emphasis="low"
                              icon={<Expander expanded={isExpanded} size="sm" />}
                              onClick={() => toggleExpand(rk, record)}
                              aria-expanded={isExpanded}
                              aria-label={isExpanded ? "Collapse row" : "Expand row"}
                              className={styles.expandButton}
                            />
                          ) : ((showExpandCol || (isTreeData && !treeCanExpand)) ? (
                            <span className={styles.treeLeafSpacer} />
                          ) : null);
                          expandBtnSlot = btn || undefined;
                        }

                        const guide = needsTreeIndent && depth > 0 ? connectorGuides[rowIdx] : null;

                        let cellContent: ReactNode;
                        if (isValidElement(raw) && (raw as ReactElement).type === DataCellContent) {
                          cellContent = cloneElement(raw as ReactElement<any>, {
                            switchSlot: switchSlot ?? (raw as ReactElement<any>).props.switchSlot,
                            expandButton: expandBtnSlot ?? (raw as ReactElement<any>).props.expandButton,
                          });
                        } else {
                          cellContent = (
                            <DataCellContent
                              switchSlot={switchSlot}
                              expandButton={expandBtnSlot}
                              title={raw}
                            />
                          );
                        }

                        if (guide) {
                          return (
                            <div className={styles.treeCell}>
                              <TreeIndent
                                guide={guide}
                                cellWidth={treeIndentWidth ?? indentSize}
                                showLines={treeConnectorLines}
                                lineStyle={treeLineStyle}
                              />
                              {cellContent}
                            </div>
                          );
                        }
                        return cellContent;
                      })()}
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
        className={cx(styles.table, DENSITY_CLASS[density], !columnDividers && styles.noColumnDividers, !rowDividers && styles.noRowDividers, dragRow != null && styles.rowDragging, dragCol && styles.colDragging)}
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
