import { type CSSProperties } from "react";
import { ToolbarButton } from "@sds/components/ToolbarButton";
import { Icon } from "@sds/components/Icon";
import { GenericSelectOption } from "@sds/components/GenericSelectOption";
import { Sidebar } from "@sds/components/Sidebar";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const rowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};

function SubToolOptions({ onSelect }: { onSelect?: () => void }) {
  return (
    <>
      <GenericSelectOption
        labelText="Brush"
        leading={<Icon name="brush" size={20} />}
        onClick={onSelect}
      />
      <GenericSelectOption
        labelText="Draw"
        leading={<Icon name="draw" size={20} />}
        onClick={onSelect}
      />
      <GenericSelectOption
        labelText="Crop"
        leading={<Icon name="crop" size={20} />}
        onClick={onSelect}
      />
    </>
  );
}

export default function ToolbarButtonPlayground() {
  return (
    <>
      <h1>ToolbarButton</h1>

      <section style={sectionStyle}>
        <h2>Basic</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Icon-only button with tooltip on hover.
        </p>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <ToolbarButton
              icon={<Icon name="favorite_fill" size={20} />}
              aria-label="Favorite"
            />
            <ToolbarButton
              icon={<Icon name="crop" size={20} />}
              aria-label="Crop"
            />
            <ToolbarButton
              icon={<Icon name="draw" size={20} />}
              aria-label="Draw"
            />
            <ToolbarButton
              icon={<Icon name="undo" size={20} />}
              aria-label="Undo"
            />
            <ToolbarButton
              icon={<Icon name="redo" size={20} />}
              aria-label="Redo"
            />
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Selected</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Buttons can be in a selected/active state.
        </p>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <ToolbarButton
              icon={<Icon name="brush" size={20} />}
              aria-label="Brush"
              selected
            />
            <ToolbarButton
              icon={<Icon name="draw" size={20} />}
              aria-label="Draw"
            />
            <ToolbarButton
              icon={<Icon name="crop" size={20} />}
              aria-label="Crop"
            />
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Disabled &amp; Loading</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Disabled buttons are non-interactive. Loading shows a spinner.
        </p>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <ToolbarButton
              icon={<Icon name="favorite_fill" size={20} />}
              aria-label="Disabled"
              disabled
            />
            <ToolbarButton
              icon={<Icon name="brush" size={20} />}
              aria-label="Loading"
              loading
            />
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>SubTool (dropdown)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Click to open the subtool dropdown. The small indicator at bottom-right
          signals sub-options are available.
        </p>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <ToolbarButton
              icon={<Icon name="brush" size={20} />}
              aria-label="Brush tools"
              subTool
              subToolContent={<SubToolOptions />}
              dropdownPlacement="right-start"
            />
            <ToolbarButton
              icon={<Icon name="draw" size={20} />}
              aria-label="Draw tools"
              subTool
              subToolContent={<SubToolOptions />}
              dropdownPlacement="bottom-start"
            />
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>ShortcutTooltip</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Tooltip includes keyboard shortcut keys.
        </p>
        <div style={cardStyle}>
          <div style={rowStyle}>
            <ToolbarButton
              icon={<Icon name="undo" size={20} />}
              aria-label="Undo"
              tooltipShortcut={["⌘", "Z"]}
            />
            <ToolbarButton
              icon={<Icon name="redo" size={20} />}
              aria-label="Redo"
              tooltipShortcut={["⌘", "⇧", "Z"]}
            />
            <ToolbarButton
              icon={<Icon name="zoom_in" size={20} />}
              aria-label="Zoom in"
              tooltipShortcut={["⌘", "+"]}
              tooltipPlacement="bottom"
            />
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Inside a Sidebar</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toolbar buttons inside a real DS Sidebar (collapsed, non-expandable).
          Tooltips and dropdowns open to the right.
        </p>
        <div style={{ ...cardStyle, display: "flex", height: 420 }}>
          <Sidebar open>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <ToolbarButton
                icon={<Icon name="select_all" size={20} />}
                aria-label="Select"
                selected
                tooltipShortcut={["V"]}
                tooltipPlacement="right"
              />
              <ToolbarButton
                icon={<Icon name="brush" size={20} />}
                aria-label="Brush tools"
                subTool
                subToolContent={<SubToolOptions />}
                dropdownPlacement="right-start"
                tooltipShortcut={["B"]}
                tooltipPlacement="right"
              />
              <ToolbarButton
                icon={<Icon name="draw" size={20} />}
                aria-label="Draw tools"
                subTool
                subToolContent={<SubToolOptions />}
                dropdownPlacement="right-start"
                tooltipShortcut={["P"]}
                tooltipPlacement="right"
              />
              <ToolbarButton
                icon={<Icon name="crop" size={20} />}
                aria-label="Crop"
                tooltipShortcut={["C"]}
                tooltipPlacement="right"
              />
              <ToolbarButton
                icon={<Icon name="zoom_in" size={20} />}
                aria-label="Zoom"
                tooltipShortcut={["Z"]}
                tooltipPlacement="right"
              />
              <ToolbarButton
                icon={<Icon name="undo" size={20} />}
                aria-label="Undo"
                tooltipShortcut={["⌘", "Z"]}
                tooltipPlacement="right"
              />
              <ToolbarButton
                icon={<Icon name="redo" size={20} />}
                aria-label="Redo"
                tooltipShortcut={["⌘", "⇧", "Z"]}
                tooltipPlacement="right"
              />
            </div>
          </Sidebar>
          <div style={{ flex: 1, padding: 16, opacity: 0.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
            Main content area
          </div>
        </div>
      </section>
    </>
  );
}
