import type { CSSProperties, ReactNode } from "react";
import type { DataCellContentProps } from "../DataCellContent";
import type { IconName } from "../Icon";

export interface AiEntityColumnConfig<T> {
  key: string;
  getDescription: (data: T) => ReactNode;
  /** Full DataCellContent props — use when you need leading/trailing/state etc. Overrides getDescription. */
  getCellContent?: (data: T) => Partial<DataCellContentProps>;
}

export interface AiEntitySurfaceConfig<T> {
  getTitle: (data: T) => string;
  /** Extra props for the header DataCellContent (leading, trailing, state, etc.) */
  headerCellContent?: Partial<DataCellContentProps>;
  /** Full DataCellContent props for the title (first) cell in multiple rows — overrides default title rendering */
  getTitleCellContent?: (data: T) => Partial<DataCellContentProps>;
  columns: AiEntityColumnConfig<T>[];
}

export interface AiEntityConfig<T> {
  /** Extracts a unique key from each data item */
  getKey: (data: T) => string;
  /** Icon representing this entity type — used in inline chips */
  entityIcon?: IconName;
  /** Builds the URL for navigating to an entity — used in inline chips */
  getHref?: (data: T) => string;
  /** Drives the single-item card */
  single: AiEntitySurfaceConfig<T>;
  /** Drives the hover tooltip — defaults to single if not provided */
  tooltip?: AiEntitySurfaceConfig<T>;
  /** Extra styles applied to the tooltip wrapper */
  tooltipStyle?: CSSProperties;
  /** Drives each row in the multiple-item list */
  multiple: AiEntitySurfaceConfig<T>;
}
