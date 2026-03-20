import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../Icon";
import { IconButton } from "../IconButton";
import styles from "./VideoPlayer.module.css";

export type VideoPlayerRadius = "sm" | "md" | "full";

export interface VideoPlayerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Border-radius: sm (4px), md (8px), full (pill) */
  radius?: VideoPlayerRadius;
  /** Total duration in seconds */
  duration: number;
  /** Current playback position in seconds */
  currentTime?: number;
  /** Whether the video is currently playing */
  playing?: boolean;
  /** Whether the player is expanded (shows full controls) */
  expanded?: boolean;
  /** Current volume 0–1 */
  volume?: number;
  /** Called when user clicks play/pause */
  onPlayPause?: () => void;
  /** Called when user changes volume */
  onVolumeChange?: (volume: number) => void;
  /** Called when user clicks the action button (fullscreen/more) */
  onAction?: () => void;
  /** Override icon for the rightmost action button */
  actionIcon?: ReactNode;
}

const RADIUS_CLASS: Record<VideoPlayerRadius, string> = {
  sm: styles.radiusSm,
  md: styles.radiusMd,
  full: styles.radiusFull,
};

function getVolumeIcon(vol: number) {
  if (vol <= 0) return "volume_mute_fill" as const;
  if (vol <= 0.5) return "volume_down_fill" as const;
  return "volume_up_fill" as const;
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export const VideoPlayer = forwardRef<HTMLDivElement, VideoPlayerProps>(
  function VideoPlayer(
    {
      radius = "sm",
      duration,
      currentTime = 0,
      playing = false,
      expanded = false,
      volume = 1,
      onPlayPause,
      onVolumeChange,
      onAction,
      actionIcon,
      className,
      ...rest
    },
    ref,
  ) {
    const [volumeOpen, setVolumeOpen] = useState(false);
    const volumeRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);

    const handleVolumeToggle = useCallback(() => {
      setVolumeOpen((v) => !v);
    }, []);

    useEffect(() => {
      if (!volumeOpen) return;
      function handleClickOutside(e: MouseEvent) {
        if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
          setVolumeOpen(false);
        }
      }
      document.addEventListener("pointerdown", handleClickOutside);
      return () => document.removeEventListener("pointerdown", handleClickOutside);
    }, [volumeOpen]);

    const updateVolumeFromEvent = useCallback(
      (clientY: number) => {
        if (!trackRef.current || !onVolumeChange) return;
        const rect = trackRef.current.getBoundingClientRect();
        const pct = 1 - (clientY - rect.top) / rect.height;
        onVolumeChange(Math.max(0, Math.min(1, pct)));
      },
      [onVolumeChange],
    );

    const handleTrackPointerDown = useCallback(
      (e: React.PointerEvent) => {
        e.preventDefault();
        draggingRef.current = true;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        updateVolumeFromEvent(e.clientY);
      },
      [updateVolumeFromEvent],
    );

    const handleTrackPointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!draggingRef.current) return;
        updateVolumeFromEvent(e.clientY);
      },
      [updateVolumeFromEvent],
    );

    const handleTrackPointerUp = useCallback(() => {
      draggingRef.current = false;
    }, []);

    const handleVolumeKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!onVolumeChange) return;
        let next = volume;
        if (e.key === "ArrowUp" || e.key === "ArrowRight") {
          next = Math.min(1, volume + 0.05);
        } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
          next = Math.max(0, volume - 0.05);
        } else if (e.key === "Home") {
          next = 0;
        } else if (e.key === "End") {
          next = 1;
        } else {
          return;
        }
        e.preventDefault();
        onVolumeChange(next);
      },
      [volume, onVolumeChange],
    );

    return (
      <div
        ref={ref}
        className={cx(
          styles.root,
          RADIUS_CLASS[radius],
          expanded && styles.expanded,
          className,
        )}
        role="group"
        aria-label="Video player controls"
        {...rest}
      >
        <div className={styles.playDuration}>
          <IconButton
            size="sm"
            variant="inverse"
            emphasis="low"
            hideTooltip
            icon={<Icon name={playing ? "pause_fill" : "play_arrow_fill"} size={16} />}
            aria-label={playing ? "Pause" : "Play"}
            onClick={onPlayPause}
          />

          <div className={styles.progressDuration}>
            {playing && (
              <div className={styles.progress}>
                <span className={styles.timeText}>
                  {formatTime(currentTime)}
                </span>
                <span className={styles.divider} aria-hidden="true" />
              </div>
            )}
            <span className={cx(styles.timeText, (expanded || playing) && styles.durationGrow)}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {expanded && (
          <div className={styles.controls}>
            <div className={styles.volumeContainer} ref={volumeRef}>
              <div
                className={cx(
                  styles.volumePopup,
                  volumeOpen ? styles.volumePopupOpen : styles.volumePopupClosed,
                )}
              >
                <div className={styles.volumeSlider}>
                  <div className={styles.volumeTrackContainer}>
                    <div
                      ref={trackRef}
                      className={styles.volumeTrack}
                      role="slider"
                      aria-label="Volume"
                      aria-orientation="vertical"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(volume * 100)}
                      tabIndex={volumeOpen ? 0 : -1}
                      onPointerDown={handleTrackPointerDown}
                      onPointerMove={handleTrackPointerMove}
                      onPointerUp={handleTrackPointerUp}
                      onKeyDown={handleVolumeKeyDown}
                    >
                      <div
                        className={styles.volumeIndicator}
                        style={{ height: `${volume * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className={styles.volumeIcon} aria-hidden="true">
                    <Icon name={getVolumeIcon(volume)} size={16} />
                  </span>
                </div>
              </div>
              <IconButton
                size="sm"
                variant="inverse"
                emphasis="low"
                hideTooltip
                icon={<Icon name={getVolumeIcon(volume)} size={16} />}
                aria-label="Volume"
                aria-expanded={volumeOpen}
                onClick={handleVolumeToggle}
              />
            </div>

            <IconButton
              size="sm"
              variant="inverse"
              emphasis="low"
              hideTooltip
              icon={actionIcon ?? <Icon name="fullscreen" size={16} />}
              aria-label="Fullscreen"
              onClick={onAction}
            />
          </div>
        )}
      </div>
    );
  },
);

VideoPlayer.displayName = "VideoPlayer";
