import { Entity } from "../Entity";
import { Badge } from "../Badge";
import { Icon } from "../Icon";
import type { LineDash, BarFillPattern } from "./chartUtils";
import type { IconName } from "../Icon/iconData";
import styles from "./ChartContainer.module.css";

const DASH_TOOLTIP_ICON: Record<LineDash, IconName> = {
  dotted: "dashed_line_style_1",
  dashed: "dashed_line_style_2",
  "dash-dot": "dashed_line_style_3",
};

const FILL_PATTERN_TOOLTIP_ICON: Record<BarFillPattern, IconName> = {
  dotted: "blur_on",
  "hatch-right": "texture",
  "hatch-left": "texture_alt",
};

export interface TooltipEntry {
  label: string;
  value: string;
  color: string;
  axis?: "left" | "right";
  dash?: LineDash;
  fillPattern?: BarFillPattern;
}

export interface ChartTooltipContentProps {
  header: string;
  entries: TooltipEntry[];
  yLeftTitle?: string;
  yRightTitle?: string;
}

function TooltipIndicator({ color, dash, fillPattern }: { color: string; dash?: LineDash; fillPattern?: BarFillPattern }) {
  if (dash) return <Icon name={DASH_TOOLTIP_ICON[dash]} size={16} color={color} />;
  if (fillPattern) return <Icon name={FILL_PATTERN_TOOLTIP_ICON[fillPattern]} size={16} color={color} />;
  return (
    <span
      className={styles.tooltipDot}
      style={{ background: color }}
    />
  );
}

function TooltipRow({ entry }: { entry: TooltipEntry }) {
  return (
    <div className={styles.tooltipRow}>
      <Badge
        size="sm"
        variant="neutral"
        emphasis="low"
        className={styles.tooltipBadge}
        leadingIcon={<TooltipIndicator color={entry.color} dash={entry.dash} fillPattern={entry.fillPattern} />}
      >
        {entry.label}
      </Badge>
      <span className={styles.tooltipValue}>{entry.value}</span>
    </div>
  );
}

export function ChartTooltipContent({ header, entries, yLeftTitle, yRightTitle }: ChartTooltipContentProps) {
  const hasDualAxis = yLeftTitle && yRightTitle && entries.some((e) => e.axis === "right");

  const leftEntries = hasDualAxis ? entries.filter((e) => e.axis !== "right") : entries;
  const rightEntries = hasDualAxis ? entries.filter((e) => e.axis === "right") : [];

  return (
    <div className={styles.tooltipBox}>
      <div className={styles.tooltipHeader}>
        <Entity title={header} className={styles.tooltipEntity} />
      </div>

      {hasDualAxis ? (
        <>
          <div className={styles.tooltipLegends}>
            <span className={styles.tooltipAxisTitle}>{yLeftTitle}</span>
            {leftEntries.map((entry, i) => (
              <TooltipRow key={i} entry={entry} />
            ))}
          </div>
          <div className={styles.tooltipLegends}>
            <span className={styles.tooltipAxisTitle}>{yRightTitle}</span>
            {rightEntries.map((entry, i) => (
              <TooltipRow key={i} entry={entry} />
            ))}
          </div>
        </>
      ) : (
        <div className={styles.tooltipLegends}>
          {entries.map((entry, i) => (
            <TooltipRow key={i} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
