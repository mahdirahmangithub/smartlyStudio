import { createContext, useContext, useCallback, useRef, type ReactNode } from "react";

export interface TooltipProviderConfig {
  /** Delay (ms) before showing the tooltip. Default 400. */
  showDelay?: number;
  /** Delay (ms) before hiding the tooltip. Default 200. */
  hideDelay?: number;
  /**
   * When a tooltip was recently dismissed, the next tooltip shows instantly
   * within this window (ms). Mimics Radix "skip delay" behavior. Default 300.
   */
  skipDelay?: number;
}

interface TooltipGroupState {
  isGroupOpen: boolean;
  lastCloseTime: number;
  markOpen: () => void;
  markClosed: () => void;
  shouldSkipDelay: () => boolean;
}

const TooltipConfigContext = createContext<Required<TooltipProviderConfig>>({
  showDelay: 400,
  hideDelay: 200,
  skipDelay: 300,
});

const TooltipGroupContext = createContext<TooltipGroupState>({
  isGroupOpen: false,
  lastCloseTime: 0,
  markOpen: () => {},
  markClosed: () => {},
  shouldSkipDelay: () => false,
});

export function useTooltipConfig() {
  return useContext(TooltipConfigContext);
}

export function useTooltipGroup() {
  return useContext(TooltipGroupContext);
}

export interface TooltipProviderProps extends TooltipProviderConfig {
  children: ReactNode;
}

export function TooltipProvider({
  showDelay = 400,
  hideDelay = 200,
  skipDelay = 300,
  children,
}: TooltipProviderProps) {
  const openCountRef = useRef(0);
  const lastCloseRef = useRef(0);

  const markOpen = useCallback(() => {
    openCountRef.current += 1;
  }, []);

  const markClosed = useCallback(() => {
    openCountRef.current = Math.max(0, openCountRef.current - 1);
    if (openCountRef.current === 0) {
      lastCloseRef.current = Date.now();
    }
  }, []);

  const shouldSkipDelay = useCallback(() => {
    if (openCountRef.current > 0) return true;
    return Date.now() - lastCloseRef.current < skipDelay;
  }, [skipDelay]);

  return (
    <TooltipConfigContext.Provider value={{ showDelay, hideDelay, skipDelay }}>
      <TooltipGroupContext.Provider
        value={{
          isGroupOpen: false,
          lastCloseTime: 0,
          markOpen,
          markClosed,
          shouldSkipDelay,
        }}
      >
        {children}
      </TooltipGroupContext.Provider>
    </TooltipConfigContext.Provider>
  );
}
