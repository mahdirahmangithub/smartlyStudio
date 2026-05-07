import type {
  Campaign,
  CampaignField,
} from "@sds/components/AiEntityPreview";

/** Campaign that's pre-selected in the prompt context. The inline
 *  `<entity-preview id="…">` tag in EDIT_RESPONSE_HTML is bound to this id
 *  via the `components` registration in S8Scenario, so the streamed bubble
 *  renders an `AiEntityPreviewInlineTyped` mid-paragraph with the campaign's
 *  ad-account and ad-set / ad counts surfaced in the hover tooltip. */
export const S8_CAMPAIGN: Campaign = {
  id: "bmw-summer-2026",
  name: "BMW-Summer-2026",
  workspace: "WS Meta summer sale",
  platform: "Meta",
  adAccount: "BMW Group · US",
  adSetCount: 4,
  adCount: 12,
  status: "Active",
  budget: "€48,000",
  channel: "Meta",
  start: "01 Jun 2026",
};

/** Labels for the loading bubble's secondary line. One per cot step;
 *  cycles in lockstep with the cot item that's currently in `loading`
 *  state. */
export const S8_LOADING_LABELS = [
  "Detecting intent",
  "Resolving scope",
  "Validating constraints",
  "Detecting edge cases",
  "Planning response",
];

/** Follow-up clarifying questions surfaced as a 5-step PromptOptionInput
 *  flow once the assistant's response finishes streaming. Each step
 *  carries a label, an option list (one of which is flagged as
 *  recommended), a multi/single mode, and a flag for whether the user
 *  may type a custom answer. */
export interface S8OptionStep {
  label: string;
  options: { value: string; recommended?: boolean }[];
  multi: boolean;
  hasInput: boolean;
}

export const S8_OPTION_STEPS: S8OptionStep[] = [
  {
    label: "How should I handle ad sets that exceed the maximum budget limit?",
    multi: false,
    hasInput: true,
    options: [
      { value: "Cap at maximum allowed limit", recommended: true },
      { value: "Skip these ad sets" },
    ],
  },
  {
    label: "What should I do with ad sets that have a budget of 0?",
    multi: false,
    hasInput: true,
    options: [
      { value: "Skip (no change)", recommended: true },
      { value: "Set a new base budget" },
    ],
  },
  {
    label: "How should I match and replace the message?",
    multi: false,
    hasInput: true,
    options: [
      { value: "Replace exact matches only" },
      { value: "Replace all similar variations", recommended: true },
    ],
  },
  {
    label: "Which text fields do you want to update?",
    multi: true,
    hasInput: false,
    options: [
      { value: "Primary text" },
      { value: "Headlines" },
      { value: "Descriptions" },
    ],
  },
  {
    label: "What should I do with ads that don't contain matching text?",
    multi: false,
    hasInput: true,
    options: [
      { value: "Skip these ads", recommended: true },
      { value: "Add the new message to these ads" },
    ],
  },
];

/* ─────────────────────────── Second response ─────────────────────────── */

/** Cot step titles for the assistant's second response (preview of
 *  the changes that will be applied after user confirmation). */
export const S8_PREVIEW_COT_STEPS: { title: string }[] = [
  { title: "Selection Resolution" },
  { title: "Operation Finalization" },
  { title: "Per-Entity Computation" },
  { title: "Exception Handling" },
  { title: "Preview Structuring" },
];

/** Labels for the loading bubble's secondary line. Mirrors the cot
 *  titles but in active / present-tense form. */
export const S8_PREVIEW_LOADING_LABELS = [
  "Resolving selection",
  "Finalizing operations",
  "Computing per-entity changes",
  "Handling exceptions",
  "Structuring preview",
];

export const S8_PREVIEW_RESPONSE_HTML =
  `<p>This is a preview of the changes I'll apply after your confirmation:</p>`;

/** Per-entity changes the assistant will preview. Each row uses the
 *  shared `CAMPAIGN_FIELD_CONFIG` so it renders consistently with the
 *  rest of the AiEntityPreview surface:
 *   • leading icon + field label as the title
 *   • `Ad: …` or `Ad set: …` as the description
 *   • `{old} → {new}` text in the value cell
 *   • per-row "Add to context" trailing IconButton (handled by
 *     AiEntityPreviewMultiple's `onRowAction`).
 *
 *  Counts mirror the spec for BMW-Summer-2026 with the user's
 *  recommended choices applied: 2 budget rows (the other 2 ad sets
 *  had budget=0 and were skipped) + 5 message-edit rows across
 *  primary text / headline / description fields. */
export const S8_PREVIEW_FIELDS: CampaignField[] = [
  {
    id: "field-budget-1",
    fieldName: "Daily Budget",
    icon: "euro",
    value: "€1,250 → €1,500",
    campaignName: "Ad set: Summer Tier 2",
  },
  {
    id: "field-budget-2",
    fieldName: "Daily Budget",
    icon: "euro",
    // Capped at the account's maximum allowed limit (per the user's
    // step-1 recommended choice). Annotated inline so the cap reason
    // is visible at a glance.
    value: "€4,200 → €4,200 (capped)",
    campaignName: "Ad set: Summer Tier 4",
  },
  {
    id: "field-msg-1",
    fieldName: "Primary text",
    icon: "edit_note",
    value: "30% discount → 50%",
    campaignName: "Ad: BMW-iX-Storytelling",
  },
  {
    id: "field-msg-2",
    fieldName: "Headline",
    icon: "edit_note",
    value: "Save 30% → Save 50%",
    campaignName: "Ad: BMW-iX-Storytelling",
  },
  {
    id: "field-msg-3",
    fieldName: "Primary text",
    icon: "edit_note",
    value: "30% off → 50% off",
    campaignName: "Ad: BMW-i4-Carousel",
  },
  {
    id: "field-msg-4",
    fieldName: "Headline",
    icon: "edit_note",
    value: "30% discount → 50%",
    campaignName: "Ad: BMW-X3-Hero",
  },
  {
    id: "field-msg-5",
    fieldName: "Description",
    icon: "edit_note",
    value: "with 30% discount → with 50%",
    campaignName: "Ad: BMW-X5-Family",
  },
];

/** Refined preview after the user adds the BMW-X3-Hero headline + the
 *  BMW-X5-Family description to context and asks to "keep discount
 *  after 50%". The replacements that previously dropped the word
 *  `discount` now preserve it; rows whose original copy didn't contain
 *  `discount` (e.g. "Save 30%", "30% off") are left untouched. Budget
 *  rows are unchanged because the refinement only affected message
 *  replacements. */
export const S8_PREVIEW_FIELDS_REFINED: CampaignField[] = [
  {
    id: "field-budget-1",
    fieldName: "Daily Budget",
    icon: "euro",
    value: "€1,250 → €1,500",
    campaignName: "Ad set: Summer Tier 2",
  },
  {
    id: "field-budget-2",
    fieldName: "Daily Budget",
    icon: "euro",
    value: "€4,200 → €4,200 (capped)",
    campaignName: "Ad set: Summer Tier 4",
  },
  {
    id: "field-msg-1",
    fieldName: "Primary text",
    icon: "edit_note",
    value: "30% discount → 50% discount",
    campaignName: "Ad: BMW-iX-Storytelling",
  },
  {
    id: "field-msg-2",
    fieldName: "Headline",
    icon: "edit_note",
    value: "Save 30% → Save 50%",
    campaignName: "Ad: BMW-iX-Storytelling",
  },
  {
    id: "field-msg-3",
    fieldName: "Primary text",
    icon: "edit_note",
    value: "30% off → 50% off",
    campaignName: "Ad: BMW-i4-Carousel",
  },
  {
    id: "field-msg-4",
    fieldName: "Headline",
    icon: "edit_note",
    value: "30% discount → 50% discount",
    campaignName: "Ad: BMW-X3-Hero",
  },
  {
    id: "field-msg-5",
    fieldName: "Description",
    icon: "edit_note",
    value: "with 30% discount → with 50% discount",
    campaignName: "Ad: BMW-X5-Family",
  },
];

/** Streaming markdown for the assistant's response. Inline campaign
 *  preview is rendered for the `<entity-preview id="bmw-summer-2026">`
 *  tag — the components map in S8Scenario hooks it up. `<hr/>` tags act
 *  as the visual section separators (the "⸻" rules in the spec). */
export const S8_RESPONSE_HTML = `<p>Here's what I'm about to update in <entity-preview id="bmw-summer-2026"></entity-preview>:</p>
<ul>
<li>Budgets: Increase all 4 ad sets by +20%</li>
<li>Ad messages: Replace "30% discount" → "50%" across 12 ads</li>
</ul>
<hr/>
<p>Before applying, I found a few things to review:</p>
<h4>Budget updates</h4>
<ul>
<li>2 ad sets have a budget of 0 → a 20% increase will have no effect</li>
<li>1 ad set will exceed the allowed maximum after the increase</li>
</ul>
<h4>Message updates</h4>
<ul>
<li>Multiple variations of "30% discount" may exist (e.g. "30% OFF", "Save 30%")</li>
<li>These may appear across different text fields (primary text, headline, description)</li>
<li>Some ads may not contain any matching text</li>
</ul>
<hr/>
<p>To proceed, I need your input:</p>
<h4>For budgets</h4>
<ul>
<li>How should I handle ad sets that exceed the maximum limit?<br/><recommended-badge></recommended-badge> Cap at maximum allowed limit</li>
<li>What should I do with ad sets that have a budget of 0?<br/><recommended-badge></recommended-badge> Skip (no change)</li>
</ul>
<h4>For ad messages</h4>
<ul>
<li>Should I replace only exact matches or include similar variations?<br/><recommended-badge></recommended-badge> Replace all similar variations</li>
<li>Which fields should be updated?</li>
<li>What should happen to ads without matching text?<br/><recommended-badge></recommended-badge> Skip these ads</li>
</ul>
<p>Once you confirm these details, I'll generate a preview of all changes before applying them.</p>`;
