import {
  forwardRef,
  useState,
  useRef,
  useCallback,
  type InputHTMLAttributes,
  type ReactNode,
  type ChangeEvent,
} from "react";
import { Icon } from "../Icon";
import { InputClear, type InputClearSize } from "../InputClear";
import { SearchInputAttachment, type SearchInputAttachmentSize } from "../SearchInputAttachment";
import { Divider } from "../Divider";
import styles from "./SearchInput.module.css";

export type SearchInputSize = "md" | "lg" | "xl";

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  size?: SearchInputSize;
  /** Show the prefix area (context + attachment) */
  prefix?: boolean;
  /** Show the context section (icon + text) inside the prefix */
  context?: boolean;
  /** Custom icon for the context section */
  contextIcon?: ReactNode;
  /** Text label for the context section */
  contextText?: string;
  /** Show the attachment sub-component inside the prefix */
  attachment?: boolean;
  /** URL of the attached file thumbnail */
  attachmentSrc?: string | null;
  /** Called when the user selects a file attachment */
  onAttach?: (file: File) => void;
  /** Called when the user clears the attachment */
  onAttachClear?: () => void;
  /** Accepted file types for attachment */
  attachmentAccept?: string;
  /** Show the clear button when filled */
  clearable?: boolean;
  /** Called when the clear button is clicked */
  onClear?: () => void;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

const INLINE_SIZE: Record<SearchInputSize, "sm" | "lg"> = {
  md: "sm",
  lg: "lg",
  xl: "lg",
};

const CLEAR_SIZE: Record<SearchInputSize, InputClearSize> = {
  md: "sm",
  lg: "md",
  xl: "lg",
};

const ATTACHMENT_SIZE: Record<SearchInputSize, SearchInputAttachmentSize> = {
  md: "md",
  lg: "md",
  xl: "lg",
};

const SEARCH_ICON_SIZE: Record<SearchInputSize, number> = {
  md: 16,
  lg: 16,
  xl: 20,
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      size = "md",
      prefix: showPrefix = false,
      context: showContext = false,
      contextIcon,
      contextText = "Files",
      attachment: showAttachment = false,
      attachmentSrc,
      onAttach,
      onAttachClear,
      attachmentAccept,
      clearable = true,
      onClear,
      disabled = false,
      value,
      defaultValue,
      onChange,
      className,
      placeholder = "Search...",
      ...rest
    },
    externalRef
  ) => {
    const innerRef = useRef<HTMLInputElement>(null);

    const setRef = useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof externalRef === "function") externalRef(node);
        else if (externalRef) externalRef.current = node;
      },
      [externalRef]
    );

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(
      String(defaultValue ?? "")
    );
    const currentValue = isControlled ? String(value) : internalValue;
    const hasValue = currentValue.length > 0;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleClear = () => {
      if (!isControlled) {
        setInternalValue("");
        if (innerRef.current) innerRef.current.value = "";
      }
      onClear?.();
      innerRef.current?.focus();
    };

    const handleWrapperClick = () => {
      innerRef.current?.focus();
    };

    const hasPrefix = showPrefix && (showContext || showAttachment);

    return (
      <div
        className={cx(
          styles.wrapper,
          styles[size],
          disabled && styles.disabled,
          className
        )}
        onClick={handleWrapperClick}
      >
        {hasPrefix && (
          <div className={styles.prefix}>
            {showContext && (
              <div className={styles.context}>
                <span className={styles.contextIcon}>
                  {contextIcon || (
                    <Icon
                      name="smartly"
                      size={SEARCH_ICON_SIZE[size]}
                    />
                  )}
                </span>
                <span className={cx(styles.contextText, styles[`contextText_${size}`])}>
                  {contextText}
                </span>
              </div>
            )}
            {showAttachment && (
              <SearchInputAttachment
                size={ATTACHMENT_SIZE[size]}
                attachmentSrc={attachmentSrc}
                onAttach={onAttach}
                onClear={onAttachClear}
                accept={attachmentAccept}
              />
            )}
          </div>
        )}

        <div className={styles.leadingText}>
          <Icon
            name="search"
            size={SEARCH_ICON_SIZE[size]}
            className={styles.searchIcon}
          />
          <div className={styles.inputArea}>
            <input
              ref={setRef}
              className={cx(styles.nativeInput, styles[`input_${size}`])}
              disabled={disabled}
              value={isControlled ? value : undefined}
              defaultValue={isControlled ? undefined : defaultValue}
              onChange={handleChange}
              placeholder={placeholder}
              {...rest}
            />
          </div>
        </div>

        {clearable && hasValue && !disabled && (
          <span className={styles.clearSlot}>
            <InputClear
              size={CLEAR_SIZE[size]}
              variant="neutral"
              round
              onClick={handleClear}
              aria-label="Clear search"
            />
          </span>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
