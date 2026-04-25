import type { CSSProperties, ReactNode } from "react";
import type { SpacingProps } from "../../utils/spacing";

export interface AiGenerationContextTag {
  /** Unique identifier */
  id: string;
  /** Displayed label text */
  label: string;
  /** Optional leading icon */
  leadingIcon?: ReactNode;
}

export interface AiGenerationProps extends SpacingProps {
  /** Header title — passed to Header size="sm" density="sm" (maps to TitleText 2xs internally) */
  title?: string;
  /** Header description text — shown below the title */
  description?: string;
  /** Action buttons rendered in the header actions slot */
  actions?: ReactNode;
  /** Main content slot */
  children?: ReactNode;
  /** Tags that clarify the generation context, shown below the content */
  contextTags?: AiGenerationContextTag[];
  /** Active/selected state — changes border and version indicator to brand color */
  active?: boolean;
  /** Show the version control indicator on the right edge of the card */
  showVersion?: boolean;
  /** Version label to display in the indicator */
  versionNumber?: string | number;
  /** Optional suggestion section rendered below the main card */
  suggestion?: ReactNode;
  /** Title for the suggestion section */
  suggestionTitle?: string;
  className?: string;
  style?: CSSProperties;
  /** Accessible label for the card region */
  "aria-label"?: string;
  /** Points to an element that labels this card region */
  "aria-labelledby"?: string;
}
