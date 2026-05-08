import type { CampaignField, KnowledgeBaseArticle } from "@sds/components/AiEntityPreview";
import type { RecommendationItem } from "@sds/components/PromptInput";
import type { ReactNode } from "react";

export const LOADING_LABELS = [
  "Thinking...",
  "Loading best tools...",
  "Constructing the plan...",
  "Generating campaign creation plan...",
];

export const WORKSPACE_LOOKUP_LABELS = [
  "Looking for workspace",
  "No exact match",
  "Found similar options",
];

export const EXTRACT_LABELS = [
  "Reading attachment",
  "Analyzing content",
  "Mapping the fields",
  "Creating campaign field entity",
];

export const APPLY_LABELS = [
  "Create a plan to update fields",
  "Get access to Objective",
];

/** KnowledgeBase articles referenced inline in the post-creation guidance.
 *  Order in `KB_SOURCES` drives the inline-chip number — index 0 → "1",
 *  index 1 → "2", etc. — and mirrors the rows in the source list slot. */
export const PUBLISHING_REQUIREMENTS_ARTICLE: KnowledgeBaseArticle = {
  id: "kb-publishing-requirements",
  title: "Publishing requirements",
  url: "https://help.smartly.io/articles/publishing-requirements",
};

export const AUTOMATION_FEEDS_ARTICLE: KnowledgeBaseArticle = {
  id: "kb-automation-feeds",
  title: "Automation Feeds",
  url: "https://help.smartly.io/articles/automation-feeds",
};

export const KB_SOURCES: KnowledgeBaseArticle[] = [
  PUBLISHING_REQUIREMENTS_ARTICLE,
  AUTOMATION_FEEDS_ARTICLE,
];

/** Plan-detail prose shown above the s-1 campaign-creation plan task. */
export const PLAN_DETAILS_CODE = `Campaign Creation Plan

This plan outlines how the campaign will be created within the selected workspace using the chosen ad account, minimizing manual input while ensuring a valid, scalable structure.

⸻

1. Initialize Campaign Shell

The system creates a new campaign entity inside the selected workspace. Core campaign attributes are inferred from prior context when available (objective, platform, optimization goal). If missing, only the critical parameter is requested before creation.

At this stage:

* Campaign name is auto-generated based on naming conventions (objective, audience, date tokens).
* Buying type and objective are set.
* Default optimization settings are applied.

This establishes a valid campaign container without requiring full configuration upfront.

⸻

2. Attach Ad Account

The selected ad account is assigned to the campaign.

This step ensures:

* Platform-specific constraints and features are applied (e.g. Meta structure rules).
* Billing, pixel, and tracking configurations are inherited.
* Available audiences and creatives are scoped correctly.

No additional input is required since the ad account is already selected.

⸻

3. Generate Minimum Viable Structure

The system automatically creates a baseline delivery structure to make the campaign immediately valid and launch-ready.

This includes:

* One ad set with default targeting aligned to the campaign objective
* One ad within the ad set using either:
    * Existing creative assets (if available), or
    * Placeholder creative for later completion

Defaults applied:

* Budget: system-recommended starting point based on objective
* Schedule: starts immediately unless specified otherwise
* Placement: automatic placements
* Bidding strategy: lowest cost or equivalent default

This ensures the campaign can run while allowing iteration later.

⸻

4. Validate and Finalize Structure

Before completion, the system performs a lightweight validation pass:

* Ensures no missing required fields
* Confirms budget and schedule are valid
* Verifies tracking and attribution readiness
* Checks structural integrity (campaign → ad set → ad)

If issues are detected, the system highlights only blocking problems.`;

/** Synthetic field set "extracted" from the user's attachment, anchored to
 *  the just-created campaign for realistic in-bubble rendering. */
export const buildExtractedFields = (campaignName: string): CampaignField[] => [
  { id: "ef-1", fieldName: "Objective",           icon: "emoji_flags",     value: "Conversions",                    campaignName },
  { id: "ef-2", fieldName: "Conversion location", icon: "ads_click",       value: "Website",                        campaignName },
  { id: "ef-3", fieldName: "Optimization event",  icon: "page_info",       value: "Purchase",                       campaignName },
  { id: "ef-4", fieldName: "Budget",              icon: "attach_money",    value: "$48,000 lifetime",               campaignName },
  { id: "ef-5", fieldName: "Schedule",            icon: "calendar_clock",  value: "Jun 1 – Aug 31, 2026",           campaignName },
  { id: "ef-6", fieldName: "Targeting",           icon: "target",          value: "US · 18–34 · Auto enthusiasts",  campaignName },
  { id: "ef-7", fieldName: "Creative",            icon: "animated_images", value: "12 video assets · 4 statics",    campaignName },
];

/** Recommendation chip factory — rendered inside PromptInput at step 6. */
export const buildPostCreationRecommendations = (
  iconFor: (name: string) => ReactNode,
  onAnyClick: () => void,
): RecommendationItem[] => [
  { id: "rec-objective",    label: "Objective",            leadingIcon: iconFor("emoji_flags"),     onSelect: onAnyClick },
  { id: "rec-conversion",   label: "Conversion location",  leadingIcon: iconFor("ads_click"),       onSelect: onAnyClick },
  { id: "rec-optimization", label: "Optimization event",   leadingIcon: iconFor("page_info"),       onSelect: onAnyClick },
  { id: "rec-budget",       label: "Budget",               leadingIcon: iconFor("attach_money"),    onSelect: onAnyClick },
  { id: "rec-schedule",     label: "Schedule",             leadingIcon: iconFor("calendar_clock"),  onSelect: onAnyClick },
  { id: "rec-targeting",    label: "Targeting",            leadingIcon: iconFor("target"),          onSelect: onAnyClick },
  { id: "rec-creative",     label: "Creative",             leadingIcon: iconFor("animated_images"), onSelect: onAnyClick },
];
