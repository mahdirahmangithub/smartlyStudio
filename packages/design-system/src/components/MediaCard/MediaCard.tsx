import { forwardRef, useState, useCallback, type ReactNode } from "react";
import {
  Card,
  CardMedia,
  CardMediaContent,
  CardMediaBar,
  CardContent,
  CardPretitle,
  CardBody,
  CardTitle,
  CardSlot,
} from "../Card";
import type { CardMediaContentType, CardMediaContentProps, CardMediaBarProps } from "../Card";
import type { ImageryAspectRatio } from "../Imagery";
import { VideoPlayer, type VideoPlayerRadius } from "../VideoPlayer";
import styles from "./MediaCard.module.css";

export type MediaCardVariant = "outline" | "elevated";

export interface MediaCardVideoProps {
  /** Total duration in seconds */
  duration: number;
  /** Current playback position in seconds */
  currentTime?: number;
  /** Whether the video is playing */
  playing?: boolean;
  /** Volume 0–1 */
  volume?: number;
  /** Called on play/pause toggle */
  onPlayPause?: () => void;
  /** Called when volume changes */
  onVolumeChange?: (volume: number) => void;
  /** Called when action button is clicked */
  onAction?: () => void;
  /** Override icon for the action button */
  actionIcon?: ReactNode;
  /** VideoPlayer radius */
  videoRadius?: VideoPlayerRadius;
}

export interface MediaCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "children" | "slot"> {
  variant?: MediaCardVariant;
  /** Whether the card is selected (enables checkbox in media bar) */
  selected?: boolean;
  disabled?: boolean;
  /** CardMediaContent type */
  mediaType?: CardMediaContentType;
  /** Aspect ratio for the media content */
  aspectRatio?: ImageryAspectRatio;
  /** Content rendered inside CardMediaContent */
  children: ReactNode;
  /** Media bar leading actions (after checkbox when selectable) */
  mediaBarLeading?: ReactNode;
  /** Media bar trailing actions */
  mediaBarTrailing?: ReactNode;
  /** Called when selection checkbox is toggled */
  onSelectChange?: CardMediaBarProps["onSelectChange"];
  /** Pretitle area — rendered above the title in CardPretitle */
  pretitle?: ReactNode;
  /** Card title text */
  title?: string;
  /** Leading element for CardTitle */
  titleLeading?: ReactNode;
  /** Trailing slot for CardTitle */
  titleTrailing?: ReactNode;
  /** Arbitrary content rendered in CardSlot after the title */
  slot?: ReactNode;
  /** When provided, renders a VideoPlayer overlay at the bottom of the media */
  video?: MediaCardVideoProps;
}

export const MediaCard = forwardRef<HTMLElement, MediaCardProps>(
  function MediaCard(
    {
      variant = "outline",
      selected,
      disabled,
      mediaType = "image",
      aspectRatio = "16:9",
      children,
      mediaBarLeading,
      mediaBarTrailing,
      onSelectChange,
      pretitle,
      title,
      titleLeading,
      titleTrailing,
      slot,
      video,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref,
  ) {
    const hasContent = pretitle || title || slot;
    const [hovered, setHovered] = useState(false);

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        setHovered(true);
        onMouseEnter?.(e);
      },
      [onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLElement>) => {
        setHovered(false);
        onMouseLeave?.(e);
      },
      [onMouseLeave],
    );

    return (
      <Card
        ref={ref}
        variant={variant}
        density="sm"
        radius="lg"
        inset={false}
        selected={selected}
        disabled={disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        <CardMedia>
          <CardMediaContent {...{ type: mediaType, aspectRatio, children } as CardMediaContentProps} />
          <CardMediaBar
            leading={mediaBarLeading}
            trailing={mediaBarTrailing}
            onSelectChange={onSelectChange}
          />
          {video && (
            <div className={styles.videoOverlay}>
              <VideoPlayer
                radius={video.videoRadius ?? "md"}
                duration={video.duration}
                currentTime={video.currentTime}
                playing={video.playing}
                expanded={hovered}
                volume={video.volume}
                onPlayPause={video.onPlayPause}
                onVolumeChange={video.onVolumeChange}
                onAction={video.onAction}
                actionIcon={video.actionIcon}
              />
            </div>
          )}
        </CardMedia>

        {hasContent && (
          <CardContent>
            <CardBody>
              {pretitle && <CardPretitle>{pretitle}</CardPretitle>}
              {title && (
                <CardTitle size="sm" title={title} leading={titleLeading} trailing={titleTrailing} />
              )}
              {slot && <CardSlot>{slot}</CardSlot>}
            </CardBody>
          </CardContent>
        )}
      </Card>
    );
  },
);

MediaCard.displayName = "MediaCard";
