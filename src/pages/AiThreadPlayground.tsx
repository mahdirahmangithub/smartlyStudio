import { useCallback, useEffect, forwardRef, useImperativeHandle, createRef, useMemo, useRef, useState, type RefObject } from "react";
import { flushSync } from "react-dom";
import { AiThread, type AiThreadHandle, type AiThreadMessage } from "../components/AiThread";
import { AiGeneration } from "../components/AiGeneration";
import { DataTable, type ColumnDef } from "../components/DataTable";
import { DataCellContent } from "../components/DataCellContent";
import { useScrollFade } from "../components/ScrollFade";
import { LineChart, type Series as LineSeries } from "../components/LineChart";
import { curveMonotoneX } from "@visx/curve";
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputFooterStart,
  PromptInputAddMenu,
  PromptInputToolsButton,
  PromptInputSubmit,
  PromptInputInfo,
  PromptInputRecommendations,
  PromptInputContextMenu,
  usePromptInput,
  type PromptInputTriggerConfig,
  type PromptInputInfoType,
  type RecommendationItem,
  type ContextMenuCategory,
  type ContextMenuSuggestedItem,
  type PromptInputContextItem,
} from "../components/PromptInput";
import { Icon } from "../components/Icon";
import { ResponseBody } from "../components/ResponseBody";
import { PromptOptionInput, usePromptOptionInput } from "../components/PromptOptionInput";
import { MultiSelectOption } from "../components/MultiSelectOption";
import { Cot, CotItem, CotContainer } from "../components/Cot";
import { BodyText } from "../components/BodyText";

/* ── Response content ─────────────────────────────────────────── */

const SHORT_HTML = `<p>Got it — short test response. The thread component is streaming correctly, the scroll sentinel is active, and the scroll-to-bottom FAB will appear if you scroll up during a long generation. Try sending <strong>long test</strong> to stress-test the scroll behavior.</p>`;

const LONG_HTML = `<h2>Understanding modern frontend architecture</h2>
<p>Frontend architecture has evolved dramatically over the past decade. What once required hand-crafted jQuery and server-rendered HTML templates is now handled by sophisticated component systems, build tooling, and state management layers. This response is intentionally long so you can test the thread's scroll behavior during streaming generation.</p>
<h3>Component-driven development</h3>
<p>The shift to component-driven development changed how teams think about UI. Instead of pages, we build systems of composable, reusable units. Each component owns its markup, styles, and logic — making reasoning about behavior much easier.</p>
<ul>
  <li><strong>Isolation</strong> — components encapsulate complexity behind a clean API surface.</li>
  <li><strong>Reusability</strong> — the same button, input, or card works identically across dozens of surfaces.</li>
  <li><strong>Testability</strong> — small units are easier to test in isolation than whole pages.</li>
  <li><strong>Composability</strong> — combining small components produces complex interfaces without complexity leaking across boundaries.</li>
</ul>
<h3>State management</h3>
<p>State management remains one of the hardest problems in frontend engineering. The community has cycled through Flux, Redux, MobX, Zustand, Jotai, and back again. The common thread is the tension between <em>global shared state</em> and <em>local component state</em>.</p>
<p>Most modern guidance is to keep state as local as possible, lifting it up only when genuinely needed. Server state (data fetched from APIs) is now treated as a separate concern — tools like React Query and SWR make cache management, background refetching, and optimistic updates declarative.</p>
<pre><code class="language-typescript">// Example: optimistic update with React Query
const mutation = useMutation({
  mutationFn: updateMessage,
  onMutate: async (newMessage) => {
    await queryClient.cancelQueries({ queryKey: ["messages"] });
    const previous = queryClient.getQueryData(["messages"]);
    queryClient.setQueryData(["messages"], (old) => [...old, newMessage]);
    return { previous };
  },
  onError: (_err, _vars, context) => {
    queryClient.setQueryData(["messages"], context?.previous);
  },
});
</code></pre>
<h3>Performance patterns</h3>
<p>Performance in large applications comes from a handful of well-understood patterns:</p>
<ol>
  <li><strong>Code splitting</strong> — ship only the JavaScript needed for the current route.</li>
  <li><strong>Memoization</strong> — prevent expensive re-renders with <code>React.memo</code>, <code>useMemo</code>, and <code>useCallback</code>.</li>
  <li><strong>Virtualization</strong> — render only visible rows in long lists.</li>
  <li><strong>CSS containment</strong> — <code>content-visibility: auto</code> lets the browser skip layout and paint for off-screen subtrees.</li>
</ol>
<h3>Design systems</h3>
<p>A design system is not just a component library — it is a shared language between design and engineering. Done well, it eliminates entire categories of inconsistency: spacing, typography, color, motion, and interaction patterns all become deterministic.</p>
<p>The token layer is the foundation. Semantic tokens (<code>--content-primary-default</code>, <code>--element-surface-over</code>) abstract over primitive values, making theme switching, dark mode, and density changes a single variable swap rather than a codebase-wide hunt.</p>
<blockquote>The measure of a good design system is not how many components it has, but how rarely engineers need to make visual decisions on their own.</blockquote>
<h3>Accessibility</h3>
<p>Accessibility is not a feature to add at the end — it is a quality dimension that must be designed in from the start. Chat interfaces have specific requirements:</p>
<ul>
  <li><code>role="log"</code> on the message container announces new messages to screen readers.</li>
  <li>Each message should have a clear accessible label so keyboard users can navigate between them.</li>
  <li>Action buttons must be reachable via keyboard and have meaningful labels.</li>
  <li>Focus management after submitting a new message should be intentional.</li>
</ul>`;

/* ── Chunk streaming ─────────────────────────────────────────── */

function toStreamChunks(html: string): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === "<") {
      const end = html.indexOf(">", i);
      if (end !== -1) { chunks.push(html.slice(i, end + 1)); i = end + 1; }
      else { chunks.push(html[i++]); }
    } else {
      const tagAt = html.indexOf("<", i);
      const spaceAt = html.indexOf(" ", i);
      const newlineAt = html.indexOf("\n", i);
      const whitespace = [spaceAt, newlineAt].filter((n) => n > i);
      const nearestWhitespace = whitespace.length ? Math.min(...whitespace) + 1 : Infinity;
      const nearestTag = tagAt > i ? tagAt : Infinity;
      const next = Math.min(nearestWhitespace, nearestTag, html.length);
      if (next === i) { i++; continue; }
      chunks.push(html.slice(i, next));
      i = next;
    }
  }
  return chunks;
}

const SHORT_CHUNKS = toStreamChunks(SHORT_HTML);
const LONG_CHUNKS = toStreamChunks(LONG_HTML);

const CHART_BEFORE_HTML = `<p>Here's a look at your metric performance over the last 30 days. The chart below shows daily values — you can see a general upward trend with some mid-period volatility.</p>`;

const TABLE_BEFORE_HTML = `<p>Here's the campaign performance breakdown across your active placements. The table shows impressions, clicks, CTR, spend, and ROAS for each channel.</p>`;
const TABLE_BEFORE_CHUNKS = toStreamChunks(TABLE_BEFORE_HTML);

const PLAN_BEFORE_HTML = `<p>I've put together a six-step strategy plan for your summer campaign. Review the steps below and click <strong>Start</strong> when you're ready to run it.</p>`;
const PLAN_BEFORE_CHUNKS = toStreamChunks(PLAN_BEFORE_HTML);

type CampaignRow = { key: string; channel: string; platform: string; impressions: string; reach: string; frequency: string; clicks: string; ctr: string; cpc: string; cpm: string; conversions: string; cvr: string; spend: string; budget: string; roas: string; status: "active" | "paused" | "ended" };

const CAMPAIGN_TABLE_DATA: CampaignRow[] = [
  { key: "1", channel: "Instagram Feed",   platform: "Meta",    impressions: "142,300", reach: "98,400",  frequency: "1.45", clicks: "4,838",  ctr: "3.4%", cpc: "$0.50", cpm: "$16.94", conversions: "382",  cvr: "7.9%", spend: "$2,410", budget: "$3,000", roas: "4.2×", status: "active" },
  { key: "2", channel: "Facebook Feed",    platform: "Meta",    impressions: "98,700",  reach: "71,200",  frequency: "1.39", clicks: "2,073",  ctr: "2.1%", cpc: "$0.89", cpm: "$18.64", conversions: "148",  cvr: "7.1%", spend: "$1,840", budget: "$2,500", roas: "3.1×", status: "active" },
  { key: "3", channel: "TikTok In-Feed",   platform: "TikTok",  impressions: "210,500", reach: "185,300", frequency: "1.14", clicks: "11,998", ctr: "5.7%", cpc: "$0.27", cpm: "$15.20", conversions: "1,044",cvr: "8.7%", spend: "$3,200", budget: "$4,000", roas: "5.8×", status: "active" },
  { key: "4", channel: "Google Search",    platform: "Google",  impressions: "67,200",  reach: "67,200",  frequency: "1.00", clicks: "3,494",  ctr: "5.2%", cpc: "$1.17", cpm: "$61.01", conversions: "490",  cvr: "14.0%",spend: "$4,100", budget: "$4,500", roas: "6.3×", status: "paused" },
  { key: "5", channel: "YouTube Pre-roll", platform: "Google",  impressions: "88,900",  reach: "54,100",  frequency: "1.64", clicks: "1,245",  ctr: "1.4%", cpc: "$1.25", cpm: "$17.55", conversions: "62",   cvr: "5.0%", spend: "$1,560", budget: "$2,000", roas: "2.4×", status: "ended"  },
  { key: "6", channel: "Pinterest Ads",    platform: "Pinterest",impressions: "54,300",  reach: "48,900",  frequency: "1.11", clicks: "980",    ctr: "1.8%", cpc: "$0.72", cpm: "$12.98", conversions: "74",   cvr: "7.6%", spend: "$706",  budget: "$1,000", roas: "3.4×", status: "active" },
  { key: "7", channel: "Snapchat Story",   platform: "Snapchat",impressions: "76,400",  reach: "70,200",  frequency: "1.09", clicks: "2,140",  ctr: "2.8%", cpc: "$0.41", cpm: "$11.52", conversions: "163",  cvr: "7.6%", spend: "$880",  budget: "$1,200", roas: "3.7×", status: "active" },
];

const STATUS_COLOR: Record<CampaignRow["status"], string> = {
  active: "var(--text-success-default)",
  paused: "var(--text-warning-default)",
  ended:  "var(--text-neutral-secondary-default)",
};

const CAMPAIGN_TABLE_COLUMNS: ColumnDef<CampaignRow>[] = [
  { key: "channel",     title: "Channel",      width: 160, fixed: "left", render: (_, r) => <DataCellContent title={r.channel} description={r.platform} /> },
  { key: "status",      title: "Status",       width: 90,  render: (_, r) => <DataCellContent title={r.status.charAt(0).toUpperCase() + r.status.slice(1)} trailing={<span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[r.status], flexShrink: 0 }} />} /> },
  { key: "impressions", title: "Impressions",  width: 110, render: (_, r) => <DataCellContent title={r.impressions} textAlignment="right" cellAlignment="right" /> },
  { key: "reach",       title: "Reach",        width: 100, render: (_, r) => <DataCellContent title={r.reach} textAlignment="right" cellAlignment="right" /> },
  { key: "frequency",   title: "Frequency",    width: 95,  render: (_, r) => <DataCellContent title={r.frequency} textAlignment="right" cellAlignment="right" /> },
  { key: "clicks",      title: "Clicks",       width: 90,  render: (_, r) => <DataCellContent title={r.clicks} textAlignment="right" cellAlignment="right" /> },
  { key: "ctr",         title: "CTR",          width: 70,  render: (_, r) => <DataCellContent title={r.ctr} textAlignment="right" cellAlignment="right" /> },
  { key: "cpc",         title: "CPC",          width: 80,  render: (_, r) => <DataCellContent title={r.cpc} textAlignment="right" cellAlignment="right" /> },
  { key: "cpm",         title: "CPM",          width: 80,  render: (_, r) => <DataCellContent title={r.cpm} textAlignment="right" cellAlignment="right" /> },
  { key: "conversions", title: "Conversions",  width: 110, render: (_, r) => <DataCellContent title={r.conversions} textAlignment="right" cellAlignment="right" /> },
  { key: "cvr",         title: "CVR",          width: 70,  render: (_, r) => <DataCellContent title={r.cvr} textAlignment="right" cellAlignment="right" /> },
  { key: "spend",       title: "Spend",        width: 90,  render: (_, r) => <DataCellContent title={r.spend} textAlignment="right" cellAlignment="right" /> },
  { key: "budget",      title: "Budget",       width: 90,  render: (_, r) => <DataCellContent title={r.budget} textAlignment="right" cellAlignment="right" /> },
  { key: "roas",        title: "ROAS",         width: 80,  render: (_, r) => <DataCellContent title={r.roas} textAlignment="right" cellAlignment="right" /> },
];

const CHART_AFTER_HTML = `<p>Overall the metric is up roughly <strong>18%</strong> from the start of the period. The dip around day 14 correlates with a known campaign pause — performance recovered within three days. If you'd like a breakdown by segment or a comparison against a benchmark, just ask.</p>`;

const CHART_BEFORE_CHUNKS = toStreamChunks(CHART_BEFORE_HTML);
const CHART_AFTER_HTML_STATIC = CHART_AFTER_HTML;

function CampaignTableWithFade() {
  const tableRef = useRef<HTMLDivElement>(null);
  const { showStart, showEnd, onScroll } = useScrollFade(tableRef, "horizontal");

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <DataTable
        ref={tableRef}
        columns={CAMPAIGN_TABLE_COLUMNS}
        dataSource={CAMPAIGN_TABLE_DATA}
        density="sm"
        rowKey="key"
        style={{ width: "100%" }}
      />
      {showStart && (
        <div aria-hidden="true" style={{
          position: "absolute", top: 0, bottom: 0, left: 0, width: 40, pointerEvents: "none",
          background: "linear-gradient(to right, var(--element-surface-over), transparent)",
        }} />
      )}
      {showEnd && (
        <div aria-hidden="true" style={{
          position: "absolute", top: 0, bottom: 0, right: 0, width: 40, pointerEvents: "none",
          background: "linear-gradient(to left, var(--element-surface-over), transparent)",
        }} />
      )}
    </div>
  );
}

/* ── Chart response slot ─────────────────────────────────────── */

interface ChartDataPoint { date: Date; value: number; }

function generateLineData(points: number, base: number, volatility: number): ChartDataPoint[] {
  const now = new Date();
  let value = base;
  return Array.from({ length: points }, (_, i) => {
    value += (Math.random() - 0.45) * volatility;
    value = Math.max(0, value);
    return { date: new Date(now.getTime() - (points - i) * 24 * 60 * 60 * 1000), value: Math.round(value * 100) / 100 };
  });
}

function ChartSlot() {
  const data = useMemo(() => generateLineData(30, 100, 12), []);
  const series = useMemo<LineSeries<ChartDataPoint>[]>(() => [{
    id: "metric",
    label: "Metric",
    data,
    color: "var(--text-neutral-primary)",
  }], [data]);

  return (
    <LineChart
      series={series}
      xAccessor={(d) => d.date}
      yAccessor={(d) => d.value}
      curve={curveMonotoneX}
      edgeFade
      showXGrid={false}
      height={240}
      showLegend={false}
    />
  );
}

/* ── Plan test task ──────────────────────────────────────────── */

const PLAN_STEPS: {
  title: string;
  description: string;
  expandable?: boolean;
  detail?: string;
}[] = [
  {
    title: "Analyse current campaign performance",
    description: "Review ROAS, CTR, and spend efficiency across all active placements.",
    expandable: true,
    detail: "Pull the last 30-day report for Meta, TikTok, and Google. Flag any channel with ROAS below 3× or CTR below 1.5% for review.",
  },
  {
    title: "Identify high-value audience segments",
    description: "Use first-party data to surface segments with the highest conversion rate.",
    expandable: true,
    detail: "Cross-reference purchase history with lookalike expansion. Prioritise the 25–34 age band and retargeting pools above 10k users.",
  },
  {
    title: "Define channel mix and budget allocation",
    description: "Distribute budget based on projected ROAS per channel.",
  },
  {
    title: "Draft creative briefs per channel",
    description: "Write format-specific briefs for static, video, and story placements.",
    expandable: true,
    detail: "Each brief should include: hook (first 3 seconds), key message, CTA, aspect ratio, and max duration. Align tone to segment persona.",
  },
  {
    title: "Set up A/B test variants",
    description: "Create two variants per placement — one control, one challenger.",
  },
  {
    title: "Define KPIs and success metrics",
    description: "Set primary (ROAS, CVR) and secondary (CPM, frequency) targets before launch.",
  },
];

export interface PlanTestTaskHandle {
  startEdit: () => void;
  cancelEdit: () => void;
  markEdited: () => void;
}

const PlanTestTask = forwardRef<PlanTestTaskHandle, { onEdit?: () => void }>(
  ({ onEdit }, ref) => {
    const [status, setStatus] = useState<"idle" | "running" | "cancelled" | "completed" | "editing" | "edited">("idle");
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

    useImperativeHandle(ref, () => ({
      startEdit: () => setStatus("editing"),
      cancelEdit: () => setStatus("idle"),
      markEdited: () => setStatus("edited"),
    }));

    const handleEdit = () => {
      setStatus("editing");
      onEdit?.();
    };

    const handleStart = () => {
      setStatus("running");
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          const next = p + 2;
          if (next >= 100) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setStatus("completed");
            return 100;
          }
          return next;
        });
      }, 80);
    };

    const handleStop = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setStatus("idle");
    };

    const handleCancel = () => {
      handleStop();
      setProgress(0);
      setStatus("cancelled");
    };

    return (
      <CotContainer
        type="task"
        title="Campaign Strategy Plan"
        defaultExpanded
        status={status}
        progress={progress}
        onStart={status === "idle" ? handleStart : undefined}
        onStop={status === "running" ? handleStop : undefined}
        onCancel={status === "idle" ? handleCancel : undefined}
        onEdit={status === "idle" ? handleEdit : undefined}
      >
        <Cot>
          {PLAN_STEPS.map((step, i) => (
            <CotItem
              key={step.title}
              variant="todo"
              title={step.title}
              description={step.description}
              expandable={step.expandable}
              status={
                status === "completed" ? "complete"
                : status === "running" && progress >= ((i + 1) / PLAN_STEPS.length) * 100 ? "complete"
                : "idle"
              }
            >
              {step.detail && (
                <BodyText size="sm" emphasis="medium">{step.detail}</BodyText>
              )}
            </CotItem>
          ))}
        </Cot>
      </CotContainer>
    );
  }
);

/* ── Context menu data ───────────────────────────────────────── */

const SUGGESTED_ITEMS: ContextMenuSuggestedItem[] = [
  { id: "ws-1", icon: "Meta_color", label: "Summer 2026 - Run BMW", subtitle: "Workspace" },
  { id: "camp-1", icon: "campaign_alt", label: "Campaign_1209", subtitle: "in Summer 2026 - Run BMW" },
  { id: "camp-2", icon: "campaign_alt", label: "Campaign_freq", subtitle: "in Summer 2026 - Run BMW" },
];

const CATEGORIES: ContextMenuCategory[] = [
  { id: "campaigns", icon: "campaign_alt", label: "Campaigns", onSelect: () => {}, drillLevel: { items: [
    { id: "c-1", icon: "campaign_alt", label: "Summer 2026 - Run BMW", onSelect: () => {} },
    { id: "c-2", icon: "campaign_alt", label: "Campaign_1209", onSelect: () => {} },
    { id: "c-3", icon: "campaign_alt", label: "Campaign_freq", onSelect: () => {} },
  ]}},
  { id: "catalogs", icon: "shopping_cart", label: "Catalogs", onSelect: () => {} },
  { id: "projects", icon: "folder", label: "Projects", onSelect: () => {}, drillLevel: { items: [
    { id: "p-1", icon: "folder", label: "Alpha Project", onSelect: () => {} },
    { id: "p-2", icon: "folder", label: "Beta Launch", onSelect: () => {} },
  ]}},
  { id: "reports", icon: "reporting", label: "Reports", onSelect: () => {} },
];

function ContextMenuWithAdd(props: {
  query: string;
  onClose: () => void;
  onAccept: () => void;
  activeIndex: number;
  setItemCount: (n: number) => void;
  registerPickHandler: (fn: () => void) => void;
  menuId: string;
}) {
  const { addContextItem } = usePromptInput();

  const add = (id: string, icon: PromptInputContextItem["icon"], label: string) => {
    addContextItem({ id, icon, label });
    props.onAccept();
  };

  const categories: ContextMenuCategory[] = CATEGORIES.map((cat) => ({
    ...cat,
    onSelect: () => add(cat.id, cat.icon as PromptInputContextItem["icon"], cat.label),
    drillLevel: cat.drillLevel ? {
      items: cat.drillLevel.items.map((item) => ({
        ...item,
        onSelect: () => add(item.id, item.icon as PromptInputContextItem["icon"], item.label),
      })),
    } : undefined,
  }));

  return (
    <PromptInputContextMenu
      query={props.query}
      activeIndex={props.activeIndex}
      setItemCount={props.setItemCount}
      registerPickHandler={props.registerPickHandler}
      menuId={props.menuId}
      suggestedItems={SUGGESTED_ITEMS}
      onSelectSuggested={(item) => add(item.id, item.icon as PromptInputContextItem["icon"], item.label)}
      categories={categories}
    />
  );
}

const TRIGGER_MENUS: PromptInputTriggerConfig[] = [
  { char: "/" },
  { char: "@", renderContent: (props) => <ContextMenuWithAdd {...props} /> },
];

/* ── Recommendations data ────────────────────────────────────── */

const RECOMMENDATIONS: RecommendationItem[] = [
  { id: "r1", label: "Summarise campaign performance", onSelect: () => {} },
  { id: "r2", label: "Generate ad copy for Q4", onSelect: () => {} },
  { id: "r3", label: "Compare last two campaigns", onSelect: () => {} },
  { id: "r4", label: "Suggest budget optimisations", onSelect: () => {} },
  { id: "r5", label: "Draft a weekly report", onSelect: () => {} },
];

const INFO_TYPE_OPTIONS: { value: PromptInputInfoType; label: string }[] = [
  { value: "edit", label: "Edit" },
  { value: "error", label: "Error" },
  { value: "warning", label: "Warning" },
  { value: "length-limit", label: "Length limit" },
  { value: "cook-book", label: "Cook-book" },
];

/* ── Shopping option input ───────────────────────────────────── */

const SHOPPING_CATEGORIES = ["Grocery", "Clothing", "Electronics", "Home & Garden", "Sports"];

const CATEGORY_ITEMS: Record<string, string[]> = {
  Grocery: ["Potato", "Banana", "Meat", "Milk", "Bread"],
  Electronics: ["Speaker", "Headphones", "Laptop", "Phone", "TV"],
  Clothing: ["Shirt", "Jeans", "Shoes", "Jacket"],
  "Home & Garden": ["Tools", "Plants", "Furniture", "Lighting"],
  Sports: ["Running shoes", "Gym equipment", "Yoga mat", "Bicycle"],
};

function ShoppingMultiOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  const { optionsDisabled } = usePromptOptionInput();
  return (
    <MultiSelectOption
      labelText={label}
      checked={checked}
      disabled={optionsDisabled}
      description={false}
      onChange={onChange}
    />
  );
}

/* ── Shopping plan task ──────────────────────────────────────── */

function ShoppingPlanTask({ categories, items }: { categories: string[]; items: string[] }) {
  const [status, setStatus] = useState<"idle" | "running" | "cancelled" | "completed">("idle");
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const steps = [
    `Organise ${categories.length > 0 ? categories.join(" & ") : "shopping"} list`,
    items.length > 0 ? `Find best prices for ${items.slice(0, 3).join(", ")}` : "Research product options",
    "Compare stores and availability",
    "Generate optimised shopping route",
  ];

  const handleStart = () => {
    setStatus("running");
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + 2;
        if (next >= 100) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setStatus("completed");
          return 100;
        }
        return next;
      });
    }, 80);
  };

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setStatus("idle");
  };

  const handleCancel = () => {
    handleStop();
    setProgress(0);
    setStatus("cancelled");
  };

  return (
    <CotContainer
      type="task"
      title="Shopping Plan"
      defaultExpanded
      status={status}
      progress={progress}
      onStart={status === "idle" ? handleStart : undefined}
      onStop={handleStop}
      onCancel={status === "idle" ? handleCancel : undefined}
      onEdit={status === "idle" ? handleCancel : undefined}
    >
      <Cot>
        {steps.map((step, i) => (
          <CotItem
            key={step}
            variant="todo"
            title={step}
            status={
              status === "completed" ? "complete"
              : status === "running" && progress >= ((i + 1) / steps.length) * 100 ? "complete"
              : "idle"
            }
          />
        ))}
      </Cot>
    </CotContainer>
  );
}

/* ── Playground ──────────────────────────────────────────────── */

export default function AiThreadPlayground() {
  const [messages, setMessages] = useState<AiThreadMessage[]>([]);
  const [generating, setGenerating] = useState(false);
  const [promptHeight, setPromptHeight] = useState(0);

  // Option input state
  const [showOptionInput, setShowOptionInput] = useState(false);
  const [optionStep, setOptionStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [step1Custom, setStep1Custom] = useState("");
  const [step2Custom, setStep2Custom] = useState("");

  // Controls
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(false);
  const [infoType, setInfoType] = useState<PromptInputInfoType>("edit");

  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const editingPlanIdRef = useRef<string | null>(null);
  const planRefsMap = useRef<Map<string, RefObject<PlanTestTaskHandle>>>(new Map());

  const threadRef = useRef<AiThreadHandle>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    const el = promptRef.current;
    if (!el) return;
    setPromptHeight(el.getBoundingClientRect().height);
    const ro = new ResizeObserver(([entry]) => setPromptHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);
  }, []);

  const stopGeneration = useCallback((assistId: string, currentText: string) => {
    if (loadingTimerRef.current) { clearTimeout(loadingTimerRef.current); loadingTimerRef.current = null; }
    if (streamTimerRef.current) { clearInterval(streamTimerRef.current); streamTimerRef.current = null; }
    activeIdRef.current = null;
    setGenerating(false);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistId
          ? { ...m, phase: "done" as const, copyValue: currentText || undefined, showFeedback: true }
          : m,
      ),
    );
  }, []);

  const handleStop = useCallback(() => {
    const assistId = activeIdRef.current;
    if (!assistId) return;
    setMessages((prev) => {
      const msg = prev.find((m) => m.id === assistId);
      const currentText = msg?.role === "assistant" ? (msg.text ?? "") : "";
      stopGeneration(assistId, currentText);
      return prev;
    });
  }, [stopGeneration]);

  const handlePlanEditStart = useCallback((planAssistId: string) => {
    setEditingPlanId(planAssistId);
    editingPlanIdRef.current = planAssistId;
    promptRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus();
  }, []);

  const handleCancelEdit = useCallback(() => {
    const id = editingPlanIdRef.current;
    if (id) planRefsMap.current.get(id)?.current?.cancelEdit();
    setEditingPlanId(null);
    editingPlanIdRef.current = null;
  }, []);

  const handleSubmit = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const capturedEditId = editingPlanIdRef.current;
    if (capturedEditId) {
      setEditingPlanId(null);
      editingPlanIdRef.current = null;
    }

    const userId = crypto.randomUUID();
    const assistId = crypto.randomUUID();
    activeIdRef.current = assistId;

    setGenerating(true);
    flushSync(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: userId,
          role: "user" as const,
          message: trimmed,
          ...(capturedEditId ? { replyLabel: "Editing plan" } : {}),
        },
        { id: assistId, role: "assistant" as const, phase: "loading" as const },
      ]);
    });
    threadRef.current?.scrollToMessage(userId, "smooth");

    if (capturedEditId) {
      loadingTimerRef.current = setTimeout(() => {
        loadingTimerRef.current = null;
        if (activeIdRef.current !== assistId) return;
        setMessages((prev) => prev.map((m) => (m.id === assistId ? { ...m, phase: "generating" as const } : m)));
        let idx = 0;
        streamTimerRef.current = setInterval(() => {
          if (activeIdRef.current !== assistId) { clearInterval(streamTimerRef.current!); streamTimerRef.current = null; return; }
          if (idx >= PLAN_BEFORE_CHUNKS.length) {
            clearInterval(streamTimerRef.current!);
            streamTimerRef.current = null;
            activeIdRef.current = null;
            setGenerating(false);
            planRefsMap.current.get(capturedEditId)?.current?.markEdited();
            const planRef = createRef<PlanTestTaskHandle>();
            planRefsMap.current.set(assistId, planRef);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistId
                  ? { ...m, phase: "done" as const, showFeedback: true, slot: <PlanTestTask ref={planRef} onEdit={() => handlePlanEditStart(assistId)} /> }
                  : m,
              ),
            );
            return;
          }
          idx++;
          setMessages((prev) => prev.map((m) => m.id === assistId ? { ...m, text: PLAN_BEFORE_CHUNKS.slice(0, idx).join("") } : m));
        }, 40);
      }, 1200);
      return;
    }

    if (trimmed.toLowerCase().startsWith("chart test")) {
      loadingTimerRef.current = setTimeout(() => {
        loadingTimerRef.current = null;
        if (activeIdRef.current !== assistId) return;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistId ? { ...m, phase: "generating" as const } : m)),
        );
        let idx = 0;
        streamTimerRef.current = setInterval(() => {
          if (activeIdRef.current !== assistId) {
            clearInterval(streamTimerRef.current!);
            streamTimerRef.current = null;
            return;
          }
          if (idx >= CHART_BEFORE_CHUNKS.length) {
            clearInterval(streamTimerRef.current!);
            streamTimerRef.current = null;
            activeIdRef.current = null;
            setGenerating(false);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistId
                  ? {
                      ...m,
                      phase: "done" as const,
                      showFeedback: true,
                      slot: (
                        <>
                          <ChartSlot />
                          <ResponseBody html={CHART_AFTER_HTML_STATIC} />
                        </>
                      ),
                    }
                  : m,
              ),
            );
            return;
          }
          idx++;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistId ? { ...m, text: CHART_BEFORE_CHUNKS.slice(0, idx).join("") } : m,
            ),
          );
        }, 40);
      }, 1200);
      return;
    }

    if (trimmed.toLowerCase().startsWith("table test")) {
      loadingTimerRef.current = setTimeout(() => {
        loadingTimerRef.current = null;
        if (activeIdRef.current !== assistId) return;
        setMessages((prev) => prev.map((m) => (m.id === assistId ? { ...m, phase: "generating" as const } : m)));
        let idx = 0;
        streamTimerRef.current = setInterval(() => {
          if (activeIdRef.current !== assistId) { clearInterval(streamTimerRef.current!); streamTimerRef.current = null; return; }
          if (idx >= TABLE_BEFORE_CHUNKS.length) {
            clearInterval(streamTimerRef.current!);
            streamTimerRef.current = null;
            activeIdRef.current = null;
            setGenerating(false);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistId
                  ? {
                      ...m,
                      phase: "done" as const,
                      showFeedback: true,
                      slot: (
                        <AiGeneration
                          title="Campaign Performance"
                          description="Summer Campaign · Paid Social"
                          paddingTop="md"
                          paddingBottom="md"
                        >
                          <CampaignTableWithFade />
                        </AiGeneration>
                      ),
                    }
                  : m,
              ),
            );
            return;
          }
          idx++;
          setMessages((prev) => prev.map((m) => m.id === assistId ? { ...m, text: TABLE_BEFORE_CHUNKS.slice(0, idx).join("") } : m));
        }, 40);
      }, 1200);
      return;
    }

    if (trimmed.toLowerCase().startsWith("plan test")) {
      loadingTimerRef.current = setTimeout(() => {
        loadingTimerRef.current = null;
        if (activeIdRef.current !== assistId) return;
        setMessages((prev) => prev.map((m) => (m.id === assistId ? { ...m, phase: "generating" as const } : m)));
        let idx = 0;
        streamTimerRef.current = setInterval(() => {
          if (activeIdRef.current !== assistId) { clearInterval(streamTimerRef.current!); streamTimerRef.current = null; return; }
          if (idx >= PLAN_BEFORE_CHUNKS.length) {
            clearInterval(streamTimerRef.current!);
            streamTimerRef.current = null;
            activeIdRef.current = null;
            setGenerating(false);
            const planRef = createRef<PlanTestTaskHandle>();
            planRefsMap.current.set(assistId, planRef);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistId
                  ? { ...m, phase: "done" as const, showFeedback: true, slot: <PlanTestTask ref={planRef} onEdit={() => handlePlanEditStart(assistId)} /> }
                  : m,
              ),
            );
            return;
          }
          idx++;
          setMessages((prev) => prev.map((m) => m.id === assistId ? { ...m, text: PLAN_BEFORE_CHUNKS.slice(0, idx).join("") } : m));
        }, 40);
      }, 1200);
      return;
    }

    if (trimmed.toLowerCase().startsWith("shopping")) {
      const SHOPPING_HTML = `<p>Sure! What kind of shopping are you looking to do? Pick a category below.</p>`;
      const shoppingChunks = toStreamChunks(SHOPPING_HTML);
      loadingTimerRef.current = setTimeout(() => {
        loadingTimerRef.current = null;
        if (activeIdRef.current !== assistId) return;
        setMessages((prev) => prev.map((m) => (m.id === assistId ? { ...m, phase: "generating" as const } : m)));
        let idx = 0;
        streamTimerRef.current = setInterval(() => {
          if (activeIdRef.current !== assistId) { clearInterval(streamTimerRef.current!); streamTimerRef.current = null; return; }
          if (idx >= shoppingChunks.length) {
            clearInterval(streamTimerRef.current!);
            streamTimerRef.current = null;
            activeIdRef.current = null;
            setGenerating(false);
            setMessages((prev) => prev.map((m) => m.id === assistId ? { ...m, phase: "done" as const, text: SHOPPING_HTML } : m));
            setOptionStep(1);
            setSelectedCategories([]);
            setSelectedItems([]);
            setStep1Custom("");
            setStep2Custom("");
            setShowOptionInput(true);
            return;
          }
          idx++;
          setMessages((prev) => prev.map((m) => m.id === assistId ? { ...m, text: shoppingChunks.slice(0, idx).join("") } : m));
        }, 40);
      }, 1200);
      return;
    }

    const chunks = trimmed.toLowerCase().startsWith("long test") ? LONG_CHUNKS : SHORT_CHUNKS;

    loadingTimerRef.current = setTimeout(() => {
      loadingTimerRef.current = null;
      if (activeIdRef.current !== assistId) return;

      setMessages((prev) =>
        prev.map((m) => (m.id === assistId ? { ...m, phase: "generating" as const } : m)),
      );

      let idx = 0;
      streamTimerRef.current = setInterval(() => {
        if (activeIdRef.current !== assistId) {
          clearInterval(streamTimerRef.current!);
          streamTimerRef.current = null;
          return;
        }
        if (idx >= chunks.length) {
          clearInterval(streamTimerRef.current!);
          streamTimerRef.current = null;
          activeIdRef.current = null;
          setGenerating(false);
          const fullText = chunks.join("");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistId
                ? { ...m, phase: "done" as const, text: fullText, copyValue: fullText, showFeedback: true }
                : m,
            ),
          );
          return;
        }
        idx++;
        const partialText = chunks.slice(0, idx).join("");
        setMessages((prev) =>
          prev.map((m) => (m.id === assistId ? { ...m, text: partialText } : m)),
        );
      }, 40);
    }, 1200);
  }, []);

  const handleOptionNext = useCallback(() => {
    setSelectedItems([]);
    setStep2Custom("");
    setOptionStep(2);
  }, []);

  const handleOptionSubmit = useCallback(() => {
    setShowOptionInput(false);

    // Build natural language summary
    const categoryList = selectedCategories.length > 0
      ? selectedCategories.map((c) => c.toLowerCase()).join(", ")
      : step1Custom;
    const itemParts: string[] = [];
    if (selectedItems.length > 0) itemParts.push(selectedItems.map((i) => i.toLowerCase()).join(", "));
    if (step2Custom) itemParts.push(step2Custom);
    const itemList = itemParts.join(" and ");

    let userText = `I'd like to go ${categoryList} shopping`;
    if (itemList) userText += `, specifically looking for ${itemList}`;
    userText += ".";

    const userId = crypto.randomUUID();
    const assistId = crypto.randomUUID();
    activeIdRef.current = assistId;

    setGenerating(true);
    flushSync(() => {
      setMessages((prev) => [
        ...prev,
        { id: userId, role: "user" as const, message: userText },
        { id: assistId, role: "assistant" as const, phase: "loading" as const },
      ]);
    });
    threadRef.current?.scrollToMessage(userId, "smooth");

    const responseHtml = `<p>I'll create a personalised shopping plan for you${itemList ? `, covering ${itemList}` : ""}. Review the steps below and start when you're ready.</p>`;
    const responseChunks = toStreamChunks(responseHtml);
    const capturedCategories = selectedCategories.slice();
    const capturedItems = selectedItems.slice();
    loadingTimerRef.current = setTimeout(() => {
      loadingTimerRef.current = null;
      if (activeIdRef.current !== assistId) return;
      setMessages((prev) => prev.map((m) => (m.id === assistId ? { ...m, phase: "generating" as const } : m)));
      let idx = 0;
      streamTimerRef.current = setInterval(() => {
        if (activeIdRef.current !== assistId) { clearInterval(streamTimerRef.current!); streamTimerRef.current = null; return; }
        if (idx >= responseChunks.length) {
          clearInterval(streamTimerRef.current!);
          streamTimerRef.current = null;
          activeIdRef.current = null;
          setGenerating(false);
          setMessages((prev) => prev.map((m) =>
            m.id === assistId ? {
              ...m,
              phase: "done" as const,
              text: responseHtml,
              showFeedback: true,
              slot: <ShoppingPlanTask categories={capturedCategories} items={capturedItems} />,
            } : m,
          ));
          return;
        }
        idx++;
        setMessages((prev) => prev.map((m) => m.id === assistId ? { ...m, text: responseChunks.slice(0, idx).join("") } : m));
      }, 40);
    }, 1200);
  }, [selectedCategories, selectedItems, step1Custom, step2Custom]);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>

      {/* ── Controls bar ── */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "8px 20px",
        borderBottom: "1px solid var(--element-outline-neutral-default)",
        background: "var(--element-surface-default)",
        zIndex: 20,
      }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={showRecommendations}
            onChange={(e) => setShowRecommendations(e.target.checked)}
          />
          Recommendations
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={showInfoBanner}
            onChange={(e) => setShowInfoBanner(e.target.checked)}
          />
          Info Banner
        </label>

        <select
          value={infoType}
          onChange={(e) => setInfoType(e.target.value as PromptInputInfoType)}
          style={{ fontSize: 12, padding: "2px 6px", borderRadius: 4, border: "1px solid var(--element-outline-neutral-default)" }}
        >
          {INFO_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Thread + PromptInput ── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AiThread
          ref={threadRef}
          messages={messages}
          bottomOffset={promptHeight}
          style={{ position: "absolute", inset: 0 }}
        />

        <div
          ref={promptRef}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 0 var(--spacing-xl)" }}>
            {showOptionInput ? (
              optionStep === 1 ? (
                <PromptOptionInput
                  label="What kind of shopping?"
                  steps={{ current: 1, total: 2 }}
                  hasValue={selectedCategories.length > 0 || step1Custom.length > 0}
                  isLastStep={false}
                  onClose={() => setShowOptionInput(false)}
                  onSkip={handleOptionNext}
                  onSubmit={handleOptionNext}
                  input={{ value: step1Custom, onChange: setStep1Custom, placeholder: "Or describe your own…" }}
                >
                  {SHOPPING_CATEGORIES.map((cat) => (
                    <ShoppingMultiOption
                      key={cat}
                      label={cat}
                      checked={selectedCategories.includes(cat)}
                      onChange={() => setSelectedCategories((prev) =>
                        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                      )}
                    />
                  ))}
                </PromptOptionInput>
              ) : (
                <PromptOptionInput
                  label="What are you looking for?"
                  steps={{ current: 2, total: 2, onPrev: () => setOptionStep(1) }}
                  hasValue={selectedItems.length > 0 || step2Custom.length > 0}
                  isLastStep
                  onClose={() => setShowOptionInput(false)}
                  onSkip={handleOptionSubmit}
                  onSubmit={handleOptionSubmit}
                  input={{ value: step2Custom, onChange: setStep2Custom, placeholder: "Or describe specific items…" }}
                >
                  {[...new Set(selectedCategories.flatMap((c) => CATEGORY_ITEMS[c] ?? []))].map((item) => (
                    <ShoppingMultiOption
                      key={item}
                      label={item}
                      checked={selectedItems.includes(item)}
                      onChange={() => setSelectedItems((prev) =>
                        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                      )}
                    />
                  ))}
                </PromptOptionInput>
              )
            ) : (
              <PromptInput
                onSubmit={handleSubmit}
                loading={generating}
                onStop={handleStop}
                showContextRow
                onAddContext={() => {}}
                triggerMenus={TRIGGER_MENUS}
              >
                {showRecommendations && (
                  <PromptInputRecommendations
                    items={RECOMMENDATIONS}
                    title="Suggestions"
                    titleIcon={<Icon name="favorite_fill" size={14} />}
                  />
                )}

                {editingPlanId && (
                  <PromptInputInfo
                    type="edit"
                    title="Editing plan"
                    onAction={handleCancelEdit}
                  />
                )}

                {showInfoBanner && !editingPlanId && (
                  <PromptInputInfo
                    type={infoType}
                    title={
                      infoType === "edit" ? "Editing message" :
                      infoType === "error" ? "Something went wrong" :
                      infoType === "warning" ? "Context window nearly full" :
                      infoType === "cook-book" ? "Try a prompt template" :
                      undefined
                    }
                    onClose={["error", "warning"].includes(infoType) ? () => setShowInfoBanner(false) : undefined}
                    onAction={["edit", "cook-book"].includes(infoType) ? () => setShowInfoBanner(false) : undefined}
                  />
                )}

                <PromptInputAttachments />
                <PromptInputTextarea placeholder='Try "test", "long test", "chart test", "table test", "plan test", "shopping", or @ to add context' />
                <PromptInputFooter>
                  <PromptInputFooterStart>
                    <PromptInputAddMenu />
                    <PromptInputToolsButton onClick={() => {}} />
                  </PromptInputFooterStart>
                  <PromptInputSubmit />
                </PromptInputFooter>
              </PromptInput>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
