import { useState, useRef, useCallback, useEffect, type CSSProperties } from "react";
import { VideoPlayer, type VideoPlayerRadius } from "@sds/components/VideoPlayer";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = { border: "1px solid #ddd", borderRadius: 8, padding: 16, marginTop: 12 };

const VIDEO_SRC = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function VideoPlayerPlayground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [radius, setRadius] = useState<VideoPlayerRadius>("full");
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlayPause = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
      setExpanded(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const handleVolumeChange = useCallback((vol: number) => {
    setVolume(vol);
    if (videoRef.current) videoRef.current.volume = vol;
  }, []);

  const handleFullscreen = useCallback(() => {
    videoRef.current?.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;

    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onLoadedMetadata = () => setDuration(v.duration);
    const onEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("loadedmetadata", onLoadedMetadata);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("loadedmetadata", onLoadedMetadata);
      v.removeEventListener("ended", onEnded);
    };
  }, [volume]);

  return (
    <>
      <h1>Video Player</h1>

      <section style={sectionStyle}>
        <h2>Interactive Demo</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          A real video controlled by the VideoPlayer component. Click play to expand automatically.
        </p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
          <label style={{ fontSize: 13 }}>
            Radius:{" "}
            <select value={radius} onChange={(e) => setRadius(e.target.value as VideoPlayerRadius)}>
              <option value="sm">sm (4px)</option>
              <option value="md">md (8px)</option>
              <option value="full">full (pill)</option>
            </select>
          </label>
          <label style={{ fontSize: 13 }}>
            <input type="checkbox" checked={expanded} onChange={(e) => setExpanded(e.target.checked)} />{" "}
            Expanded
          </label>
        </div>

        <div style={cardStyle}>
          <div style={{ position: "relative", width: "100%", maxWidth: 480, borderRadius: 12, overflow: "hidden" }}>
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              style={{ display: "block", width: "100%", height: "auto" }}
              playsInline
              preload="metadata"
            />
            <div style={{ position: "absolute", bottom: 8, left: 8, right: 8, zIndex: 2 }}>
              <VideoPlayer
                radius={radius}
                duration={duration}
                currentTime={currentTime}
                playing={playing}
                expanded={expanded}
                volume={volume}
                onPlayPause={handlePlayPause}
                onVolumeChange={handleVolumeChange}
                onAction={handleFullscreen}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
