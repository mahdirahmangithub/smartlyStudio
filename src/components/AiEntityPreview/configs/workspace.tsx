import { IconContainer } from "../../IconContainer";
import { Tag } from "../../Tag";
import type { AiEntityConfig } from "../aiEntityTypes";
import type { IconName } from "../../Icon";

export interface Workspace {
  id: string;
  name: string;
  platform: string;
  campaignCount: number;
  adSetCount: number;
  adCount: number;
}

const PLATFORM_ICON: Record<string, IconName> = {
  Meta:       "Meta_color",
  Google:     "Google_color",
  TikTok:     "TikTok_color",
  YouTube:    "YouTube_color",
  LinkedIn:   "LinkedIn_color",
  Snapchat:   "Snapchat_color",
};

export const WORKSPACE_CONFIG: AiEntityConfig<Workspace> = {
  getKey: (w) => w.id,
  entityIcon: "topic",
  tooltipStyle: { minWidth: 400 },
  single: {
    getTitle: (w) => w.name,
    headerCellContent: { leading: <IconContainer size="sm" name="topic" /> },
    columns: [
      {
        key: "platform",
        getDescription: (w) => w.platform,
        getCellContent: (w) => ({
          leading: <IconContainer size="sm" name={PLATFORM_ICON[w.platform] ?? "campaign_alt"} />,
          description: w.platform,
        }),
      },
      {
        key: "counts",
        getDescription: (w) => `${w.campaignCount} campaigns · ${w.adSetCount} ad sets · ${w.adCount} ads`,
        getCellContent: (w) => ({
          cellAlignment: "right",
          trailing: (
            <span style={{ display: "inline-flex", gap: "var(--spacing-sm)" }}>
              <Tag size="md" variant="neutral" emphasis="low" leadingIcon={<IconContainer size="xs" name="campaign_alt" />} label={String(w.campaignCount)} />
              <Tag size="md" variant="neutral" emphasis="low" leadingIcon={<IconContainer size="xs" name="adset_level" />} label={String(w.adSetCount)} />
              <Tag size="md" variant="neutral" emphasis="low" leadingIcon={<IconContainer size="xs" name="ad_level" />} label={String(w.adCount)} />
            </span>
          ),
        }),
      },
    ],
  },
  multiple: {
    getTitle: (w) => w.name,
    getTitleCellContent: (w) => ({
      leading: <IconContainer size="sm" name="topic" />,
      title: w.name,
    }),
    columns: [
      {
        key: "platform",
        getDescription: (w) => w.platform,
        getCellContent: (w) => ({
          leading: <IconContainer size="sm" name={PLATFORM_ICON[w.platform] ?? "campaign_alt"} />,
        }),
      },
      {
        key: "counts",
        getDescription: (w) => `${w.campaignCount} · ${w.adSetCount} · ${w.adCount}`,
        getCellContent: (w) => ({
          cellAlignment: "right",
          trailing: (
            <span style={{ display: "inline-flex", gap: "var(--spacing-sm)" }}>
              <Tag size="md" variant="neutral" emphasis="low" leadingIcon={<IconContainer size="xs" name="campaign_alt" />} label={String(w.campaignCount)} />
              <Tag size="md" variant="neutral" emphasis="low" leadingIcon={<IconContainer size="xs" name="adset_level" />} label={String(w.adSetCount)} />
              <Tag size="md" variant="neutral" emphasis="low" leadingIcon={<IconContainer size="xs" name="ad_level" />} label={String(w.adCount)} />
            </span>
          ),
        }),
      },
    ],
  },
};
