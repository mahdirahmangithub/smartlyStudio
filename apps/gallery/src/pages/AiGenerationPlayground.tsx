import { useState, useRef, useEffect } from "react";
import { useScrollFade } from "@sds/components/ScrollFade";
import { AiGeneration } from "@sds/components/AiGeneration";
import { IconButton } from "@sds/components/IconButton";
import { Icon } from "@sds/components/Icon";
import { BodyText } from "@sds/components/BodyText";
import { Toggle } from "@sds/components/Toggle";
import { Label } from "@sds/components/Label";
import { CodeBlock } from "@sds/components/CodeBlock";
import { DataTable, type ColumnDef } from "@sds/components/DataTable";
import { DataCellContent } from "@sds/components/DataCellContent";
import { SelectButton } from "@sds/components/SelectButton";

const CONTEXT_TAGS = [
  { id: "campaign", label: "Summer Campaign" },
  { id: "audience", label: "18–34 US" },
  { id: "channel", label: "Paid Social" },
];

type ContentType = "text" | "table" | "code";

type CampaignRow = {
  key: string;
  channel: string;
  platform: string;
  impressions: string;
  clicks: string;
  ctr: string;
  spend: string;
  roas: string;
  status: "active" | "paused" | "ended";
};

const TABLE_DATA: CampaignRow[] = [
  { key: "1", channel: "Instagram Feed",  platform: "Meta",    impressions: "142,300", clicks: "4,838", ctr: "3.4%", spend: "$2,410", roas: "4.2×", status: "active"  },
  { key: "2", channel: "Facebook Feed",   platform: "Meta",    impressions: "98,700",  clicks: "2,073", ctr: "2.1%", spend: "$1,840", roas: "3.1×", status: "active"  },
  { key: "3", channel: "TikTok In-Feed",  platform: "TikTok",  impressions: "210,500", clicks: "11,998",ctr: "5.7%", spend: "$3,200", roas: "5.8×", status: "active"  },
  { key: "4", channel: "Google Search",   platform: "Google",  impressions: "67,200",  clicks: "3,494", ctr: "5.2%", spend: "$4,100", roas: "6.3×", status: "paused"  },
  { key: "5", channel: "YouTube Pre-roll",platform: "Google",  impressions: "88,900",  clicks: "1,245", ctr: "1.4%", spend: "$1,560", roas: "2.4×", status: "ended"   },
];

const STATUS_COLOR: Record<CampaignRow["status"], string> = {
  active: "var(--text-success-default)",
  paused: "var(--text-warning-default)",
  ended:  "var(--text-neutral-secondary-default)",
};

const TABLE_COLUMNS: ColumnDef<CampaignRow>[] = [
  {
    key: "channel",
    title: "Channel",
    width: 160,
    fixed: "left",
    render: (_, row) => (
      <DataCellContent
        title={row.channel}
        description={row.platform}
      />
    ),
  },
  {
    key: "impressions",
    title: "Impressions",
    width: 110,
    render: (_, row) => (
      <DataCellContent title={row.impressions} textAlignment="right" cellAlignment="right" />
    ),
  },
  {
    key: "clicks",
    title: "Clicks",
    width: 90,
    render: (_, row) => (
      <DataCellContent title={row.clicks} textAlignment="right" cellAlignment="right" />
    ),
  },
  {
    key: "ctr",
    title: "CTR",
    width: 70,
    render: (_, row) => (
      <DataCellContent title={row.ctr} textAlignment="right" cellAlignment="right" />
    ),
  },
  {
    key: "spend",
    title: "Spend",
    width: 90,
    render: (_, row) => (
      <DataCellContent title={row.spend} textAlignment="right" cellAlignment="right" />
    ),
  },
  {
    key: "roas",
    title: "ROAS",
    width: 80,
    render: (_, row) => (
      <DataCellContent title={row.roas} textAlignment="right" cellAlignment="right" />
    ),
  },
  {
    key: "status",
    title: "Status",
    width: 90,
    render: (_, row) => (
      <DataCellContent
        title={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        trailing={
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[row.status], flexShrink: 0 }} />
        }
      />
    ),
  },
];

const CODE_SAMPLE = `const campaign = {
  name: "Summer Deals",
  audience: "18–34 US",
  channels: ["instagram", "facebook", "tiktok"],
  budget: 12000,
  startDate: "2026-06-01",
};

export default campaign;`;

function TableWithFade() {
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
        columns={TABLE_COLUMNS}
        dataSource={TABLE_DATA}
        density="sm"
        rowKey="key"
        style={{ width: "100%" }}
      />
      {showStart && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: 0, bottom: 0, left: 0, width: 40,
            pointerEvents: "none",
            background: "linear-gradient(to right, var(--element-surface-over), transparent)",
          }}
        />
      )}
      {showEnd && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: 0, bottom: 0, right: 0, width: 40,
            pointerEvents: "none",
            background: "linear-gradient(to left, var(--element-surface-over), transparent)",
          }}
        />
      )}
    </div>
  );
}

function SlotContent({ type }: { type: ContentType }) {
  if (type === "table") {
    return <TableWithFade />;
  }
  if (type === "code") {
    return (
      <CodeBlock
        code={CODE_SAMPLE}
        title="campaign.ts"
        description="TypeScript"
        showLineNumbers
        size="sm"
      />
    );
  }
  return (
    <BodyText size="md">
      Discover summer deals crafted just for you — because every adventure
      starts with the right gear. Our curated picks match your audience's
      interests and drive higher engagement across paid social channels.
    </BodyText>
  );
}

export default function AiGenerationPlayground() {
  const [active, setActive] = useState(false);
  const [showVersion, setShowVersion] = useState(true);
  const [showContext, setShowContext] = useState(true);
  const [contentType, setContentType] = useState<ContentType>("text");

  return (
    <>
      <h1>AiGeneration</h1>

      <div style={{ display: "flex", gap: 16, marginBottom: 32, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Toggle id="toggle-active" checked={active} onChange={setActive} />
          <Label label="Active" htmlFor="toggle-active" size="sm" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Toggle id="toggle-version" checked={showVersion} onChange={setShowVersion} />
          <Label label="Version indicator" htmlFor="toggle-version" size="sm" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Toggle id="toggle-context" checked={showContext} onChange={setShowContext} />
          <Label label="Context tags" htmlFor="toggle-context" size="sm" />
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          {(["text", "table", "code"] as ContentType[]).map((t) => (
            <SelectButton
              key={t}
              size="sm"
              emphasis={contentType === t ? "medium" : "low"}
              onClick={() => setContentType(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </SelectButton>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480 }}>
        <AiGeneration
          active={active}
          showVersion={showVersion}
          versionNumber={1}
          title="Ad headline"
          description="Paid social · Summer Campaign"
          actions={
            <>
              <IconButton
                size="sm"
                variant="neutral"
                emphasis="low"
                icon={<Icon name="download" size={16} />}
                aria-label="Download"
              />
              <IconButton
                size="sm"
                variant="neutral"
                emphasis="low"
                icon={<Icon name="fullscreen" size={16} />}
                aria-label="Fullscreen"
              />
            </>
          }
          contextTags={showContext ? CONTEXT_TAGS : undefined}
          aria-label="AI-generated ad headline"
        >
          <SlotContent type={contentType} />
        </AiGeneration>
      </div>
    </>
  );
}
