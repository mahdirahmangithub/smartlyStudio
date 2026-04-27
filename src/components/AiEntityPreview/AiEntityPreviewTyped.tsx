import type { ReactNode } from "react";
import { AiEntityPreview, AiEntityPreviewMultiple } from "./AiEntityPreview";
import { AiEntityPreviewInline } from "./AiEntityPreviewInline";
import type {
  AiEntityPreviewProps,
  AiEntityPreviewMultipleProps,
  AiEntityPreviewItem,
} from "./AiEntityPreview";
import type { AiEntityPreviewInlineProps } from "./AiEntityPreviewInline";
import type { AiEntityConfig, AiEntitySurfaceConfig } from "./aiEntityTypes";

function resolveProps<T>(config: AiEntitySurfaceConfig<T>, data: T) {
  return {
    title: config.getTitle(data),
    headerCellContent: config.getHeaderCellContent
      ? config.getHeaderCellContent(data)
      : config.headerCellContent,
    columns: config.columns.map((c) => ({
      key: c.key,
      ...(c.getCellContent
        ? { cellContent: c.getCellContent(data) }
        : { description: c.getDescription(data) }
      ),
    })),
  };
}

function resolveItemsProps<T>(config: AiEntitySurfaceConfig<T>) {
  return config.maxWidth ? { maxWidth: config.maxWidth } : {};
}

/* ── Single ── */

export interface AiEntityPreviewTypedProps<T>
  extends Omit<AiEntityPreviewProps, "title" | "columns"> {
  config: AiEntityConfig<T>;
  data: T;
}

export function AiEntityPreviewTyped<T>({
  config,
  data,
  ...rest
}: AiEntityPreviewTypedProps<T>) {
  return <AiEntityPreview {...resolveProps(config.single, data)} {...resolveItemsProps(config.single)} {...rest} />;
}

AiEntityPreviewTyped.displayName = "AiEntityPreviewTyped";

/* ── Multiple ── */

export interface AiEntityPreviewMultipleTypedProps<T>
  extends Omit<AiEntityPreviewMultipleProps, "items" | "renderTooltip" | "onRowAction"> {
  config: AiEntityConfig<T>;
  data: T[];
  /** Click handler for the per-row "Add to context" icon — receives the typed row data. */
  onRowAction?: (data: T) => void;
}

export function AiEntityPreviewMultipleTyped<T>({
  config,
  data,
  onRowAction,
  ...rest
}: AiEntityPreviewMultipleTypedProps<T>) {
  const tooltipConfig = config.tooltip ?? config.single;
  const dataMap = new Map(data.map((d) => [config.getKey(d), d]));

  const items: AiEntityPreviewItem[] = data.map((d) => ({
    key: config.getKey(d),
    ...resolveProps(config.multiple, d),
    ...(config.multiple.getTitleCellContent
      ? { titleCellContent: config.multiple.getTitleCellContent(d) }
      : {}),
  }));

  const renderTooltip = (item: AiEntityPreviewItem): ReactNode => {
    const raw = dataMap.get(item.key);
    if (!raw) return null;
    const preview = <AiEntityPreview {...resolveProps(tooltipConfig, raw)} hideHeaderAction />;
    return config.tooltipStyle
      ? <div style={config.tooltipStyle}>{preview}</div>
      : preview;
  };

  const handleRowAction = onRowAction
    ? (item: AiEntityPreviewItem) => {
        const raw = dataMap.get(item.key);
        if (raw) onRowAction(raw);
      }
    : undefined;

  return (
    <AiEntityPreviewMultiple
      items={items}
      renderTooltip={renderTooltip}
      onRowAction={handleRowAction}
      {...resolveItemsProps(config.multiple)}
      {...rest}
    />
  );
}

AiEntityPreviewMultipleTyped.displayName = "AiEntityPreviewMultipleTyped";

/* ── Inline ── */

export interface AiEntityPreviewInlineTypedProps<T>
  extends Omit<AiEntityPreviewInlineProps, "label" | "icon" | "href" | "tooltipContent"> {
  config: AiEntityConfig<T>;
  data: T;
}

export function AiEntityPreviewInlineTyped<T>({
  config,
  data,
  ...rest
}: AiEntityPreviewInlineTypedProps<T>) {
  const tooltipConfig = config.tooltip ?? config.single;
  const tooltipProps = resolveProps(tooltipConfig, data);
  const preview = <AiEntityPreview {...tooltipProps} hideHeaderAction />;

  return (
    <AiEntityPreviewInline
      label={config.single.getTitle(data)}
      icon={config.getEntityIcon?.(data) ?? config.entityIcon}
      href={config.getHref?.(data)}
      tooltipContent={
        config.tooltipStyle
          ? <div style={config.tooltipStyle}>{preview}</div>
          : preview
      }
      {...rest}
    />
  );
}

AiEntityPreviewInlineTyped.displayName = "AiEntityPreviewInlineTyped";
