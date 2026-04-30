import { useState, type CSSProperties } from "react";
import {
  AiEntityPreviewTyped,
  AiEntityPreviewMultipleTyped,
  AiEntityPreviewInlineTyped,
  CAMPAIGN_CONFIG,
  CAMPAIGN_FIELD_CONFIG,
  AUDIENCE_CONFIG,
  WORKSPACE_CONFIG,
  KNOWLEDGE_BASE_CONFIG,
  type AiEntityConfig,
  type Campaign,
  type CampaignField,
  type Audience,
  type Workspace,
  type KnowledgeBaseArticle,
} from "../components/AiEntityPreview";
import { AiResponseBubble } from "../components/AiResponseBubble";

/* ── Layout ── */

const wrap: CSSProperties = { maxWidth: 960, margin: "0 auto", padding: "24px 16px" };
const row: CSSProperties = { display: "flex", gap: 16, alignItems: "flex-start" };
const col: CSSProperties = { flex: 1, minWidth: 0 };
const controlBar: CSSProperties = {
  display: "flex", alignItems: "center", gap: 24, marginBottom: 24,
  padding: "12px 16px", borderRadius: 8, flexWrap: "wrap",
};
const label: CSSProperties = { fontSize: 13, display: "flex", alignItems: "center", gap: 8 };

/* ── Sample data ── */

const CAMPAIGNS: Campaign[] = [
  { id: "c-1",  name: "Summer 2026 – Run BMW",  workspace: "BMW Global",      platform: "Meta",     adAccount: "BMW Meta Ads",       adSetCount: 4,  adCount: 12, status: "Active",  budget: "$48,000", channel: "Meta",    start: "Jun 1, 2026" },
  { id: "c-2",  name: "Campaign_1209",           workspace: "BMW Global",      platform: "Google",   adAccount: "BMW Google Ads",     adSetCount: 2,  adCount: 6,  status: "Paused",  budget: "$12,500", channel: "Google",  start: "Mar 15, 2026" },
  { id: "c-3",  name: "Q4 Retargeting",          workspace: "Acme Corp",       platform: "TikTok",   adAccount: "Acme TikTok Biz",    adSetCount: 3,  adCount: 9,  status: "Draft",   budget: "$30,000", channel: "TikTok",  start: "Oct 1, 2026" },
  { id: "c-4",  name: "Spring Brand Awareness",  workspace: "Nike EMEA",       platform: "Meta",     adAccount: "Nike EU Meta",       adSetCount: 6,  adCount: 18, status: "Active",  budget: "$22,000", channel: "Meta",    start: "Apr 1, 2026" },
  { id: "c-5",  name: "Holiday Promo",           workspace: "Acme Corp",       platform: "Google",   adAccount: "Acme Search Ads",    adSetCount: 5,  adCount: 15, status: "Paused",  budget: "$60,000", channel: "Google",  start: "Nov 1, 2026" },
  { id: "c-6",  name: "Loyalty Reactivation",    workspace: "Nike EMEA",       platform: "Meta",     adAccount: "Nike EU Meta",       adSetCount: 1,  adCount: 4,  status: "Active",  budget: "$8,000",  channel: "Email",   start: "Feb 1, 2026" },
  { id: "c-7",  name: "New User Acquisition",    workspace: "BMW Global",      platform: "TikTok",   adAccount: "BMW TikTok",         adSetCount: 3,  adCount: 8,  status: "Draft",   budget: "$35,000", channel: "Meta",    start: "Jul 15, 2026" },
  { id: "c-8",  name: "Retargeting – EMEA",      workspace: "Unilever Brand",  platform: "Google",   adAccount: "Unilever EU Ads",    adSetCount: 2,  adCount: 7,  status: "Active",  budget: "$19,000", channel: "Google",  start: "Mar 1, 2026" },
  { id: "c-9",  name: "Video Push – TikTok",     workspace: "Acme Corp",       platform: "TikTok",   adAccount: "Acme TikTok Biz",    adSetCount: 4,  adCount: 11, status: "Paused",  budget: "$14,000", channel: "TikTok",  start: "May 1, 2026" },
  { id: "c-10", name: "Performance Max – US",    workspace: "Unilever Brand",  platform: "Google",   adAccount: "Unilever US Search", adSetCount: 7,  adCount: 21, status: "Active",  budget: "$55,000", channel: "Google",  start: "Jan 1, 2026" },
  { id: "c-11", name: "Brand Lift – YouTube",    workspace: "Nike EMEA",       platform: "YouTube",  adAccount: "Nike YouTube EU",    adSetCount: 2,  adCount: 5,  status: "Draft",   budget: "$27,000", channel: "YouTube", start: "Aug 1, 2026" },
  { id: "c-12", name: "App Install – Android",   workspace: "BMW Global",      platform: "Meta",     adAccount: "BMW Meta Ads",       adSetCount: 3,  adCount: 10, status: "Active",  budget: "$11,000", channel: "Meta",    start: "Sep 1, 2026" },
];

const AUDIENCES: Audience[] = [
  { id: "a-1", name: "Urban Millennials",     size: "2.4M",  cpm: "$12.50", overlap: "18%", region: "US" },
  { id: "a-2", name: "High-Intent Shoppers",  size: "890K",  cpm: "$18.00", overlap: "9%",  region: "EU" },
  { id: "a-3", name: "Retargeting Pool",      size: "340K",  cpm: "$6.80",  overlap: "42%", region: "US" },
  { id: "a-4", name: "Lookalike – Top 1%",    size: "1.1M",  cpm: "$15.20", overlap: "5%",  region: "US" },
  { id: "a-5", name: "Gen Z – Mobile",        size: "3.2M",  cpm: "$9.40",  overlap: "22%", region: "APAC" },
  { id: "a-6", name: "Affinity – Automotive", size: "760K",  cpm: "$11.70", overlap: "14%", region: "EU" },
  { id: "a-7", name: "CRM Upload – Q1",       size: "210K",  cpm: "$4.20",  overlap: "61%", region: "US" },
  { id: "a-8", name: "Contextual – Sports",   size: "1.8M",  cpm: "$8.90",  overlap: "7%",  region: "US" },
];

/* ── Campaign field sample data ── */

const CAMPAIGN_FIELDS: CampaignField[] = [
  { id: "f-1", fieldName: "Objective",           icon: "emoji_flags",     value: "Conversions",                 campaignName: "Summer 2026 – Run BMW" },
  { id: "f-2", fieldName: "Conversion location", icon: "ads_click",       value: "Website",                     campaignName: "Summer 2026 – Run BMW" },
  { id: "f-3", fieldName: "Optimization event",  icon: "page_info",       value: "Purchase",                    campaignName: "Q4 Retargeting" },
  { id: "f-4", fieldName: "Budget",              icon: "attach_money",    value: "$48,000 lifetime",            campaignName: "Summer 2026 – Run BMW" },
  { id: "f-5", fieldName: "Schedule",            icon: "calendar_clock",  value: "Jun 1 – Aug 31, 2026",        campaignName: "Spring Brand Awareness" },
  { id: "f-6", fieldName: "Targeting",           icon: "target",          value: "US · 18–34 · Auto enthusiasts", campaignName: "Holiday Promo" },
  { id: "f-7", fieldName: "Creative",            icon: "animated_images", value: "12 video assets · 4 statics", campaignName: "Video Push – TikTok" },
];

/* ── Workspace sample data ── */

const WORKSPACES: Workspace[] = [
  { id: "w-1", name: "BMW Global",      platform: "Meta",     campaignCount: 8,  adSetCount: 24, adCount: 72 },
  { id: "w-2", name: "Nike EMEA",       platform: "Google",   campaignCount: 5,  adSetCount: 15, adCount: 45 },
  { id: "w-3", name: "Acme Corp",       platform: "TikTok",   campaignCount: 3,  adSetCount: 9,  adCount: 27 },
  { id: "w-4", name: "Unilever Brand",  platform: "YouTube",  campaignCount: 4,  adSetCount: 12, adCount: 36 },
  { id: "w-5", name: "Snapchat Ads",    platform: "Snapchat", campaignCount: 2,  adSetCount: 6,  adCount: 18 },
];

/* ── Knowledge base sample data ── */

const KNOWLEDGE_BASE_ARTICLES: KnowledgeBaseArticle[] = [
  { id: "kb-1", title: "How to create a Meta workspace",      url: "https://help.smartly.io/articles/how-to-create-a-meta-workspace" },
  { id: "kb-2", title: "Sales objective overview (ODAX)",     url: "https://help.smartly.io/articles/sales-objective-overview" },
  { id: "kb-3", title: "Cloning campaigns across workspaces", url: "https://help.smartly.io/articles/cloning-campaigns" },
  { id: "kb-4", title: "Importing campaigns from CSV",        url: "https://help.smartly.io/articles/importing-campaigns" },
  { id: "kb-5", title: "Conversion windows explained",        url: "https://help.smartly.io/articles/conversion-windows" },
];

/* ── Type registry ── */

type TypeKey = "campaign" | "campaign-field" | "audience" | "workspace" | "knowledge-base";

const REGISTRY: Record<TypeKey, { config: AiEntityConfig<any>; data: any[]; itemName: string; label: string }> = {
  campaign:         { config: CAMPAIGN_CONFIG,        data: CAMPAIGNS,                itemName: "campaigns",       label: "Campaign" },
  "campaign-field": { config: CAMPAIGN_FIELD_CONFIG,  data: CAMPAIGN_FIELDS,          itemName: "campaign fields", label: "Campaign field" },
  audience:         { config: AUDIENCE_CONFIG,        data: AUDIENCES,                itemName: "audiences",       label: "Audience" },
  workspace:        { config: WORKSPACE_CONFIG,       data: WORKSPACES,               itemName: "workspaces",      label: "Workspace" },
  "knowledge-base": { config: KNOWLEDGE_BASE_CONFIG,  data: KNOWLEDGE_BASE_ARTICLES,  itemName: "articles",        label: "Knowledge base" },
};

/* ── Playground ── */

export default function AiEntityPreviewPlayground() {
  const [typeKey, setTypeKey] = useState<TypeKey>("campaign");
  const [hasActions, setHasActions] = useState(false);
  const [showMore, setShowMore] = useState(true);

  const { config, data, itemName } = REGISTRY[typeKey];
  const visibleCount = showMore ? 4 : data.length;
  const actionProps = hasActions
    ? { onEdit: () => {}, onCancel: () => {}, onCreate: () => {} }
    : {};

  return (
    <div style={wrap}>
      <h1 style={{ marginBottom: 16 }}>AiEntityPreview</h1>

      <div style={controlBar}>
        <label style={label}>
          <span>Type</span>
          <select
            value={typeKey}
            onChange={(e) => setTypeKey(e.target.value as TypeKey)}
            style={{ fontSize: 13 }}
          >
            {(Object.keys(REGISTRY) as TypeKey[]).map((k) => (
              <option key={k} value={k}>{REGISTRY[k].label}</option>
            ))}
          </select>
        </label>

        <label style={label}>
          <input
            type="checkbox"
            checked={hasActions}
            onChange={(e) => setHasActions(e.target.checked)}
          />
          Action bar
        </label>

        <label style={label}>
          <input
            type="checkbox"
            checked={showMore}
            onChange={(e) => setShowMore(e.target.checked)}
          />
          Show more
        </label>
      </div>

      <div style={{ marginBottom: 16, fontSize: 14, lineHeight: "24px" }}>
        <p style={{ margin: 0 }}>
          Inline chip for selected type:{" "}
          <AiEntityPreviewInlineTyped config={config} data={data[0]} />
        </p>
      </div>

      <div style={{ marginBottom: 32, maxWidth: 560 }}>
        <AiResponseBubble
          phase="done"
          text={`<p>Based on your brief, I found 3 relevant campaigns. Your top performer is <entity-preview id="c-1" status="Active"></entity-preview>, followed by <entity-preview id="c-4" status="Active"></entity-preview>. Note that <entity-preview id="c-3" status="Draft"></entity-preview> hasn't launched yet and may need your attention before going live.</p>`}
          components={{
            "entity-preview": (attrs) => {
              const campaign = CAMPAIGNS.find((c) => c.id === attrs.id);
              if (!campaign) return null;
              return (
                <AiEntityPreviewInlineTyped
                  config={CAMPAIGN_CONFIG}
                  data={campaign}
                  status={attrs.status}
                />
              );
            },
          }}
          copyValue="Based on your brief..."
          showFeedback
        />
      </div>

      <div style={row}>
        <div style={col}>
          <p style={{ fontSize: 12, opacity: 0.5, marginBottom: 8 }}>Single</p>
          <AiEntityPreviewTyped
            config={config}
            data={data[0]}
            {...actionProps}
          />
        </div>
        <div style={col}>
          <p style={{ fontSize: 12, opacity: 0.5, marginBottom: 8 }}>Multiple</p>
          <AiEntityPreviewMultipleTyped
            config={config}
            data={data}
            itemName={itemName}
            visibleCount={visibleCount}
            {...actionProps}
          />
        </div>
      </div>
    </div>
  );
}
