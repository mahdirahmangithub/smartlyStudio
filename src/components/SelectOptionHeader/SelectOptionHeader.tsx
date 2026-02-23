import {
  forwardRef,
  useRef,
  type HTMLAttributes,
  type ChangeEvent,
  type Ref,
} from "react";
import { SearchInput } from "../SearchInput";
import { Input } from "../Input";
import styles from "./SelectOptionHeader.module.css";

export type SelectOptionHeaderType = "search" | "from-to";

export interface SelectOptionHeaderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  type?: SelectOptionHeaderType;

  /** Search value (controlled) */
  searchValue?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Called when search value changes */
  onSearchChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Called when search is cleared */
  onSearchClear?: () => void;
  /** Ref for the search input element */
  searchRef?: Ref<HTMLInputElement>;

  /** "From" field value (controlled) */
  fromValue?: string;
  /** "From" field placeholder */
  fromPlaceholder?: string;
  /** Called when "From" value changes */
  onFromChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Ref for the "from" input element */
  fromRef?: Ref<HTMLInputElement>;

  /** "To" field value (controlled) */
  toValue?: string;
  /** "To" field placeholder */
  toPlaceholder?: string;
  /** Called when "To" value changes */
  onToChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Ref for the "to" input element */
  toRef?: Ref<HTMLInputElement>;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export const SelectOptionHeader = forwardRef<
  HTMLDivElement,
  SelectOptionHeaderProps
>(
  (
    {
      type = "search",
      searchValue,
      searchPlaceholder = "Search...",
      onSearchChange,
      onSearchClear,
      searchRef,
      fromValue,
      fromPlaceholder = "From",
      onFromChange,
      fromRef,
      toValue,
      toPlaceholder = "To",
      onToChange,
      toRef,
      className,
      ...rest
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cx(
          styles.container,
          type === "from-to" && styles.fromTo,
          className
        )}
        {...rest}
      >
        {type === "search" && (
          <SearchInput
            ref={searchRef}
            size="lg"
            value={searchValue}
            placeholder={searchPlaceholder}
            onChange={onSearchChange}
            onClear={onSearchClear}
            clearable
          />
        )}

        {type === "from-to" && (
          <>
            <Input
              ref={fromRef}
              size="md"
              value={fromValue}
              placeholder={fromPlaceholder}
              onChange={onFromChange}
            />
            <Input
              ref={toRef}
              size="md"
              value={toValue}
              placeholder={toPlaceholder}
              onChange={onToChange}
            />
          </>
        )}
      </div>
    );
  }
);

SelectOptionHeader.displayName = "SelectOptionHeader";
