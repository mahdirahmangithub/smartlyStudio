import {
  forwardRef,
  Children,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
} from "react";
import styles from "./ContentSwitcher.module.css";
import type {
  ContentSwitcherItemProps,
  ContentSwitcherItemSize,
  ContentSwitcherItemEmphasis,
} from "../ContentSwitcherItem";

export interface ContentSwitcherProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  size?: ContentSwitcherItemSize;
  emphasis?: ContentSwitcherItemEmphasis;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export const ContentSwitcher = forwardRef<HTMLDivElement, ContentSwitcherProps>(
  (
    {
      size = "md",
      emphasis = "high",
      value,
      onChange,
      disabled = false,
      children,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cx(
          styles.switcher,
          styles[size],
          styles[emphasis],
          className
        )}
        {...rest}
      >
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return child;

          const itemProps = child.props as ContentSwitcherItemProps;
          const itemValue = itemProps.value;
          const itemDisabled = disabled || itemProps.disabled;

          return cloneElement(child as ReactElement<ContentSwitcherItemProps>, {
            size,
            emphasis,
            checked: itemValue === value,
            disabled: itemDisabled,
            onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
              itemProps.onClick?.(e);
              if (!itemDisabled && itemValue !== value && itemValue != null) {
                onChange?.(itemValue);
              }
            },
          });
        })}
      </div>
    );
  }
);

ContentSwitcher.displayName = "ContentSwitcher";
