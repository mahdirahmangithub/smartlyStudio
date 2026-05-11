import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import { Label } from "../Label";
import { IconButton } from "../IconButton";
import { IconContainer } from "../IconContainer";
import { InlineInput } from "../InlineInput";
import { Button } from "../Button";
import { ScrollFade } from "../ScrollFade";
import {
  PromptOptionInputContext,
  type PromptOptionInputContextValue,
} from "./promptOptionInputContext";
import type { PromptOptionInputProps } from "./promptOptionInputTypes";
import styles from "./PromptOptionInput.module.css";
import { cx } from "../../utils/cx";
import { matchesShortcut } from "../../utils/matchesShortcut";

/**
 * Imperative handle for `<PromptOptionInput>`. Mirrors `PromptInputHandle`
 * — pass a typed ref and call methods directly instead of reaching into the
 * DOM.
 */
export interface PromptOptionInputHandle {
  /** Move focus into the picker — search input if present, else first option, else first action button. */
  focus(): void;
  /** Remove focus from whatever inside the picker currently holds it. */
  blur(): void;
}

/**
 * Picker that swaps in for `<PromptInput>` — search input on top, options
 * list, optional free-text input + Close / Skip / Back / Next / Submit
 * controls. Selection-agnostic; compose `<SingleSelectOption>`,
 * `<MultiSelectOption>`, or `<GenericSelectOption>` as children.
 *
 * ## Combobox mode caveat
 *
 * When you pass the `search` prop, this component switches to a combobox
 * keyboard model: the search input keeps DOM focus, and arrow keys / Enter
 * are handled there. To make options visually track the highlight, the
 * component clones each option child with three injected props:
 *
 * - `unmanagedFocus: true` — option drops out of the tab order.
 * - `isActive: boolean` — visual highlight for the current row.
 * - `optionId: string` — target for `aria-activedescendant`.
 *
 * **If you wrap an option in a consumer component, your wrapper must spread
 * `...rest` through to the underlying select option** — otherwise these props
 * get dropped and arrow keys won't visibly move the highlight:
 *
 * ```tsx
 * function MyOption({ label, checked, onChange, ...rest }: MyProps & Partial<ComponentProps<typeof SingleSelectOption>>) {
 *   return <SingleSelectOption {...rest} labelText={label} checked={checked} onChange={onChange} />;
 * }
 * ```
 */
export const PromptOptionInput = forwardRef<PromptOptionInputHandle, PromptOptionInputProps>(({
  label,
  steps,
  onClose,
  info,
  search,
  input,
  hasValue = false,
  isLastStep = false,
  onSkip,
  onSubmit,
  children,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  id: idProp,
  style,
}, ref) => {
  const autoId = useId();
  const labelId = `${autoId}-label`;
  const searchId = `${autoId}-search`;

  const isControlledInput = input !== undefined && input.value !== undefined;
  const [internalInputValue, setInternalInputValue] = useState("");
  const inputValue = isControlledInput
    ? (input?.value ?? "")
    : internalInputValue;

  const optionsDisabled = inputValue.length > 0;
  const effectiveHasValue = hasValue || optionsDisabled;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlledInput) setInternalInputValue(e.target.value);
    input?.onChange?.(e.target.value);
  };

  const isFirstStep = steps ? steps.current <= 1 : true;
  const isLastNavStep = steps ? steps.current >= steps.total : true;

  /* ── Combobox vs real-focus model ────────────────────────────────────────
   * Hybrid: combobox semantics when `search` prop is provided (search input
   * keeps DOM focus, options highlighted via `aria-activedescendant` + the
   * `unmanagedFocus` / `isActive` / `optionId` props on the option components);
   * real DOM focus on options when no search.
   * ────────────────────────────────────────────────────────────────────── */
  const inCombobox = search !== undefined;
  const optionsListId = `${autoId}-options`;

  const slotRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  // Walk children once per render to count pickable options for combobox math.
  const optionChildren = useMemo(() => {
    if (!inCombobox || children == null) return [];
    return Children.toArray(children).filter(isValidElement) as ReactElement[];
  }, [children, inCombobox]);
  const optionCount = optionChildren.length;

  const [activeIndex, setActiveIndex] = useState(0);

  // Keep activeIndex in range as the filter narrows / a step renders fewer options.
  useEffect(() => {
    if (!inCombobox) return;
    if (activeIndex >= optionCount) {
      setActiveIndex(Math.max(0, optionCount - 1));
    }
  }, [activeIndex, optionCount, inCombobox]);

  // Reset highlight to top when the typed query changes (the user is filtering).
  useEffect(() => {
    if (!inCombobox) return;
    setActiveIndex(0);
  }, [search?.value, inCombobox]);

  /** Fire the click handler of the option at `index`. Works for any of our
   * select option components (SingleSelect, MultiSelect, Generic) since they
   * all render an inner element with `id={optionId}`. */
  const pickActiveOption = useCallback((index: number) => {
    const id = `${optionsListId}-opt-${index}`;
    const el = document.getElementById(id);
    el?.click();
  }, [optionsListId]);

  /** Real-focus mode arrow handler — preserved from the original component
   * but now wraps at boundaries to match the rest of the design system. */
  const handleSlotKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (inCombobox) return; // combobox mode handles arrows on the search input
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
    const container = slotRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll<HTMLElement>('[tabindex="0"]'));
    if (items.length === 0) return;
    e.preventDefault();
    const idx = items.indexOf(document.activeElement as HTMLElement);
    const last = items.length - 1;
    if (e.key === "ArrowDown") items[idx === -1 || idx === last ? 0 : idx + 1]?.focus();
    else if (e.key === "ArrowUp") items[idx <= 0 ? last : idx - 1]?.focus();
    else if (e.key === "Home") items[0]?.focus();
    else if (e.key === "End") items[last]?.focus();
  }, [inCombobox]);

  /** Search-input keydown: drives the virtual highlight + Enter-to-pick. */
  const handleSearchKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (optionsDisabled) return; // free-text input takes over — see Phase 3 handoff

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (optionCount > 0) {
        setActiveIndex((i) => (i >= optionCount - 1 ? 0 : i + 1));
      }
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (optionCount > 0) {
        setActiveIndex((i) => (i <= 0 ? optionCount - 1 : i - 1));
      }
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(Math.max(0, optionCount - 1));
      return;
    }
    if (e.key === "Enter") {
      // If we have options to pick, pick the highlighted one.
      if (optionCount > 0) {
        e.preventDefault();
        pickActiveOption(activeIndex);
      }
      return;
    }
    if (e.key === "Escape") {
      // First Escape clears a non-empty search; second closes (next call lands here with empty value).
      if (search?.value && search.onChange) {
        e.preventDefault();
        search.onChange("");
        return;
      }
      if (onClose) {
        e.preventDefault();
        onClose();
      }
    }
  }, [activeIndex, optionCount, pickActiveOption, optionsDisabled, search, onClose]);

  /** Component-level keydown — handles shortcuts that fire from anywhere
   * inside the picker (Escape close, Cmd+Enter submit, Alt+Left/Right step
   * nav) when the more-specific input handlers haven't consumed them. */
  const handleFieldKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    // Cmd/Ctrl+Enter submits regardless of focus location — covers the
    // multi-select-with-confirm flow (user picks several options, hits Cmd+Enter
    // without moving focus) AND the single-select manual-submit flow.
    if (matchesShortcut(e, "mod+enter") && effectiveHasValue && onSubmit) {
      e.preventDefault();
      onSubmit();
      return;
    }

    // Alt+Left / Alt+Right walk the step stack when the consumer wires it.
    if (steps?.onPrev && matchesShortcut(e, "alt+arrowleft")) {
      e.preventDefault();
      if (!isFirstStep) steps.onPrev();
      return;
    }
    if (steps?.onNext && matchesShortcut(e, "alt+arrowright")) {
      e.preventDefault();
      if (!isLastNavStep) steps.onNext();
      return;
    }

    if (e.key === "Escape" && onClose) {
      // The search-input handler intercepts Escape when search has a value;
      // by the time we get here, either there's no search or the search is empty.
      const target = e.target as HTMLElement | null;
      if (target === searchInputRef.current && search?.value) return;
      e.preventDefault();
      onClose();
    }
  }, [onClose, search?.value, effectiveHasValue, onSubmit, steps, isFirstStep, isLastNavStep]);

  /** Auto-focus on mount + step transition. Priority: search → first option →
   * first action button. rAF defers until after the children render. */
  const stepKey = steps?.current ?? 0;
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        return;
      }
      const slot = slotRef.current;
      if (slot) {
        const first = slot.querySelector<HTMLElement>('[tabindex="0"]');
        if (first) {
          first.focus();
          return;
        }
      }
      // Falls through to whatever action button is currently rendered.
      const actionBtn = fieldRef.current?.querySelector<HTMLElement>(
        ".__poi_actions__ button:not(:disabled)",
      );
      actionBtn?.focus();
    });
    return () => cancelAnimationFrame(id);
    // Re-run on step change so each new step lands focus correctly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey]);

  /* ── Imperative handle ─────────────────────────────────────────────────── */
  useImperativeHandle(ref, () => ({
    focus() {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        return;
      }
      const slot = slotRef.current;
      const firstOption = slot?.querySelector<HTMLElement>('[tabindex="0"]');
      if (firstOption) {
        firstOption.focus();
        return;
      }
      const actionBtn = fieldRef.current?.querySelector<HTMLElement>(
        ".__poi_actions__ button:not(:disabled)",
      );
      actionBtn?.focus();
    },
    blur() {
      const active = document.activeElement;
      if (active && fieldRef.current?.contains(active)) {
        (active as HTMLElement).blur();
      }
    },
  }), []);

  const context: PromptOptionInputContextValue = { optionsDisabled };

  const showActions =
    input !== undefined || onSkip !== undefined || onSubmit !== undefined;

  return (
    <PromptOptionInputContext.Provider value={context}>
      {info}
      <div
        ref={fieldRef}
        id={idProp}
        role="group"
        aria-labelledby={ariaLabelledBy ?? labelId}
        aria-label={ariaLabel}
        className={cx(styles.field, info && styles.fieldWithInfo, className)}
        style={style}
        onKeyDown={handleFieldKeyDown}
      >
        {/* Header */}
        <div className={cx(styles.header, search === undefined && styles.headerNoSearch)}>
          <div className={styles.headerLabel}>
            <Label id={labelId} label={label} size="sm" strong density="none" />
          </div>

          {steps && (
            <div
              className={styles.steps}
              role="group"
              aria-label={`Step ${steps.current} of ${steps.total}`}
            >
              <IconButton
                size="md"
                variant="neutral"
                emphasis="low"
                icon={<IconContainer name="chevron_left" size="md" />}
                aria-label="Previous step"
                aria-keyshortcuts={steps.onPrev ? "Alt+ArrowLeft" : undefined}
                disabled={isFirstStep}
                onClick={steps.onPrev}
                hideTooltip
              />
              <span className={styles.stepCount} aria-hidden="true">
                {steps.current} of {steps.total}
              </span>
              <IconButton
                size="md"
                variant="neutral"
                emphasis="low"
                icon={<IconContainer name="chevron_right" size="md" />}
                aria-label="Next step"
                aria-keyshortcuts={steps.onNext ? "Alt+ArrowRight" : undefined}
                disabled={isLastNavStep}
                onClick={steps.onNext}
                hideTooltip
              />
            </div>
          )}

          {onClose && (
            <IconButton
              size="md"
              variant="neutral"
              emphasis="low"
              icon={<IconContainer name="close" size="md" />}
              aria-label="Close"
              onClick={onClose}
              hideTooltip
            />
          )}
        </div>

        {/* Search */}
        {search !== undefined && (
          <div className={styles.search} role="search">
            <div className={styles.searchLeading}>
              <IconContainer
                name="search"
                size="md"
                className={styles.searchIcon}
              />
              <InlineInput
                ref={searchInputRef}
                id={searchId}
                className={styles.searchInput}
                value={search.value}
                onChange={(e) => search.onChange?.(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={search.placeholder ?? "Search..."}
                focusIndicator={false}
                hoverIndicator={false}
                aria-label="Search options"
                role={optionCount > 0 ? "combobox" : undefined}
                aria-expanded={optionCount > 0 ? true : undefined}
                aria-controls={optionCount > 0 ? optionsListId : undefined}
                aria-autocomplete={optionCount > 0 ? "list" : undefined}
                aria-activedescendant={
                  optionCount > 0 && !optionsDisabled
                    ? `${optionsListId}-opt-${Math.min(activeIndex, optionCount - 1)}`
                    : undefined
                }
              />
            </div>
          </div>
        )}

        {/* Options slot. In combobox mode we clone each option child to inject
            `unmanagedFocus` (tabindex=-1, search keeps focus), `isActive` (visual
            highlight), and `optionId` (target for `aria-activedescendant`). */}
        {children != null && (
          <ScrollFade
            direction="vertical"
            surface="default"
            className={styles.slot}
            style={{ height: "auto" }}
            scrollAreaStyle={{
              maxHeight: 260,
              paddingTop: "var(--spacing-sm-extra)",
              paddingBottom: "var(--spacing-sm-extra)",
            }}
          >
            <div
              ref={slotRef}
              id={optionsListId}
              role={inCombobox ? "listbox" : undefined}
              aria-label={inCombobox ? label : undefined}
              onKeyDown={handleSlotKeyDown}
            >
              {inCombobox
                ? Children.map(children, (child, i) => {
                    if (!isValidElement(child)) return child;
                    return cloneElement(child as ReactElement<{
                      unmanagedFocus?: boolean;
                      isActive?: boolean;
                      optionId?: string;
                    }>, {
                      unmanagedFocus: true,
                      isActive: !optionsDisabled && i === activeIndex,
                      optionId: `${optionsListId}-opt-${i}`,
                    });
                  })
                : children}
            </div>
          </ScrollFade>
        )}

        {/* Input + Actions */}
        {showActions && (
          <div className={cx(styles.actions, "__poi_actions__")}>
            {input !== undefined && (
              <div className={styles.inputArea}>
                <IconContainer
                  name="edit"
                  size="lg"
                  className={styles.inputIcon}
                  aria-hidden
                />
                <InlineInput
                  ref={customInputRef}
                  className={styles.actionInput}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    // Use `effectiveHasValue` — Enter should also fire when the
                    // free-text input alone has content (no option selected).
                    // Was previously `hasValue` which missed that case.
                    if (e.key === "Enter" && effectiveHasValue && onSubmit) {
                      e.preventDefault();
                      onSubmit();
                    }
                  }}
                  placeholder={input.placeholder ?? "Type a value..."}
                  focusIndicator={false}
                  hoverIndicator={false}
                  aria-label="Custom value"
                />
              </div>
            )}

            {effectiveHasValue ? (
              <IconButton
                size="md"
                variant={isLastStep ? "brand" : "neutral"}
                emphasis="high"
                icon={
                  <IconContainer
                    name={isLastStep ? "arrow_upward" : "arrow_forward"}
                    size="md"
                  />
                }
                aria-label={isLastStep ? "Submit" : "Next step"}
                aria-keyshortcuts="Meta+Enter Control+Enter"
                onClick={onSubmit}
              />
            ) : (
              onSkip && (
                <Button
                  size="md"
                  variant="neutral"
                  emphasis="medium"
                  onClick={onSkip}
                >
                  Skip
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </PromptOptionInputContext.Provider>
  );
});

PromptOptionInput.displayName = "PromptOptionInput";
