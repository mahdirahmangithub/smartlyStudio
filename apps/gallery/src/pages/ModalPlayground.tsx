import { type CSSProperties, useState } from "react";
import { Modal, type ModalSize, type ModalDensity } from "@sds/components/Modal";
import { Button } from "@sds/components/Button";
import { BodyText } from "@sds/components/BodyText";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

function SizesDemo() {
  const [openSize, setOpenSize] = useState<ModalSize | null>(null);

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <Button
          key={size}
          variant="brand"
          emphasis="high"
          size="md"
          onClick={() => setOpenSize(size)}
        >
          {size} ({size === "sm" ? 400 : size === "md" ? 600 : size === "lg" ? 800 : 1000}px)
        </Button>
      ))}

      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <Modal
          key={size}
          open={openSize === size}
          onClose={() => setOpenSize(null)}
          size={size}
          title={`${size.toUpperCase()} Modal`}
          description={`This modal is ${size === "sm" ? 400 : size === "md" ? 600 : size === "lg" ? 800 : 1000}px wide.`}
          footerActions={
            <Button variant="brand" emphasis="high" size="md" onClick={() => setOpenSize(null)}>
              Confirm
            </Button>
          }
          footerExtraAction={
            <Button variant="neutral" emphasis="medium" size="md" onClick={() => setOpenSize(null)}>
              Cancel
            </Button>
          }
        >
          <BodyText size="md">
            Content area for the {size} size modal. The max height is 80vh by default.
          </BodyText>
        </Modal>
      ))}
    </div>
  );
}

function DensitiesDemo() {
  const [openDensity, setOpenDensity] = useState<ModalDensity | null>(null);

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {(["none", "sm", "lg"] as const).map((d) => (
        <Button
          key={d}
          variant="brand"
          emphasis="high"
          size="md"
          onClick={() => setOpenDensity(d)}
        >
          density={d}
        </Button>
      ))}

      {(["none", "sm", "lg"] as const).map((d) => (
        <Modal
          key={d}
          open={openDensity === d}
          onClose={() => setOpenDensity(null)}
          density={d}
          title={`Density: ${d}`}
          description="Notice how padding changes across densities."
          footerActions={
            <Button variant="brand" emphasis="high" size="md" onClick={() => setOpenDensity(null)}>
              Done
            </Button>
          }
        >
          <BodyText size="md">
            The content padding is{" "}
            {d === "none" ? "0" : d === "sm" ? "16px" : "24px"}.
            Header and footer use{" "}
            {d === "lg" ? "24px (lg)" : "16px (sm)"} padding.
          </BodyText>
        </Modal>
      ))}
    </div>
  );
}

function ScrollableDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button variant="brand" emphasis="high" size="md" onClick={() => setOpen(true)}>
        Open scrollable modal
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Scrollable Content"
        description="This modal has content that exceeds 80vh."
        footerActions={
          <Button variant="brand" emphasis="high" size="md" onClick={() => setOpen(false)}>
            Close
          </Button>
        }
      >
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            style={{
              padding: "12px 0",
              borderBottom:
                "1px solid var(--element-divider-neutral-default)",
            }}
          >
            <BodyText size="md">
              Item {i + 1} — scroll to see overflow behavior and bottom padding.
            </BodyText>
          </div>
        ))}
      </Modal>
    </div>
  );
}

function HugContentDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button variant="brand" emphasis="high" size="md" onClick={() => setOpen(true)}>
        Open hug-content modal
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Short Modal"
        footerActions={
          <Button variant="brand" emphasis="high" size="md" onClick={() => setOpen(false)}>
            OK
          </Button>
        }
      >
        <BodyText size="md">
          This modal has very little content and hugs its height.
        </BodyText>
      </Modal>
    </div>
  );
}

function CustomHeightDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button variant="brand" emphasis="high" size="md" onClick={() => setOpen(true)}>
        Open fixed-height modal (500px)
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Custom Height"
        description="This modal has height set to 500px."
        height={500}
        footerActions={
          <Button variant="brand" emphasis="high" size="md" onClick={() => setOpen(false)}>
            Done
          </Button>
        }
      >
        <BodyText size="md">
          The content area fills the remaining space between header and footer.
        </BodyText>
      </Modal>
    </div>
  );
}

export default function ModalPlayground() {
  return (
    <>
      <h1>Modal</h1>

      <section style={sectionStyle}>
        <h2>Sizes</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Four width presets: sm (400), md (600), lg (800), xl (1000).
        </p>
        <div style={cardStyle}>
          <SizesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Densities</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Three density levels controlling content and header/footer padding.
        </p>
        <div style={cardStyle}>
          <DensitiesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Scrollable content</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Content exceeding 80vh max height becomes scrollable with hidden
          scrollbar. Bottom padding scrolls with content.
        </p>
        <div style={cardStyle}>
          <ScrollableDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Hug content</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          When content is short, the modal shrinks to fit.
        </p>
        <div style={cardStyle}>
          <HugContentDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Custom height</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Consumer can set a fixed height or custom maxHeight.
        </p>
        <div style={cardStyle}>
          <CustomHeightDemo />
        </div>
      </section>
    </>
  );
}
