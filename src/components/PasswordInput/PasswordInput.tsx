import { forwardRef, useState } from "react";
import { Input, type InputProps, type InputSize } from "../Input";
import { Icon } from "../Icon";
import { Tooltip } from "../Tooltip";
import styles from "./PasswordInput.module.css";

export interface PasswordInputProps
  extends Omit<InputProps, "type" | "trailingIcon"> {}

const ICON_SIZE: Record<InputSize, number> = {
  md: 16,
  lg: 16,
  xl: 20,
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ size = "md", disabled = false, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <Input
        ref={ref}
        size={size}
        disabled={disabled}
        type={visible ? "text" : "password"}
        trailingIcon={
          <Tooltip
            type="neutral"
            showTail={false}
            placement="top"
            label={visible ? "Hide password" : "Show password"}
          >
            <button
              type="button"
              className={styles.toggle}
              onClick={(e) => {
                e.stopPropagation();
                setVisible((v) => !v);
              }}
              disabled={disabled}
              aria-label={visible ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              <Icon
                name={visible ? "visibility_off" : "visibility"}
                size={ICON_SIZE[size]}
              />
            </button>
          </Tooltip>
        }
        {...rest}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";
