import { useState, type CSSProperties } from "react";
import { Toast, toast } from "@sds/components/Toast";
import type { ToastType, ToastLayout } from "@sds/components/Toast";
import { Button } from "@sds/components/Button";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const rowStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  flexWrap: "wrap",
  alignItems: "flex-start",
};

function StaticToastGrid() {
  const types: ToastType[] = ["neutral", "success", "alert"];
  const layouts: ToastLayout[] = ["vertical", "horizontal"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {types.map((type) => (
        <div key={type} style={rowStyle}>
          {layouts.map((layout) => (
            <Toast
              key={`${type}-${layout}`}
              title="Title"
              description="Description"
              type={type}
              layout={layout}
              undoAction={{ label: "Undo", onClick: () => {} }}
              ctaAction={{ label: "Label", onClick: () => {} }}
              onClose={() => {}}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function ImperativeDemo() {
  return (
    <div style={rowStyle}>
      <Button
        variant="neutral"
        emphasis="medium"
        size="md"
        onClick={() =>
          toast("File has been saved", {
            description: "Your changes were saved successfully.",
            type: "neutral",
            layout: "vertical",
            undoAction: {
              label: "Undo",
              onClick: () => toast.dismiss(),
            },
            ctaAction: { label: "View", onClick: () => {} },
          })
        }
      >
        Neutral (vertical)
      </Button>

      <Button
        variant="success"
        emphasis="medium"
        size="md"
        onClick={() =>
          toast.success("Campaign published!", {
            description: "Your campaign is now live.",
            layout: "vertical",
            ctaAction: { label: "View", onClick: () => {} },
          })
        }
      >
        Success (vertical)
      </Button>

      <Button
        variant="alert"
        emphasis="medium"
        size="md"
        onClick={() =>
          toast.alert("Failed to save", {
            description: "Something went wrong. Please try again.",
            layout: "vertical",
            ctaAction: { label: "Retry", onClick: () => {} },
          })
        }
      >
        Alert (vertical)
      </Button>

      <Button
        variant="neutral"
        emphasis="low"
        size="md"
        onClick={() =>
          toast("Item deleted", {
            type: "neutral",
            layout: "horizontal",
            undoAction: {
              label: "Undo",
              onClick: () => toast.dismiss(),
            },
            ctaAction: { label: "Details", onClick: () => {} },
          })
        }
      >
        Neutral (horizontal)
      </Button>

      <Button
        variant="success"
        emphasis="low"
        size="md"
        onClick={() =>
          toast.success("Saved!", { layout: "horizontal" })
        }
      >
        Success (horizontal, minimal)
      </Button>

      <Button
        variant="alert"
        emphasis="low"
        size="md"
        onClick={() =>
          toast.alert("Connection lost", {
            layout: "horizontal",
            ctaAction: { label: "Retry", onClick: () => {} },
          })
        }
      >
        Alert (horizontal)
      </Button>
    </div>
  );
}

function StackingDemo() {
  let counter = 0;
  const messages = [
    { title: "First toast", type: "neutral" as const },
    { title: "Second toast — with a longer title so stacking is clearer", type: "success" as const },
    { title: "Third toast", type: "alert" as const },
    { title: "Fourth toast", type: "neutral" as const },
    { title: "Fifth toast", type: "success" as const },
    { title: "Sixth toast — extra item in the queue", type: "alert" as const },
  ];

  return (
    <div style={rowStyle}>
      <Button
        variant="neutral"
        emphasis="medium"
        size="md"
        onClick={() => {
          const msg = messages[counter % messages.length];
          toast(msg.title, {
            type: msg.type,
            description: `Toast #${counter + 1} — hover the stack to expand, close one by one.`,
            layout: "vertical",
            duration: Infinity,
          });
          counter++;
        }}
      >
        Add toast to stack
      </Button>

      <Button
        variant="neutral"
        emphasis="medium"
        size="md"
        onClick={() => {
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              const msg = messages[(counter + i) % messages.length];
              toast(msg.title, {
                type: msg.type,
                description: `Rapid toast #${counter + i + 1}`,
                layout: "vertical",
                duration: Infinity,
              });
            }, i * 100);
          }
          counter += 5;
        }}
      >
        Fire 5 toasts rapidly
      </Button>

      <Button
        variant="neutral"
        emphasis="low"
        size="md"
        onClick={() => toast.dismiss()}
      >
        Dismiss all
      </Button>
    </div>
  );
}

function DurationDemo() {
  return (
    <div style={rowStyle}>
      <Button
        variant="neutral"
        emphasis="low"
        size="md"
        onClick={() =>
          toast("Short message", {
            type: "success",
            layout: "horizontal",
          })
        }
      >
        Auto-duration (short text)
      </Button>

      <Button
        variant="neutral"
        emphasis="low"
        size="md"
        onClick={() =>
          toast("This is a longer message that should stay visible for more time", {
            type: "neutral",
            description:
              "The duration is calculated automatically based on the total character count of the title and description combined.",
            layout: "vertical",
          })
        }
      >
        Auto-duration (long text)
      </Button>

      <Button
        variant="neutral"
        emphasis="low"
        size="md"
        onClick={() =>
          toast("Persistent toast", {
            type: "alert",
            description: "This toast will not auto-dismiss. Close it manually.",
            layout: "vertical",
            duration: Infinity,
          })
        }
      >
        Persistent (Infinity)
      </Button>
    </div>
  );
}

function TruncationDemo() {
  const [title, setTitle] = useState("12 files have been deleted.");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, fontWeight: 500 }}>Title text</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: 6,
            fontSize: 14,
            maxWidth: 480,
          }}
        />
      </div>

      <p style={{ fontSize: 12, opacity: 0.5, margin: 0 }}>
        Static previews (horizontal with actions):
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Toast
          title={title}
          type="alert"
          layout="horizontal"
          undoAction={{ label: "Undo", onClick: () => {} }}
          onClose={() => {}}
        />
        <Toast
          title={title}
          type="neutral"
          layout="horizontal"
          ctaAction={{ label: "Details", onClick: () => {} }}
          undoAction={{ label: "Undo", onClick: () => {} }}
          onClose={() => {}}
        />
        <Toast
          title={title}
          type="success"
          layout="horizontal"
          onClose={() => {}}
        />
      </div>

      <div style={rowStyle}>
        <Button
          variant="alert"
          emphasis="medium"
          size="md"
          onClick={() =>
            toast.alert(title, {
              layout: "horizontal",
              undoAction: { label: "Undo", onClick: () => {} },
              duration: Infinity,
            })
          }
        >
          Fire as alert + undo
        </Button>
        <Button
          variant="neutral"
          emphasis="medium"
          size="md"
          onClick={() =>
            toast(title, {
              layout: "horizontal",
              ctaAction: { label: "Details", onClick: () => {} },
              undoAction: { label: "Undo", onClick: () => {} },
              duration: Infinity,
            })
          }
        >
          Fire with both actions
        </Button>
        <Button
          variant="neutral"
          emphasis="low"
          size="md"
          onClick={() => toast.dismiss()}
        >
          Dismiss all
        </Button>
      </div>
    </div>
  );
}

export default function ToastPlayground() {
  return (
    <>
      <h1>Toast</h1>

      <section style={sectionStyle}>
        <h2>All Variants (static)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          3 types × 2 layouts — neutral, success, alert in vertical and horizontal.
        </p>
        <div style={cardStyle}>
          <StaticToastGrid />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Imperative API</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Use toast(), toast.success(), toast.alert() to trigger toasts.
        </p>
        <div style={cardStyle}>
          <ImperativeDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Stacking & Expand on Hover</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Click multiple times, then hover over the toast stack in the bottom-right corner.
        </p>
        <div style={cardStyle}>
          <StackingDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Title Truncation</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Edit the title text to test how horizontal toasts handle long titles.
          Static previews update live; buttons fire real toasts.
        </p>
        <div style={cardStyle}>
          <TruncationDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Auto-Duration</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Duration scales with content length: min 3s, ~50ms per character, max 10s.
          Set duration to Infinity for persistent toasts.
        </p>
        <div style={cardStyle}>
          <DurationDemo />
        </div>
      </section>
    </>
  );
}
