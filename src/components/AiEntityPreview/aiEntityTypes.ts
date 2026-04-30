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
  /** Per-item header cell content — overrides the static `headerCellContent` when present. */
  getHeaderCellContent?: (data: T) => Partial<DataCellContentProps>;
  /** Full DataCellContent props for the title (first) cell in multiple rows — overrides default title rendering */
  getTitleCellContent?: (data: T) => Partial<DataCellContentProps>;
  /** Per-row prefix cell — rendered BEFORE the title cell when present.
   *  Receives the row data and the 0-based row index. */
  getPrefixCellContent?: (data: T, index: number) => Partial<DataCellContentProps>;
  /** Override the card's max-width (in px) for this surface. */
  maxWidth?: number;
  columns: AiEntityColumnConfig<T>[];
}

export interface AiEntityConfig<T> {
  /** Extracts a unique key from each data item */
  getKey: (data: T) => string;
  /** Icon representing this entity type — used in inline chips */
  entityIcon?: IconName;
  /** Per-item icon for inline chips — overrides the static `entityIcon` when present. */
  getEntityIcon?: (data: T) => IconName;
  /** Builds the URL for navigating to an entity — used in inline chips */
  getHref?: (data: T) => string;
  /** Drives the single-item card */
  single: AiEntitySurfaceConfig<T>;
  /** Drives the hover tooltip — defaults to single if not provided */
  tooltip?: AiEntitySurfaceConfig<T>;
  /** Extra styles applied to the tooltip wrapper */
  tooltipStyle?: CSSProperties;
  /** Inline-mode label style — applied to the chip's label span. Useful for
   *  overriding typography (e.g. number-xs) per entity type. */
  inlineLabelStyle?: CSSProperties;
  /** Inline-mode root style — applied to the chip's root element (anchor /
   *  button / span). Useful for overriding shape (e.g. pill border-radius). */
  inlineStyle?: CSSProperties;
  /** Drives each row in the multiple-item list */
  multiple: AiEntitySurfaceConfig<T>;
}
