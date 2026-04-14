import { type IconName } from "../Icon";
import { IconThumbnail, type IconThumbnailSize } from "../IconThumbnail";
import type { SurfaceType } from "../../utils/detectSurface";
import styles from "./IconThumbnailRow.module.css";
import { cx } from "../../utils/cx";

export type IconThumbnailRowSize = IconThumbnailSize;

export interface IconThumbnailRowProps {
  /** Icon names to display as overlapping circular chips */
  icons: IconName[];
  /** Size variant */
  size?: IconThumbnailRowSize;
  /** Max visible icons — surplus auto-shows as "+N" */
  max?: number;
  /** Show an outline ring on each chip that adapts to the parent surface */
  outline?: boolean;
  /** Which surface background the outline should match */
  surface?: SurfaceType;
  className?: string;
}

export function IconThumbnailRow({
  icons,
  size = "lg",
  max,
  outline = true,
  surface = "auto",
  className,
}: IconThumbnailRowProps) {
  const visible = max != null && max < icons.length ? icons.slice(0, max) : icons;
  const overflow = max != null ? Math.max(0, icons.length - max) : 0;

  if (visible.length === 0) return null;

  return (
    <div
      className={cx(styles.root, styles[size], className)}
      aria-hidden="true"
    >
      <div className={styles.icons}>
        {visible.map((name, i) => (
          <IconThumbnail
            key={`${name}-${i}`}
            icon={name}
            size={size}
            outline={outline}
            surface={surface}
            className={styles.chip}
            style={{ zIndex: i + 1 }}
          />
        ))}
      </div>

      {overflow > 0 && (
        <span className={styles.overflow}>+{overflow}</span>
      )}
    </div>
  );
}

IconThumbnailRow.displayName = "IconThumbnailRow";
