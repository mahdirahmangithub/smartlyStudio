import { createContext } from "react";
import type { CotContainerProps } from "./cotTypes";

/**
 * Broadcast by CotContainer so descendant CotItems can auto-derive their
 * status (e.g. show a loading spinner on the currently-progressing item)
 * without consumers having to compute thresholds manually.
 */
export interface CotContainerContextValue {
  type: CotContainerProps["type"];
  status: NonNullable<CotContainerProps["status"]>;
  progress: number;
}

export const CotContainerContext = createContext<CotContainerContextValue | null>(null);

/**
 * Provided by Cot per-child so CotItem knows its index and the total count —
 * enough to compute its own progress-driven status.
 */
export interface CotItemContextValue {
  index: number;
  total: number;
}

export const CotItemContext = createContext<CotItemContextValue | null>(null);
