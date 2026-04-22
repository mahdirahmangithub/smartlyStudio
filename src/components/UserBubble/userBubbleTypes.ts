import type { HTMLAttributes } from "react";
import type { IconName } from "../Icon";

export interface UserBubbleAttachment {
  id: string;
  /** Source File object — used to infer thumbnail type and file size. */
  file?: File;
  /** Preview URL for image files (e.g. from URL.createObjectURL). */
  previewUrl?: string;
  /** Used to infer thumbnail type from extension and as tooltip label. */
  fileName?: string;
  /** Tooltip label shown on hover. Defaults to fileName. */
  title?: string;
}

export interface UserBubbleContextItem {
  id: string;
  icon: IconName;
  label: string;
}

export interface UserBubbleProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Plain-text message body. */
  message: string;
  /** Attached files displayed above the bubble as compact read-only thumbnails. */
  attachments?: UserBubbleAttachment[];
  /** Context chips displayed inside the bubble, above the message text. */
  contextItems?: UserBubbleContextItem[];
  /**
   * When provided, shows a reply badge above the bubble.
   * Pass the quoted/replied message label as the value.
   */
  replyLabel?: string;
  /** Called after the message text is successfully copied. */
  onCopy?: (value: string) => void;
  /** When provided, the edit action button is rendered in the action bar. */
  onEdit?: () => void;
}
