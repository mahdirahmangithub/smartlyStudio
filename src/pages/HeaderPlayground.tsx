import { type CSSProperties, useState } from "react";
import { Header, type HeaderSize, type HeaderDensity } from "../components/Header";
import { Thumbnail } from "../components/Thumbnail";
import { Icon } from "../components/Icon";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid var(--element-outline-neutral-default)",
  borderRadius: 8,
  paddingBlock: 16,
  marginTop: 12,
  overflow: "hidden",
  maxWidth: 600,
 };

const sizes: HeaderSize[] = ["2xl", "xl", "lg", "md", "sm"];

function AllSizesDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {sizes.map((size) => (
        <div key={size}>
          <p style={{ fontSize: 12, opacity: 0.5, margin: "0 0 4px" }}>
            size=&quot;{size}&quot;
          </p>
          <div style={cardStyle}>
            <Header
              size={size}
              title={`Header ${size.toUpperCase()}`}
              description="Description text for this header"
              onBack={size !== "2xl" ? () => console.log("back") : undefined}
              thumbnail={
                size === "2xl" ? (
                  <Thumbnail
                    size="md"
                    type="icon"
                    icon={<Icon name="favorite_fill" size={24} />}
                  />
                ) : undefined
              }
              onClose={() => console.log("close")}
              divider
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function WithActionsDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={cardStyle}>
        <Header
          size="xl"
          title="Edit Campaign"
          description="Make changes to your campaign settings"
          onBack={() => console.log("back")}
          onClose={() => console.log("close")}
          actions={
            <>
              <Button size="md" variant="neutral" emphasis="medium">
                Cancel
              </Button>
              <Button size="md" variant="brand" emphasis="high">
                Save
              </Button>
            </>
          }
          divider
        />
      </div>

      <div style={cardStyle}>
        <Header
          size="sm"
          title="Compact Header"
          onBack={() => console.log("back")}
          onClose={() => console.log("close")}
          actions={
            <>
              <Button size="sm" variant="neutral" emphasis="medium">
                Cancel
              </Button>
              <Button size="sm" variant="brand" emphasis="high">
                Apply
              </Button>
            </>
          }
          divider
        />
      </div>
    </div>
  );
}

function WithSlotDemo() {
  return (
    <div style={cardStyle}>
      <Header
        size="lg"
        title="Campaign Report"
        description="Overview of performance metrics"
        onBack={() => console.log("back")}
        onClose={() => console.log("close")}
        slot={
          <>
            <Badge size="sm" variant="success" emphasis="high" round>
              Active
            </Badge>
            <Badge size="sm" variant="info" emphasis="medium" round>
              3 new
            </Badge>
          </>
        }
        actions={
          <>
            <Button size="md" variant="neutral" emphasis="medium">
              Export
            </Button>
            <Button size="md" variant="brand" emphasis="high">
              Share
            </Button>
          </>
        }
        divider
      />
    </div>
  );
}

function ThumbnailDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={cardStyle}>
        <Header
          size="2xl"
          title="Campaign Details"
          description="View and manage your campaign"
          thumbnail={
            <Thumbnail
              size="md"
              type="icon"
              icon={<Icon name="Campaign" size={24} />}
            />
          }
          onClose={() => console.log("close")}
          actions={
            <>
              <Button size="md" variant="neutral" emphasis="medium">
                Cancel
              </Button>
              <Button size="md" variant="brand" emphasis="high">
                Save
              </Button>
            </>
          }
          divider
        />
      </div>

      <div style={cardStyle}>
        <Header
          size="2xl"
          title="User Profile"
          thumbnail={
            <Thumbnail
              size="md"
              type="icon"
              icon={<Icon name="person" size={24} />}
            />
          }
          onClose={() => console.log("close")}
          divider
        />
      </div>
    </div>
  );
}

function NoDividerDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={cardStyle}>
        <Header
          size="lg"
          title="Without Divider"
          description="This header has no bottom divider"
          onBack={() => console.log("back")}
          onClose={() => console.log("close")}
        />
      </div>

      <div style={cardStyle}>
        <Header
          size="md"
          title="Minimal Header"
          onClose={() => console.log("close")}
        />
      </div>
    </div>
  );
}

function ConfigurableDemo() {
  const [size, setSize] = useState<HeaderSize>("lg");
  const [density, setDensity] = useState<HeaderDensity>("sm");
  const [titleText, setTitleText] = useState("Header Title");
  const [descriptionText, setDescriptionText] = useState("Description text for this header");
  const [showBack, setShowBack] = useState(true);
  const [showClose, setShowClose] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [showDivider, setShowDivider] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [showActions, setShowActions] = useState(true);
  const [showSlot, setShowSlot] = useState(false);

  const handleSizeChange = (newSize: HeaderSize) => {
    setSize(newSize);
    if (newSize === "2xl") {
      setShowThumbnail(true);
      setShowBack(false);
    } else {
      setShowThumbnail(false);
      setShowBack(true);
    }
  };

  const btnSize = size === "sm" ? "sm" as const : "md" as const;

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 16,
          fontSize: 13,
        }}
      >
        <label>
          Size:{" "}
          <select
            value={size}
            onChange={(e) => handleSizeChange(e.target.value as HeaderSize)}
          >
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Density:{" "}
          <select
            value={density}
            onChange={(e) => setDensity(e.target.value as HeaderDensity)}
          >
            <option value="sm">sm</option>
            <option value="lg">lg</option>
          </select>
        </label>
        <label>
          Title:{" "}
          <input
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
            style={{ width: 160 }}
          />
        </label>
        <label>
          Description:{" "}
          <input
            value={descriptionText}
            onChange={(e) => setDescriptionText(e.target.value)}
            style={{ width: 200 }}
          />
        </label>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 16,
          fontSize: 13,
        }}
      >
        <label>
          <input type="checkbox" checked={showBack} onChange={(e) => setShowBack(e.target.checked)} />{" "}
          Back
        </label>
        <label>
          <input type="checkbox" checked={showClose} onChange={(e) => setShowClose(e.target.checked)} />{" "}
          Close
        </label>
        <label>
          <input type="checkbox" checked={showDescription} onChange={(e) => setShowDescription(e.target.checked)} />{" "}
          Description
        </label>
        <label>
          <input type="checkbox" checked={showDivider} onChange={(e) => setShowDivider(e.target.checked)} />{" "}
          Divider
        </label>
        <label>
          <input type="checkbox" checked={showThumbnail} onChange={(e) => setShowThumbnail(e.target.checked)} />{" "}
          Thumbnail
        </label>
        <label>
          <input type="checkbox" checked={showActions} onChange={(e) => setShowActions(e.target.checked)} />{" "}
          Actions
        </label>
        <label>
          <input type="checkbox" checked={showSlot} onChange={(e) => setShowSlot(e.target.checked)} />{" "}
          Slot
        </label>
      </div>

      <div style={cardStyle}>
        <Header
          size={size}
          density={density}
          title={titleText}
          description={showDescription ? descriptionText : undefined}
          onBack={showBack ? () => console.log("back") : undefined}
          onClose={showClose ? () => console.log("close") : undefined}
          thumbnail={
            showThumbnail ? (
              <Thumbnail
                size="md"
                type="icon"
                icon={<Icon name="favorite_fill" size={24} />}
              />
            ) : undefined
          }
          slot={
            showSlot ? (
              <>
                <Badge size="sm" variant="success" emphasis="high" round>
                  Active
                </Badge>
                <Badge size="sm" variant="info" emphasis="medium" round>
                  3 new
                </Badge>
              </>
            ) : undefined
          }
          actions={
            showActions ? (
              <>
                <Button size={btnSize} variant="neutral" emphasis="medium">
                  Cancel
                </Button>
                <Button size={btnSize} variant="brand" emphasis="high">
                  Save
                </Button>
              </>
            ) : undefined
          }
          divider={showDivider}
        />
      </div>
    </div>
  );
}

export default function HeaderPlayground() {
  return (
    <>
      <h1>Header</h1>

      <section style={sectionStyle}>
        <h2>Configurable</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle props and edit text to explore all header configurations.
        </p>
        <ConfigurableDemo />
      </section>

      <section style={sectionStyle}>
        <h2>All Sizes</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Header at each size with back/close buttons and description.
        </p>
        <AllSizesDemo />
      </section>

      <section style={sectionStyle}>
        <h2>With Actions</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Headers with action buttons.
        </p>
        <WithActionsDemo />
      </section>

      <section style={sectionStyle}>
        <h2>With Slot</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Custom slot content (badges) between title and actions.
        </p>
        <WithSlotDemo />
      </section>

      <section style={sectionStyle}>
        <h2>With Thumbnail</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          2xl headers with leading thumbnails.
        </p>
        <ThumbnailDemo />
      </section>

      <section style={sectionStyle}>
        <h2>Without Divider</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Headers without the bottom divider.
        </p>
        <NoDividerDemo />
      </section>
    </>
  );
}
