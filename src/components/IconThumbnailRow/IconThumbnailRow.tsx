import { Icon, type IconName } from "../Icon";
import styles from "./IconThumbnailRow.module.css";
import { cx } from "../../utils/cx";

export type IconThumbnailRowSize = "sm" | "md" | "lg";

export interface IconThumbnailRowProps {
  /** Icon names to display as overlapping circular chips */
  icons: IconName[];
  /** Size variant */
  size?: IconThumbnailRowSize;
  /** Max visible icons — surplus auto-shows as "+N" */
  max?: number;
  className?: string;
}

const ICON_SIZE: Record<IconThumbnailRowSize, number> = {
  lg: 20,
  md: 16,
  sm: 12,
};

export function IconThumbnailRow({
  icons,
  size = "lg",
  max,
  className,
}: IconThumbnailRowProps) {
  const visible = max != null && max < icons.length ? icons.slice(0, max) : icons;
  const overflow = max != null ? Math.max(0, icons.length - max) : 0;
  const iconSize = ICON_SIZE[size];

  if (visible.length === 0) return null;

  return (
    <div
      className={cx(styles.root, styles[size], className)}
      aria-hidden="true"
    >
      <div className={styles.icons}>
        {visible.map((name, i) => (
          <span key={`${name}-${i}`} className={styles.chip} style={{ zIndex: i + 1 }}>
            <Icon name={name} size={iconSize} />
          </span>
        ))}
      </div>

      {overflow > 0 && (
        <span className={styles.overflow}>+{overflow}</span>
      )}
    </div>
  );
}

IconThumbnailRow.displayName = "IconThumbnailRow";
