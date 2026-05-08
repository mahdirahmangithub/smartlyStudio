import { WORKSPACES } from "../../shared/data/workspaces";

/** Loading labels surfaced before the assistant's intro reply streams. */
export const S2_LABELS = [
  "Reading workspace structure",
  "Preparing campaign form",
];

/** The workspace already in the user's prompt context when s-2 is entered.
 *  We re-use BMW Global from the shared list so the inline preview chip
 *  shares its id with the prompt context-row chip. */
export const S2_WORKSPACE = WORKSPACES[0];

export interface Objective {
  id: string;
  label: string;
}

/** Common Meta-style campaign objectives. Local to s-2 for now; promote to
 *  shared/data if a second scenario needs the same list. */
export const OBJECTIVES: Objective[] = [
  { id: "obj-awareness",     label: "Awareness" },
  { id: "obj-traffic",       label: "Traffic" },
  { id: "obj-engagement",    label: "Engagement" },
  { id: "obj-leads",         label: "Leads" },
  { id: "obj-app-promotion", label: "App promotion" },
  { id: "obj-sales",         label: "Sales" },
];
