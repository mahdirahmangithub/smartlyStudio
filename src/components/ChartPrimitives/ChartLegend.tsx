import { useState, useRef, useCallback } from "react";
import { Chip } from "../Chip";
import { Divider } from "../Divider";
import { Dropdown } from "../Dropdown";
import { Icon } from "../Icon";
import { MultiSelectOption } from "../MultiSelectOption";
import { ScrollFade } from "../ScrollFade";
import { ToggleChip } from "../ToggleChip";
import { getSeriesColor, type Series, type LineDash, type BarFillPattern } from "./chartUtils";
import type { IconName } from "../Icon/iconData";
import styles from "./ChartContainer.module.css";

const DASH_LEGEND_ICON: Record<LineDash, IconName> = {
  dotted: "dashed_line_style_1",
  dashed: "dashed_line_style_2",
  "dash-dot": "dashed_line_style_3",
};

const FILL_PATTERN_LEGEND_ICON: Record<BarFillPattern, IconName> = {
  dotted: "blur_on",
  "hatch-right": "texture",
  "hatch-left": "texture_alt",
};

function getLegendIcon(dash?: LineDash, fillPattern?: BarFillPattern): IconName {
  if (dash) return DASH_LEGEND_ICON[dash];
  if (fillPattern) return FILL_PATTERN_LEGEND_ICON[fillPattern];
  return "dot_fill";
}

export type LegendLayout = "wrap" | "scroll";

export interface ChartLegendProps<D> {
  series: Series<D>[];
  hiddenSeries?: Set<string>;
  onToggle?: (id: string) => void;
  layout?: LegendLayout;
}

/* ── Expanded legend chips (individual series toggles) ────────────── */

function LegendChips<D>({
  series,
  hiddenSeries,
  onToggle,
}: Pick<ChartLegendProps<D>, "series" | "hiddenSeries" | "onToggle">) {
  return (
    <>
      {series.map((s, i) => {
        const hidden = hiddenSeries?.has(s.id);
        const color = getSeriesColor(i, s.color);
        return (
          <ToggleChip
            key={s.id}
            size="md"
            emphasis="low"
            className={styles.legendChip}
            checked={!hidden}
            onChange={() => onToggle?.(s.id)}
            leadingIcon={
              <Icon
                name={getLegendIcon(s.dash, s.fillPattern)}
                size={16}
                color={color}
                className={styles.legendSwatch}
              />
            }
          >
            {s.label}
          </ToggleChip>
        );
      })}
    </>
  );
}

function CollapseChip({ onClick }: { onClick: () => void }) {
  return (
    <Chip
      size="md"
      variant="neutral"
      emphasis="medium"
      className={styles.legendActionChip}
      onClick={onClick}
      aria-label="Collapse legends"
      leadingIcon={<Icon name="hug_contents" size={16} />}
    />
  );
}

function ExpandedLegend<D>({
  series,
  hiddenSeries,
  onToggle,
  onCollapse,
  layout = "wrap",
}: ChartLegendProps<D> & { onCollapse: () => void }) {
  if (layout === "scroll") {
    return (
      <div className={styles.legendScrollOuter}>
        <ScrollFade
          direction="horizontal"
          fadeSize={32}
          className={styles.legendScrollFade}
          scrollAreaClassName={styles.legendScrollArea}
        >
          <div className={styles.legendScrollInner} role="toolbar" aria-label="Chart legend">
            <LegendChips series={series} hiddenSeries={hiddenSeries} onToggle={onToggle} />
          </div>
        </ScrollFade>
        <CollapseChip onClick={onCollapse} />
      </div>
    );
  }

  return (
    <div className={styles.legend} role="toolbar" aria-label="Chart legend">
      <LegendChips series={series} hiddenSeries={hiddenSeries} onToggle={onToggle} />
      <CollapseChip onClick={onCollapse} />
    </div>
  );
}

/* ── Collapsed legend trigger (chip + dropdown) ───────────────────── */

function CollapsedLegend<D>({
  series,
  hiddenSeries,
  onToggle,
  onExpand,
}: ChartLegendProps<D> & { onExpand: () => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const chipRef = useRef<HTMLDivElement>(null);

  const allIds = series.map((s) => s.id);
  const visibleCount = allIds.filter((id) => !hiddenSeries?.has(id)).length;
  const allChecked = visibleCount === allIds.length;
  const someChecked = visibleCount > 0 && visibleCount < allIds.length;

  const handleChipClick = useCallback(() => {
    setDropdownOpen((v) => !v);
  }, []);

  const handleExpandClick = useCallback(() => {
    setDropdownOpen(false);
    onExpand();
  }, [onExpand]);

  const handleSelectAll = useCallback(() => {
    if (!onToggle) return;
    if (allChecked) {
      allIds.forEach((id) => onToggle(id));
    } else {
      allIds
        .filter((id) => hiddenSeries?.has(id))
        .forEach((id) => onToggle(id));
    }
  }, [allChecked, allIds, hiddenSeries, onToggle]);

  return (
    <div className={styles.legend}>
      <Chip
        ref={chipRef}
        size="md"
        variant="neutral"
        emphasis="medium"
        className={`${styles.legendActionChip} ${styles.legendTriggerChip}`}
        onClick={handleChipClick}
        onRemove={handleExpandClick}
        removeTooltip="Expand legends"
      >
        Show legend
      </Chip>

      <Dropdown
        open={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
        anchorRef={chipRef}
        placement="top-start"
        width={240}
      >
        <MultiSelectOption
          labelText="Select all"
          checked={allChecked}
          indeterminate={someChecked}
          description={false}
          onChange={handleSelectAll}
        />
        <Divider />
        {series.map((s, i) => {
          const hidden = hiddenSeries?.has(s.id);
          const color = getSeriesColor(i, s.color);
          return (
            <MultiSelectOption
              key={s.id}
              labelText={s.label}
              checked={!hidden}
              description={false}
              leading={<Icon name={getLegendIcon(s.dash, s.fillPattern)} size={20} color={color} />}
              onChange={() => onToggle?.(s.id)}
            />
          );
        })}
      </Dropdown>
    </div>
  );
}

/* ── ChartLegend (public API unchanged) ───────────────────────────── */

export function ChartLegend<D>({
  series,
  hiddenSeries,
  onToggle,
  layout = "wrap",
}: ChartLegendProps<D>) {
  const [expanded, setExpanded] = useState(true);

  if (expanded) {
    return (
      <ExpandedLegend
        series={series}
        hiddenSeries={hiddenSeries}
        onToggle={onToggle}
        onCollapse={() => setExpanded(false)}
        layout={layout}
      />
    );
  }

  return (
    <CollapsedLegend
      series={series}
      hiddenSeries={hiddenSeries}
      onToggle={onToggle}
      onExpand={() => setExpanded(true)}
    />
  );
}
