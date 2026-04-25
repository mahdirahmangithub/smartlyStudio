import { useState, type ReactNode } from "react";
import { useCollapsible } from "../../hooks/useCollapsible";
import { Card } from "../Card";
import { DataTable, type ColumnDef } from "../DataTable";
import { DataCellContent, type DataCellContentProps } from "../DataCellContent";

import { Button } from "../Button";
import { IconContainer } from "../IconContainer";
import { Tooltip } from "../Tooltip";
import { cx } from "../../utils/cx";
import styles from "./AiEntityPreview.module.css";

/* ── Shared types ── */

export interface AiEntityPreviewColumn {
  key: string;
  description?: ReactNode;
  /** Full DataCellContent props — overrides description when provided */
  cellContent?: Partial<DataCellContentProps>;
}

/* ── Single ── */

export interface AiEntityPreviewProps {
  /** Header group label spanning all columns */
  title: string;
  /** Extra props for the header DataCellContent (leading, trailing, state, etc.) */
  headerCellContent?: Partial<DataCellContentProps>;
  columns: AiEntityPreviewColumn[];
  onClick?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onCreate?: () => void;
  className?: string;
}

type SingleRow = Record<string, Partial<DataCellContentProps>>;

export function AiEntityPreview({
  title,
  headerCellContent,
  columns,
  onClick,
  onEdit,
  onCancel,
  onCreate,
  className,
}: AiEntityPreviewProps) {
  const tableColumns: ColumnDef<SingleRow>[] = [
    {
      key: "__entity__",
      title,
      headerCellContent,
      children: columns.map((col) => ({
        key: col.key,
        dataIndex: col.key,
        title: undefined,
        density: "lg",
        onHeaderCell: () => ({ style: { padding: 0, border: "none" } }),
        onCell: () => ({ style: { paddingTop: "calc(var(--spacing-sm-extra) + var(--spacing-sm))" } }),
        dividerRight: false,
        dividerBottom: false,
        render: (cellProps: Partial<DataCellContentProps>) => <DataCellContent {...cellProps} />,
      })),
    },
  ];

  const dataSource: SingleRow[] = [
    Object.fromEntries(columns.map((col) => [
      col.key,
      col.cellContent ?? { description: col.description },
    ])),
  ];

  return (
    <Card
      variant="outline-hairline"
      radius="sm"
      onClick={onClick}
      className={cx(styles.card, className)}
    >
      <div className={styles.tableWrapNoHover}>
        <DataTable
          dataSource={dataSource}
          columns={tableColumns}
          density="md"
          columnDividers={false}
          rowKey={() => "__row__"}
        />
      </div>

      {(onEdit || onCancel || onCreate) && (
        <div className={styles.actions}>
          <div className={styles.actionsLeft}>
            {onEdit && (
              <Button size="md" variant="neutral" emphasis="low" onClick={onEdit}>
                Edit
              </Button>
            )}
          </div>
          <div className={styles.actionsRight}>
            {onCancel && (
              <Button size="md" variant="neutral" emphasis="medium" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {onCreate && (
              <Button size="md" variant="neutral" emphasis="high" onClick={onCreate}>
                Create
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

AiEntityPreview.displayName = "AiEntityPreview";

/* ── Multiple ── */

export interface AiEntityPreviewItem {
  key: string;
  /** Shown in the first column via DataCellContent title */
  title: string;
  /** Full DataCellContent props for the first column — overrides title when provided */
  titleCellContent?: Partial<DataCellContentProps>;
  /** Shown in subsequent columns via DataCellContent description */
  columns: AiEntityPreviewColumn[];
}

export interface AiEntityPreviewMultipleProps {
  items: AiEntityPreviewItem[];
  /** Max rows shown before "show more". Default: 10 */
  visibleCount?: number;
  /** Item type name used in "Show more N {itemName}". Default: "items" */
  itemName?: string;
  /** Custom tooltip content per row. Defaults to rendering AiEntityPreview with the row's own data. */
  renderTooltip?: (item: AiEntityPreviewItem) => ReactNode;
  onClick?: (key: string) => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onCreate?: () => void;
  className?: string;
}

export function AiEntityPreviewMultiple({
  items,
  visibleCount = 10,
  itemName = "items",
  renderTooltip,
  onClick,
  onEdit,
  onCancel,
  onCreate,
  className,
}: AiEntityPreviewMultipleProps) {
  const [hoveredItem, setHoveredItem] = useState<AiEntityPreviewItem | null>(null);
  const [showAll, setShowAll] = useState(false);


  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);
  const hasHidden = hiddenItems.length > 0;

  const { ref: collapsibleRef } = useCollapsible(showAll);

  const colKeys = items[0]?.columns.map((c) => c.key) ?? [];

  const tableColumns: ColumnDef<AiEntityPreviewItem>[] = [
    {
      key: "__title__",
      title: undefined,
      onHeaderCell: () => ({ style: { padding: 0, border: "none" } }),
      onCell: () => ({ style: { width: "100%" } }),
      density: "lg",
      dividerRight: false,
      render: (_: unknown, record: AiEntityPreviewItem) => (
        <DataCellContent title={record.title} {...record.titleCellContent} />
      ),
    },
    ...colKeys.map((colKey) => ({
      key: colKey,
      title: undefined,
      onHeaderCell: () => ({ style: { padding: 0, border: "none" } }),
      density: "lg" as const,
      dividerRight: false,
      render: (_: unknown, record: AiEntityPreviewItem) => (
        (() => {
          const col = record.columns.find((c) => c.key === colKey);
          return col?.cellContent
            ? <DataCellContent {...col.cellContent} />
            : <DataCellContent description={col?.description} />;
        })()
      ),
    })),
  ];

  return (
    <Card
      variant="outline-hairline"
      radius="sm"
      isStatic
      className={cx(styles.card, className)}
    >
      <div className={styles.tableWrap}>
        <Tooltip
          anchor="cursor"
          open={hoveredItem !== null}
          onOpenChange={(open) => { if (!open) setHoveredItem(null); }}
          content={hoveredItem ? (
            renderTooltip
              ? renderTooltip(hoveredItem)
              : <AiEntityPreview title={hoveredItem.title} columns={hoveredItem.columns} />
          ) : null}
          type="neutral"
          showTail={false}
          disableInteractive
          placement="left"
          offsetPx={48}
          className={styles.tooltipContent}
        >
          {/* Plain div as tooltip anchor — DataTable drops injected props (no ...rest spread),
              but a div accepts all handlers and lets DataTable events bubble up naturally. */}
          <div>
            <DataTable
              dataSource={visibleItems}
              columns={tableColumns}
              density="md"
              columnDividers={false}
              rowDividers={false}
              rowKey={(item) => item.key}
              onRow={(record) => ({
                onMouseEnter: () => setHoveredItem(record),
                onMouseLeave: () => setHoveredItem(null),
                ...(onClick ? { onClick: () => onClick(record.key) } : {}),
              })}
            />

            {hasHidden && (
              <>
                <div
                  ref={collapsibleRef}
                  style={{ overflow: "hidden", height: 0, opacity: 0 }}
                >
                  <DataTable
                    dataSource={hiddenItems}
                    columns={tableColumns}
                    density="md"
                    columnDividers={false}
                    rowDividers={false}
                    rowKey={(item) => item.key}
                    onRow={(record) => ({
                      onMouseEnter: () => setHoveredItem(record),
                      onMouseLeave: () => setHoveredItem(null),
                      ...(onClick ? { onClick: () => onClick(record.key) } : {}),
                    })}
                  />
                </div>

                <div
                  className={styles.showMoreRow}
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowAll((v) => !v)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowAll((v) => !v); }}
                >
                  <DataCellContent
                    leading={<IconContainer size="md" name={showAll ? "unfold_less" : "unfold_more"} color="var(--text-neutral-tertiary-default)" />}
                    description={showAll ? "Show less" : `Show more ${hiddenItems.length} ${itemName}`}
                  />
                </div>
              </>
            )}
          </div>
        </Tooltip>
      </div>

      {(onEdit || onCancel || onCreate) && (
        <div className={styles.actions}>
          <div className={styles.actionsLeft}>
            {onEdit && (
              <Button size="md" variant="neutral" emphasis="low" onClick={onEdit}>
                Edit
              </Button>
            )}
          </div>
          <div className={styles.actionsRight}>
            {onCancel && (
              <Button size="md" variant="neutral" emphasis="medium" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {onCreate && (
              <Button size="md" variant="neutral" emphasis="high" onClick={onCreate}>
                Create
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

AiEntityPreviewMultiple.displayName = "AiEntityPreviewMultiple";
