import { type CSSProperties, useState, useCallback } from "react";
import { CodeBlock, type CodeBlockSize, type HighlightType, type LineHighlight } from "../components/CodeBlock";
import { CopyButton } from "../components/CopyButton";

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
  marginBottom: 8,
};

const SAMPLE_CODE = `import { useState } from "react";

export function Counter({ initial = 0 }) {
  const [count, setCount] = useState(initial);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Count: {count}
    </button>
  );
}`;

const SAMPLE_PYTHON = `def fibonacci(n):
    """Generate fibonacci sequence up to n."""
    a, b = 0, 1
    while a < n:
        yield a
        a, b = b, a + b

for num in fibonacci(100):
    print(num)`;

const SAMPLE_CSS = `.container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--element-surface-under);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--element-divider-neutral-default);
}

.container:hover {
  box-shadow: var(--shadow-cast-medium);
}`;

const VERSION_SNIPPETS = [
  `function greet(name) {
  const prefix = "Hello";
  const separator = ", ";
  const suffix = "!";
  const message = prefix + separator + name + suffix;
  console.log(message);
  return message;
}

greet("World");`,
  `function greet(name: string): string {
  const prefix = "Hello";
  const separator = ", ";
  const suffix = "!";
  const message = \`\${prefix}\${separator}\${name}\${suffix}\`;
  console.log(message);
  return message;
}

greet("World");`,
  `const greet = (name: string): string => {
  const parts = ["Hello", ", ", name, "!"];
  const message = parts.join("");
  console.log(message);
  return message;
};

greet("World");`,
];

function ConfigurableDemo() {
  const [size, setSize] = useState<CodeBlockSize>("md");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [enableSyntax, setEnableSyntax] = useState(true);
  const [visibleLines, setVisibleLines] = useState<number | undefined>(6);
  const [showVersion, setShowVersion] = useState(false);
  const [versionIdx, setVersionIdx] = useState(0);

  const handlePrev = useCallback(
    () => setVersionIdx((i) => Math.max(0, i - 1)),
    [],
  );
  const handleNext = useCallback(
    () => setVersionIdx((i) => Math.min(VERSION_SNIPPETS.length - 1, i + 1)),
    [],
  );

  const code = showVersion ? VERSION_SNIPPETS[versionIdx] : SAMPLE_CODE;

  return (
    <div>
      <div style={controlRow}>
        <label>
          Size:
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as CodeBlockSize)}
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
            checked={showLineNumbers}
            onChange={(e) => setShowLineNumbers(e.target.checked)}
          />
          Line numbers
        </label>
        <label>
          <input
            type="checkbox"
            checked={showHeader}
            onChange={(e) => setShowHeader(e.target.checked)}
          />
          Header
        </label>
        <label>
          <input
            type="checkbox"
            checked={showDescription}
            onChange={(e) => setShowDescription(e.target.checked)}
          />
          Description
        </label>
        <label>
          <input
            type="checkbox"
            checked={enableSyntax}
            onChange={(e) => setEnableSyntax(e.target.checked)}
          />
          Syntax
        </label>
        <label>
          <input
            type="checkbox"
            checked={visibleLines != null}
            onChange={(e) => setVisibleLines(e.target.checked ? 6 : undefined)}
          />
          Show more ({visibleLines ?? "off"})
        </label>
        <label>
          <input
            type="checkbox"
            checked={showVersion}
            onChange={(e) => setShowVersion(e.target.checked)}
          />
          Version switch
        </label>
      </div>
      <CodeBlock
        code={code}
        size={size}
        showLineNumbers={showLineNumbers}
        title={showHeader ? "Counter.tsx" : undefined}
        description={showHeader && showDescription ? "React component" : undefined}
        actions={showHeader ? <CopyButton value={code} /> : undefined}
        enableSyntax={enableSyntax}
        visibleLines={visibleLines}
        versionLabel={showVersion ? `Version ${versionIdx + 1}` : undefined}
        onPrevVersion={showVersion ? handlePrev : undefined}
        onNextVersion={showVersion ? handleNext : undefined}
        hasPrevVersion={showVersion && versionIdx > 0}
        hasNextVersion={showVersion && versionIdx < VERSION_SNIPPETS.length - 1}
      />
    </div>
  );
}

function SizesDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(["sm", "md", "lg"] as const).map((s) => (
        <div key={s}>
          <p style={{ fontSize: 13, margin: "0 0 4px", opacity: 0.7 }}>
            size="{s}"
          </p>
          <CodeBlock
            code={`const x = 42;\nconsole.log("size ${s}");`}
            size={s}
            showLineNumbers
            title={`Size ${s}`}
          />
        </div>
      ))}
    </div>
  );
}

function HighlightsDemo() {
  const highlights: LineHighlight[] = [
    { line: 3, type: "success", indicator: true },
    { line: 4, type: "success", indicator: true },
    { line: 7, type: "alert", indicator: true },
  ];

  return (
    <CodeBlock
      code={SAMPLE_CODE}
      showLineNumbers
      title="Diff view"
      description="Green = added, Red = removed"
      actions={<CopyButton value={SAMPLE_CODE} />}
      highlights={highlights}
    />
  );
}

function HighlightTypesDemo() {
  const types: HighlightType[] = [
    "neutral",
    "brand",
    "info",
    "success",
    "warning",
    "alert",
  ];
  const code = types.map((t) => `// highlight type: ${t}`).join("\n");
  const highlights: LineHighlight[] = types.map((t, i) => ({
    line: i + 1,
    type: t,
    indicator: true,
  }));

  return (
    <CodeBlock
      code={code}
      showLineNumbers
      title="All highlight types"
      highlights={highlights}
    />
  );
}

function ShowMoreDemo() {
  return (
    <CodeBlock
      code={SAMPLE_CODE}
      showLineNumbers
      title="Counter.tsx"
      description="React component"
      actions={<CopyButton value={SAMPLE_CODE} />}
      visibleLines={5}
    />
  );
}

function VersionSwitchDemo() {
  const [versionIdx, setVersionIdx] = useState(0);

  const handlePrev = useCallback(
    () => setVersionIdx((i) => Math.max(0, i - 1)),
    [],
  );
  const handleNext = useCallback(
    () => setVersionIdx((i) => Math.min(VERSION_SNIPPETS.length - 1, i + 1)),
    [],
  );

  return (
    <CodeBlock
      code={VERSION_SNIPPETS[versionIdx]}
      showLineNumbers
      title="greet.ts"
      description="Evolution of a function"
      actions={<CopyButton value={VERSION_SNIPPETS[versionIdx]} />}
      versionLabel={`Version ${versionIdx + 1}`}
      onPrevVersion={handlePrev}
      onNextVersion={handleNext}
      hasPrevVersion={versionIdx > 0}
      hasNextVersion={versionIdx < VERSION_SNIPPETS.length - 1}
    />
  );
}

function LanguagesDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <CodeBlock
        code={SAMPLE_CODE}
        showLineNumbers
        title="Counter.tsx"
        description="JavaScript / JSX"
        actions={<CopyButton value={SAMPLE_CODE} />}
      />
      <CodeBlock
        code={SAMPLE_PYTHON}
        showLineNumbers
        title="fibonacci.py"
        description="Python"
        actions={<CopyButton value={SAMPLE_PYTHON} />}
      />
      <CodeBlock
        code={SAMPLE_CSS}
        showLineNumbers
        title="styles.css"
        description="CSS"
        actions={<CopyButton value={SAMPLE_CSS} />}
      />
    </div>
  );
}

function MinimalDemo() {
  return (
    <CodeBlock
      code={`npm install @smartly/design-system`}
      size="sm"
    />
  );
}

export default function CodeBlockPlayground() {
  return (
    <>
      <h1>CodeBlock</h1>

      <section style={sectionStyle}>
        <h2>Configurable</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Toggle props to explore all options.
        </p>
        <div style={cardStyle}>
          <ConfigurableDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Sizes</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          sm, md, lg — affects font size and line height.
        </p>
        <div style={cardStyle}>
          <SizesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Line highlights</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Highlight specific lines with colored indicators.
        </p>
        <div style={cardStyle}>
          <HighlightsDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Highlight types</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          All six highlight color variants.
        </p>
        <div style={cardStyle}>
          <HighlightTypesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Show more</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Truncated code with a one-way expand button.
        </p>
        <div style={cardStyle}>
          <ShowMoreDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Version switch</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Consumer-controlled version navigation.
        </p>
        <div style={cardStyle}>
          <VersionSwitchDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Multi-language</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Syntax highlighting for JS/JSX, Python, and CSS.
        </p>
        <div style={cardStyle}>
          <LanguagesDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Minimal</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Code block with no header, no line numbers — just code.
        </p>
        <div style={cardStyle}>
          <MinimalDemo />
        </div>
      </section>
    </>
  );
}
