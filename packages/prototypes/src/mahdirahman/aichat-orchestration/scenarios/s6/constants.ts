import type { Workspace, Campaign } from "@sds/components/AiEntityPreview";

export const S6_LABELS = [
  "Reading workspace structure",
  "Checking Ad accounts",
];

export const S6_PLAN_LABELS = [
  "Checking all available objective",
  "Found sales",
  "Plan to create campaign",
];

/** Synthetic "BMW Meta" workspace surfaced by s-6. The context chip uses
 *  this label, so the inline AiEntityPreview here uses the matching object
 *  rather than reusing one from the WORKSPACES list. */
export const S6_WORKSPACE: Workspace = {
  id: "w-s6",
  name: "BMW Meta",
  platform: "Meta",
  campaignCount: 12,
  adSetCount: 36,
  adCount: 108,
};

export const buildS6Campaign = (adAccountName: string): Campaign => ({
  id: `c-${Date.now()}-s6`,
  name: "New sales campaign in BMW Meta",
  workspace: S6_WORKSPACE.name,
  platform: S6_WORKSPACE.platform,
  adAccount: adAccountName,
  adSetCount: 1,
  adCount: 1,
  status: "Draft",
  budget: "—",
  channel: S6_WORKSPACE.platform,
  start: "Today",
});
