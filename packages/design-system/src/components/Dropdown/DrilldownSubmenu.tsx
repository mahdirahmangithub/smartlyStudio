import { useRef, useCallback, useEffect, useContext, type ReactNode, type KeyboardEvent, type MutableRefObject } from "react";
import { GenericSelectOption } from "../GenericSelectOption";
import { SiblingSubmenuContext } from "./MenuContext";
import { useDrilldown } from "./DrilldownContext";

export interface DrilldownSubmenuProps {
  labelText: string;
  leading?: ReactNode;
  /**
   * Optional sticky header for this drill level (e.g. a `SelectOptionHeader`
   * with a search input). Rendered above the scrollable option list so it
   * doesn't scroll with the items.
   */
  header?: ReactNode;
  children: ReactNode;
}

export function DrilldownSubmenu({ labelText, leading, header, children }: DrilldownSubmenuProps) {
  const { push } = useDrilldown();
  const siblingManager = useContext(SiblingSubmenuContext);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  /*
   * childrenRef always holds the latest children prop. It is written during
   * render (root-level slot) and read by FrameContent (drilled-level slot).
   * React reconciles root-level before drilled-level, so FrameContent always
   * sees the current render's children — enabling live multi-select state.
   */
  const childrenRef = useRef<ReactNode>(children) as MutableRefObject<ReactNode>;
  childrenRef.current = children;

  /** Same ref pattern for the optional sticky header (e.g. search input). */
  const headerRef = useRef<ReactNode>(header) as MutableRefObject<ReactNode>;
  headerRef.current = header;

  // Resolve the focusable row element so pop() can return focus here.
  useEffect(() => {
    triggerRef.current =
      wrapperRef.current?.querySelector<HTMLElement>('[tabindex="0"]') ?? null;
  }, []);

  const drill = useCallback(() => {
    // Close any open HoverSubmenus before sliding — a fresh symbol matches no sibling.
    siblingManager?.notifyOpen(Symbol());
    // Pass the refs themselves — FrameContent will read .current on each render.
    push({
      content: childrenRef,
      header: header !== undefined ? headerRef : undefined,
      label: labelText,
      triggerRef,
    });
  }, [siblingManager, labelText, push, header]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        drill();
      }
    },
    [drill],
  );

  return (
    <div ref={wrapperRef} onKeyDown={handleKeyDown}>
      <GenericSelectOption
        hideFocusRing
        subMenu
        description={false}
        labelText={labelText}
        leading={leading}
        ariaHasPopup="menu"
        ariaExpanded={false}
        onClick={drill}
      />
    </div>
  );
}

DrilldownSubmenu.displayName = "DrilldownSubmenu";
