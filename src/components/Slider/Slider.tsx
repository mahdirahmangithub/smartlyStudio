import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type KeyboardEvent,
  type PointerEvent,
  type CSSProperties,
} from "react";
import { Tooltip } from "../Tooltip";
import styles from "./Slider.module.css";

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */

export type SliderSize = "sm" | "lg";
export type SliderOrientation = "horizontal" | "vertical";

export interface SliderMark {
  value: number;
  label?: string;
}

interface SliderBaseProps {
  min?: number;
  max?: number;
  step?: number;
  marks?: SliderMark[];
  showMarkers?: boolean;
  size?: SliderSize;
  orientation?: SliderOrientation;
  disabled?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  formatValue?: (value: number) => string;
  className?: string;
}

export interface SingleSliderProps extends SliderBaseProps {
  range?: false;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
}

export interface RangeSliderProps extends SliderBaseProps {
  range: true;
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?: (value: [number, number]) => void;
  onChangeEnd?: (value: [number, number]) => void;
}

export type SliderProps = SingleSliderProps | RangeSliderProps;

/* ═══════════════════════════════════════════════════════════════════════
   Utilities
   ═══════════════════════════════════════════════════════════════════════ */

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function clamp(val: number, lo: number, hi: number) {
  return Math.min(Math.max(val, lo), hi);
}

function snapToStep(val: number, min: number, step: number | undefined) {
  if (!step || step <= 0) return val;
  return Math.round((val - min) / step) * step + min;
}

function valueToPct(val: number, min: number, max: number) {
  if (max === min) return 0;
  return ((val - min) / (max - min)) * 100;
}

function pctToValue(pct: number, min: number, max: number) {
  return min + (pct / 100) * (max - min);
}

const ROUND_PRECISION = 1e10;
function roundValue(val: number) {
  return Math.round(val * ROUND_PRECISION) / ROUND_PRECISION;
}

/* ═══════════════════════════════════════════════════════════════════════
   Slider
   ═══════════════════════════════════════════════════════════════════════ */

export function Slider(props: SliderProps) {
  const {
    min = 0,
    max = 100,
    step,
    marks,
    showMarkers = true,
    size = "lg",
    orientation = "horizontal",
    disabled = false,
    leadingIcon,
    trailingIcon,
    formatValue,
    className,
    range = false,
  } = props;

  const isH = orientation === "horizontal";

  /* ── value management ────────────────────────── */

  const isControlled = props.value !== undefined;

  const [internalValue, setInternalValue] = useState<[number, number]>(() => {
    if (range) {
      const rp = props as RangeSliderProps;
      const dv = rp.value ?? rp.defaultValue ?? [min, max];
      return [clamp(dv[0], min, max), clamp(dv[1], min, max)];
    }
    const sp = props as SingleSliderProps;
    const dv = sp.value ?? sp.defaultValue ?? min;
    return [clamp(dv, min, max), max];
  });

  const currentValue: [number, number] = (() => {
    if (isControlled) {
      if (range) {
        const rv = (props as RangeSliderProps).value!;
        return [clamp(rv[0], min, max), clamp(rv[1], min, max)];
      }
      const sv = (props as SingleSliderProps).value!;
      return [clamp(sv, min, max), max];
    }
    return internalValue;
  })();

  const fireChange = useCallback(
    (next: [number, number]) => {
      if (!isControlled) setInternalValue(next);
      if (range) {
        (props as RangeSliderProps).onChange?.([next[0], next[1]]);
      } else {
        (props as SingleSliderProps).onChange?.(next[0]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isControlled, range, props.onChange],
  );

  const fireChangeEnd = useCallback(
    (next: [number, number]) => {
      if (range) {
        (props as RangeSliderProps).onChangeEnd?.([next[0], next[1]]);
      } else {
        (props as SingleSliderProps).onChangeEnd?.(next[0]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, props.onChangeEnd],
  );

  /* ── refs ────────────────────────────────────── */

  const trackRef = useRef<HTMLDivElement>(null);
  const knobRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const draggingRef = useRef<number | null>(null);
  const pointerFocusRef = useRef(false);

  /* ── tooltip state ─────────────────────────────
     dragging: knob index while pointer is held down
     kbFocused: knob index when focused via keyboard (Tab) */

  const [dragging, setDragging] = useState<number | null>(null);
  const [kbFocused, setKbFocused] = useState<number | null>(null);

  /* ── force Tooltip reposition when knob moves ── */

  const triggerTooltipReposition = useCallback(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);

  /* ── pointer to value ───────────────────────── */

  const pointerToValue = useCallback(
    (clientX: number, clientY: number) => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      let pct: number;
      if (isH) {
        pct = ((clientX - rect.left) / rect.width) * 100;
      } else {
        pct = ((rect.bottom - clientY) / rect.height) * 100;
      }
      pct = clamp(pct, 0, 100);
      let val = pctToValue(pct, min, max);
      val = snapToStep(val, min, step);
      val = roundValue(val);
      return clamp(val, min, max);
    },
    [isH, min, max, step],
  );

  /* ── update value for a specific knob ───────── */

  const updateKnob = useCallback(
    (knobIdx: number, val: number, prev: [number, number]) => {
      const next: [number, number] = [...prev];
      next[knobIdx] = val;

      if (range) {
        if (knobIdx === 0 && next[0] > next[1]) next[0] = next[1];
        if (knobIdx === 1 && next[1] < next[0]) next[1] = next[0];
      }

      fireChange(next);
      return next;
    },
    [range, fireChange],
  );

  /* ── closest knob to a value ────────────────── */

  const closestKnob = useCallback(
    (val: number): number => {
      if (!range) return 0;
      const d0 = Math.abs(val - currentValue[0]);
      const d1 = Math.abs(val - currentValue[1]);
      if (d0 < d1) return 0;
      if (d1 < d0) return 1;
      return val <= currentValue[0] ? 0 : 1;
    },
    [range, currentValue],
  );

  /* ── pointer down on track ──────────────────── */

  const handleTrackPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.button !== 0) return;
      e.preventDefault();

      const val = pointerToValue(e.clientX, e.clientY);
      const knobIdx = closestKnob(val);
      updateKnob(knobIdx, val, currentValue);

      draggingRef.current = knobIdx;
      setDragging(knobIdx);
      setKbFocused(null);
      pointerFocusRef.current = true;

      const knobEl = knobRefs[knobIdx].current;
      knobEl?.focus();
      knobEl?.setPointerCapture(e.pointerId);
    },
    [disabled, pointerToValue, closestKnob, updateKnob, currentValue],
  );

  /* ── pointer down on knob ───────────────────── */

  const handleKnobPointerDown = useCallback(
    (knobIdx: number, e: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      draggingRef.current = knobIdx;
      setDragging(knobIdx);
      setKbFocused(null);
      pointerFocusRef.current = true;
      knobRefs[knobIdx].current?.focus();

      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled],
  );

  /* ── pointer move / up ─────────────────────── */

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const knobIdx = draggingRef.current;
      if (knobIdx === null) return;
      e.preventDefault();

      const val = pointerToValue(e.clientX, e.clientY);
      updateKnob(knobIdx, val, currentValue);
      triggerTooltipReposition();
    },
    [pointerToValue, updateKnob, currentValue, triggerTooltipReposition],
  );

  const handlePointerUp = useCallback(
    (_e: PointerEvent<HTMLDivElement>) => {
      if (draggingRef.current === null) return;
      draggingRef.current = null;
      setDragging(null);
      fireChangeEnd(currentValue);
    },
    [fireChangeEnd, currentValue],
  );

  /* ── focus / blur (keyboard vs pointer) ─────── */

  const handleFocus = useCallback(
    (knobIdx: number) => {
      if (disabled) return;
      if (pointerFocusRef.current) {
        pointerFocusRef.current = false;
        return;
      }
      setKbFocused(knobIdx);
    },
    [disabled],
  );

  const handleBlur = useCallback(() => {
    setKbFocused(null);
  }, []);

  /* ── keyboard ───────────────────────────────── */

  const handleKeyDown = useCallback(
    (knobIdx: number, e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const stepSize = step ?? (max - min) / 100;
      const bigStep = step ? step * 10 : (max - min) / 10;
      let newVal = currentValue[knobIdx];

      const increment = e.shiftKey ? bigStep : stepSize;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          newVal += increment;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          newVal -= increment;
          break;
        case "PageUp":
          newVal += bigStep;
          break;
        case "PageDown":
          newVal -= bigStep;
          break;
        case "Home":
          newVal = min;
          break;
        case "End":
          newVal = max;
          break;
        default:
          return;
      }

      e.preventDefault();
      newVal = snapToStep(newVal, min, step);
      newVal = roundValue(newVal);
      newVal = clamp(newVal, min, max);

      const next = updateKnob(knobIdx, newVal, currentValue);
      fireChangeEnd(next);
      triggerTooltipReposition();
    },
    [disabled, step, min, max, currentValue, updateKnob, fireChangeEnd, triggerTooltipReposition],
  );

  /* ── global pointer-up safety net ──────────────
     Pointer capture can be lost silently (DOM changes, focus shifts,
     pointer leaving the window). A window-level listener guarantees
     the drag is always released. */

  useEffect(() => {
    if (dragging === null) return;

    const onGlobalPointerUp = () => {
      if (draggingRef.current === null) return;
      draggingRef.current = null;
      setDragging(null);
      fireChangeEnd(currentValue);
    };

    window.addEventListener("pointerup", onGlobalPointerUp);
    window.addEventListener("pointercancel", onGlobalPointerUp);

    return () => {
      window.removeEventListener("pointerup", onGlobalPointerUp);
      window.removeEventListener("pointercancel", onGlobalPointerUp);
    };
  }, [dragging, fireChangeEnd, currentValue]);

  /* ── computed percentages ───────────────────── */

  const pct0 = valueToPct(currentValue[0], min, max);
  const pct1 = range ? valueToPct(currentValue[1], min, max) : pct0;

  const indicatorStyle: CSSProperties = isH
    ? range
      ? { left: `${pct0}%`, width: `${pct1 - pct0}%` }
      : { left: 0, width: `${pct0}%` }
    : range
      ? { bottom: `${pct0}%`, height: `${pct1 - pct0}%` }
      : { bottom: 0, height: `${pct0}%` };

  const knob0Style: CSSProperties = isH
    ? { left: `${pct0}%` }
    : { bottom: `${pct0}%`, top: "auto" };

  const knob1Style: CSSProperties = isH
    ? { left: `${pct1}%` }
    : { bottom: `${pct1}%`, top: "auto" };

  /* ── a11y helpers ───────────────────────────── */

  const markLabels = marks?.reduce<Record<number, string>>((acc, m) => {
    if (m.label) acc[m.value] = m.label;
    return acc;
  }, {});

  const getAriaValueText = (val: number) => {
    if (formatValue) return formatValue(val);
    if (markLabels?.[val]) return markLabels[val];
    return undefined;
  };

  /* ── markers for discrete mode ─────────────── */

  const discreteMarks = marks && showMarkers;
  const markerItems = discreteMarks
    ? (isH ? marks : [...marks].reverse())
    : undefined;

  /* ── render knob ────────────────────────────── */

  const renderKnob = (knobIdx: number, style: CSSProperties) => {
    const val = currentValue[knobIdx];
    const isActive = dragging === knobIdx;
    const isKbFocused = kbFocused === knobIdx;
    const showTooltip = (isActive || isKbFocused) && !disabled;
    const tooltipLabel = formatValue ? formatValue(val) : String(Math.round(val));

    return (
      <Tooltip
        key={knobIdx}
        open={showTooltip}
        label={tooltipLabel}
        placement={isH ? "top" : "right"}
        showDelay={0}
        hideDelay={0}
        showTail={false}
      >
        <div
          ref={knobRefs[knobIdx]}
          className={cx(
            styles.knob,
            isActive && styles.knobActive,
            isKbFocused && styles.knobKbFocused,
            disabled && styles.knobDisabled,
          )}
          style={style}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={val}
          aria-valuetext={getAriaValueText(val)}
          aria-disabled={disabled || undefined}
          aria-orientation={orientation}
          onPointerDown={(e) => handleKnobPointerDown(knobIdx, e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={(e) => handleKeyDown(knobIdx, e)}
          onFocus={() => handleFocus(knobIdx)}
          onBlur={handleBlur}
          onTransitionEnd={triggerTooltipReposition}
        />
      </Tooltip>
    );
  };

  /* ── root class ─────────────────────────────── */

  const rootClass = cx(
    styles.root,
    styles[size],
    styles[orientation],
    disabled && styles.disabled,
    className,
  );

  const leadingSlot = leadingIcon ? (
    <div className={styles.iconSlot}>{leadingIcon}</div>
  ) : null;

  const trailingSlot = trailingIcon ? (
    <div className={styles.iconSlot}>{trailingIcon}</div>
  ) : null;

  return (
    <div className={rootClass}>
      <div className={styles.barRow}>
        {isH ? leadingSlot : trailingSlot}

        <div className={styles.trackContainer}>
          <div
            ref={trackRef}
            className={styles.track}
            onPointerDown={handleTrackPointerDown}
          >
            <div className={styles.indicator} style={indicatorStyle} />
            {renderKnob(0, knob0Style)}
            {range && renderKnob(1, knob1Style)}
          </div>

          {markerItems && (
            <div className={styles.markers}>
              {marks!.map((m, i) => {
                const pct = valueToPct(m.value, min, max);
                const posStyle: CSSProperties = isH
                  ? { left: `${pct}%` }
                  : { bottom: `${pct}%` };
                return (
                  <span key={i} className={styles.marker} style={posStyle}>
                    {m.label ?? m.value}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {isH ? trailingSlot : leadingSlot}
      </div>
    </div>
  );
}
