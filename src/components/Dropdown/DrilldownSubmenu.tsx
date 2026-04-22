import { useRef, useCallback, useEffect, useContext, type ReactNode, type KeyboardEvent, type MutableRefObject } from "react";
import { GenericSelectOption } from "../GenericSelectOption";
import { SiblingSubmenuContext } from "./MenuContext";
import { useDrilldown } from "./DrilldownContext";

export interface DrilldownSubmenuProps {
  labelText: string;
  leading?: ReactNode;
  children: ReactNode;
}

export function DrilldownSubmenu({ labelText, leading, children }: DrilldownSubmenuProps) {
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

  // Resolve the focusable row element so pop() can return focus here.
  useEffect(() => {
    triggerRef.current =
      wrapperRef.current?.querySelector<HTMLElement>('[tabindex="0"]') ?? null;
  }, []);

  const drill = useCallback(() => {
    // Close any open HoverSubmenus before sliding — a fresh symbol matches no sibling.
    siblingManager?.notifyOpen(Symbol());
    // Pass the ref itself — FrameContent will read .current on each render.
    push({ content: childrenRef, label: labelText, triggerRef });
  }, [siblingManager, labelText, push]);

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
        onClick={drill}
      />
    </div>
  );
}

DrilldownSubmenu.displayName = "DrilldownSubmenu";
