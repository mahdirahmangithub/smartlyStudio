import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type DragEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "../Button";
import { Dropdown } from "../Dropdown";
import { GenericSelectOption } from "../GenericSelectOption";
import { Icon } from "../Icon";
import { InlineMessage } from "../InlineMessage";
import { readDroppedEntries, buildEntriesFromFileList, type DroppedEntry } from "../FileUpload/fileUploadUtils";
import styles from "./FileUploadDropzone.module.css";
import { cx } from "../../utils/cx";

export interface UploadOption {
  /** Unique key */
  key: string;
  /** Display label */
  label: string;
  /** Leading icon or content */
  leading?: ReactNode;
  /** Called when selected. For "browse files" actions, call the provided openFilePicker. */
  onSelect: (openFilePicker: () => void) => void;
}

export interface FileUploadDropzoneProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Allowed MIME types / extensions (maps to input accept) */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Allow folder upload (webkitdirectory) */
  directory?: boolean;
  /** Override the default upload icon */
  icon?: ReactNode;
  /** Title text inside the zone */
  title?: string;
  /** Description text (file type hints, size limits, etc.) */
  description?: string;
  /** Upload button label */
  buttonLabel?: string;
  /**
   * When provided, the button shows a trailing chevron and opens a dropdown
   * with these options instead of directly opening the file picker.
   * Each option receives `openFilePicker` in its `onSelect` callback so it
   * can trigger the native file dialog when appropriate.
   */
  uploadOptions?: UploadOption[];
  /** Hint text below the zone (neutral InlineMessage) */
  hintText?: string;
  /** Error text below the zone (alert InlineMessage, replaces hint) */
  errorText?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Callback when files are selected or dropped (flat list, no folder structure) */
  onFiles?: (files: File[]) => void;
  /** Callback when entries are dropped with folder hierarchy preserved */
  onDropEntries?: (entries: DroppedEntry[]) => void;
}

const DEFAULT_TITLE =
  "Drag and drop files and folders or browse to upload";
const DEFAULT_DESCRIPTION =
  "A note for extra info (such as: File Type, Max File Size etc.)";
const DEFAULT_BUTTON_LABEL = "Upload";

export const FileUploadDropzone = forwardRef<
  HTMLDivElement,
  FileUploadDropzoneProps
>(
  (
    {
      accept,
      multiple = true,
      directory = false,
      icon,
      title = DEFAULT_TITLE,
      description = DEFAULT_DESCRIPTION,
      buttonLabel = DEFAULT_BUTTON_LABEL,
      uploadOptions,
      hintText,
      errorText,
      disabled = false,
      onFiles,
      onDropEntries,
      className,
      ...rest
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dragCounter = useRef(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const uid = useId();
    const titleId = `${uid}-title`;
    const descId = description ? `${uid}-desc` : undefined;
    const hintId = hintText ? `${uid}-hint` : undefined;
    const errorId = errorText ? `${uid}-error` : undefined;

    const openFilePicker = useCallback(() => {
      if (disabled) return;
      inputRef.current?.click();
    }, [disabled]);

    const handleFiles = useCallback(
      (files: FileList | null) => {
        if (!files || files.length === 0) return;
        onFiles?.(Array.from(files));
      },
      [onFiles]
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0 && onDropEntries && directory) {
          onDropEntries(buildEntriesFromFileList(Array.from(files)));
        } else {
          handleFiles(files);
        }
        if (inputRef.current) inputRef.current.value = "";
      },
      [handleFiles, onDropEntries, directory]
    );

    const handleDragEnter = useCallback(
      (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        dragCounter.current += 1;
        if (dragCounter.current === 1) setIsDragging(true);
      },
      [disabled]
    );

    const handleDragOver = useCallback(
      (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      },
      []
    );

    const handleDragLeave = useCallback(
      (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
          dragCounter.current = 0;
          setIsDragging(false);
        }
      },
      [disabled]
    );

    const handleDrop = useCallback(
      (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsDragging(false);
        if (disabled) return;

        if (onDropEntries) {
          readDroppedEntries(e.dataTransfer).then(onDropEntries);
        } else {
          handleFiles(e.dataTransfer.files);
        }
      },
      [disabled, handleFiles, onDropEntries]
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (uploadOptions) {
            setDropdownOpen((prev) => !prev);
          } else {
            openFilePicker();
          }
        }
      },
      [disabled, openFilePicker, uploadOptions]
    );

    const handleButtonClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (uploadOptions) {
          setDropdownOpen((prev) => !prev);
        } else {
          openFilePicker();
        }
      },
      [openFilePicker, uploadOptions]
    );

    const describedBy =
      [descId, hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div
        ref={ref}
        className={cx(
          styles.root,
          disabled && styles.disabled,
          !!errorText && styles.error,
          className
        )}
        aria-disabled={disabled || undefined}
        {...rest}
      >
        {/* dashed border interactive area */}
        <div
          className={styles.input}
          onClick={openFilePicker}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={styles.iconText}>
            <span className={styles.uploadIcon} aria-hidden="true">
              {icon ?? <Icon name="upload" size={24} />}
            </span>
            <div className={styles.textGroup}>
              <p id={titleId} className={styles.title}>{title}</p>
              {description && (
                <p id={descId} className={styles.description}>{description}</p>
              )}
            </div>
          </div>

          <Button
            ref={buttonRef}
            size="md"
            variant="brand"
            emphasis="high"
            disabled={disabled}
            leadingIcon={<Icon name="add" size={16} />}
            trailingIcon={
              uploadOptions ? <Icon name="arrow_chevron_down" size={16} /> : undefined
            }
            onClick={handleButtonClick}
            onKeyDown={handleKeyDown}
            aria-labelledby={titleId}
            aria-describedby={describedBy}
            aria-haspopup={uploadOptions ? "listbox" : undefined}
            aria-expanded={uploadOptions ? dropdownOpen : undefined}
          >
            {buttonLabel}
          </Button>

          {uploadOptions && (
            <Dropdown
              open={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
              anchorRef={buttonRef}
              placement="bottom-start"
              role="menu"
              width={240}
            >
              {uploadOptions.map((opt) => (
                <GenericSelectOption
                  key={opt.key}
                  labelText={opt.label}
                  leading={opt.leading}
                  description={false}
                  itemRole="menuitem"
                  onClick={() => {
                    setDropdownOpen(false);
                    opt.onSelect(openFilePicker);
                  }}
                />
              ))}
            </Dropdown>
          )}

          {/* drag-over overlay */}
          {isDragging && !disabled && (
            <div className={styles.dropOverlay}>
              <Icon
                name="file_stack"
                size={24}
                className={styles.dropIcon}
                aria-hidden="true"
              />
              <p className={styles.dropText}>
                Drop files and folders here
              </p>
            </div>
          )}
        </div>

        {/* screen reader live region for drag state */}
        <div aria-live="assertive" className={styles.hiddenInput} role="status">
          {isDragging && !disabled ? "Drop files and folders here" : ""}
        </div>

        {/* hidden file input */}
        <input
          ref={inputRef}
          type="file"
          className={styles.hiddenInput}
          accept={accept}
          multiple={multiple}
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleInputChange}
          {...(directory
            ? {
                webkitdirectory: "",
                directory: "",
              }
            : {})}
        />

        {/* hint or error message below */}
        {errorText ? (
          <InlineMessage
            id={errorId}
            type="alert"
            emphasis="low"
            text={errorText}
            showLeadingIcon
            aria-live="polite"
          />
        ) : hintText ? (
          <InlineMessage
            id={hintId}
            type="neutral"
            emphasis="low"
            text={hintText}
            showLeadingIcon={false}
          />
        ) : null}
      </div>
    );
  }
);

FileUploadDropzone.displayName = "FileUploadDropzone";
