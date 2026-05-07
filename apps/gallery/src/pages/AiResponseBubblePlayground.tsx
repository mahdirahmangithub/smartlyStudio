import { useState, useEffect, useRef } from "react";
import {
  AiResponseBubble,
  type AiResponseBubblePhase,
} from "@sds/components/AiResponseBubble";
import { Cot, CotItem } from "@sds/components/Cot";
import type { FeedbackValue } from "@sds/components/FeedbackBoolean";

/* ── Labels cycling in loading phase ── */

const LOADING_LABELS = [
  "Understand the question",
  "Retrieve context",
  "Check for ambiguities",
  "Synthesise answer",
  "Verify accuracy",
  "Format response",
];

function useCyclingLabel(labels: string[], intervalMs = 1800) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % labels.length), intervalMs);
    return () => clearInterval(id);
  }, [labels.length, intervalMs]);
  return labels[index];
}

/* ── Full HTML response ── */

const FULL_HTML = `<h2>How large language models work</h2>
<p>Large language models are trained on vast amounts of text data, allowing them to generate coherent, contextually relevant responses across a wide range of topics.</p>
<h3>Key components</h3>
<ul>
  <li><strong>Transformer architecture</strong> — attention mechanisms capture long-range dependencies in language.</li>
  <li><strong>Pre-training</strong> — the model learns general language patterns from a large corpus.</li>
  <li><strong>Fine-tuning</strong> — targeted training aligns the model with specific tasks or instructions.</li>
</ul>
<p>A simple example in Python:</p>
<pre><code class="language-python">response = client.messages.create(
    model="claude-opus-4-7",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.content[0].text)
</code></pre>
<blockquote>Models do not store memory between conversations — each request is stateless.</blockquote>`;

/**
 * Split HTML into stream-like chunks: each HTML tag is one chunk,
 * text content is split word-by-word. This mirrors how real AI APIs
 * send tokens — never a partial HTML tag.
 */
function toStreamChunks(html: string): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === "<") {
      const end = html.indexOf(">", i);
      if (end !== -1) {
        chunks.push(html.slice(i, end + 1));
        i = end + 1;
      } else {
        chunks.push(html[i++]);
      }
    } else {
      // Grab up to the next tag or next space (word boundary).
      // Stop BEFORE a tag boundary so < is never appended to a text chunk —
      // a dangling < in the accumulated HTML causes DOMParser to briefly render it.
      const tagAt = html.indexOf("<", i);
      const spaceAt = html.indexOf(" ", i);
      const newlineAt = html.indexOf("\n", i);
      const whitespace = [spaceAt, newlineAt].filter((n) => n > i);
      const nearestWhitespace = whitespace.length ? Math.min(...whitespace) + 1 : Infinity;
      const nearestTag = tagAt > i ? tagAt : Infinity;
      const next = Math.min(nearestWhitespace, nearestTag, html.length);
      if (next === i) { i++; continue; }
      chunks.push(html.slice(i, next));
      i = next;
    }
  }
  return chunks;
}

const STREAM_CHUNKS = toStreamChunks(FULL_HTML);

/**
 * Simulates real AI streaming: reveals one chunk every ~40ms.
 * When phase switches to "generating" it starts from zero.
 */
function useStreamingText(active: boolean) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setText("");
      setDone(false);
      idxRef.current = 0;
      return;
    }

    const id = setInterval(() => {
      if (idxRef.current >= STREAM_CHUNKS.length) {
        setDone(true);
        clearInterval(id);
        return;
      }
      const next = idxRef.current + 1;
      setText(STREAM_CHUNKS.slice(0, next).join(""));
      idxRef.current = next;
    }, 40);

    return () => clearInterval(id);
  }, [active]);

  return { text, done };
}

/* ── CoT content ── */

const SAMPLE_COT = (
  <Cot>
    <CotItem variant="todo" status="complete" title="Understand the question" description="Parsing intent and identifying key concepts" />
    <CotItem variant="todo" status="complete" title="Retrieve context" description="Searching knowledge base for relevant facts" />
    <CotItem variant="todo" status="complete" title="Check for ambiguities" description="Resolving conflicting or unclear signals" />
    <CotItem variant="todo" status="complete" title="Synthesise answer" description="Combining retrieved context with reasoning" />
    <CotItem variant="todo" status="complete" title="Verify accuracy" description="Cross-checking facts against known sources" />
    <CotItem variant="todo" status="loading" title="Format response" description="Structuring the final output for clarity" connector={false} />
  </Cot>
);

/* ── Demo ── */

function Demo({
  phase,
  withCot,
  withSlot,
  withActions,
}: {
  phase: AiResponseBubblePhase;
  withCot: boolean;
  withSlot: boolean;
  withActions: boolean;
}) {
  const [feedback, setFeedback] = useState<FeedbackValue>(null);
  const cyclingLabel = useCyclingLabel(LOADING_LABELS);
  const { text: streamText, done: streamDone } = useStreamingText(phase === "generating");

  const resolvedPhase: AiResponseBubblePhase =
    phase === "generating" && streamDone ? "done" : phase;

  const text = phase === "done" ? FULL_HTML : streamText;

  return (
    <AiResponseBubble
      phase={resolvedPhase}
      loadingLabel={cyclingLabel}
      cotContent={withCot ? SAMPLE_COT : undefined}
      cotTitle="Thought for 3s"
      text={text}
      slot={
        withSlot ? (
          <div style={{
            background: "var(--element-surface-over)",
            border: "0.5px solid var(--element-divider-neutral-default)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--spacing-md)",
            fontSize: "13px",
            color: "var(--content-secondary-default)",
          }}>
            Slot content (e.g. a code block or card)
          </div>
        ) : undefined
      }
      copyValue={withActions ? FULL_HTML : undefined}
      onRegenerate={withActions ? () => {} : undefined}
      showFeedback={withActions}
      feedbackValue={feedback}
      onFeedbackChange={setFeedback}
    />
  );
}

/* ── Playground ── */

export default function AiResponseBubblePlayground() {
  const [phase, setPhase] = useState<AiResponseBubblePhase>("loading");
  const [withCot, setWithCot] = useState(true);
  const [withSlot, setWithSlot] = useState(false);
  const [withActions, setWithActions] = useState(true);

  const labelStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 13, color: "var(--content-secondary-default)", cursor: "pointer",
  };

  const phaseBtns: AiResponseBubblePhase[] = ["loading", "generating", "done"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 600 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>AiResponseBubble</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, paddingBottom: 24, borderBottom: "1px solid var(--element-divider-neutral-default)" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "var(--content-secondary-default)" }}>Phase:</span>
          {phaseBtns.map((p) => (
            <button
              key={p}
              onClick={() => setPhase(p)}
              style={{
                padding: "4px 12px", borderRadius: 6,
                border: "1px solid var(--element-divider-neutral-default)",
                background: phase === p ? "var(--element-surface-active)" : "transparent",
                cursor: "pointer", fontSize: 13,
                color: "var(--content-primary-default)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <label style={labelStyle}>
          <input type="checkbox" checked={withCot} onChange={(e) => setWithCot(e.target.checked)} />
          With CoT
        </label>
        <label style={labelStyle}>
          <input type="checkbox" checked={withSlot} onChange={(e) => setWithSlot(e.target.checked)} />
          With slot
        </label>
        <label style={labelStyle}>
          <input type="checkbox" checked={withActions} onChange={(e) => setWithActions(e.target.checked)} />
          With actions
        </label>
      </div>

      <Demo key={phase} phase={phase} withCot={withCot} withSlot={withSlot} withActions={withActions} />

      <hr style={{ border: "none", borderTop: "1px solid var(--element-divider-neutral-default)" }} />

      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>All phases — side by side</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {phaseBtns.map((p) => (
          <div key={p}>
            <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--content-tertiary-default)" }}>
              {p}
            </p>
            <Demo phase={p} withCot={true} withSlot={false} withActions={p === "done"} />
          </div>
        ))}
      </div>
    </div>
  );
}
