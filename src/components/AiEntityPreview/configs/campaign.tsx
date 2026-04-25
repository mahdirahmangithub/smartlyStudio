import { IconContainer } from "../../IconContainer";
import { Tag } from "../../Tag";
import type { AiEntityConfig } from "../aiEntityTypes";
import type { IconName } from "../../Icon";

export interface Campaign {
  id: string;
  name: string;
  workspace: string;
  platform: string;
  adAccount: string;
  adSetCount: number;
  adCount: number;
  status: string;
  budget: string;
  channel: string;
  start: string;
}

const PLATFORM_ICON: Record<string, IconName> = {
  Meta:       "Meta_color",
  Google:     "Google_color",
  TikTok:     "TikTok_color",
  YouTube:    "YouTube_color",
  LinkedIn:   "LinkedIn_color",
  Snapchat:   "Snapchat_color",
};

export const CAMPAIGN_CONFIG: AiEntityConfig<Campaign> = {
  getKey: (c) => c.id,
  entityIcon: "campaign_alt",
  getHref: (c) => `/campaigns/${c.id}`,
  tooltipStyle: { minWidth: 400 },
  single: {
    getTitle: (c) => c.name,
    headerCellContent: { leading: <IconContainer size="sm" name="campaign_alt" /> },
    columns: [
      {
        key: "workspace",
        getDescription: (c) => c.workspace,
        getCellContent: (c) => ({
          leading: <IconContainer size="sm" name={PLATFORM_ICON[c.platform] ?? "campaign_alt"} />,
          description: c.workspace,
        }),
      },
      {
        key: "adAccount",
        getDescription: (c) => c.adAccount,
        getCellContent: (c) => ({
          leading: <IconContainer size="sm" name="account_circle" />,
          description: c.adAccount,
        }),
      },
      {
        key: "budget",
        getDescription: (c) => c.budget,
        getCellContent: (c) => ({
          cellAlignment: "right",
          trailing: (
            <span style={{ display: "inline-flex", gap: "var(--spacing-sm)" }}>
              <Tag size="md" variant="neutral" emphasis="low" leadingIcon={<IconContainer size="xs" name="adset_level" />} label={String(c.adSetCount)} />
              <Tag size="md" variant="neutral" emphasis="low" leadingIcon={<IconContainer size="xs" name="ad_level" />} label={String(c.adCount)} />
            </span>
          ),
        }),
      },
    ],
  },
  multiple: {
    getTitle: (c) => c.name,
    getTitleCellContent: (c) => ({
      leading: <IconContainer size="sm" name="campaign_alt" />,
      title: c.name,
    }),
    columns: [
      {
        key: "platform",
        getDescription: (c) => c.platform,
        getCellContent: (c) => ({
          leading: <IconContainer size="sm" name={PLATFORM_ICON[c.platform] ?? "campaign_alt"} />,
        }),
      },
      {
        key: "counts",
        getDescription: (c) => `${c.adSetCount} ad sets · ${c.adCount} ads`,
        getCellContent: (c) => ({
          cellAlignment: "right",
          trailing: (
            <span style={{ display: "inline-flex", gap: "var(--spacing-sm)" }}>
              <Tag size="md" variant="neutral" emphasis="low" leadingIcon={<IconContainer size="xs" name="adset_level" />} label={String(c.adSetCount)} />
              <Tag size="md" variant="neutral" emphasis="low" leadingIcon={<IconContainer size="xs" name="ad_level" />} label={String(c.adCount)} />
            </span>
          ),
        }),
      },
    ],
  },
};
