import {
  useId,
  useRef,
  useState,
  useCallback,
  type ChangeEvent,
  type KeyboardEvent,
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

export function PromptOptionInput({
  label,
  steps,
  onClose,
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
}: PromptOptionInputProps) {
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

  const slotRef = useRef<HTMLDivElement>(null);
  const handleSlotKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
    const container = slotRef.current;
    if (!container) return;
    const items = Array.from(container.querySelectorAll<HTMLElement>('[tabindex="0"]'));
    if (items.length === 0) return;
    e.preventDefault();
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") items[idx === -1 ? 0 : Math.min(idx + 1, items.length - 1)]?.focus();
    else if (e.key === "ArrowUp") items[idx === -1 ? items.length - 1 : Math.max(idx - 1, 0)]?.focus();
    else if (e.key === "Home") items[0]?.focus();
    else if (e.key === "End") items[items.length - 1]?.focus();
  }, []);

  const context: PromptOptionInputContextValue = { optionsDisabled };

  const showActions =
    input !== undefined || onSkip !== undefined || onSubmit !== undefined;

  return (
    <PromptOptionInputContext.Provider value={context}>
      <div
        id={idProp}
        role="group"
        aria-labelledby={ariaLabelledBy ?? labelId}
        aria-label={ariaLabel}
        className={cx(styles.field, className)}
        style={style}
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
                id={searchId}
                className={styles.searchInput}
                value={search.value}
                onChange={(e) => search.onChange?.(e.target.value)}
                placeholder={search.placeholder ?? "Search..."}
                focusIndicator={false}
                hoverIndicator={false}
                aria-label="Search options"
              />
            </div>
          </div>
        )}

        {/* Options slot */}
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
            <div ref={slotRef} onKeyDown={handleSlotKeyDown}>
              {children}
            </div>
          </ScrollFade>
        )}

        {/* Input + Actions */}
        {showActions && (
          <div className={styles.actions}>
            {input !== undefined && (
              <div className={styles.inputArea}>
                <IconContainer
                  name="edit"
                  size="lg"
                  className={styles.inputIcon}
                  aria-hidden
                />
                <InlineInput
                  className={styles.actionInput}
                  value={inputValue}
                  onChange={handleInputChange}
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
}

PromptOptionInput.displayName = "PromptOptionInput";
