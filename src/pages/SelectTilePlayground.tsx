import { useState, type CSSProperties } from "react";
import { SelectTile, SelectTileGroup } from "../components/SelectTile";
import { Thumbnail } from "../components/Thumbnail";
import { Icon } from "../components/Icon";
import { Avatar } from "../components/Avatar";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

/* ── Single select demo ───────────────────────────────────────────────── */

function SingleSelectDemo() {
  const [value, setValue] = useState("favorites");

  const options = [
    { value: "favorites", label: "Favorites", icon: "favorite" },
    { value: "home", label: "Home", icon: "home" },
    { value: "settings", label: "Settings", icon: "settings" },
    { value: "notifications", label: "Alerts", icon: "notifications" },
  ] as const;

  return (
    <SelectTileGroup
      selectionMode="single"
      aria-label="Category"
    >
      {options.map((opt) => (
        <SelectTile
          key={opt.value}
          value={opt.value}
          label={opt.label}
          checked={value === opt.value}
          onChange={() => setValue(opt.value)}
          thumbnail={
            <Thumbnail
              size="sm"
              type="icon"
              icon={<Icon name={opt.icon} size={24} />}
            />
          }
        />
      ))}
    </SelectTileGroup>
  );
}

/* ── Multi select demo ────────────────────────────────────────────────── */

function MultiSelectDemo() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["music"]),
  );

  const options = [
    { value: "music", label: "Music", icon: "music_note" },
    { value: "star", label: "Starred", icon: "star" },
    { value: "campaign", label: "Campaigns", icon: "campaign" },
    { value: "home", label: "Home", icon: "home" },
  ] as const;

  const toggle = (val: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(val)) next.delete(val);
      else next.add(val);
      return next;
    });
  };

  return (
    <SelectTileGroup
      selectionMode="multi"
      aria-label="Interests"
    >
      {options.map((opt) => (
        <SelectTile
          key={opt.value}
          value={opt.value}
          label={opt.label}
          checked={selected.has(opt.value)}
          onChange={() => toggle(opt.value)}
          thumbnail={
            <Thumbnail
              size="sm"
              type="icon"
              icon={<Icon name={opt.icon} size={24} />}
            />
          }
        />
      ))}
    </SelectTileGroup>
  );
}

/* ── Disabled demo ────────────────────────────────────────────────────── */

function DisabledDemo() {
  return (
    <SelectTileGroup
      selectionMode="single"
      disabled
      aria-label="Disabled group"
    >
      <SelectTile
        value="a"
        label="Checked"
        checked
        thumbnail={
          <Thumbnail size="sm" type="icon" icon={<Icon name="favorite" size={24} />} />
        }
      />
      <SelectTile
        value="b"
        label="Unchecked"
        thumbnail={
          <Thumbnail size="sm" type="icon" icon={<Icon name="home" size={24} />} />
        }
      />
    </SelectTileGroup>
  );
}

/* ── Custom thumbnails demo ───────────────────────────────────────────── */

function CustomThumbnailDemo() {
  const [value, setValue] = useState("avatar");

  return (
    <SelectTileGroup selectionMode="single" aria-label="Custom thumbnails">
      <SelectTile
        value="avatar"
        label="Avatar"
        checked={value === "avatar"}
        onChange={() => setValue("avatar")}
        thumbnail={<Avatar size="sm" alt="Jane Doe" initials="JD" />}
      />
      <SelectTile
        value="media"
        label="Media"
        checked={value === "media"}
        onChange={() => setValue("media")}
        thumbnail={
          <Thumbnail
            size="sm"
            type="media"
            src="https://placehold.co/80x80/e8d5f5/7c3aed?text=Img"
            alt="Example"
          />
        }
      />
      <SelectTile
        value="text"
        label="Text"
        checked={value === "text"}
        onChange={() => setValue("text")}
        thumbnail={<Thumbnail size="sm" type="text" text="+7" />}
      />
    </SelectTileGroup>
  );
}

/* ── States showcase ──────────────────────────────────────────────────── */

function StatesDemo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <SelectTile
        label="Unchecked"
        thumbnail={
          <Thumbnail size="sm" type="icon" icon={<Icon name="favorite" size={24} />} />
        }
      />
      <SelectTile
        label="Checked"
        checked
        thumbnail={
          <Thumbnail size="sm" type="icon" icon={<Icon name="favorite" size={24} />} />
        }
      />
      <SelectTile
        label="Disabled"
        disabled
        thumbnail={
          <Thumbnail size="sm" type="icon" icon={<Icon name="favorite" size={24} />} />
        }
      />
      <SelectTile
        label="Disabled ✓"
        checked
        disabled
        thumbnail={
          <Thumbnail size="sm" type="icon" icon={<Icon name="favorite" size={24} />} />
        }
      />
    </div>
  );
}

/* ── Main playground ──────────────────────────────────────────────────── */

export default function SelectTilePlayground() {
  return (
    <>
      <h1>SelectTile</h1>

      <section style={sectionStyle}>
        <h2>Single select (radio)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Only one tile can be selected at a time. Uses native radio inputs
          with arrow-key navigation.
        </p>
        <div style={cardStyle}>
          <SingleSelectDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Multi select (checkbox)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Multiple tiles can be toggled independently. Uses native checkbox
          inputs.
        </p>
        <div style={cardStyle}>
          <MultiSelectDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>States</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Unchecked, checked, disabled, and disabled + checked states.
        </p>
        <div style={cardStyle}>
          <StatesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Custom thumbnails</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          The thumbnail slot accepts any ReactNode — Avatar, media Thumbnail,
          text Thumbnail, or custom content.
        </p>
        <div style={cardStyle}>
          <CustomThumbnailDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Disabled group</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Disabling the group disables all tiles inside it.
        </p>
        <div style={cardStyle}>
          <DisabledDemo />
        </div>
      </section>
    </>
  );
}
