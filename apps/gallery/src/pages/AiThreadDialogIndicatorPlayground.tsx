import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { AiThread, type AiThreadHandle, type AiThreadMessage } from "@sds/components/AiThread";
import {
  AiThreadDialogIndicator,
  useAiThreadActiveMessage,
  type AiThreadDialogIndicatorItem,
} from "@sds/components/AiThread";

/* ── Strip HTML tags to produce a plain-text preview ── */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/* ── Static conversation content ── */

const SHORT_RESPONSE = `<p>Got it! I'll help you with that right away.</p>`;

const MEDIUM_RESPONSE = `<p>Here's a quick summary of the key points you should consider when planning your Q3 campaign:</p>
<ul>
  <li>Define your primary KPI — reach, conversions, or ROAS.</li>
  <li>Align your creative assets with your audience segments.</li>
  <li>Set a realistic budget distribution across channels.</li>
</ul>`;

const LONG_RESPONSE = `<h3>Campaign Planning Guide — Q3 2026</h3>
<p>Planning a high-performing campaign requires balancing creative ambition with data-driven targeting. Here's a structured approach based on industry benchmarks and the performance patterns we see across similar accounts.</p>
<h4>1. Audience segmentation</h4>
<p>Start by splitting your audience into three tiers: prospecting (top of funnel), retargeting (mid-funnel users who engaged but didn't convert), and retention (existing customers for upsell). Each tier needs its own creative tone and bid strategy. Blending them into a single ad set is the most common mistake and consistently leads to underperformance across all three objectives.</p>
<h4>2. Creative strategy</h4>
<p>For prospecting, use thumb-stopping visuals with a clear value proposition in the first two seconds. For retargeting, lean on social proof — testimonials, ratings, or "X people bought this week" copy. For retention, personalise: reference the product they bought or the category they browsed.</p>
<h4>3. Budget allocation</h4>
<p>A 60/30/10 split across prospecting, retargeting, and retention tends to work well for accounts with an established pixel and at least 90 days of conversion history. If you're launching into a new market or have a thin pixel, shift more toward prospecting until you have enough retargeting volume to be meaningful.</p>`;

const COT_RESPONSE = `<p>I've analysed your campaign data and identified three optimisation opportunities.</p>`;

const INITIAL_MESSAGES: AiThreadMessage[] = [
  {
    id: "u1",
    role: "user",
    message: "Can you help me plan a Q3 campaign for our BMW account?",
  },
  {
    id: "a1",
    role: "assistant",
    phase: "done",
    text: MEDIUM_RESPONSE,
    copyValue: stripHtml(MEDIUM_RESPONSE),
  },
  {
    id: "u2",
    role: "user",
    message: "Great — can you go deeper on the audience segmentation part?",
  },
  {
    id: "a2",
    role: "assistant",
    phase: "done",
    text: LONG_RESPONSE,
    copyValue: stripHtml(LONG_RESPONSE),
    cotContent: (
      <p style={{ margin: 0, fontSize: 13 }}>
        Analysed 12 months of account history across 4 markets. Segmentation model derived
        from 2.3M attributed conversions using a 7-day click / 1-day view window.
      </p>
    ),
    cotTitle: "Reasoning",
  },
  {
    id: "u3",
    role: "user",
    message: "What about the budget split? Should we change it for a new market?",
  },
  {
    id: "a3",
    role: "assistant",
    phase: "done",
    text: SHORT_RESPONSE,
    copyValue: stripHtml(SHORT_RESPONSE),
  },
  {
    id: "u4",
    role: "user",
    message: "How does ROAS differ between prospecting and retargeting?",
  },
  {
    id: "a4",
    role: "assistant",
    phase: "done",
    text: `<p>Retargeting almost always shows higher reported ROAS because it's catching warm intent — but it's often mis-attributed. A prospecting campaign that fills the funnel is what makes retargeting efficient. You can't scale retargeting without healthy prospecting volume feeding it.</p>`,
    copyValue: "Retargeting almost always shows higher reported ROAS...",
  },
  {
    id: "u5",
    role: "user",
    message: "Can you also analyse our current ad sets and flag any issues?",
  },
  {
    id: "a5",
    role: "assistant",
    phase: "done",
    text: COT_RESPONSE,
    cotContent: (
      <p style={{ margin: 0, fontSize: 13 }}>
        Scanned 34 active ad sets. Flagged 6 with overlapping audience definitions, 3 with
        creative fatigue signals, and 2 with budget caps that are limiting delivery.
      </p>
    ),
    cotTitle: "Analysis",
    copyValue: stripHtml(COT_RESPONSE),
  },
  {
    id: "u6",
    role: "user",
    message: "Perfect. What's the priority order for fixing them?",
  },
  {
    id: "a6",
    role: "assistant",
    phase: "done",
    text: `<p>Fix the budget caps first — they're actively throttling spend right now and the fix is instant. Audience overlaps are a medium-term issue; resolve them in the next planning cycle. Creative fatigue needs new assets, which takes time, so deprioritise unless CTR has already dropped below 0.8%.</p>`,
    copyValue: "Fix the budget caps first...",
  },
  {
    id: "u7",
    role: "user",
    message: "One more thing — can you draft a brief for the creative team?",
  },
  {
    id: "a7",
    role: "assistant",
    phase: "done",
    text: `<h4>Creative Brief — Q3 BMW Retargeting</h4>
<p><strong>Objective:</strong> Re-engage users who visited the configurator but did not request a test drive within 14 days.</p>
<p><strong>Tone:</strong> Confident, aspirational — BMW owns the road, not the algorithm.</p>
<p><strong>Key message:</strong> "Your configuration is waiting." Lead with the car they built, not a discount.</p>
<p><strong>Formats needed:</strong> 1:1 feed (1080×1080), 9:16 Stories/Reels (1080×1920), 4:5 feed (1080×1350).</p>
<p><strong>Deliverables:</strong> 3 concept directions by end of sprint 22.</p>`,
    copyValue: "Creative Brief — Q3 BMW Retargeting...",
  },
];

/* ── Playground ── */

export default function AiThreadDialogIndicatorPlayground() {
  const threadRef = useRef<AiThreadHandle>(null);
  // Point at document.documentElement so AiThread uses the browser's native
  // page scroll rather than an inner div. Initialized in useEffect to avoid
  // SSR issues (document doesn't exist on the server).
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    scrollContainerRef.current = document.documentElement;
  }, []);

  const [bookmarks, setBookmarks] = useState<Set<string>>(
    () => new Set(["a2", "a5"])
  );

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const indicatorItems: AiThreadDialogIndicatorItem[] = INITIAL_MESSAGES.map((msg) => ({
    id: msg.id,
    role: msg.role,
    preview:
      msg.role === "user"
        ? msg.message
        : stripHtml((msg as { text?: string }).text ?? "").slice(0, 120),
    bookmarked: bookmarks.has(msg.id),
  }));

  // null = page scroll (window). For a drawer, pass the drawer's scroll element.
  const activeId = useAiThreadActiveMessage(threadRef, indicatorItems, null);

  const handleNavigate = useCallback((id: string) => {
    const el = document.querySelector<HTMLElement>(`[data-message-id="${id}"]`);
    if (!el) return;
    // Page scroll: query the element and scroll window to it.
    // For a drawer layout, replace this with:
    //   drawerScrollRef.current?.scrollTo({ top: el.offsetTop - 24, behavior: "smooth" })
    const top = el.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {/* AiThread flows naturally — no overflow wrapper, the browser page scrolls. */}
      <AiThread
        ref={threadRef}
        messages={INITIAL_MESSAGES}
        scrollContainerRef={scrollContainerRef as RefObject<HTMLElement>}
        style={{ flex: 1, minWidth: 0 }}
      />

      {/* Indicator is sticky so it stays visible as the page scrolls. */}
      <div style={{ position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
        <AiThreadDialogIndicator
          items={indicatorItems}
          activeId={activeId}
          onNavigate={handleNavigate}
          onBookmark={(id) => toggleBookmark(id)}
          maxHeight="100vh"
        />
      </div>
    </div>
  );
}
