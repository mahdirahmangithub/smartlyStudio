import { IconContainer } from "../../IconContainer";
import type { AiEntityConfig } from "../aiEntityTypes";
import type { IconName } from "../../Icon";

export interface CampaignField {
  id: string;
  /** Field name shown as the title (e.g. "Objective"). */
  fieldName: string;
  /** Per-field icon chosen by the consumer (e.g. "emoji_flags"). */
  icon: IconName;
  /** Field value shown in the value cell (e.g. "Conversions"). */
  value: string;
  /** Name of the campaign this field belongs to — rendered as "in {campaignName}". */
  campaignName: string;
}

export const CAMPAIGN_FIELD_CONFIG: AiEntityConfig<CampaignField> = {
  getKey: (f) => f.id,
  getEntityIcon: (f) => f.icon,
  tooltipStyle: { minWidth: 400 },
  single: {
    getTitle: (f) => f.fieldName,
    getHeaderCellContent: (f) => ({
      leading: <IconContainer size="sm" name={f.icon} />,
    }),
    columns: [
      {
        key: "value",
        getDescription: (f) => f.value,
      },
      {
        key: "campaign",
        getDescription: (f) => `in ${f.campaignName}`,
        getCellContent: (f) => ({
          leading: <IconContainer size="sm" name="campaign_alt" />,
          description: `in ${f.campaignName}`,
        }),
      },
    ],
  },
  multiple: {
    getTitle: (f) => f.fieldName,
    maxWidth: 520,
    getTitleCellContent: (f) => ({
      leading: <IconContainer size="sm" name={f.icon} />,
      title: f.fieldName,
      description: f.campaignName,
    }),
    columns: [
      {
        key: "value",
        getDescription: (f) => f.value,
        getCellContent: (f) => ({
          description: f.value,
          textAlignment: "right",
          cellAlignment: "right",
        }),
      },
    ],
  },
};
