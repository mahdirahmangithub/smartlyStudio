import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
  type MutableRefObject,
  type CSSProperties,
} from "react";
import { ScrollFade } from "../ScrollFade";
import { GenericSelectOption } from "../GenericSelectOption";
import { Icon } from "../Icon";
import styles from "./Dropdown.module.css";

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */

export interface DrilldownFrame {
  /**
   * Ref that always holds the latest children of the DrilldownSubmenu that
   * pushed this frame. Storing a ref (not a snapshot) means the drilled level
   * reflects parent re-renders (e.g. checked-state changes in multi-select).
   *
   * Why a ref and not a render function: DrilldownPanelContent renders this
   * via a FrameContent child component. React reconciles the root-level slot
   * (where DrilldownSubmenu writes the ref) before the drilled-level slot
   * (where FrameContent reads it), so the read always sees the current value.
   */
  content: MutableRefObject<ReactNode>;
  label: string;
  triggerRef: RefObject<HTMLElement | null>;
}

export interface DrilldownContextValue {
  stack: DrilldownFrame[];
  push: (frame: DrilldownFrame) => void;
  pop: () => void;
}

/* ═══════════════════════════════════════════════════════════════════════
   Context
   ═══════════════════════════════════════════════════════════════════════ */

export const DrilldownContext = createContext<DrilldownContextValue | null>(null);

export function useDrilldown(): DrilldownContextValue {
  const ctx = useContext(DrilldownContext);
  if (!ctx) throw new Error("useDrilldown must be used inside DrilldownProvider");
  return ctx;
}

/* ═══════════════════════════════════════════════════════════════════════
   Provider
   ═══════════════════════════════════════════════════════════════════════ */

interface DrilldownProviderProps {
  children: ReactNode;
  open: boolean;
}

export function DrilldownProvider({ children, open }: DrilldownProviderProps) {
  const [stack, setStack] = useState<DrilldownFrame[]>([]);

  // Reset to root whenever the dropdown closes so next open starts fresh.
  useEffect(() => {
    if (!open) setStack([]);
  }, [open]);

  const push = useCallback((frame: DrilldownFrame) => {
    setStack((prev) => [...prev, frame]);
  }, []);

  const pop = useCallback(() => {
    setStack((prev) => prev.slice(0, -1));
  }, []);

  return (
    <DrilldownContext.Provider value={{ stack, push, pop }}>
      {children}
    </DrilldownContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FrameContent — renders a drilled frame's live children
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Thin wrapper that reads from a ref. Must be a real React component (not an
 * inline call) so React reconciles it AFTER the root-level slot — which is
 * where DrilldownSubmenu runs and writes the ref to the latest children.
 */
function FrameContent({ contentRef }: { contentRef: MutableRefObject<ReactNode> }) {
  return <>{contentRef.current}</>;
}

/* ═══════════════════════════════════════════════════════════════════════
   Panel content — renders the sliding viewport
   ═══════════════════════════════════════════════════════════════════════ */

interface DrilldownPanelContentProps {
  children: ReactNode;
  scrollMaxH: number | undefined;
  /** Kept in sync so Dropdown.handlePanelKeyDown can intercept ArrowLeft. */
  drillDepthRef: MutableRefObject<number>;
  /**
   * Stored as popWithFocus (pop + restore trigger focus) so both the Back
   * button click and ArrowLeft keyboard shortcut restore focus correctly.
   */
  drillPopRef: MutableRefObject<(() => void) | null>;
}

export function DrilldownPanelContent({
  children,
  scrollMaxH,
  drillDepthRef,
  drillPopRef,
}: DrilldownPanelContentProps) {
  const { stack, pop } = useContext(DrilldownContext)!;
  const viewportRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);

  // Keep depth ref in sync (read during async event handlers — safe to write during render).
  drillDepthRef.current = stack.length;

  // popWithFocus: pop the stack and return focus to the trigger that opened this level.
  const popWithFocus = useCallback(() => {
    const topFrame = stack[stack.length - 1];
    pop();
    if (topFrame) {
      setTimeout(() => {
        topFrame.triggerRef.current?.focus({ focusVisible: true } as FocusOptions);
      }, 0);
    }
  }, [stack, pop]);

  // Keep drillPopRef pointing at the latest popWithFocus (includes current stack snapshot).
  drillPopRef.current = popWithFocus;

  const scrollAreaStyle: CSSProperties | undefined =
    scrollMaxH != null ? { maxHeight: scrollMaxH } : undefined;

  const scrollFadeProps = {
    direction: "vertical" as const,
    surface: "over" as const,
    scrollAreaClassName: styles.options,
    scrollAreaStyle,
  };

  // When drilling forward, focus the first focusable in the newly-visible level.
  useEffect(() => {
    if (stack.length > prevLenRef.current) {
      const timer = setTimeout(() => {
        const levels = viewportRef.current?.querySelectorAll<HTMLElement>("[data-drill-level]");
        const last = levels?.[levels.length - 1];
        const focusable = last?.querySelector<HTMLElement>('[tabindex="0"]');
        focusable?.focus({ focusVisible: true } as FocusOptions);
      }, 0);
      prevLenRef.current = stack.length;
      return () => clearTimeout(timer);
    }
    prevLenRef.current = stack.length;
  }, [stack.length]);

  /*
   * Always render the viewport/slider — even at root level (stack.length === 0).
   *
   * Why: if we conditionally swap between plain <ScrollFade> and the viewport,
   * the root-level DOM is unmounted and remounted on pop. That detaches the DOM
   * nodes that DrilldownSubmenu's triggerRef.current points to, so focus after
   * Back / ArrowLeft is lost. Keeping the structure stable means triggerRef
   * always refers to a live element.
   *
   * The active level carries [data-drill-active] so Dropdown's getOptions() and
   * scroll-to-view logic scope to the visible level only (ignoring off-screen levels).
   *
   * Render order guarantee: React reconciles the root-level slot first (left in
   * the JSX array), so DrilldownSubmenu writes its childrenRef before FrameContent
   * reads it in each drilled-level slot. This is why content is a ref, not a
   * snapshot — see DrilldownFrame.content for full explanation.
   */
  return (
    <div ref={viewportRef} className={styles.drillViewport}>
      <div
        className={styles.drillSlider}
        style={{ transform: `translateX(-${stack.length * 100}%)` }}
      >
        {/* Root level — always mounted. DrilldownSubmenu inside here writes childrenRef. */}
        <div
          data-drill-level=""
          data-drill-active={stack.length === 0 ? "" : undefined}
          className={styles.drillLevel}
        >
          <ScrollFade {...scrollFadeProps}>{children}</ScrollFade>
        </div>

        {/* Each drilled level — FrameContent reads the ref written above. */}
        {stack.map((frame, i) => (
          <div
            key={i}
            data-drill-level=""
            data-drill-active={i === stack.length - 1 ? "" : undefined}
            className={styles.drillLevel}
          >
            <ScrollFade {...scrollFadeProps}>
              {/* Back row */}
              <GenericSelectOption
                hideFocusRing
                description={false}
                labelText="Back"
                leading={<Icon name="arrow_back" size={16} />}
                onClick={popWithFocus}
              />
              <FrameContent contentRef={frame.content} />
            </ScrollFade>
          </div>
        ))}
      </div>
    </div>
  );
}
