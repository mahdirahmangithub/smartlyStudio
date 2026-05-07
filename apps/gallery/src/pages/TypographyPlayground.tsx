const SAMPLE = "The quick brown fox jumps over the lazy dog";
const NUM_SAMPLE = "0123456789";
const CODE_SAMPLE = "const x = await fetch('/api');";

const captionStyle = {
  fontSize: 11,
  color: "var(--text-neutral-secondary-default)",
  fontFamily: "monospace",
  whiteSpace: "nowrap" as const,
  minWidth: 120,
};

const sectionCard = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
} as const;

const rowStyle = {
  display: "flex",
  gap: 16,
  alignItems: "baseline",
  paddingBottom: 16,
  borderBottom: "1px solid var(--element-outline-neutral-subtlest)",
} as const;

interface StyleRow {
  label: string;
  token: string;
  text?: string;
}

function TypeRow({ label, token, text = SAMPLE }: StyleRow) {
  return (
    <div style={rowStyle}>
      <span style={captionStyle}>{label}</span>
      <span
        style={{
          fontFamily: `var(--type-${token}-family)`,
          fontWeight: `var(--type-${token}-weight)` as unknown as number,
          fontSize: `var(--type-${token}-size)`,
          lineHeight: `var(--type-${token}-line-height)`,
          letterSpacing: `var(--type-${token}-letter-spacing)`,
        }}
      >
        {text}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 style={{ margin: "0 0 12px" }}>{title}</h3>
      <div style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </section>
  );
}

export default function TypographyPlayground() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2 style={{ margin: 0 }}>Typography</h2>

      <Section title="Heading">
        <TypeRow label="heading-lg" token="heading-lg" />
        <TypeRow label="heading-md" token="heading-md" />
        <TypeRow label="heading-sm" token="heading-sm" />
      </Section>

      <Section title="Title">
        <TypeRow label="title-lg" token="title-lg" />
        <TypeRow label="title-md" token="title-md" />
        <TypeRow label="title-sm" token="title-sm" />
        <TypeRow label="title-xs" token="title-xs" />
      </Section>

      <Section title="Label">
        <TypeRow label="label-lg" token="label-lg" />
        <TypeRow label="label-md" token="label-md" />
        <TypeRow label="label-sm" token="label-sm" />
        <TypeRow label="label-xs" token="label-xs" />
      </Section>

      <Section title="Label Strong">
        <TypeRow label="label-strong-lg" token="label-strong-lg" />
        <TypeRow label="label-strong-md" token="label-strong-md" />
        <TypeRow label="label-strong-sm" token="label-strong-sm" />
        <TypeRow label="label-strong-xs" token="label-strong-xs" />
      </Section>

      <Section title="Body">
        <TypeRow label="body-lg" token="body-lg" />
        <TypeRow label="body-md" token="body-md" />
        <TypeRow label="body-sm" token="body-sm" />
      </Section>

      <Section title="Body Strong">
        <TypeRow label="body-strong-lg" token="body-strong-lg" />
        <TypeRow label="body-strong-md" token="body-strong-md" />
        <TypeRow label="body-strong-sm" token="body-strong-sm" />
      </Section>

      <Section title="Number">
        <TypeRow label="number-lg" token="number-lg" text={NUM_SAMPLE} />
        <TypeRow label="number-md" token="number-md" text={NUM_SAMPLE} />
        <TypeRow label="number-sm" token="number-sm" text={NUM_SAMPLE} />
        <TypeRow label="number-xs" token="number-xs" text={NUM_SAMPLE} />
      </Section>

      <Section title="Number Strong">
        <TypeRow label="number-strong-lg" token="number-strong-lg" text={NUM_SAMPLE} />
        <TypeRow label="number-strong-md" token="number-strong-md" text={NUM_SAMPLE} />
        <TypeRow label="number-strong-sm" token="number-strong-sm" text={NUM_SAMPLE} />
        <TypeRow label="number-strong-xs" token="number-strong-xs" text={NUM_SAMPLE} />
      </Section>

      <Section title="Caption">
        <TypeRow label="caption-md" token="caption-md" />
        <TypeRow label="caption-sm" token="caption-sm" />
      </Section>

      <Section title="Caption Strong">
        <TypeRow label="caption-strong-md" token="caption-strong-md" />
        <TypeRow label="caption-strong-sm" token="caption-strong-sm" />
      </Section>

      <Section title="Code">
        <TypeRow label="code-lg" token="code-lg" text={CODE_SAMPLE} />
        <TypeRow label="code-md" token="code-md" text={CODE_SAMPLE} />
        <TypeRow label="code-sm" token="code-sm" text={CODE_SAMPLE} />
      </Section>
    </div>
  );
}
