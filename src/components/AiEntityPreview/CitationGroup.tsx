import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import { AiEntityPreviewInlineTyped, AiEntityPreviewMultipleTyped } from "./AiEntityPreviewTyped";
import type { AiEntityPreviewMultipleTypedProps } from "./AiEntityPreviewTyped";
import type { AiEntityConfig } from "./aiEntityTypes";

/* ── Hook ────────────────────────────────────────────────────────────── */

export interface CitationProps {
  /** Id of the entity in the group's `data` array.
   *  Matched via `config.getKey(entity) === id`. */
  id: string;
}

export type SourcesListProps<T> = Omit<
  AiEntityPreviewMultipleTypedProps<T>,
  "config" | "data" | "highlightedKey"
>;

export interface CitationGroupApi<T> {
  /** Inline citation — renders the matching entity as
   *  `AiEntityPreviewInlineTyped` with its 1-based index in `data` as the
   *  visible label. Pointer enter/leave on the chip lights up the matching
   *  row in `<Sources>`. Returns `null` if no entity matches `id`. */
  Citation: (props: CitationProps) => JSX.Element | null;
  /** Multi-mode preview of every entity in `data`, with `highlightedKey`
   *  driven by which inline `<Citation>` is currently being hovered. Pass
   *  any other `AiEntityPreviewMultipleTyped` props through (e.g.
   *  `hideRowAction`, `itemName`, `onRowAction`). */
  Sources: (props: SourcesListProps<T>) => JSX.Element;
}

/**
 * Creates a citation group bound to the given `config` and ordered `data`.
 *
 * Returns `Citation` and `Sources` components that share an internal hover
 * store (per-call: each `useCitationGroup(...)` call creates an isolated
 * group, so multiple groups in the same consumer don't interfere).
 *
 * Indices are deterministic from `data` order — `data[0]` becomes "[1]",
 * `data[1]` becomes "[2]", etc. — matching the prefix-cell numbers in the
 * `<Sources>` multi-mode list. The components are stable across the
 * consumer's renders, so they're safe to capture in a message's
 * `components` map and `slot` (state changes propagate via the internal
 * external store, not via consumer re-renders).
 *
 * Coexists with non-citation inline previews: route only the chips you
 * want as citations to `<Citation>`; render any other inline previews
 * (campaigns, audiences, etc.) directly with `AiEntityPreviewInlineTyped`.
 */
export function useCitationGroup<T>({
  config,
  data,
}: {
  config: AiEntityConfig<T>;
  data: T[];
}): CitationGroupApi<T> {
  // Hover state lives in a ref + listener set so it stays "live" even when
  // accessed by Citation/Sources elements captured in some external state
  // (e.g. a message's `slot` or `components` map). Consumer re-renders are
  // not required for state propagation — `useSyncExternalStore` re-renders
  // Sources when the hover changes.
  const storeRef = useRef<{
    hoveredKey: string | null;
    listeners: Set<() => void>;
  } | null>(null);
  if (!storeRef.current) {
    storeRef.current = { hoveredKey: null, listeners: new Set() };
  }

  // Mutable refs to the latest config/data so the bound components always
  // see the current values even after the consumer updates them.
  const configRef = useRef(config);
  configRef.current = config;
  const dataRef = useRef(data);
  dataRef.current = data;

  const setHoveredKey = useCallback((key: string | null) => {
    const store = storeRef.current!;
    if (store.hoveredKey === key) return;
    store.hoveredKey = key;
    store.listeners.forEach((fn) => fn());
  }, []);

  const subscribe = useCallback((cb: () => void) => {
    const store = storeRef.current!;
    store.listeners.add(cb);
    return () => { store.listeners.delete(cb); };
  }, []);

  const getHoveredKey = useCallback(() => storeRef.current!.hoveredKey, []);

  const Citation = useCallback<CitationGroupApi<T>["Citation"]>(({ id }) => {
    const cfg = configRef.current;
    const dt = dataRef.current;
    const entity = dt.find((d) => cfg.getKey(d) === id);
    if (!entity) return null;
    const idx = dt.indexOf(entity);
    return (
      <sup
        onPointerEnter={() => setHoveredKey(id)}
        onPointerLeave={() => setHoveredKey(null)}
        style={{ userSelect: "none", verticalAlign: "baseline", fontSize: "inherit" }}
      >
        <AiEntityPreviewInlineTyped
          config={cfg}
          data={entity}
          label={String(idx + 1)}
        />
      </sup>
    );
  }, [setHoveredKey]);

  const Sources = useCallback<CitationGroupApi<T>["Sources"]>((props) => {
    const hoveredKey = useSyncExternalStore(subscribe, getHoveredKey, getHoveredKey);
    return (
      <AiEntityPreviewMultipleTyped
        config={configRef.current}
        data={dataRef.current}
        highlightedKey={hoveredKey ?? undefined}
        {...props}
      />
    );
  }, [subscribe, getHoveredKey]);

  return useMemo(() => ({ Citation, Sources }), [Citation, Sources]);
}
