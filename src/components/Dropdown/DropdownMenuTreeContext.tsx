import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

export interface DropdownMenuTreeContextValue {
  /** Register a portal panel or pointer bridge so clicks inside the menu tree do not dismiss ancestors. */
  registerTreePanel: (el: HTMLElement | null) => () => void;
  /** True if the node lies inside any registered panel or bridge in this tree. */
  isInsideTreePanels: (node: Node | null) => boolean;
}

export const DropdownMenuTreeContext =
  createContext<DropdownMenuTreeContextValue | null>(null);

export function DropdownMenuTreeProvider({ children }: { children: ReactNode }) {
  const panelsRef = useRef(new Set<HTMLElement>());

  const registerTreePanel = useCallback((el: HTMLElement | null) => {
    if (!el) return () => {};
    panelsRef.current.add(el);
    return () => {
      panelsRef.current.delete(el);
    };
  }, []);

  const isInsideTreePanels = useCallback((node: Node | null) => {
    if (!node) return false;
    const el = node instanceof Element ? node : node.parentElement;
    if (!el) return false;
    for (const p of panelsRef.current) {
      if (p.contains(el)) return true;
    }
    return false;
  }, []);

  const value = useMemo(
    () => ({ registerTreePanel, isInsideTreePanels }),
    [registerTreePanel, isInsideTreePanels],
  );

  return (
    <DropdownMenuTreeContext.Provider value={value}>
      {children}
    </DropdownMenuTreeContext.Provider>
  );
}

export function useDropdownMenuTree(): DropdownMenuTreeContextValue | null {
  return useContext(DropdownMenuTreeContext);
}
