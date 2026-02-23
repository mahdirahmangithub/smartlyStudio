import { useRef, type HTMLAttributes } from "react";
import { Icon } from "../Icon";
import { InputClear } from "../InputClear";
import { Divider } from "../Divider";
import styles from "./SearchInputAttachment.module.css";

export type SearchInputAttachmentSize = "md" | "lg";

export interface SearchInputAttachmentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  size?: SearchInputAttachmentSize;
  /** URL of the attached file thumbnail — null/undefined means no file attached */
  attachmentSrc?: string | null;
  /** Alt text for the thumbnail */
  attachmentAlt?: string;
  /** Called when the user selects a file */
  onAttach?: (file: File) => void;
  /** Called when the user clears the attachment */
  onClear?: () => void;
  /** Accepted file types (passed to the hidden input's accept attribute) */
  accept?: string;
}

function cx(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function SearchInputAttachment({
  size = "md",
  attachmentSrc,
  attachmentAlt = "Attachment",
  onAttach,
  onClear,
  accept = "image/*",
  className,
  ...rest
}: SearchInputAttachmentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filled = !!attachmentSrc;

  const handleClick = () => {
    if (!filled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAttach?.(file);
      e.target.value = "";
    }
  };

  const handleClear = () => {
    onClear?.();
  };

  return (
    <div
      className={cx(styles.wrapper, styles[size], className)}
      {...rest}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className={styles.hiddenInput}
        onChange={handleFileChange}
        tabIndex={-1}
        aria-hidden="true"
      />

      {filled ? (
        <div className={styles.filledArea}>
          <div className={styles.thumbnail}>
            <img
              src={attachmentSrc!}
              alt={attachmentAlt}
              className={styles.thumbnailImg}
            />
          </div>
          <InputClear
            size={size === "lg" ? "xs" : "2xs"}
            variant="neutral"
            round
            onClick={handleClear}
            aria-label="Remove attachment"
          />
        </div>
      ) : (
        <button
          type="button"
          className={styles.addButton}
          onClick={handleClick}
          aria-label="Add attachment"
        >
          <Icon
            name="add_photo_alternate"
            size={size === "lg" ? 20 : 16}
            className={styles.addIcon}
          />
        </button>
      )}

      <Divider orientation="vertical" />
    </div>
  );
}
