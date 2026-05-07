import { type CSSProperties, useState } from "react";
import { Drawer, type DrawerDensity, type DrawerSide } from "@sds/components/Drawer";
import { Button } from "@sds/components/Button";
import { BodyText } from "@sds/components/BodyText";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";

function OverlayDemo() {
  const [open, setOpen] = useState(false);
  const [density, setDensity] = useState<DrawerDensity>("sm");
  const [longContent, setLongContent] = useState(false);
  const [backdrop, setBackdrop] = useState(true);
  const [resizable, setResizable] = useState(true);
  const [side, setSide] = useState<DrawerSide>("right");

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <Button variant="brand" emphasis="high" size="md" onClick={() => setOpen(true)}>
          Open Drawer
        </Button>
        <select
          value={density}
          onChange={(e) => setDensity(e.target.value as DrawerDensity)}
          style={{ padding: "4px 8px", borderRadius: 6, fontSize: 13 }}
        >
          <option value="none">none</option>
          <option value="sm">sm</option>
          <option value="lg">lg</option>
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={side === "bottom"}
            onChange={(e) => setSide(e.target.checked ? "bottom" : "right")}
          />
          Bottom
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={longContent}
            onChange={(e) => setLongContent(e.target.checked)}
          />
          Scrollable
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={backdrop}
            onChange={(e) => setBackdrop(e.target.checked)}
          />
          Backdrop
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={resizable}
            onChange={(e) => setResizable(e.target.checked)}
          />
          Resizable
        </label>
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side={side}
        density={density}
        backdrop={backdrop}
        title="Drawer Title"
        headerSize="md"
        footerActions={
          <Button variant="brand" emphasis="high" size="md">
            Confirm
          </Button>
        }
        footerFullWidth
        resizable={resizable}
      >
        {longContent ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Array.from({ length: 20 }, (_, i) => (
              <BodyText key={i} size="md">
                {i + 1}. {LOREM}
              </BodyText>
            ))}
          </div>
        ) : (
          <BodyText size="md">{LOREM}</BodyText>
        )}
      </Drawer>
    </div>
  );
}

function ContainedRightDemo() {
  const [open, setOpen] = useState(false);
  const [backdrop, setBackdrop] = useState(true);
  const [longContent, setLongContent] = useState(false);
  const [resizable, setResizable] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Button variant="brand" emphasis="high" size="md" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Open"} Right
        </Button>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input type="checkbox" checked={longContent} onChange={(e) => setLongContent(e.target.checked)} />
          Scrollable
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input type="checkbox" checked={backdrop} onChange={(e) => setBackdrop(e.target.checked)} />
          Backdrop
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input type="checkbox" checked={resizable} onChange={(e) => setResizable(e.target.checked)} />
          Resizable
        </label>
      </div>

      <div
        style={{
          position: "relative",
          height: 400,
          marginTop: 12,
          borderRadius: 8,
          background: "var(--element-surface-default)",
          border: "1px solid var(--element-divider-neutral-default)",
        }}
      >
        <div style={{ padding: 24, height: "100%", boxSizing: "border-box", overflow: "auto" }}>
          <BodyText size="lg">Container content. The drawer slides in from the right.</BodyText>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} style={{ height: 48, borderRadius: 8, background: "var(--element-fill-neutral-tertiary-default)" }} />
            ))}
          </div>
        </div>

        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          side="right"
          placement="container"
          backdrop={backdrop}
          density="sm"
          title="Contained Right"
          headerSize="md"
          footerActions={<Button variant="brand" emphasis="high" size="md">Confirm</Button>}
          footerFullWidth
          resizable={resizable}
        >
          {longContent ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {Array.from({ length: 20 }, (_, i) => (
                <BodyText key={i} size="md">{i + 1}. {LOREM}</BodyText>
              ))}
            </div>
          ) : (
            <BodyText size="md">{LOREM}</BodyText>
          )}
        </Drawer>
      </div>
    </div>
  );
}

function ContainedBottomDemo() {
  const [open, setOpen] = useState(false);
  const [backdrop, setBackdrop] = useState(true);
  const [longContent, setLongContent] = useState(false);
  const [resizable, setResizable] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Button variant="brand" emphasis="high" size="md" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Open"} Bottom
        </Button>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input type="checkbox" checked={longContent} onChange={(e) => setLongContent(e.target.checked)} />
          Scrollable
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input type="checkbox" checked={backdrop} onChange={(e) => setBackdrop(e.target.checked)} />
          Backdrop
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input type="checkbox" checked={resizable} onChange={(e) => setResizable(e.target.checked)} />
          Resizable
        </label>
      </div>

      <div
        style={{
          position: "relative",
          height: 500,
          marginTop: 12,
          borderRadius: 8,
          background: "var(--element-surface-default)",
          border: "1px solid var(--element-divider-neutral-default)",
        }}
      >
        <div style={{ padding: 24, height: "100%", boxSizing: "border-box", overflow: "auto" }}>
          <BodyText size="lg">Container content. The drawer slides in from the bottom.</BodyText>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} style={{ height: 48, borderRadius: 8, background: "var(--element-fill-neutral-tertiary-default)" }} />
            ))}
          </div>
        </div>

        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          side="bottom"
          placement="container"
          backdrop={backdrop}
          density="sm"
          title="Contained Bottom"
          headerSize="md"
          footerActions={<Button variant="brand" emphasis="high" size="md">Confirm</Button>}
          footerFullWidth
          resizable={resizable}
        >
          {longContent ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {Array.from({ length: 20 }, (_, i) => (
                <BodyText key={i} size="md">{i + 1}. {LOREM}</BodyText>
              ))}
            </div>
          ) : (
            <BodyText size="md">{LOREM}</BodyText>
          )}
        </Drawer>
      </div>
    </div>
  );
}

function PushDemo() {
  const [open, setOpen] = useState(false);
  const [resizable, setResizable] = useState(true);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Button variant="brand" emphasis="high" size="md" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Open"} Push Drawer
        </Button>
        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <input
            type="checkbox"
            checked={resizable}
            onChange={(e) => setResizable(e.target.checked)}
          />
          Resizable
        </label>
      </div>
      <div
        style={{
          display: "flex",
          height: 500,
          marginTop: 12,
          borderRadius: 8,
          overflow: "hidden",
          background: "var(--element-surface-default)",
          border: "1px solid var(--element-divider-neutral-default)",
        }}
      >
        <div style={{ flex: 1, padding: 24, overflow: "auto", minWidth: 0 }}>
          <BodyText size="lg">Main content area. The drawer pushes this content.</BodyText>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                style={{
                  height: 48,
                  borderRadius: 8,
                  background: "var(--element-fill-neutral-tertiary-default)",
                }}
              />
            ))}
          </div>
        </div>

        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          mode="push"
          density="sm"
          title="Push Drawer"
          description="This drawer pushes content to the left."
          footerActions={
            <>
              <Button variant="neutral" emphasis="medium" size="md" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button variant="brand" emphasis="high" size="md">
                Save
              </Button>
            </>
          }
          footerFullWidth
          resizable={resizable}
        >
          <BodyText size="md">{LOREM}</BodyText>
        </Drawer>
      </div>
    </div>
  );
}

export default function DrawerPlayground() {
  return (
    <>
      <h1>Drawer</h1>

      <section style={sectionStyle}>
        <h2>Overlay (Viewport)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Slides in from the right over the full viewport. Select density and toggle scrollable content.
          Escape or backdrop click to close.
        </p>
        <div style={cardStyle}>
          <OverlayDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Contained Overlay — Right</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Drawer positioned within a container, sliding from the right.
        </p>
        <div style={cardStyle}>
          <ContainedRightDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Contained Overlay — Bottom</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Drawer positioned within a container, sliding from the bottom.
        </p>
        <div style={cardStyle}>
          <ContainedBottomDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Push Mode</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Drawer pushes content to the left instead of overlaying. No backdrop. Footer uses fullWidth.
        </p>
        <div style={cardStyle}>
          <PushDemo />
        </div>
      </section>
    </>
  );
}
