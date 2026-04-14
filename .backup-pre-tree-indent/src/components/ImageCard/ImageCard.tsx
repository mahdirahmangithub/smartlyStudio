import { forwardRef, type ReactNode } from "react";
import {
  Card,
  CardMedia,
  CardMediaContent,
  CardMediaBar,
} from "../Card";
import type { CardRadius } from "../Card";
import type { ImageryAspectRatio } from "../Imagery";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import { ProgressiveBlur } from "../ProgressiveBlur";
import styles from "./ImageCard.module.css";

export type ImageCardVariant = "outline-hairline" | "elevated";

export interface ImageCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "children"> {
  variant?: ImageCardVariant;
  radius?: CardRadius;
  aspectRatio?: ImageryAspectRatio;
  title?: string;
  description?: string;
  /** Media bar left actions (defaults to thumbs up/down) */
  leadingActions?: ReactNode;
  /** Media bar right actions (defaults to download) */
  trailingActions?: ReactNode;
  children: ReactNode;
}

const defaultLeading = (
  <>
    <IconButton size="md" variant="inverse" emphasis="low" icon={<Icon name="thumb_up" size={16} />} aria-label="Like" />
    <IconButton size="md" variant="inverse" emphasis="low" icon={<Icon name="thumb_down" size={16} />} aria-label="Dislike" />
  </>
);

const defaultTrailing = (
  <IconButton size="md" variant="inverse" emphasis="low" icon={<Icon name="download" size={16} />} aria-label="Download" />
);

export const ImageCard = forwardRef<HTMLElement, ImageCardProps>(
  function ImageCard(
    {
      variant = "outline-hairline",
      radius = "lg",
      aspectRatio = "1:1",
      title,
      description,
      leadingActions,
      trailingActions,
      children,
      ...rest
    },
    ref,
  ) {
    const hasOverlay = title || description;

    return (
      <Card
        ref={ref}
        variant={variant}
        radius={radius}
        density="sm"
        {...rest}
      >
        <CardMedia>
          <CardMediaContent type="image" aspectRatio={aspectRatio}>
            {children}
          </CardMediaContent>
          <CardMediaBar
            leading={leadingActions ?? defaultLeading}
            trailing={trailingActions ?? defaultTrailing}
          />
          {hasOverlay && (
            <div className={styles.overlay} data-theme="light">
              <ProgressiveBlur position="bottom">
                <div className={styles.textContent}>
                  {title && <span className={styles.title}>{title}</span>}
                  {description && <span className={styles.description}>{description}</span>}
                </div>
              </ProgressiveBlur>
            </div>
          )}
        </CardMedia>
      </Card>
    );
  },
);

ImageCard.displayName = "ImageCard";
