import type { HTMLAttributes, ReactNode } from "react";

/** Operational state — drives the leading icon and text colour. */
export type CotItemStatus = "idle" | "loading" | "complete" | "error";

/**
 * Visual variant — determines the icon family shown in the leading column.
 * - dot:  small dot indicator (generic progress)
 * - icon: custom icon passed via the `icon` prop
 * - todo: semantic icons that change with status (pending → complete → error)
 */
export type CotItemVariant = "dot" | "icon" | "todo";

export interface CotItemProps extends Omit<HTMLAttributes<HTMLLIElement>, "children" | "title"> {
  /** Step title — primary label. */
  title?: ReactNode;
  /** Step description — secondary label below the title. */
  description?: ReactNode;
  /** Slot content rendered below the header. Hidden when expandable and collapsed. */
  children?: ReactNode;

  /** Icon family for the leading column. Defaults to "dot". */
  variant?: CotItemVariant;
  /** Custom icon element. Only used when variant="icon" and status is not "loading". */
  icon?: ReactNode;
  /** Operational status. Drives the leading icon and colour. Defaults to "idle". */
  status?: CotItemStatus;
  /** Disables the item — mutes all colours, blocks interaction, and passes disabled to direct slot children. */
  disabled?: boolean;

  /** When true the step can be expanded/collapsed to reveal slot content. */
  expandable?: boolean;
  /** Initial expanded state (uncontrolled). */
  defaultExpanded?: boolean;
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Called when the expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;

  /**
   * Show the vertical connector line below this item.
   * Defaults to true. The `<Cot>` parent automatically sets it to false on the
   * last child so consumers rarely need to set this explicitly.
   */
  connector?: boolean;
}

export interface CotProps extends Omit<HTMLAttributes<HTMLOListElement>, "children"> {
  children: ReactNode;
  /**
   * Override connectors on all items.
   * When omitted, the parent automatically hides the connector on the last item.
   */
  connector?: boolean;
}

export interface CotContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** "task" renders a bordered card with action buttons; "reasoning" is borderless with a compact header. */
  type: "task" | "reasoning";
  /** Container title. Omitting on reasoning type renders it without a header — always expanded, with uniform padding. */
  title?: ReactNode;
  /** Hint text shown below the container (neutral/low InlineMessage). */
  hint?: string;

  /* ── Task-type props ── */

  /** Drives the visual state of the task card. Defaults to "idle". */
  status?: "idle" | "running" | "cancelled" | "completed" | "editing" | "edited";
  /** Progress value 0–100 shown in the progress bar while running. */
  progress?: number;
  /** Overrides the auto-derived tag for the title row. */
  tag?: ReactNode;
  /** When provided, renders a CodeBlock (size="sm", height 144px) above the
   *  task card with its bottom 32px tucked behind the card. */
  planDetailsCode?: string;
  /** Header title for the plan-details CodeBlock. Defaults to "Plan detail". */
  planDetailsTitle?: string;
  /** Header action area for the plan-details CodeBlock. Defaults to a CopyButton
   *  + an expand/collapse IconButton wired to the plan-details expanded state.
   *  Provide a custom node to override (e.g. extra buttons or a different layout). */
  planDetailsActions?: ReactNode;
  /** Controlled expanded state for the plan-details CodeBlock. When omitted
   *  the container manages its own state (default collapsed). When true the
   *  CodeBlock grows to its natural height and pushes the task card down
   *  (still keeping the 32px overlap). */
  planDetailsExpanded?: boolean;
  /** Initial expanded state when uncontrolled. Defaults to false. */
  defaultPlanDetailsExpanded?: boolean;
  /** Notified whenever the plan-details expanded state changes (whether the
   *  change originated from the default toggle action or a controlled update). */
  onPlanDetailsExpandedChange?: (expanded: boolean) => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onStart?: () => void;
  onStop?: () => void;

  /* ── Expand / collapse ── */

  /** Controlled expanded state. */
  expanded?: boolean;
  /** Initial expanded state (uncontrolled). Defaults to false. */
  defaultExpanded?: boolean;
  /** Called when the expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;

  children?: ReactNode;
}
