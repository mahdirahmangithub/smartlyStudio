import { useState, Fragment } from "react";
import { TitleText } from "@sds/components/TitleText";
import { BodyText } from "@sds/components/BodyText";
import { Link } from "@sds/components/Link";
import { Divider } from "@sds/components/Divider";
import { Icon } from "@sds/components/Icon";
import { Button } from "@sds/components/Button";
import { ContentSwitcher } from "@sds/components/ContentSwitcher";
import { ContentSwitcherItem } from "@sds/components/ContentSwitcherItem";
import { useTypewriter, type TypewriterTrail } from "@sds/hooks/useTypewriter";

const sectionCard = {
  padding: 32,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
  maxWidth: 720,
} as const;

/* ── Raw markdown source ──────────────────────────────────────────── */

const MARKDOWN_SOURCE = `# Getting Started with Smartly

A quick guide to launching your first campaign on the platform.

---

Smartly helps teams manage and launch high performing campaigns across platforms with just a few clicks. Whether you are boosting posts or managing multi-market launches, the platform ensures ads stay relevant and optimized.

## Why Smartly?

Traditional campaign management involves juggling spreadsheets, switching between ad platforms, and manually tracking performance. Smartly streamlines this into a single workspace where you can set up templates, define creative rules, and monitor metrics — all in one place. Learn more in the [official documentation](https://docs.example.com).

---

## Core Features

### 1. Campaign Templates

Create reusable templates that enforce brand guidelines automatically. Templates support dynamic variables, audience targeting presets, and budget allocation rules. See the [templates guide](#templates) for setup instructions.

### 2. Performance Tracking

Real-time dashboards surface the metrics that matter. You can track impressions, click-through rates, conversions, and ROAS across every channel from a single view.

### 3. Multi-Market Launches

Roll out campaigns across multiple regions simultaneously with localized creative and budgets. The system handles translations, currency conversions, and regional compliance automatically.

---

## Quick Start Checklist

- Create your workspace and invite team members
- Connect your ad accounts (Meta, Google, TikTok, Snapchat)
- Upload your brand assets and creative templates
- Define audience segments and targeting rules
- Launch your first campaign and monitor the performance dashboard

---

## Additional Resources

Explore these resources to get the most out of Smartly:

- API Reference
- Video Tutorials
- Community Forum

---

Last updated February 2026. For questions, reach out to support@example.com.`;

function MarkdownSource() {
  return (
    <pre
      style={{
        ...sectionCard,
        margin: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontFamily: "var(--type-body-md-family, monospace)",
        fontSize: "var(--type-body-md-size, 14px)",
        lineHeight: "var(--type-body-md-line-height, 1.5)",
        color: "var(--text-neutral-primary)",
      }}
    >
      {MARKDOWN_SOURCE}
    </pre>
  );
}

/* ── DS-styled article ───────────────────────────────────────────── */

function DSArticle() {
  return (
    <article style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 0 }}>
      <TitleText
        size="xl"
        title="Getting Started with Smartly"
        description="A quick guide to launching your first campaign on the platform."
        leadingIcon={<Icon name="rocket_launch" size={24} />}
        paddingBottom="md"
      />

      <Divider />

      <BodyText size="lg" paddingTop="md" paddingBottom="md">
        Smartly helps teams manage and launch high performing campaigns across
        platforms with just a few clicks. Whether you are boosting posts or
        managing multi-market launches, the platform ensures ads stay relevant
        and optimized.
      </BodyText>

      <TitleText size="lg" title="Why Smartly?" paddingBottom="sm" />

      <BodyText size="lg" paddingBottom="md">
        Traditional campaign management involves juggling spreadsheets,
        switching between ad platforms, and manually tracking performance.{" "}
        <BodyText as="span" size="lg" strong>Smartly streamlines this</BodyText>{" "}
        into a single workspace where you can set up templates,
        define creative rules, and monitor metrics — all in one place. Learn more
        in the{" "}
        <Link href="https://docs.example.com" inline type="brand">
          official documentation
        </Link>.
      </BodyText>

      <Divider variant="dashed" />

      <TitleText size="lg" title="Core Features" paddingTop="md" paddingBottom="sm" />

      <TitleText size="md" title="1. Campaign Templates" paddingBottom="xs" />

      <BodyText size="md" paddingBottom="md">
        Create reusable templates that enforce brand guidelines automatically.
        Templates support dynamic variables, audience targeting presets, and
        budget allocation rules. See the{" "}
        <Link href="#templates" inline type="brand">
          templates guide
        </Link>{" "}
        for setup instructions.
      </BodyText>

      <TitleText size="md" title="2. Performance Tracking" paddingBottom="xs" />

      <BodyText size="md" paddingBottom="md">
        Real-time dashboards surface the metrics that matter. You can track
        impressions, click-through rates, conversions, and ROAS across every
        channel from a single view.
      </BodyText>

      <TitleText size="md" title="3. Multi-Market Launches" paddingBottom="xs" />

      <BodyText size="md" paddingBottom="md">
        Roll out campaigns across multiple regions simultaneously with
        localized creative and budgets. The system handles translations,
        currency conversions, and regional compliance automatically.
      </BodyText>

      <Divider />

      <TitleText size="lg" title="Quick Start Checklist" paddingTop="md" paddingBottom="sm" />

      <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
        <BodyText as="li" size="lg">
          Create your workspace and invite team members
        </BodyText>
        <BodyText as="li" size="lg">
          Connect your ad accounts (Meta, Google, TikTok, Snapchat)
        </BodyText>
        <BodyText as="li" size="lg">
          Upload your brand assets and creative templates
        </BodyText>
        <BodyText as="li" size="lg">
          Define audience segments and targeting rules
        </BodyText>
        <BodyText as="li" size="lg">
          Launch your first campaign and monitor the{" "}
          <Link href="#dashboard" inline type="brand">
            performance dashboard
          </Link>
        </BodyText>
      </ul>

      <Divider padding />

      <TitleText size="lg" title="Additional Resources" paddingBottom="sm" />

      <BodyText size="md" emphasis="medium" paddingBottom="xs">
        Explore these resources to get the most out of Smartly:
      </BodyText>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 16 }}>
        <Link href="https://docs.example.com/api" size="md" type="brand">
          API Reference
        </Link>
        <Link href="https://docs.example.com/tutorials" size="md" type="brand">
          Video Tutorials
        </Link>
        <Link href="https://community.example.com" size="md" type="brand">
          Community Forum
        </Link>
      </div>

      <Divider />

      <BodyText size="sm" emphasis="low" paddingTop="sm">
        Last updated February 2026. For questions, reach out to{" "}
        <Link href="mailto:support@example.com" inline type="brand" underline>
          support@example.com
        </Link>.
      </BodyText>
    </article>
  );
}

/* ── Typewriter article (rich inline parts) ──────────────────────── */

type InlinePart =
  | { kind: "text"; text: string }
  | { kind: "strong"; text: string }
  | { kind: "link"; text: string; href: string; underline?: boolean };

type Segment =
  | { type: "title"; size: "xl" | "lg" | "md"; text: string; description?: string; icon?: boolean }
  | { type: "body"; size: "sm" | "md" | "lg"; parts: InlinePart[]; emphasis?: "high" | "medium" | "low" }
  | { type: "li"; parts: InlinePart[] }
  | { type: "divider"; variant?: "normal" | "dashed" }
  | { type: "standalone-link"; text: string; href: string };

function partsText(parts: InlinePart[]): string {
  return parts.map((p) => p.text).join("");
}

function segText(seg: Segment): string {
  switch (seg.type) {
    case "divider": return "";
    case "title": return seg.text + (seg.description ?? "");
    case "body":
    case "li": return partsText(seg.parts);
    case "standalone-link": return seg.text;
  }
}

function sliceParts(
  parts: InlinePart[],
  chars: number,
  globalStart: number,
  trail: TypewriterTrail,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = chars;
  let pos = globalStart;
  for (let i = 0; i < parts.length && remaining > 0; i++) {
    const p = parts[i];
    const visible = p.text.slice(0, remaining);
    const content = trail.renderText(visible, pos);
    switch (p.kind) {
      case "text":
        nodes.push(<Fragment key={`p${i}`}>{content}</Fragment>);
        break;
      case "strong":
        nodes.push(
          <BodyText key={i} as="span" size="lg" strong>{content}</BodyText>
        );
        break;
      case "link":
        nodes.push(
          <Link key={i} href={p.href} inline type="brand" underline={p.underline}>
            {content}
          </Link>
        );
        break;
    }
    pos += visible.length;
    remaining -= visible.length;
  }
  return nodes;
}

const SEGMENTS: Segment[] = [
  { type: "title", size: "xl", text: "Getting Started with Smartly", description: "A quick guide to launching your first campaign on the platform.", icon: true },
  { type: "divider" },
  { type: "body", size: "lg", parts: [
    { kind: "text", text: "Smartly helps teams manage and launch high performing campaigns across platforms with just a few clicks. Whether you are boosting posts or managing multi-market launches, the platform ensures ads stay relevant and optimized." },
  ]},
  { type: "title", size: "lg", text: "Why Smartly?" },
  { type: "body", size: "lg", parts: [
    { kind: "text", text: "Traditional campaign management involves juggling spreadsheets, switching between ad platforms, and manually tracking performance. " },
    { kind: "strong", text: "Smartly streamlines this" },
    { kind: "text", text: " into a single workspace where you can set up templates, define creative rules, and monitor metrics — all in one place. Learn more in the " },
    { kind: "link", text: "official documentation", href: "https://docs.example.com" },
    { kind: "text", text: "." },
  ]},
  { type: "divider", variant: "dashed" },
  { type: "title", size: "lg", text: "Core Features" },
  { type: "title", size: "md", text: "1. Campaign Templates" },
  { type: "body", size: "md", parts: [
    { kind: "text", text: "Create reusable templates that enforce brand guidelines automatically. Templates support dynamic variables, audience targeting presets, and budget allocation rules. See the " },
    { kind: "link", text: "templates guide", href: "#templates" },
    { kind: "text", text: " for setup instructions." },
  ]},
  { type: "title", size: "md", text: "2. Performance Tracking" },
  { type: "body", size: "md", parts: [
    { kind: "text", text: "Real-time dashboards surface the metrics that matter. You can track impressions, click-through rates, conversions, and ROAS across every channel from a single view." },
  ]},
  { type: "title", size: "md", text: "3. Multi-Market Launches" },
  { type: "body", size: "md", parts: [
    { kind: "text", text: "Roll out campaigns across multiple regions simultaneously with localized creative and budgets. The system handles translations, currency conversions, and regional compliance automatically." },
  ]},
  { type: "divider" },
  { type: "title", size: "lg", text: "Quick Start Checklist" },
  { type: "li", parts: [{ kind: "text", text: "Create your workspace and invite team members" }] },
  { type: "li", parts: [{ kind: "text", text: "Connect your ad accounts (Meta, Google, TikTok, Snapchat)" }] },
  { type: "li", parts: [{ kind: "text", text: "Upload your brand assets and creative templates" }] },
  { type: "li", parts: [{ kind: "text", text: "Define audience segments and targeting rules" }] },
  { type: "li", parts: [
    { kind: "text", text: "Launch your first campaign and monitor the " },
    { kind: "link", text: "performance dashboard", href: "#dashboard" },
  ]},
  { type: "divider" },
  { type: "title", size: "lg", text: "Additional Resources" },
  { type: "body", size: "md", parts: [{ kind: "text", text: "Explore these resources to get the most out of Smartly:" }], emphasis: "medium" },
  { type: "standalone-link", text: "API Reference", href: "https://docs.example.com/api" },
  { type: "standalone-link", text: "Video Tutorials", href: "https://docs.example.com/tutorials" },
  { type: "standalone-link", text: "Community Forum", href: "https://community.example.com" },
  { type: "divider" },
  { type: "body", size: "sm", parts: [
    { kind: "text", text: "Last updated February 2026. For questions, reach out to " },
    { kind: "link", text: "support@example.com", href: "mailto:support@example.com", underline: true },
    { kind: "text", text: "." },
  ], emphasis: "low" },
];

const TOTAL_CHARS = SEGMENTS.reduce((sum, s) => sum + segText(s).length, 0);

function TypewriterArticle() {
  const allText = SEGMENTS.map(segText).join("");
  const { isTyping, isDone, start, skip, reset, trail } = useTypewriter(
    allText,
    { speed: 12, fade: 120 },
  );

  const isIdle = !isTyping && !isDone;
  const { revealed } = trail;

  const elements: React.ReactNode[] = [];
  let offset = 0;

  for (let i = 0; i < SEGMENTS.length; i++) {
    const seg = SEGMENTS[i];
    const len = segText(seg).length;
    const chars = Math.min(Math.max(revealed - offset, 0), len);

    if (seg.type === "divider") {
      if (revealed > offset) elements.push(<Divider key={i} variant={seg.variant} />);
      offset += len;
      continue;
    }

    if (chars <= 0) { offset += len; continue; }

    if (seg.type === "title") {
      const titleChars = Math.min(chars, seg.text.length);
      const descChars = chars - seg.text.length;
      elements.push(
        <TitleText
          key={i}
          size={seg.size}
          title={trail.renderText(seg.text.slice(0, titleChars), offset)}
          description={
            seg.description && descChars > 0
              ? trail.renderText(seg.description.slice(0, descChars), offset + seg.text.length)
              : undefined
          }
          leadingIcon={seg.icon ? <Icon name="rocket_launch" size={24} /> : undefined}
          paddingTop={seg.size === "lg" || seg.size === "xl" ? "md" : undefined}
          paddingBottom={seg.size === "xl" ? "md" : seg.size === "lg" ? "sm" : "xs"}
        />
      );
    } else if (seg.type === "body") {
      elements.push(
        <BodyText key={i} size={seg.size} emphasis={seg.emphasis} paddingBottom="md">
          {sliceParts(seg.parts, chars, offset, trail)}
        </BodyText>
      );
    } else if (seg.type === "li") {
      let listStart = i;
      while (listStart > 0 && SEGMENTS[listStart - 1].type === "li") listStart--;
      if (listStart === i) {
        const listItems: React.ReactNode[] = [];
        for (let j = i; j < SEGMENTS.length && SEGMENTS[j].type === "li"; j++) {
          const liSeg = SEGMENTS[j] as { type: "li"; parts: InlinePart[] };
          const liLen = partsText(liSeg.parts).length;
          const liChars = Math.min(Math.max(revealed - offset, 0), liLen);
          if (liChars > 0) {
            listItems.push(
              <BodyText key={j} as="li" size="lg">
                {sliceParts(liSeg.parts, liChars, offset, trail)}
              </BodyText>
            );
          }
          offset += liLen;
          i = j;
        }
        elements.push(
          <ul key={`ul-${listStart}`} style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
            {listItems}
          </ul>
        );
        continue;
      }
    } else if (seg.type === "standalone-link") {
      elements.push(
        <Link key={i} href={seg.href} size="md" type="brand">
          {trail.renderText(seg.text.slice(0, chars), offset)}
        </Link>
      );
    }

    offset += len;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {isIdle && (
          <Button size="md" variant="brand" emphasis="high" onClick={start}>
            <Icon name="play_arrow" size={16} />
            Play
          </Button>
        )}
        {isTyping && (
          <Button size="md" variant="neutral" emphasis="medium" onClick={skip}>
            Skip
          </Button>
        )}
        {isDone && (
          <Button size="md" variant="neutral" emphasis="medium" onClick={() => { reset(); setTimeout(start, 50); }}>
            <Icon name="repeat" size={16} />
            Replay
          </Button>
        )}
        {!isIdle && (
          <span style={{ fontSize: 12, color: "var(--text-neutral-tertiary-default)", alignSelf: "center" }}>
            {revealed} / {TOTAL_CHARS} chars
          </span>
        )}
      </div>

      <article style={{ ...sectionCard, display: "flex", flexDirection: "column", gap: 0, minHeight: 400 }}>
        {elements.length > 0 ? elements : <BodyText size="lg">{"\u00A0"}</BodyText>}
      </article>
    </div>
  );
}

/* ── Page with toggle ────────────────────────────────────────────── */

export default function TextShowcase() {
  const [mode, setMode] = useState<"ds" | "markdown" | "typewriter">("ds");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ContentSwitcher
          size="md"
          emphasis="high"
          value={mode}
          onChange={(v) => setMode(v as "ds" | "markdown" | "typewriter")}
        >
          <ContentSwitcherItem value="ds">Design System</ContentSwitcherItem>
          <ContentSwitcherItem value="markdown">Markdown</ContentSwitcherItem>
          <ContentSwitcherItem value="typewriter">Typewriter</ContentSwitcherItem>
        </ContentSwitcher>
      </div>

      {mode === "ds" && <DSArticle />}
      {mode === "markdown" && <MarkdownSource />}
      {mode === "typewriter" && <TypewriterArticle />}
    </div>
  );
}
