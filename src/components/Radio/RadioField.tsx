import { useId } from "react";
import { Radio, type RadioSize } from "./Radio";
import { SwitchField, type SwitchFieldProps } from "../SwitchField";

export interface RadioFieldProps
  extends Omit<SwitchFieldProps, "htmlFor" | "control" | "size"> {
  checked?: boolean;
  error?: boolean;
  disabled?: boolean;
  size?: RadioSize;
  onChange?: (checked: boolean) => void;
  name?: string;
  value?: string;
  id?: string;
}

export function RadioField({
  checked,
  error,
  disabled,
  size = "sm",
  onChange,
  name,
  value,
  id,
  ...labelProps
}: RadioFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <SwitchField
      {...labelProps}
      size={size}
      disabled={disabled}
      htmlFor={inputId}
      control={
        <Radio
          checked={checked}
          error={error}
          disabled={disabled}
          size={size}
          onChange={onChange}
          name={name}
          value={value}
          id={inputId}
        />
      }
    />
  );
}
