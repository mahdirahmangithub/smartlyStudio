import { forwardRef, type HTMLAttributes } from "react";
import { Thumbnail, type ThumbnailSize } from "../Thumbnail";
import { Icon, type IconName } from "../Icon";
import styles from "./FileTypeThumbnail.module.css";
import { cx } from "../../utils/cx";

export type FileType =
  | "document"
  | "file"
  | "video"
  | "image"
  | "font"
  | "folder";

export interface FileTypeThumbnailProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  size?: ThumbnailSize;
  fileType?: FileType;
  loading?: boolean;
  error?: boolean;
}

const ICON_SIZE: Record<ThumbnailSize, number> = {
  xs: 16,
  sm: 16,
  md: 24,
  lg: 24,
  xl: 24,
  "2xl": 24,
};

const FILE_TYPE_ICON: Record<FileType, IconName> = {
  document: "draft",
  file: "attach_file",
  video: "slideshow",
  image: "image",
  font: "serif",
  folder: "folder",
};

export const FileTypeThumbnail = forwardRef<
  HTMLDivElement,
  FileTypeThumbnailProps
>(({ size = "md", fileType = "document", loading, error, className, ...rest }, ref) => {
  const isFolder = fileType === "folder";

  return (
    <Thumbnail
      ref={ref}
      size={size}
      type="icon"
      icon={<Icon name={FILE_TYPE_ICON[fileType]} size={ICON_SIZE[size]} />}
      loading={loading}
      error={error}
      className={cx(isFolder && styles.folder, className)}
      {...rest}
    />
  );
});

FileTypeThumbnail.displayName = "FileTypeThumbnail";
