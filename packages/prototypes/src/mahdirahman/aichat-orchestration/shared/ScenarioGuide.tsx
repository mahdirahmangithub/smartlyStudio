import { useRef, useState, useCallback, useEffect, type ReactNode, type RefObject } from "react";
import { Popover, type VirtualAnchor } from "@sds/components/Popover";
import { TitleText } from "@sds/components/TitleText";
import { BodyText } from "@sds/components/BodyText";

/**
 * Floating bottom-right Popover that tells the user what action to take next.
 * Anchored to a virtual point at the bottom-right of the viewport so it stays
 * put across page scroll/resize. The whole panel is draggable: pointer-down
 * captures the starting position, window pointermove accumulates a delta into
 * positionOffset, clamped so the popover stays inside the viewport.
 *
 * Forced to light theme so it stands out regardless of the surrounding app
 * theme (the consumer's className typically also paints a yellow background).
 */
export function ScenarioGuide({ children, className }: { children: ReactNode; className?: string }) {
  const anchorRef = useRef<VirtualAnchor>({
    getBoundingClientRect: () =>
      new DOMRect(window.innerWidth - 24, window.innerHeight - 24, 0, 0),
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const offsetRef = useRef(offset);
  offsetRef.current = offset;

  const dragRef = useRef<{
    startX: number;
    startY: number;
    ox: number;
    oy: number;
    baseX: number;
    baseY: number;
    panelW: number;
    panelH: number;
  } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = panelRef.current;
    const rect = el?.getBoundingClientRect();
    const o = offsetRef.current;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      ox: o.x,
      oy: o.y,
      baseX: rect ? rect.left - o.x : 0,
      baseY: rect ? rect.top - o.y : 0,
      panelW: rect?.width ?? 0,
      panelH: rect?.height ?? 0,
    };
  }, []);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      let nextX = d.ox + (e.clientX - d.startX);
      let nextY = d.oy + (e.clientY - d.startY);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const minX = -d.baseX;
      const minY = -d.baseY;
      const maxX = vw - d.panelW - d.baseX;
      const maxY = vh - d.panelH - d.baseY;
      nextX = Math.max(minX, Math.min(maxX, nextX));
      nextY = Math.max(minY, Math.min(maxY, nextY));
      setOffset({ x: nextX, y: nextY });
    };
    const handleUp = () => { dragRef.current = null; };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  return (
    <Popover
      ref={panelRef}
      open
      onClose={() => {}}
      anchorRef={anchorRef as RefObject<VirtualAnchor | null>}
      placement="top-end"
      offset={0}
      fixed
      closeOnClickOutside={false}
      closeOnEscape={false}
      autoFocus={false}
      width={240}
      className={className}
      positionOffset={offset.x !== 0 || offset.y !== 0 ? offset : undefined}
      onPointerDown={onPointerDown}
      data-theme="light"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
        <TitleText size="2xs" title="Demo guide" />
        <BodyText size="sm">{children}</BodyText>
      </div>
    </Popover>
  );
}
ScenarioGuide.displayName = "ScenarioGuide";
