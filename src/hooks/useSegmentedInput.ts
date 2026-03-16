import { useCallback, useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */

export interface NumericSegmentDef {
  kind: "numeric";
  sectionType?: string;
  placeholder: string;
  label: string;
  min: number;
  max: number;
  length: number;
}

export interface LiteralSegmentDef {
  kind: "literal";
  value: string;
}

export type SegmentDef = NumericSegmentDef | LiteralSegmentDef;

interface CharacterQuery {
  segIdx: number;
  value: string;
}

interface HookState {
  sectionValues: string[];
  characterQuery: CharacterQuery | null;
  lastExternalValues: string[] | null;
}

export interface UseSegmentedInputOptions {
  segments: SegmentDef[];
  separatorKeys?: string[];
  onSectionsChange?: (values: string[]) => void;
  getMax?: (segIdx: number, currentValues: string[]) => number | undefined;
  initialValues?: string[];
  externalValues?: string[];
  disabled?: boolean;
  readOnly?: boolean;
}

const QUERY_LIFE_DURATION_MS = 5000;

export function useSegmentedInput({
  segments,
  separatorKeys = [],
  onSectionsChange,
  getMax,
  initialValues,
  externalValues,
  disabled = false,
  readOnly = false,
}: UseSegmentedInputOptions) {
  const numericIndices = segments
    .map((s, i) => (s.kind === "numeric" ? i : -1))
    .filter((i) => i >= 0);

  const [state, setState] = useState<HookState>(() => ({
    sectionValues: segments.map((seg, i) => {
      if (seg.kind !== "numeric") return "";
      return initialValues?.[i] ?? "";
    }),
    characterQuery: null,
    lastExternalValues: externalValues ?? null,
  }));

  /* ── Render-time controlled sync ────────────────────────────────── */
  if (externalValues != null && externalValues !== state.lastExternalValues) {
    const valuesChanged = !externalValues.every(
      (v, i) => v === state.sectionValues[i],
    );
    if (valuesChanged) {
      setState((prev) => ({
        ...prev,
        sectionValues: externalValues,
        lastExternalValues: externalValues,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        lastExternalValues: externalValues,
      }));
    }
  }

  // Ref that always holds the latest state — used by event callbacks
  // to avoid stale closures (MUI's useEventCallback pattern).
  const stateRef = useRef(state);
  stateRef.current = state;

  const valuesRef = useRef(state.sectionValues);
  valuesRef.current = state.sectionValues;

  const queryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const segmentRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const onChangeRef = useRef(onSectionsChange);
  onChangeRef.current = onSectionsChange;
  const getMaxRef = useRef(getMax);
  getMaxRef.current = getMax;
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;

  /* ── stable helpers (no state in closure — read from refs) ──────── */

  const resolveMax = useCallback(
    (segIdx: number): number => {
      const def = segmentsRef.current[segIdx];
      if (def.kind !== "numeric") return 0;
      const dynamic = getMaxRef.current?.(segIdx, valuesRef.current);
      return dynamic ?? def.max;
    },
    [],
  );

  const clearQueryTimer = useCallback(() => {
    if (queryTimerRef.current != null) {
      clearTimeout(queryTimerRef.current);
      queryTimerRef.current = null;
    }
  }, []);

  const updateSectionValue = useCallback(
    (segIdx: number, value: string) => {
      const next = [...valuesRef.current];
      next[segIdx] = value;
      valuesRef.current = next;
      setState((prev) => ({ ...prev, sectionValues: next }));
      onChangeRef.current?.(next);
    },
    [],
  );

  const setCharacterQuery = useCallback(
    (q: CharacterQuery | null) => {
      if (q == null) clearQueryTimer();
      setState((prev) => ({ ...prev, characterQuery: q }));
    },
    [clearQueryTimer],
  );

  // Auto-clear query after 5 seconds
  useEffect(() => {
    if (state.characterQuery != null) {
      clearQueryTimer();
      queryTimerRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, characterQuery: null }));
        queryTimerRef.current = null;
      }, QUERY_LIFE_DURATION_MS);
    }
    return clearQueryTimer;
  }, [state.characterQuery, clearQueryTimer]);

  /* ── navigation ──────────────────────────────────────────────────── */

  const focusSegment = useCallback((idx: number) => {
    setFocusedIndex(idx);
    segmentRefs.current[idx]?.focus();
  }, []);

  const focusNextNumeric = useCallback(
    (fromIdx: number) => {
      const pos = numericIndices.indexOf(fromIdx);
      if (pos < numericIndices.length - 1) {
        focusSegment(numericIndices[pos + 1]);
      }
    },
    [numericIndices, focusSegment],
  );

  const focusPrevNumeric = useCallback(
    (fromIdx: number) => {
      const pos = numericIndices.indexOf(fromIdx);
      if (pos > 0) {
        focusSegment(numericIndices[pos - 1]);
      }
    },
    [numericIndices, focusSegment],
  );

  const formatValue = useCallback(
    (segIdx: number, num: number): string => {
      const def = segmentsRef.current[segIdx] as NumericSegmentDef;
      return String(num).padStart(def.length, "0");
    },
    [],
  );

  /* ── digit handling — reads query from ref, never stale ────────── */

  const applyNumericEditing = useCallback(
    (segIdx: number, digit: string) => {
      const max = resolveMax(segIdx);
      const maxDigits = max.toString().length;
      const currentQuery = stateRef.current.characterQuery;

      let queryValue: string;
      if (currentQuery != null && currentQuery.segIdx === segIdx) {
        const concatenated = currentQuery.value + digit;
        const concatenatedNum = parseInt(concatenated, 10);
        queryValue = concatenatedNum > max ? digit : concatenated;
      } else {
        queryValue = digit;
      }

      const numericValue = parseInt(queryValue, 10);

      if (numericValue > max) {
        setCharacterQuery(null);
        return;
      }

      const shouldGoToNextSection =
        numericValue * 10 > max || queryValue.length >= maxDigits;

      const formatted = formatValue(segIdx, numericValue);
      updateSectionValue(segIdx, formatted);

      if (shouldGoToNextSection) {
        setCharacterQuery(null);
        focusNextNumeric(segIdx);
      } else {
        setCharacterQuery({ segIdx, value: queryValue });
      }
    },
    [resolveMax, formatValue, updateSectionValue, setCharacterQuery, focusNextNumeric],
  );

  /* ── increment / decrement ─────────────────────────────────────── */

  const adjustValue = useCallback(
    (segIdx: number, delta: number) => {
      const def = segmentsRef.current[segIdx] as NumericSegmentDef;
      const max = resolveMax(segIdx);
      const currentStr = valuesRef.current[segIdx];

      let newValue: number;
      if (currentStr === "") {
        if (def.sectionType === "year") {
          newValue = new Date().getFullYear();
        } else {
          newValue = delta > 0 ? def.min : max;
        }
      } else {
        newValue = parseInt(currentStr, 10) + delta;
        const range = max - def.min + 1;
        if (newValue > max) {
          newValue = def.min + ((newValue - max - 1) % range);
        }
        if (newValue < def.min) {
          newValue = max - ((def.min - newValue - 1) % range);
        }
      }

      updateSectionValue(segIdx, formatValue(segIdx, newValue));
      setCharacterQuery(null);
    },
    [resolveMax, formatValue, updateSectionValue, setCharacterQuery],
  );

  const setAbsolute = useCallback(
    (segIdx: number, target: "min" | "max") => {
      const def = segmentsRef.current[segIdx] as NumericSegmentDef;
      const max = resolveMax(segIdx);
      const value = target === "min" ? def.min : max;
      updateSectionValue(segIdx, formatValue(segIdx, value));
      setCharacterQuery(null);
    },
    [resolveMax, formatValue, updateSectionValue, setCharacterQuery],
  );

  /* ── keydown handler ─────────────────────────────────────────────── */

  const handleKeyDown = useCallback(
    (segIdx: number, e: React.KeyboardEvent) => {
      if (disabled) return;
      const def = segmentsRef.current[segIdx];
      if (def.kind !== "numeric") return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setCharacterQuery(null);
          focusNextNumeric(segIdx);
          break;

        case "ArrowLeft":
          e.preventDefault();
          setCharacterQuery(null);
          focusPrevNumeric(segIdx);
          break;

        case "ArrowUp":
          e.preventDefault();
          if (readOnly) break;
          adjustValue(segIdx, 1);
          break;

        case "ArrowDown":
          e.preventDefault();
          if (readOnly) break;
          adjustValue(segIdx, -1);
          break;

        case "PageUp":
          e.preventDefault();
          if (readOnly) break;
          adjustValue(segIdx, 5);
          break;

        case "PageDown":
          e.preventDefault();
          if (readOnly) break;
          adjustValue(segIdx, -5);
          break;

        case "Home":
          e.preventDefault();
          if (readOnly) break;
          setAbsolute(segIdx, "min");
          break;

        case "End":
          e.preventDefault();
          if (readOnly) break;
          setAbsolute(segIdx, "max");
          break;

        case "Backspace":
        case "Delete": {
          e.preventDefault();
          if (readOnly) break;
          setCharacterQuery(null);
          if (valuesRef.current[segIdx] !== "") {
            updateSectionValue(segIdx, "");
          } else if (e.key === "Backspace") {
            focusPrevNumeric(segIdx);
          }
          break;
        }

        case "Tab":
          setCharacterQuery(null);
          break;

        default:
          if (e.key >= "0" && e.key <= "9") {
            e.preventDefault();
            if (readOnly) break;
            applyNumericEditing(segIdx, e.key);
          } else if (separatorKeys.includes(e.key)) {
            e.preventDefault();
            setCharacterQuery(null);
            focusNextNumeric(segIdx);
          }
          break;
      }
    },
    [
      disabled, readOnly, separatorKeys,
      setCharacterQuery, focusNextNumeric, focusPrevNumeric,
      adjustValue, setAbsolute, applyNumericEditing, updateSectionValue,
    ],
  );

  /* ── focus / blur ────────────────────────────────────────────────── */

  const handleFocus = useCallback((segIdx: number) => {
    setFocusedIndex(segIdx);
  }, []);

  const handleBlur = useCallback(
    (segIdx: number) => {
      setCharacterQuery(null);
      setFocusedIndex((prev) => (prev === segIdx ? null : prev));
    },
    [setCharacterQuery],
  );

  /* ── display / ARIA (read from state for render) ─────────────────── */

  const getDisplayText = useCallback(
    (segIdx: number): string => {
      const def = segments[segIdx];
      if (def.kind === "literal") return def.value;
      const val = state.sectionValues[segIdx];
      if (val !== "") return val;
      return def.placeholder;
    },
    [segments, state.sectionValues],
  );

  const isPlaceholder = useCallback(
    (segIdx: number): boolean => {
      const def = segments[segIdx];
      if (def.kind !== "numeric") return false;
      return state.sectionValues[segIdx] === "";
    },
    [segments, state.sectionValues],
  );

  const getSegmentProps = useCallback(
    (segIdx: number) => {
      const def = segments[segIdx];
      if (def.kind === "literal") {
        return { role: "presentation" as const, "aria-hidden": true as const };
      }

      const val = state.sectionValues[segIdx];
      const max = resolveMax(segIdx);
      const numVal = val !== "" ? parseInt(val, 10) : undefined;

      return {
        role: "spinbutton" as const,
        "aria-label": def.label,
        "aria-valuenow": numVal,
        "aria-valuemin": def.min,
        "aria-valuemax": max,
        "aria-valuetext": val !== "" ? val : def.placeholder,
        tabIndex: disabled ? -1 : 0,
        inputMode: "numeric" as const,
        "data-placeholder": state.sectionValues[segIdx] === "" || undefined,
        "data-focused": focusedIndex === segIdx || undefined,
      };
    },
    [segments, state.sectionValues, resolveMax, focusedIndex, disabled],
  );

  const setRef = useCallback(
    (segIdx: number) => (el: HTMLSpanElement | null) => {
      segmentRefs.current[segIdx] = el;
    },
    [],
  );

  const focusFirst = useCallback(() => {
    if (numericIndices.length > 0) {
      focusSegment(numericIndices[0]);
    }
  }, [numericIndices, focusSegment]);

  return {
    segments,
    sectionValues: state.sectionValues,
    focusedIndex,
    getDisplayText,
    isPlaceholder,
    getSegmentProps,
    handleKeyDown,
    handleFocus,
    handleBlur,
    setRef,
    focusFirst,
  };
}
