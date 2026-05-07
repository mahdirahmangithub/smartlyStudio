import { type CSSProperties } from "react";
import { ShortcutTooltip } from "@sds/components/ShortcutTooltip";
import { Button } from "@sds/components/Button";
import { IconButton } from "@sds/components/IconButton";
import { Icon } from "@sds/components/Icon";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const rowStyle: CSSProperties = {
  display: "flex",
  gap: 24,
  alignItems: "center",
  flexWrap: "wrap",
};

export default function ShortcutTooltipPlayground() {
  return (
    <>
      <h1>ShortcutTooltip</h1>

      <section style={sectionStyle}>
        <h2>Inverse (default)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Dark tooltip with label and keyboard shortcut keys.
        </p>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <ShortcutTooltip label="Undo" shortcut={["⌘", "Z"]}>
              <Button variant="neutral" emphasis="medium">Undo</Button>
            </ShortcutTooltip>

            <ShortcutTooltip label="Copy" shortcut={["⌘", "C"]}>
              <Button variant="neutral" emphasis="medium">Copy</Button>
            </ShortcutTooltip>

            <ShortcutTooltip label="Save" shortcut={["⌘", "S"]}>
              <Button variant="neutral" emphasis="medium">Save</Button>
            </ShortcutTooltip>

            <ShortcutTooltip label="Search" shortcut={["⌘", "K"]}>
              <IconButton
                icon={<Icon name="search" size={20} />}
                aria-label="Search"
                hideTooltip
              />
            </ShortcutTooltip>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Neutral</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Light tooltip with border, label and keyboard shortcut keys.
        </p>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <ShortcutTooltip type="neutral" label="Undo" shortcut={["⌘", "Z"]}>
              <Button variant="neutral" emphasis="medium">Undo</Button>
            </ShortcutTooltip>

            <ShortcutTooltip type="neutral" label="Edit" shortcut={["⌘", "E"]}>
              <IconButton
                icon={<Icon name="edit" size={20} />}
                aria-label="Edit"
                hideTooltip
              />
            </ShortcutTooltip>

            <ShortcutTooltip type="neutral" label="Select all" shortcut={["⌘", "A"]}>
              <Button variant="neutral" emphasis="medium">Select all</Button>
            </ShortcutTooltip>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Placements</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          ShortcutTooltip supports all tooltip placements.
        </p>
        <div style={cardStyle}>
          <div style={{ ...rowStyle, justifyContent: "center" }}>
            <ShortcutTooltip label="Top" shortcut={["⌘"]} placement="top">
              <Button variant="neutral" emphasis="medium">Top</Button>
            </ShortcutTooltip>
            <ShortcutTooltip label="Bottom" shortcut={["⌘"]} placement="bottom">
              <Button variant="neutral" emphasis="medium">Bottom</Button>
            </ShortcutTooltip>
            <ShortcutTooltip label="Left" shortcut={["⌘"]} placement="left">
              <Button variant="neutral" emphasis="medium">Left</Button>
            </ShortcutTooltip>
            <ShortcutTooltip label="Right" shortcut={["⌘"]} placement="right">
              <Button variant="neutral" emphasis="medium">Right</Button>
            </ShortcutTooltip>
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Single key</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Works with a single shortcut key too.
        </p>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <ShortcutTooltip label="Delete" shortcut={["⌫"]}>
              <IconButton
                icon={<Icon name="delete" size={20} />}
                aria-label="Delete"
                hideTooltip
              />
            </ShortcutTooltip>
            <ShortcutTooltip label="Escape" shortcut={["Esc"]}>
              <Button variant="neutral" emphasis="medium">Close</Button>
            </ShortcutTooltip>
          </div>
        </div>
      </section>
    </>
  );
}
