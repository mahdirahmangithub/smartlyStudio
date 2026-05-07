import { type CSSProperties, useState } from "react";
import { InlineCode, type InlineCodeSize } from "@sds/components/InlineCode";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const controlRow: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 12,
};

function ConfigurableDemo() {
  const [size, setSize] = useState<InlineCodeSize>("md");
  const [enableSyntax, setEnableSyntax] = useState(false);
  const [code, setCode] = useState('const greeting = "Hello";');

  return (
    <div>
      <div style={controlRow}>
        <label>
          Size:
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as InlineCodeSize)}
            style={{ marginLeft: 4 }}
          >
            <option value="sm">sm</option>
            <option value="md">md</option>
            <option value="lg">lg</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={enableSyntax}
            onChange={(e) => setEnableSyntax(e.target.checked)}
          />
          Syntax highlighting
        </label>
        <label>
          Code:
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ marginLeft: 4, width: 260 }}
          />
        </label>
      </div>

      <p>
        Run <InlineCode size={size} enableSyntax={enableSyntax}>{code}</InlineCode> to get started.
      </p>
    </div>
  );
}

function SizesDemo() {
  const code = 'const lifeAnalogy = "like the life I\'ve had";';
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(["lg", "md", "sm"] as const).map((s) => (
        <div key={s}>
          <p style={{ fontSize: 13, margin: "0 0 4px", opacity: 0.7 }}>
            size="{s}"
          </p>
          <InlineCode size={s}>{code}</InlineCode>
        </div>
      ))}
    </div>
  );
}

function InlineWithTextDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p>
        Install the package with <InlineCode>npm install @smartly/ds</InlineCode> and
        then import the component you need.
      </p>
      <p>
        Use <InlineCode enableSyntax>const count = useState(0)</InlineCode> to
        declare a stateful variable in React.
      </p>
      <p>
        The <InlineCode>--spacing-md</InlineCode> token equals 16px in the default theme.
      </p>
    </div>
  );
}

export default function InlineCodePlayground() {
  return (
    <>
      <h1>InlineCode</h1>

      <section style={sectionStyle}>
        <h2>Configurable</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Adjust size, syntax highlighting, and code content.
        </p>
        <div style={cardStyle}>
          <ConfigurableDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Sizes</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          lg, md, sm — matching the code typography scale.
        </p>
        <div style={cardStyle}>
          <SizesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Inline with text</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Used naturally within paragraphs.
        </p>
        <div style={cardStyle}>
          <InlineWithTextDemo />
        </div>
      </section>
    </>
  );
}
