import { useState, useRef, useEffect, useCallback, type CSSProperties, type ReactNode } from "react";
import {
  Card,
  CardMedia,
  CardMediaContent,
  CardMediaBar,
  CardContent,
  CardBody,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../components/Card";
import type {
  CardVariant,
  CardDensity,
  CardRadius,
  CardLayout,
  CardTitleSize,
  CardMediaContentType,
} from "../components/Card";
import type { ImageryAspectRatio } from "../components/Imagery";
import type { BodyTextSize } from "../components/BodyText";
import { ActionCard, type ActionCardVariant } from "../components/ActionCard";
import { ImageCard, type ImageCardVariant } from "../components/ImageCard";
import { MediaCard, type MediaCardVariant } from "../components/MediaCard";
import { SelectChip } from "../components/SelectChip";
import { Tag } from "../components/Tag";
import { Icon } from "../components/Icon";
import { IconButton } from "../components/IconButton";
import { Avatar } from "../components/Avatar";
import { Imagery } from "../components/Imagery";
import { Button } from "../components/Button";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

type CardState = "normal" | "disabled" | "static";
type LeadingType = "none" | "icon" | "thumbnail" | "avatar";

const THUMBNAIL_SIZE: Record<CardTitleSize, number> = { lg: 48, md: 40, sm: 32 };
const AVATAR_SIZE: Record<CardTitleSize, "xs" | "sm" | "md" | "lg"> = { lg: "lg", md: "md", sm: "sm" };

function getLeading(type: LeadingType, titleSize: CardTitleSize): ReactNode | undefined {
  switch (type) {
    case "icon":
      return <Icon name="favorite" size={titleSize === "sm" ? 16 : 24} />;
    case "thumbnail":
      return (
        <Imagery
          src="https://placehold.co/96x96/e8d5f5/7c3aed?text=T"
          alt="Thumbnail"
          style={{ width: THUMBNAIL_SIZE[titleSize], height: THUMBNAIL_SIZE[titleSize] }}
          radius={titleSize === "lg" ? "lg" : "md"}
        />
      );
    case "avatar":
      return <Avatar size={AVATAR_SIZE[titleSize]} label="User" />;
    default:
      return undefined;
  }
}

function StateGrid() {
  const [variant, setVariant] = useState<CardVariant>("outline");
  const [density, setDensity] = useState<CardDensity>("sm");
  const [radius, setRadius] = useState<CardRadius>("lg");
  const [layout, setLayout] = useState<CardLayout>("vertical");
  const [titleSize, setTitleSize] = useState<CardTitleSize>("md");
  const [leadingType, setLeadingType] = useState<LeadingType>("icon");
  const [descriptionSize, setDescriptionSize] = useState<BodyTextSize>("lg");
  const [state, setState] = useState<CardState>("normal");
  const [selected, setSelected] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showMediaBar, setShowMediaBar] = useState(false);
  const [mediaType, setMediaType] = useState<CardMediaContentType>("image");
  const [mediaAspect, setMediaAspect] = useState<ImageryAspectRatio>("1:1");
  const [inset, setInset] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [showFooter, setShowFooter] = useState(true);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <label style={{ fontSize: 13 }}>
          Variant:{" "}
          <select value={variant} onChange={(e) => setVariant(e.target.value as CardVariant)}>
            <option value="outline">Outline</option>
            <option value="outline-hairline">Outline Hairline</option>
            <option value="elevated">Elevated</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          Density:{" "}
          <select value={density} onChange={(e) => setDensity(e.target.value as CardDensity)}>
            <option value="sm">sm</option>
            <option value="lg">lg</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          Radius:{" "}
          <select value={radius} onChange={(e) => setRadius(e.target.value as CardRadius)}>
            <option value="xs">xs (4px)</option>
            <option value="sm">sm (8px)</option>
            <option value="md">md (12px)</option>
            <option value="lg">lg (16px)</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          Layout:{" "}
          <select value={layout} onChange={(e) => setLayout(e.target.value as CardLayout)}>
            <option value="vertical">Vertical</option>
            <option value="horizontal-leading">Horizontal Leading</option>
            <option value="horizontal-trailing">Horizontal Trailing</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          Title size:{" "}
          <select value={titleSize} onChange={(e) => setTitleSize(e.target.value as CardTitleSize)}>
            <option value="sm">sm</option>
            <option value="md">md</option>
            <option value="lg">lg</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          Leading:{" "}
          <select value={leadingType} onChange={(e) => setLeadingType(e.target.value as LeadingType)}>
            <option value="none">None</option>
            <option value="icon">Icon</option>
            <option value="thumbnail">Thumbnail</option>
            <option value="avatar">Avatar</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          Description size:{" "}
          <select value={descriptionSize} onChange={(e) => setDescriptionSize(e.target.value as BodyTextSize)}>
            <option value="sm">sm</option>
            <option value="md">md</option>
            <option value="lg">lg</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          State:{" "}
          <select value={state} onChange={(e) => setState(e.target.value as CardState)}>
            <option value="normal">Normal</option>
            <option value="disabled">Disabled</option>
            <option value="static">Static</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => setSelected(e.target.checked)}
          />{" "}
          Selected
        </label>
        <label style={{ fontSize: 13 }}>
          <input
            type="checkbox"
            checked={showMedia}
            onChange={(e) => setShowMedia(e.target.checked)}
          />{" "}
          Media
        </label>
        <label style={{ fontSize: 13 }}>
          <input
            type="checkbox"
            checked={inset}
            onChange={(e) => setInset(e.target.checked)}
          />{" "}
          Inset
        </label>
        <label style={{ fontSize: 13 }}>
          <input
            type="checkbox"
            checked={showMediaBar}
            onChange={(e) => setShowMediaBar(e.target.checked)}
          />{" "}
          Media Bar
        </label>
        <label style={{ fontSize: 13 }}>
          Media type:{" "}
          <select value={mediaType} onChange={(e) => setMediaType(e.target.value as CardMediaContentType)}>
            <option value="image">Image</option>
            <option value="icon">Icon</option>
            <option value="file-type">File Type</option>
            <option value="font">Font</option>
            <option value="loading">Loading</option>
            <option value="error">Error</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          Aspect ratio:{" "}
          <select value={mediaAspect} onChange={(e) => setMediaAspect(e.target.value as ImageryAspectRatio)}>
            <option value="1:1">1:1</option>
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
            <option value="3:2">3:2</option>
            <option value="3:4">3:4</option>
            <option value="free-form">Free-form</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          <input
            type="checkbox"
            checked={showTitle}
            onChange={(e) => setShowTitle(e.target.checked)}
          />{" "}
          Card Title
        </label>
        <label style={{ fontSize: 13 }}>
          <input
            type="checkbox"
            checked={showDescription}
            onChange={(e) => setShowDescription(e.target.checked)}
          />{" "}
          Description
        </label>
        <label style={{ fontSize: 13 }}>
          <input
            type="checkbox"
            checked={showFooter}
            onChange={(e) => setShowFooter(e.target.checked)}
          />{" "}
          Footer
        </label>
      </div>

      <div
        style={{
          display: layout === "vertical" ? "grid" : "flex",
          gridTemplateColumns: layout === "vertical" ? "repeat(auto-fill, minmax(280px, 1fr))" : undefined,
          flexDirection: layout !== "vertical" ? "column" : undefined,
          gap: 24,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Card
            key={i}
            variant={variant}
            density={density}
            radius={radius}
            layout={layout}
            inset={inset}
            selected={selected}
            disabled={state === "disabled"}
            isStatic={state === "static"}
            onClick={state === "normal" ? () => setSelected((s) => !s) : undefined}
          >
            {showMedia && (
              <CardMedia width={layout !== "vertical" ? "30%" : undefined}>
                {mediaType === "image" ? (
                  <CardMediaContent type="image" aspectRatio={mediaAspect}>
                    <img
                      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=600&fit=crop"
                      alt="Card media"
                    />
                  </CardMediaContent>
                ) : mediaType === "file-type" ? (
                  <CardMediaContent type="file-type" aspectRatio={mediaAspect} extension=".pdf" />
                ) : mediaType === "font" ? (
                  <CardMediaContent type="font" aspectRatio={mediaAspect} preview="Font preview" />
                ) : mediaType === "error" ? (
                  <CardMediaContent
                    type="error"
                    aspectRatio={mediaAspect}
                    title="Upload failed"
                    description="Could not load image"
                    onRetry={() => alert("Retry clicked")}
                  />
                ) : (
                  <CardMediaContent type={mediaType} aspectRatio={mediaAspect} />
                )}
                {showMediaBar && (
                  <CardMediaBar
                    onSelectChange={(checked) => setSelected(checked)}
                    leading={
                      <>
                        <IconButton size="md" variant="inverse" emphasis="low" icon={<Icon name="thumb_up" size={16} />} aria-label="Like" />
                        <IconButton size="md" variant="inverse" emphasis="low" icon={<Icon name="thumb_down" size={16} />} aria-label="Dislike" />
                      </>
                    }
                    trailing={
                      <>
                        <IconButton size="md" variant="inverse" emphasis="low" icon={<Icon name="visibility" size={16} />} aria-label="Preview" />
                        <IconButton size="md" variant="inverse" emphasis="low" icon={<Icon name="share" size={16} />} aria-label="Share" />
                        <IconButton size="md" variant="inverse" emphasis="low" icon={<Icon name="more_vert" size={16} />} aria-label="More" />
                      </>
                    }
                  />
                )}
              </CardMedia>
            )}
            {(showTitle || showDescription || showFooter) && (
              <CardContent>
                <CardBody>
                  {showTitle && (
                    <CardTitle
                      size={titleSize}
                      title="Card heading"
                      leading={getLeading(leadingType, titleSize)}
                    />
                  )}
                  {showDescription && (
                    <CardDescription size={descriptionSize}>
                      Description text for this card goes here.
                    </CardDescription>
                  )}
                </CardBody>
                {showFooter && (
                  <CardFooter
                    actions={<Button size="md">Action</Button>}
                  />
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function ActionCardDemo() {
  const [acVariant, setAcVariant] = useState<ActionCardVariant>("outline-hairline");
  const [acDisabled, setAcDisabled] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [showDescription, setShowDescription] = useState(true);

  const actions = [
    { icon: "bolt", title: "Quick action", description: "Perform a common task with one click" },
    { icon: "send", title: "Send message", description: "Compose and send a new message" },
    { icon: "settings", title: "Settings", description: "Manage your account preferences" },
    { icon: "rocket", title: "Deploy", description: "Push your latest changes to production" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <label style={{ fontSize: 13 }}>
          Variant:{" "}
          <select value={acVariant} onChange={(e) => setAcVariant(e.target.value as ActionCardVariant)}>
            <option value="outline-hairline">Outline Hairline</option>
            <option value="elevated">Elevated</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          <input type="checkbox" checked={acDisabled} onChange={(e) => setAcDisabled(e.target.checked)} />{" "}
          Disabled
        </label>
        <label style={{ fontSize: 13 }}>
          <input type="checkbox" checked={showThumbnail} onChange={(e) => setShowThumbnail(e.target.checked)} />{" "}
          Thumbnail
        </label>
        <label style={{ fontSize: 13 }}>
          <input type="checkbox" checked={showDescription} onChange={(e) => setShowDescription(e.target.checked)} />{" "}
          Description
        </label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {actions.map((a) => (
          <ActionCard
            key={a.title}
            variant={acVariant}
            disabled={acDisabled}
            icon={showThumbnail ? <Icon name={a.icon} /> : undefined}
            title={a.title}
            description={showDescription ? a.description : undefined}
            onClick={() => alert(a.title)}
          />
        ))}
      </div>
    </div>
  );
}

function ImageCardDemo() {
  const [icVariant, setIcVariant] = useState<ImageCardVariant>("outline-hairline");
  const [icRadius, setIcRadius] = useState<CardRadius>("lg");
  const [showTitle, setShowTitle] = useState(true);
  const [showDescription, setShowDescription] = useState(true);

  const images = [
    { src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=400&fit=crop", title: "Mountain Lake", description: "Calm waters at sunrise" },
    { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop", title: "Golden Valley", description: "Sunlight through the hills" },
    { src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop", title: "Misty Forest", description: "Morning fog in the woods" },
    { src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=400&fit=crop", title: "Ancient Trees", description: "Towering redwood canopy" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <label style={{ fontSize: 13 }}>
          Variant:{" "}
          <select value={icVariant} onChange={(e) => setIcVariant(e.target.value as ImageCardVariant)}>
            <option value="outline-hairline">Outline Hairline</option>
            <option value="elevated">Elevated</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          Radius:{" "}
          <select value={icRadius} onChange={(e) => setIcRadius(e.target.value as CardRadius)}>
            <option value="xs">xs (4px)</option>
            <option value="sm">sm (8px)</option>
            <option value="md">md (12px)</option>
            <option value="lg">lg (16px)</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          <input type="checkbox" checked={showTitle} onChange={(e) => setShowTitle(e.target.checked)} />{" "}
          Title
        </label>
        <label style={{ fontSize: 13 }}>
          <input type="checkbox" checked={showDescription} onChange={(e) => setShowDescription(e.target.checked)} />{" "}
          Description
        </label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {images.map((img, i) => (
          <ImageCard
            key={i}
            variant={icVariant}
            radius={icRadius}
            aspectRatio="1:1"
            title={showTitle ? img.title : undefined}
            description={showDescription ? img.description : undefined}
            onClick={() => alert(`${img.title} clicked`)}
          >
            <img src={img.src} alt={img.title} />
          </ImageCard>
        ))}
      </div>
      <h3 style={{ margin: "16px 0 8px", fontSize: 14 }}>16:9 Aspect Ratio</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {images.slice(0, 2).map((img, i) => (
          <ImageCard
            key={i}
            variant={icVariant}
            radius={icRadius}
            aspectRatio="16:9"
            title={showTitle ? img.title : undefined}
            description={showDescription ? img.description : undefined}
            onClick={() => alert(`${img.title} clicked`)}
          >
            <img src={img.src} alt={img.title} />
          </ImageCard>
        ))}
      </div>
    </div>
  );
}

function MediaCardDemo() {
  const [mcVariant, setMcVariant] = useState<MediaCardVariant>("outline");
  const [mcSelected, setMcSelected] = useState<Record<number, boolean>>({});
  const [showPretitle, setShowPretitle] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [showSlot, setShowSlot] = useState(false);
  const [selectable, setSelectable] = useState(true);
  const [mcDisabled, setMcDisabled] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoVolume, setVideoVolume] = useState(0.7);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const handleVideoPlayPause = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setVideoPlaying(true); }
    else { v.pause(); setVideoPlaying(false); }
  }, []);

  const handleVideoVolume = useCallback((vol: number) => {
    setVideoVolume(vol);
    if (videoRef.current) videoRef.current.volume = vol;
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = videoVolume;
    const onTime = () => setVideoTime(v.currentTime);
    const onMeta = () => setVideoDuration(v.duration);
    const onEnd = () => { setVideoPlaying(false); setVideoTime(0); };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended", onEnd);
    };
  }, [videoVolume]);

  const images = [
    { src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=340&fit=crop", title: "Mountain Lake" },
    { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=340&fit=crop", title: "Golden Valley" },
    { src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=340&fit=crop", title: "Green Hills" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
        <label style={{ fontSize: 13 }}>
          Variant:{" "}
          <select value={mcVariant} onChange={(e) => setMcVariant(e.target.value as MediaCardVariant)}>
            <option value="outline">outline</option>
            <option value="elevated">elevated</option>
          </select>
        </label>
        <label style={{ fontSize: 13 }}>
          <input type="checkbox" checked={selectable} onChange={(e) => setSelectable(e.target.checked)} /> Selectable
        </label>
        <label style={{ fontSize: 13 }}>
          <input type="checkbox" checked={mcDisabled} onChange={(e) => setMcDisabled(e.target.checked)} /> Disabled
        </label>
        <label style={{ fontSize: 13 }}>
          <input type="checkbox" checked={showPretitle} onChange={(e) => setShowPretitle(e.target.checked)} /> Pretitle
        </label>
        <label style={{ fontSize: 13 }}>
          <input type="checkbox" checked={showTitle} onChange={(e) => setShowTitle(e.target.checked)} /> Title
        </label>
        <label style={{ fontSize: 13 }}>
          <input type="checkbox" checked={showSlot} onChange={(e) => setShowSlot(e.target.checked)} /> Slot
        </label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        {images.map((img, i) => (
          <MediaCard
            key={i}
            variant={mcVariant}
            disabled={mcDisabled}
            selected={selectable ? !!mcSelected[i] : undefined}
            onSelectChange={(checked) => setMcSelected((s) => ({ ...s, [i]: checked }))}
            aspectRatio="1:1"
            pretitle={showPretitle ? <SelectChip size="sm" variant="info" emphasis="low">Category</SelectChip> : undefined}
            title={showTitle ? img.title : undefined}
            slot={showSlot ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Tag size="md" variant="neutral" label="Design" /><Tag size="md" variant="neutral" label="Photo" /></div> : undefined}
            onClick={() => {
              if (selectable) setMcSelected((s) => ({ ...s, [i]: !s[i] }));
            }}
          >
            <img src={img.src} alt={img.title} />
          </MediaCard>
        ))}
        <MediaCard
          variant={mcVariant}
          disabled={mcDisabled}
          selected={selectable ? !!mcSelected[3] : undefined}
          onSelectChange={(checked) => setMcSelected((s) => ({ ...s, 3: checked }))}
          aspectRatio="1:1"
          pretitle={showPretitle ? <SelectChip size="sm" variant="info" emphasis="low">Video</SelectChip> : undefined}
          title={showTitle ? "Big Buck Bunny" : undefined}
          slot={showSlot ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Tag size="md" variant="neutral" label="Animation" /><Tag size="md" variant="neutral" label="Video" /></div> : undefined}
          onClick={() => {
            if (selectable) setMcSelected((s) => ({ ...s, 3: !s[3] }));
          }}
          video={{
            duration: videoDuration,
            currentTime: videoTime,
            playing: videoPlaying,
            volume: videoVolume,
            onPlayPause: handleVideoPlayPause,
            onVolumeChange: handleVideoVolume,
            onAction: () => videoRef.current?.requestFullscreen?.(),
          }}
        >
          <video ref={videoRef} src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" playsInline preload="metadata" />
        </MediaCard>
      </div>
    </div>
  );
}

export default function CardPlayground() {
  return (
    <>
      <h1>Card</h1>
      <section style={sectionStyle}>
        <h2>Interactive Demo</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Click a card to toggle selection. Use keyboard (Tab + Enter/Space) to
          test focus ring and keyboard interaction.
        </p>
        <div style={cardStyle}>
          <StateGrid />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Action Card</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Simplified card for clickable actions. Fixed density (sm), radius (md), no media/footer/selection.
        </p>
        <ActionCardDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Image Card</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Media-only card with hover action bar. No content area, no selection.
        </p>
        <ImageCardDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Media Card</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Card with media, selectable checkbox, pretitle (SelectChip), title (sm), and optional slot. Fixed density (sm), radius (lg), no inset, no footer.
        </p>
        <MediaCardDemo />
      </section>

    </>
  );
}
