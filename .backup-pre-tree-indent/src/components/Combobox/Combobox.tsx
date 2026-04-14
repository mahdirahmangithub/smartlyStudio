import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  type ReactNode,
  type RefObject,
} from "react";
import {
  SelectInput,
  type SelectInputSize,
} from "../SelectInput";
import { Dropdown, type DropdownPlacement } from "../Dropdown";
import { SingleSelectOption } from "../SingleSelectOption";
import { OptionSeparator } from "../OptionSeparator";
import type { OptionItemTrailingProps } from "../OptionItemTrailing";

/* ═══════════════════════════════════════════════════════════════════════
   Context
   ═══════════════════════════════════════════════════════════════════════ */

interface ComboboxContextValue {
  value: string | null;
  selectedLabel: string | null;
  query: string;
  setQuery: (q: string) => void;
  onSelect: (value: string, label: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  anchorRef: RefObject<HTMLDivElement | null>;
  dropdownId: string;
  disabled: boolean;
  readOnly: boolean;
  matchCount: number;
  incMatch: () => void;
  decMatch: () => void;
}

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

function useComboboxContext() {
  const ctx = useContext(ComboboxContext);
  if (!ctx)
    throw new Error(
      "Combobox compound components must be used within <Combobox>"
    );
  return ctx;
}

/* ═══════════════════════════════════════════════════════════════════════
   Hidden native <select> for form submission
   ═══════════════════════════════════════════════════════════════════════ */

const HIDDEN_STYLE: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  opacity: 0,
  pointerEvents: "none",
};

/* ═══════════════════════════════════════════════════════════════════════
   Root
   ═══════════════════════════════════════════════════════════════════════ */

export interface ComboboxProps {
  /** Controlled selected value */
  value?: string | null;
  /** Called when user selects an item */
  onValueChange?: (value: string) => void;
  /** Controlled open state */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  /** Form field name — renders a hidden native <select> for form submission */
  name?: string;
  children: ReactNode;
}

function ComboboxRoot({
  value: controlledValue,
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  readOnly = false,
  name,
  children,
}: ComboboxProps) {
  const [internalValue, setInternalValue] = useState<string | null>(
    controlledValue ?? null
  );
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [query, setQueryState] = useState("");
  const [matchCount, setMatchCount] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const dropdownId = useId();

  const isControlledValue = controlledValue !== undefined;
  const isControlledOpen = controlledOpen !== undefined;

  const currentValue = isControlledValue ? controlledValue : internalValue;
  const currentOpen = isControlledOpen ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlledOpen) setInternalOpen(next);
      onOpenChange?.(next);
      if (!next) setQueryState("");
    },
    [isControlledOpen, onOpenChange]
  );

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
  }, []);

  const onSelect = useCallback(
    (value: string, label: string) => {
      if (!isControlledValue) setInternalValue(value);
      setSelectedLabel(label);
      onValueChange?.(value);
      setOpen(false);
    },
    [isControlledValue, onValueChange, setOpen]
  );

  const incMatch = useCallback(() => setMatchCount((c) => c + 1), []);
  const decMatch = useCallback(() => setMatchCount((c) => c - 1), []);

  const ctx: ComboboxContextValue = {
    value: currentValue,
    selectedLabel,
    query,
    setQuery,
    onSelect,
    open: currentOpen,
    setOpen,
    inputRef,
    anchorRef,
    dropdownId,
    disabled,
    readOnly,
    matchCount,
    incMatch,
    decMatch,
  };

  return (
    <ComboboxContext.Provider value={ctx}>
      {children}
      {name && (
        <select
          name={name}
          value={currentValue ?? ""}
          onChange={() => {}}
          aria-hidden
          tabIndex={-1}
          style={HIDDEN_STYLE}
        >
          <option value="" />
          {currentValue && (
            <option value={currentValue}>
              {selectedLabel ?? currentValue}
            </option>
          )}
        </select>
      )}
    </ComboboxContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Input — wraps SelectInput, wired to context
   ═══════════════════════════════════════════════════════════════════════ */

export interface ComboboxInputProps {
  size?: SelectInputSize;
  error?: boolean;
  leadingIcon?: ReactNode;
  clearable?: boolean;
  placeholder?: string;
  className?: string;
}

function ComboboxInput({
  size,
  error,
  leadingIcon,
  clearable,
  placeholder = "Search\u2026",
  className,
}: ComboboxInputProps) {
  const ctx = useComboboxContext();

  const displayValue = ctx.open ? ctx.query : ctx.selectedLabel ?? "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    ctx.setQuery(e.target.value);
    if (!ctx.open) ctx.setOpen(true);
  };

  const handleClick = () => {
    if (!ctx.open && !ctx.disabled && !ctx.readOnly) ctx.setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && ctx.open) {
      ctx.setOpen(false);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "Enter") {
      if (ctx.open) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const panel = document.getElementById(ctx.dropdownId);
          if (panel) {
            const first = panel.querySelector<HTMLElement>(
              '[role="option"]:not([aria-disabled="true"])'
            );
            first?.focus({ focusVisible: true } as FocusOptions);
          }
        }
      } else {
        e.preventDefault();
        ctx.setOpen(true);
      }
    }
  };

  const handleClear = () => {
    if (!ctx.value) return;
    ctx.onSelect("", "");
    ctx.setQuery("");
  };

  const showClear = clearable && !!ctx.value;

  return (
    <div ref={ctx.anchorRef}>
      <SelectInput
        ref={ctx.inputRef}
        size={size}
        error={error}
        disabled={ctx.disabled}
        readOnly={ctx.readOnly}
        clearable={showClear}
        leadingIcon={leadingIcon}
        placeholder={ctx.open && ctx.selectedLabel ? ctx.selectedLabel : placeholder}
        value={displayValue}
        onChange={handleChange}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onClear={handleClear}
        expanded={ctx.open && !ctx.disabled && !ctx.readOnly}
        className={className}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Content — wraps Dropdown, anchored to Input
   ═══════════════════════════════════════════════════════════════════════ */

export interface ComboboxContentProps {
  placement?: DropdownPlacement;
  width?: number;
  maxHeight?: number;
  offset?: number;
  className?: string;
  children: ReactNode;
}

function ComboboxContent({
  children,
  ...dropdownProps
}: ComboboxContentProps) {
  const ctx = useComboboxContext();

  return (
    <Dropdown
      id={ctx.dropdownId}
      open={ctx.open && !ctx.disabled && !ctx.readOnly}
      onClose={() => ctx.setOpen(false)}
      anchorRef={ctx.anchorRef}
      matchAnchorWidth
      autoFocus={false}
      returnFocusRef={ctx.inputRef}
      {...dropdownProps}
    >
      {children}
    </Dropdown>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Item — single option with auto-filtering
   ═══════════════════════════════════════════════════════════════════════ */

export interface ComboboxItemProps {
  value: string;
  disabled?: boolean;
  description?: string;
  leading?: ReactNode;
  trailing?: Omit<OptionItemTrailingProps, "disabled">;
  /** Text to filter against. Defaults to children (if string) or value. */
  filterValue?: string;
  children: ReactNode;
}

function ComboboxItem({
  value,
  disabled = false,
  description,
  leading,
  trailing,
  filterValue: filterValueProp,
  children,
}: ComboboxItemProps) {
  const ctx = useComboboxContext();
  const label = typeof children === "string" ? children : value;
  const filterValue = filterValueProp ?? label;

  const matches = useMemo(() => {
    if (!ctx.query) return true;
    return filterValue.toLowerCase().includes(ctx.query.toLowerCase());
  }, [ctx.query, filterValue]);

  useLayoutEffect(() => {
    if (matches) {
      ctx.incMatch();
      return () => ctx.decMatch();
    }
  }, [matches, ctx.incMatch, ctx.decMatch]);

  if (!matches) return null;

  return (
    <SingleSelectOption
      labelText={label}
      checked={ctx.value === value}
      disabled={disabled || ctx.disabled}
      description={!!description}
      descriptionText={description}
      leading={leading}
      trailing={trailing}
      onChange={() => ctx.onSelect(value, label)}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Empty — shown when no items match the query
   ═══════════════════════════════════════════════════════════════════════ */

export interface ComboboxEmptyProps {
  children?: ReactNode;
}

function ComboboxEmpty({
  children = "No results",
}: ComboboxEmptyProps) {
  const ctx = useComboboxContext();

  if (ctx.matchCount > 0) return null;

  return (
    <div
      style={{
        padding: "12px 16px",
        color: "var(--text-neutral-placeholder)",
        fontFamily: "var(--type-label-sm-family)",
        fontSize: "var(--type-label-sm-size)",
        lineHeight: "var(--type-label-sm-line-height)",
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Group — thin semantic wrapper
   ═══════════════════════════════════════════════════════════════════════ */

export interface ComboboxGroupProps {
  children: ReactNode;
}

function ComboboxGroup({ children }: ComboboxGroupProps) {
  return <>{children}</>;
}

/* ═══════════════════════════════════════════════════════════════════════
   Label — group heading
   ═══════════════════════════════════════════════════════════════════════ */

export interface ComboboxLabelProps {
  children: string;
}

function ComboboxLabel({ children }: ComboboxLabelProps) {
  return <OptionSeparator type="group-label" labelText={children} />;
}

/* ═══════════════════════════════════════════════════════════════════════
   Separator
   ═══════════════════════════════════════════════════════════════════════ */

function ComboboxSeparator() {
  return <OptionSeparator type="divider" />;
}

/* ═══════════════════════════════════════════════════════════════════════
   Compound export
   ═══════════════════════════════════════════════════════════════════════ */

export const Combobox = Object.assign(ComboboxRoot, {
  Input: ComboboxInput,
  Content: ComboboxContent,
  Item: ComboboxItem,
  Empty: ComboboxEmpty,
  Group: ComboboxGroup,
  Label: ComboboxLabel,
  Separator: ComboboxSeparator,
});
