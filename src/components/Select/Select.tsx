import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import {
  SelectButton,
  type SelectButtonSize,
  type SelectButtonEmphasis,
} from "../SelectButton";
import { Dropdown, type DropdownPlacement } from "../Dropdown";
import { SingleSelectOption } from "../SingleSelectOption";
import { OptionSeparator } from "../OptionSeparator";
import type { OptionItemTrailingProps } from "../OptionItemTrailing";

/* ═══════════════════════════════════════════════════════════════════════
   Context
   ═══════════════════════════════════════════════════════════════════════ */

interface SelectContextValue {
  value: string | null;
  selectedLabel: string | null;
  onSelect: (value: string, label: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  disabled: boolean;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = useContext(SelectContext);
  if (!ctx)
    throw new Error(
      "Select compound components must be used within <Select>"
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

export interface SelectProps {
  /** Controlled selected value */
  value?: string | null;
  /** Called when user selects an item */
  onValueChange?: (value: string) => void;
  /** Controlled open state */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** Form field name — renders a hidden native <select> for form submission */
  name?: string;
  children: ReactNode;
}

function SelectRoot({
  value: controlledValue,
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  name,
  children,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState<string | null>(
    controlledValue ?? null
  );
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isControlledValue = controlledValue !== undefined;
  const isControlledOpen = controlledOpen !== undefined;

  const currentValue = isControlledValue ? controlledValue : internalValue;
  const currentOpen = isControlledOpen ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlledOpen) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlledOpen, onOpenChange]
  );

  const onSelect = useCallback(
    (value: string, label: string) => {
      if (!isControlledValue) setInternalValue(value);
      setSelectedLabel(label);
      onValueChange?.(value);
      setOpen(false);
    },
    [isControlledValue, onValueChange, setOpen]
  );

  const ctx: SelectContextValue = {
    value: currentValue,
    selectedLabel,
    onSelect,
    open: currentOpen,
    setOpen,
    triggerRef,
    disabled,
  };

  return (
    <SelectContext.Provider value={ctx}>
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
    </SelectContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Trigger
   ═══════════════════════════════════════════════════════════════════════ */

export interface SelectTriggerProps {
  size?: SelectButtonSize;
  emphasis?: SelectButtonEmphasis;
  error?: boolean;
  leadingIcon?: ReactNode;
  selectedCount?: number;
  className?: string;
  children?: ReactNode;
}

function SelectTrigger({
  size,
  emphasis,
  error,
  leadingIcon,
  selectedCount,
  className,
  children,
}: SelectTriggerProps) {
  const ctx = useSelectContext();

  return (
    <SelectButton
      ref={ctx.triggerRef}
      size={size}
      emphasis={emphasis}
      error={error}
      expanded={ctx.open}
      leadingIcon={leadingIcon}
      selectedCount={selectedCount}
      disabled={ctx.disabled}
      className={className}
      onClick={() => ctx.setOpen(!ctx.open)}
    >
      {children}
    </SelectButton>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Value — renders the selected item's label, or a placeholder
   ═══════════════════════════════════════════════════════════════════════ */

export interface SelectValueProps {
  placeholder?: string;
  children?: ReactNode;
}

function SelectValue({
  placeholder = "Select\u2026",
  children,
}: SelectValueProps) {
  const ctx = useSelectContext();

  if (children !== undefined && children !== null) return <>{children}</>;

  if (ctx.selectedLabel) return <>{ctx.selectedLabel}</>;
  if (ctx.value) return <>{ctx.value}</>;
  return <>{placeholder}</>;
}

/* ═══════════════════════════════════════════════════════════════════════
   Content — wraps Dropdown, auto-wired to context
   ═══════════════════════════════════════════════════════════════════════ */

export interface SelectContentProps {
  placement?: DropdownPlacement;
  width?: number;
  maxHeight?: number;
  header?: ReactNode;
  footer?: ReactNode;
  matchAnchorWidth?: boolean;
  offset?: number;
  className?: string;
  children: ReactNode;
}

function SelectContent({ children, ...dropdownProps }: SelectContentProps) {
  const ctx = useSelectContext();

  return (
    <Dropdown
      open={ctx.open}
      onClose={() => ctx.setOpen(false)}
      anchorRef={ctx.triggerRef}
      {...dropdownProps}
    >
      {children}
    </Dropdown>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Group — thin semantic wrapper
   ═══════════════════════════════════════════════════════════════════════ */

export interface SelectGroupProps {
  children: ReactNode;
}

function SelectGroup({ children }: SelectGroupProps) {
  return <>{children}</>;
}

/* ═══════════════════════════════════════════════════════════════════════
   Label — group heading (maps to OptionSeparator type="group-label")
   ═══════════════════════════════════════════════════════════════════════ */

export interface SelectLabelProps {
  children: string;
}

function SelectLabel({ children }: SelectLabelProps) {
  return <OptionSeparator type="group-label" labelText={children} />;
}

/* ═══════════════════════════════════════════════════════════════════════
   Item — single option (maps to SingleSelectOption)
   ═══════════════════════════════════════════════════════════════════════ */

export interface SelectItemProps {
  value: string;
  disabled?: boolean;
  description?: string;
  leading?: ReactNode;
  trailing?: Omit<OptionItemTrailingProps, "disabled">;
  children: ReactNode;
}

function SelectItem({
  value,
  disabled = false,
  description,
  leading,
  trailing,
  children,
}: SelectItemProps) {
  const ctx = useSelectContext();
  const label = typeof children === "string" ? children : value;

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
   Separator — divider between groups
   ═══════════════════════════════════════════════════════════════════════ */

function SelectSeparator() {
  return <OptionSeparator type="divider" />;
}

/* ═══════════════════════════════════════════════════════════════════════
   Compound export
   ═══════════════════════════════════════════════════════════════════════ */

export const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Group: SelectGroup,
  Label: SelectLabel,
  Item: SelectItem,
  Separator: SelectSeparator,
});
