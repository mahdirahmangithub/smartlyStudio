import { useId } from "react";
import { Checkbox, type CheckboxSize } from "./Checkbox";
import { SwitchField, type SwitchFieldProps } from "../SwitchField";

export interface CheckboxFieldProps
  extends Omit<SwitchFieldProps, "htmlFor" | "control" | "size"> {
  checked?: boolean;
  indeterminate?: boolean;
  error?: boolean;
  disabled?: boolean;
  size?: CheckboxSize;
  onChange?: (checked: boolean) => void;
  name?: string;
  id?: string;
}

export function CheckboxField({
  checked,
  indeterminate,
  error,
  disabled,
  size = "sm",
  onChange,
  name,
  id,
  ...labelProps
}: CheckboxFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <SwitchField
      {...labelProps}
      size={size}
      disabled={disabled}
      htmlFor={inputId}
      control={
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          error={error}
          disabled={disabled}
          size={size}
          onChange={onChange}
          name={name}
          id={inputId}
        />
      }
    />
  );
}
