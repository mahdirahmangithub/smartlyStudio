import { useEffect, useMemo, useState } from "react";
import { Container as PageContainer } from "@sds/components/Grid";
import { BodyText } from "@sds/components/BodyText";
import { Button } from "@sds/components/Button";
import { Container } from "@sds/components/Container";
import { ContentSwitcher } from "@sds/components/ContentSwitcher";
import { ContentSwitcherItem } from "@sds/components/ContentSwitcherItem";
import { AISideEntry } from "@sds/components/AISideEntry";
import { Divider } from "@sds/components/Divider";
import { Entity } from "@sds/components/Entity";
import { Expander } from "@sds/components/Expander";
import { GlobalNavigationBar } from "@sds/components/GlobalNavigationBar";
import { Icon } from "@sds/components/Icon";
import type { IconName } from "@sds/components/Icon";
import { LineChart } from "@sds/components/LineChart";
import type { Series } from "@sds/components/LineChart";
import { Pagination } from "@sds/components/Pagination";
import { PieChart } from "@sds/components/PieChart";
import type { PieSlice } from "@sds/components/PieChart";
import { curveMonotoneX } from "@visx/curve";
import { SelectButton } from "@sds/components/SelectButton";
import { Stat } from "@sds/components/Stat";
import { Thumbnail } from "@sds/components/Thumbnail";
import { getSpacing } from "@sds/utils/spacing";
import { HomeNavContent } from "./HomeNavContent";
import { METRIC_SERIES, METRIC_HEADLINE, type MetricPoint } from "./homeMetricData";
import styles from "./HomeTemplate.module.css";

const xAccessor = (d: MetricPoint) => d.x;
const yAccessor = (d: MetricPoint) => d.y;

interface MetricChartProps {
  seriesId: keyof typeof METRIC_SERIES;
}

interface MonthlyPoint {
  date: Date;
  value: number;
}

const MONTHLY_SPEND_COLOR = "var(--data-viz-categorical-1-default)";
const MONTHLY_FORECAST_COLOR = `color-mix(in oklch, ${MONTHLY_SPEND_COLOR} 50%, var(--element-surface-default))`;

/**
 * Cumulative monthly spend with a forecast: half a month of actuals leading
 * into a linear projection through the rest of May. The "Today" cutoff sits
 * roughly mid-month (May 15). `totalSpend` is the actual cumulative value at
 * the cutoff; `predictedSpend` is the forecast endpoint at month-end.
 */
const MONTHLY_SPEND: {
  data: MonthlyPoint[];
  cutoff: Date;
  totalSpend: number;
  predictedSpend: number;
} = (() => {
  const cutoffDayIdx = 14; // 0-indexed → day 15 (May 15)
  const totalDays = 30;
  const actuals = [
    180_000, 360_000, 530_000, 690_000, 850_000,
    1_010_000, 1_160_000, 1_300_000, 1_430_000, 1_550_000,
    1_660_000, 1_780_000, 1_880_000, 1_990_000, 2_100_000,
  ];
  const forecastEnd = 4_300_000;

  const data: MonthlyPoint[] = [];
  for (let i = 0; i <= cutoffDayIdx; i++) {
    data.push({ date: new Date(2026, 4, i + 1), value: actuals[i] });
  }
  const lastActual = actuals[cutoffDayIdx];
  const forecastSteps = totalDays - cutoffDayIdx;
  const slope = (forecastEnd - lastActual) / forecastSteps;
  for (let i = 1; i <= forecastSteps; i++) {
    data.push({
      date: new Date(2026, 4, cutoffDayIdx + 1 + i),
      value: Math.round(lastActual + slope * i),
    });
  }
  return {
    data,
    cutoff: new Date(2026, 4, cutoffDayIdx + 1),
    totalSpend: lastActual,
    predictedSpend: forecastEnd,
  };
})();

function formatCompactCurrency(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

function MonthlySpendChart() {
  const series = useMemo<Series<MonthlyPoint>[]>(
    () => [
      {
        id: "spend",
        label: "Spend",
        data: MONTHLY_SPEND.data,
        color: MONTHLY_SPEND_COLOR,
        forecastFrom: MONTHLY_SPEND.cutoff,
      },
    ],
    [],
  );
  return (
    <LineChart<MonthlyPoint>
      series={series}
      xAccessor={(d) => d.date}
      yAccessor={(d) => d.value}
      curve={curveMonotoneX}
      height={300}
      margin={{ top: 16, right: 16, bottom: 40, left: 32 }}
      showXGrid={false}
      showYGrid
      showLegend={false}
      yTickFormat={formatCompactCurrency}
      referenceLines={[{ x: MONTHLY_SPEND.cutoff, label: "Today" }]}
    />
  );
}

/* ── Learning Monitor (pie + stats) ───────────────────────────────────── */

const LEARNING_MONITOR = {
  inProgress: { value: 102, color: "var(--data-viz-categorical-2-default)" },
  completed: { value: 223, color: "var(--data-viz-categorical-1-default)" },
  limited: { value: 3, color: "var(--data-viz-categorical-3-default)" },
};

const LEARNING_MONITOR_TOTAL =
  LEARNING_MONITOR.inProgress.value +
  LEARNING_MONITOR.completed.value +
  LEARNING_MONITOR.limited.value;

function LearningMonitorChart() {
  const data = useMemo<PieSlice[]>(
    () => [
      {
        id: "completed",
        label: "Completed",
        value: LEARNING_MONITOR.completed.value,
        color: LEARNING_MONITOR.completed.color,
      },
      {
        id: "in-progress",
        label: "In progress",
        value: LEARNING_MONITOR.inProgress.value,
        color: LEARNING_MONITOR.inProgress.color,
      },
      {
        id: "limited",
        label: "Limited",
        value: LEARNING_MONITOR.limited.value,
        color: LEARNING_MONITOR.limited.color,
      },
    ],
    [],
  );
  return (
    <PieChart
      data={data}
      thickness={28}
      cornerRadius={2}
      padAngle={0.01}
      centerValue={LEARNING_MONITOR_TOTAL}
      centerLabel="Ad sets"
      showLegend={false}
      showSliceLabels={false}
      sortSlices="none"
      height={260}
    />
  );
}

function LearningMonitorStats() {
  return (
    <div className={styles.chartCardStatsRow}>
      <div className={styles.chartCardStatSlot}>
        <Stat
          size="lg"
          pretitle="In progress"
          pretitleIndicatorColor={LEARNING_MONITOR.inProgress.color}
          value={LEARNING_MONITOR.inProgress.value}
          formatOptions={{ maximumFractionDigits: 0 }}
        />
      </div>
      <Divider orientation="vertical" />
      <div className={styles.chartCardStatSlot}>
        <Stat
          size="lg"
          pretitle="Completed"
          pretitleIndicatorColor={LEARNING_MONITOR.completed.color}
          value={LEARNING_MONITOR.completed.value}
          formatOptions={{ maximumFractionDigits: 0 }}
        />
      </div>
      <Divider orientation="vertical" />
      <div className={styles.chartCardStatSlot}>
        <Stat
          size="lg"
          pretitle="Limited"
          pretitleIndicatorColor={LEARNING_MONITOR.limited.color}
          value={LEARNING_MONITOR.limited.value}
          formatOptions={{ maximumFractionDigits: 0 }}
        />
      </div>
    </div>
  );
}

function MonthlySpendStats() {
  return (
    <div className={styles.chartCardStatsRow}>
      <div className={styles.chartCardStatSlot}>
        <Stat
          size="lg"
          pretitle="Total Spend"
          pretitleIndicatorColor={MONTHLY_SPEND_COLOR}
          value={MONTHLY_SPEND.totalSpend}
          prefix="$"
          formatOptions={{
            notation: "compact",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }}
        />
      </div>
      <Divider orientation="vertical" />
      <div className={styles.chartCardStatSlot}>
        <Stat
          size="lg"
          pretitle="Predicted Spend"
          pretitleIndicatorColor={MONTHLY_FORECAST_COLOR}
          value={MONTHLY_SPEND.predictedSpend}
          prefix="$"
          formatOptions={{
            notation: "compact",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }}
        />
      </div>
    </div>
  );
}

function MetricChart({ seriesId }: MetricChartProps) {
  const series = useMemo<Series<MetricPoint>[]>(() => {
    const def = METRIC_SERIES[seriesId];
    return [{ id: def.id, label: def.label, data: def.data }];
  }, [seriesId]);
  return (
    <div className={styles.metricChart}>
      <LineChart<MetricPoint>
        series={series}
        xAccessor={xAccessor}
        yAccessor={yAccessor}
        curve={curveMonotoneX}
        height={180}
        showAreaFill
        edgeFade
        edgeFadeWidth={16}
        showXGrid={false}
        showYGrid={false}
        showAxes={false}
        showLegend={false}
        margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
      />
    </div>
  );
}

const PLATFORMS: { value: string; label: string; icon: IconName }[] = [
  { value: "smartly", label: "Smartly", icon: "smartly" },
  { value: "meta", label: "Meta", icon: "Meta_color" },
  { value: "snapchat", label: "Snapchat", icon: "Snapchat_color" },
  { value: "tiktok", label: "TikTok", icon: "TikTok_color" },
  { value: "x", label: "X", icon: "X_color" },
  { value: "pinterest", label: "Pinterest", icon: "Pinterest_color" },
  { value: "google_ads", label: "Google Ads", icon: "Google Ads_color" },
  { value: "reddit", label: "Reddit", icon: "Reddit_color" },
  { value: "spotify", label: "Spotify", icon: "Spotify_color" },
  { value: "linkedin", label: "LinkedIn", icon: "LinkedIn_color" },
  { value: "google_cm360", label: "Google CM360", icon: "Google CM360_color" },
];

export function HomeTemplate() {
  const [platform, setPlatform] = useState(PLATFORMS[0].value);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [insightsPage, setInsightsPage] = useState(1);

  // Match the document body background to the template's surface so any
  // overscroll / wider viewport shows the same `--element-surface-under` tone
  // instead of the browser default white.
  useEffect(() => {
    const body = document.body;
    const prev = body.style.background;
    body.style.background = "var(--element-surface-under)";
    return () => {
      body.style.background = prev;
    };
  }, []);
  const insightSpacing = getSpacing({
    paddingTop: "sm-extra",
    paddingBottom: "sm-extra",
    insetLeft: "sm-extra",
    insetRight: "sm-extra",
  });
  return (
    <div className={styles.root}>
      <GlobalNavigationBar
        brandBadge
        inboxBadgeCount={2}
        profileAvatarSrc="https://i.pravatar.cc/80?img=12"
        profileLabel="Mahdi Rahman"
        secondaryInitials="ES"
        secondaryLabel="Smartly.io"
      >
        <HomeNavContent />
      </GlobalNavigationBar>
      <main className={styles.main}>
        <PageContainer className={styles.page}>
          <div className={styles.toolbar}>
            <ContentSwitcher
              size="md"
              value={platform}
              onChange={setPlatform}
            >
              {PLATFORMS.map((p) => (
                <ContentSwitcherItem
                  key={p.value}
                  value={p.value}
                  aria-label={p.label}
                  leadingIcon={<Icon name={p.icon} size={20} />}
                />
              ))}
            </ContentSwitcher>
            <SelectButton
              size="md"
              expanded={accountsOpen}
              onClick={() => setAccountsOpen((v) => !v)}
            >
              Accounts
            </SelectButton>
            <div className={styles.toolbarSpacer} />
            <Button
              size="md"
              variant="brand"
              emphasis="high"
              leadingIcon={<Icon name="add" size={16} />}
              trailingIcon={<Expander size="sm" />}
            >
              Connect Ad Accounts
            </Button>
            <SelectButton
              size="md"
              expanded={currencyOpen}
              onClick={() => setCurrencyOpen((v) => !v)}
            >
              Currency
            </SelectButton>
            <SelectButton
              size="md"
              leadingIcon={<Icon name="calendar_today" size={16} />}
              expanded={dateRangeOpen}
              onClick={() => setDateRangeOpen((v) => !v)}
            >
              Date range
            </SelectButton>
          </div>
          <div className={styles.dashboardSection}>
            <div className={styles.metricsGrid}>
              <Container density="sm" elevated={true} className={`${styles.dashboardCard} ${styles.metricCard}`}>
                <Stat
                  size="md"
                  pretitle="Spend"
                  value={METRIC_HEADLINE.spend}
                  prefix="€"
                  suffix="M"
                  formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                />
                <MetricChart seriesId="spend" />
              </Container>
              <Container density="sm" elevated={true} className={`${styles.dashboardCard} ${styles.metricCard}`}>
                <Stat
                  size="md"
                  pretitle="Impressions"
                  value={METRIC_HEADLINE.impressions}
                  suffix="K"
                  formatOptions={{ maximumFractionDigits: 1 }}
                />
                <MetricChart seriesId="impressions" />
              </Container>
              <Container density="sm" elevated={true} className={`${styles.dashboardCard} ${styles.metricCard}`}>
                <Stat
                  size="md"
                  pretitle="Link Clicks"
                  value={METRIC_HEADLINE.linkClicks}
                  formatOptions={{ maximumFractionDigits: 0 }}
                />
                <MetricChart seriesId="linkClicks" />
              </Container>
              <Container density="sm" elevated={true} className={`${styles.dashboardCard} ${styles.metricCard}`}>
                <Stat
                  size="md"
                  pretitle="CPM"
                  value={METRIC_HEADLINE.cpm}
                  prefix="€"
                  formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                />
                <MetricChart seriesId="cpm" />
              </Container>
              <Container density="sm" elevated={true} className={`${styles.dashboardCard} ${styles.metricCard}`}>
                <Stat
                  size="md"
                  pretitle="CPC"
                  value={METRIC_HEADLINE.cpc}
                  prefix="€"
                  formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                />
                <MetricChart seriesId="cpc" />
              </Container>
              <Container density="sm" elevated={true} className={`${styles.dashboardCard} ${styles.metricCard}`}>
                <Stat
                  size="md"
                  pretitle="CTR"
                  value={METRIC_HEADLINE.ctr}
                  suffix="%"
                  formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                />
                <MetricChart seriesId="ctr" />
              </Container>
            </div>
            <Container
              title="Weekly Insights"
              description="16th July to 23rd July 2026"
              headerSize="lg"
              headerDivider={false}
              density="sm"
              elevated={true}
              className={`${styles.dashboardCard} ${styles.weeklyInsightsCard}`}
              headerActions={
                <Button size="md" variant="neutral" emphasis="medium">
                  Explore
                </Button>
              }
            >
              <div className={styles.insightStack}>
                <div
                  className={`${styles.insightCallout} ${insightSpacing.className}`}
                  style={insightSpacing.style}
                >
                  <Entity
                    leading={
                      <Thumbnail
                        size="md"
                        type="icon"
                        icon={<Icon name="forecasting" size={20} />}
                        className={styles.insightThumbnail}
                      />
                    }
                    title='High spend on "ASC_BAU_Purchase" campaign with average engagement.'
                  />
                </div>
                <div className={styles.insightBody}>
                  <BodyText size="md">
                    <strong>Highlight:</strong> The highest-spending campaign,
                    {" "}&quot;FI_Meta_ASC_BAU_Purchase,&quot; shows moderate
                    engagement and a higher cost per click compared to
                    event-based campaigns.
                  </BodyText>
                  <BodyText size="md">
                    <strong>Context:</strong> This single campaign accounts for
                    approximately{" "}
                    <strong>93.5% of the total budget</strong> ($992k out of
                    $1.06M). It serves as the primary &quot;business as
                    usual&quot; (BAU) prospecting campaign.
                  </BodyText>
                  <BodyText size="md">
                    <strong>Evidence:</strong> <strong>Spend:</strong>{" "}
                    $991,992,{" "}<strong>Overall CTR:</strong> 3.82%,{" "}
                    <strong>Overall CPC:</strong> $18.84
                  </BodyText>
                  <BodyText size="md">
                    <strong>Recommendation:</strong> Once conversion tracking
                    is active, critically evaluate the true performance
                    (CPA/ROAS) of this campaign. While its CTR is decent, its
                    CPC is higher than the event-based &quot;Tapahtuma&quot;
                    campaign ($10.53) and the new &quot;Daria&quot; campaign
                    ($15.64). There may be an opportunity to shift budget to
                    more efficient campaigns or to refine the targeting and
                    creatives within this one.
                  </BodyText>
                  <BodyText size="md">
                    <strong>Impact:</strong> Optimizing this campaign could
                    lead to significant efficiency gains due to its large
                    share of the budget. A 10% improvement in its performance
                    would have a much larger impact than a 50% improvement in
                    a smaller campaign. The compounding effect on monthly
                    blended CPA could materially shift the profile of the
                    overall account, especially if reinvested into the better-
                    performing event-based campaigns.
                  </BodyText>
                  <BodyText size="md">
                    <strong>Risks:</strong> Pulling budget away too quickly
                    can destabilize the prospecting funnel — ASC campaigns
                    typically need 50+ conversions per week to keep the
                    learning phase stable. Audit creative fatigue (frequency
                    above 3.0 in the last 14 days) and refresh underperforming
                    ad sets before declaring the campaign inefficient.
                  </BodyText>
                  <BodyText size="md">
                    <strong>Next steps:</strong> (1) Confirm conversion
                    tracking is firing on the primary purchase event. (2)
                    Pull a 30-day breakdown of CPA and ROAS by ad set. (3)
                    Identify the bottom-quartile ad sets and pause them. (4)
                    Reallocate ~15% of the campaign budget to the Tapahtuma
                    and Daria campaigns and monitor for two full reporting
                    weeks before further moves.
                  </BodyText>
                  <BodyText size="md">
                    <strong>Owner:</strong> Performance team (lead: Daria K.).
                    Status review scheduled for the following Monday standup.
                  </BodyText>
                </div>
              </div>
              <div className={styles.insightPagination}>
                <Pagination
                  size="sm"
                  count={10}
                  page={insightsPage}
                  onChange={setInsightsPage}
                  aria-label="Weekly insights pagination"
                />
              </div>
            </Container>
          </div>
          <div className={styles.splitSection}>
            <Container
              title="Monthly Spend"
              headerSize="lg"
              headerDivider={false}
              density="sm"
              elevated={true}
              className={styles.dashboardCard}
              headerActions={
                <Button size="md" variant="neutral" emphasis="medium">
                  View in reporting
                </Button>
              }
            >
              <div className={styles.chartCardBody}>
                <div className={styles.chartCardSlot}>
                  <MonthlySpendChart />
                </div>
                <MonthlySpendStats />
              </div>
            </Container>
            <Container
              title="Learning Monitor"
              titleLeadingIcon={<Icon name="Meta_color" size={20} />}
              headerSize="lg"
              headerDivider={false}
              density="sm"
              elevated={true}
              className={styles.dashboardCard}
              headerActions={
                <Button size="md" variant="neutral" emphasis="medium">
                  View in reporting
                </Button>
              }
            >
              <div className={styles.chartCardBody}>
                <div className={styles.chartCardSlot}>
                  <LearningMonitorChart />
                </div>
                <LearningMonitorStats />
              </div>
            </Container>
          </div>
        </PageContainer>
      </main>
      <AISideEntry
        panelOpen={aiPanelOpen}
        onClick={() => setAiPanelOpen((v) => !v)}
      />
    </div>
  );
}

HomeTemplate.displayName = "HomeTemplate";
