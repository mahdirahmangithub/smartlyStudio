import type { IconName } from "../Icon";
import { filterMenuItemsByQuery } from "../../utils/textareaTrigger";
import type { PromptInputAttachmentKind } from "./promptInputTypes";

export interface AttachmentMenuItemDef {
  kind: PromptInputAttachmentKind;
  label: string;
  icon: IconName;
  keywords?: readonly string[];
  dividerBefore?: boolean;
}

export const ATTACHMENT_MENU_ITEMS: readonly AttachmentMenuItemDef[] = [
  {
    kind: "photos-files",
    label: "Add photos & files",
    icon: "attach_file",
    keywords: ["upload", "file", "image", "photo"],
  },
  {
    kind: "link",
    label: "Add link",
    icon: "link",
    keywords: ["url", "href"],
  },
  {
    kind: "context",
    label: "Add context",
    icon: "forecasting_context",
    keywords: ["ai", "prompt", "smart"],
  },
  {
    kind: "google-drive",
    label: "Add from Google drive",
    icon: "Google Drive_color",
    keywords: ["drive", "google", "cloud"],
    dividerBefore: true,
  },
];

export function filterAttachmentMenuItems(query: string): AttachmentMenuItemDef[] {
  return filterMenuItemsByQuery(ATTACHMENT_MENU_ITEMS, query);
}
