import { type CSSProperties, useState } from "react";
import { Footer } from "../components/Footer";
import { Button } from "../components/Button";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

function DensityDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, opacity: 0.5, margin: "0 0 4px" }}>
          density=&quot;sm&quot; divider
        </p>
        <div
          style={{
            border: "1px solid var(--element-divider-neutral-default)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <Footer
            density="sm"
            divider
            extraAction={
              <Button variant="neutral" emphasis="medium" size="md">
                Cancel
              </Button>
            }
            actions={
              <>
                <Button variant="neutral" emphasis="medium" size="md">
                  Save Draft
                </Button>
                <Button variant="brand" emphasis="high" size="md">
                  Publish
                </Button>
              </>
            }
          />
        </div>
      </div>

      <div>
        <p style={{ fontSize: 12, opacity: 0.5, margin: "0 0 4px" }}>
          density=&quot;lg&quot; divider
        </p>
        <div
          style={{
            border: "1px solid var(--element-divider-neutral-default)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <Footer
            density="lg"
            divider
            extraAction={
              <Button variant="neutral" emphasis="medium" size="md">
                Cancel
              </Button>
            }
            actions={
              <>
                <Button variant="neutral" emphasis="medium" size="md">
                  Save Draft
                </Button>
                <Button variant="brand" emphasis="high" size="md">
                  Publish
                </Button>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
}

function DividerDemo() {
  const [divider, setDivider] = useState(true);

  return (
    <div>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 8 }}>
        <input
          type="checkbox"
          checked={divider}
          onChange={(e) => setDivider(e.target.checked)}
        />
        divider
      </label>
      <div
        style={{
          border: "1px solid var(--element-divider-neutral-default)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 16, fontSize: 13, opacity: 0.5 }}>
          Content above footer
        </div>
        <Footer
          divider={divider}
          extraAction={
            <Button variant="neutral" emphasis="medium" size="md">
              Cancel
            </Button>
          }
          actions={
            <>
              <Button variant="neutral" emphasis="medium" size="md">
                Discard
              </Button>
              <Button variant="brand" emphasis="high" size="md">
                Save
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
}

function FullWidthDemo() {
  const [fullWidth, setFullWidth] = useState(false);

  return (
    <div>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 8 }}>
        <input
          type="checkbox"
          checked={fullWidth}
          onChange={(e) => setFullWidth(e.target.checked)}
        />
        fullWidth
      </label>
      <div
        style={{
          border: "1px solid var(--element-divider-neutral-default)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <Footer
          divider
          fullWidth={fullWidth}
          extraAction={
            !fullWidth ? (
              <Button variant="neutral" emphasis="medium" size="md">
                Cancel
              </Button>
            ) : undefined
          }
          actions={
            <>
              <Button variant="neutral" emphasis="medium" size="md">
                Cancel
              </Button>
              <Button variant="brand" emphasis="high" size="md">
                Confirm
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
}

function SlotDemo() {
  return (
    <div
      style={{
        border: "1px solid var(--element-divider-neutral-default)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <Footer
        divider
        extraAction={
          <Button variant="neutral" emphasis="medium" size="md">
            Reset
          </Button>
        }
        slot={
          <span style={{ fontSize: 13, opacity: 0.5 }}>
            3 items selected
          </span>
        }
        actions={
          <>
            <Button variant="neutral" emphasis="medium" size="md">
              Cancel
            </Button>
            <Button variant="brand" emphasis="high" size="md">
              Apply
            </Button>
          </>
        }
      />
    </div>
  );
}

export default function FooterPlayground() {
  return (
    <>
      <h1>Footer</h1>

      <section style={sectionStyle}>
        <h2>Density</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          sm (16px) vs lg (24px) padding. Both shown with divider.
        </p>
        <div style={cardStyle}>
          <DensityDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Divider Toggle</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          When divider is false, top padding is also removed.
        </p>
        <div style={cardStyle}>
          <DividerDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Full Width</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle fullWidth to stretch action buttons across the footer.
        </p>
        <div style={cardStyle}>
          <FullWidthDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>With Slot</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Extra action on the left, slot content in between, primary actions on the right.
        </p>
        <div style={cardStyle}>
          <SlotDemo />
        </div>
      </section>
    </>
  );
}
