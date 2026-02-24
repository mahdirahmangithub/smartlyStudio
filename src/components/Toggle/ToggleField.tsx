import { useId } from "react";
import { Toggle, type ToggleSize } from "./Toggle";
import { SwitchField, type SwitchFieldProps } from "../SwitchField";

export interface ToggleFieldProps
  extends Omit<SwitchFieldProps, "htmlFor" | "control" | "size"> {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  size?: ToggleSize;
  onChange?: (checked: boolean) => void;
  name?: string;
  id?: string;
  "aria-describedby"?: string;
}

export function ToggleField({
  checked,
  indeterminate,
  disabled,
  size = "sm",
  onChange,
  name,
  id,
  "aria-describedby": ariaDescribedby,
  ...labelProps
}: ToggleFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <SwitchField
      {...labelProps}
      size={size}
      disabled={disabled}
      htmlFor={inputId}
      control={
        <Toggle
          checked={checked}
          indeterminate={indeterminate}
          disabled={disabled}
          size={size}
          onChange={onChange}
          name={name}
          id={inputId}
          aria-describedby={ariaDescribedby}
        />
      }
    />
  );
}
