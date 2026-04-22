import { useState, useEffect, useRef } from "react";
import { Cot, CotItem, CotContainer } from "../components/Cot";
import type { CotItemStatus, CotItemVariant } from "../components/Cot";
import { Toggle } from "../components/Toggle";
import { Label } from "../components/Label";
import { Button } from "../components/Button";
import { Icon } from "../components/Icon";
import { Dropdown } from "../components/Dropdown";
import { SingleSelectOption } from "../components/SingleSelectOption";

/* ── AI simulation ── */

const AI_STEPS: { title: string; description: string }[] = [
  { title: "Reading context", description: "Parsing your message and attached files" },
  { title: "Searching knowledge base", description: "Looking up relevant information" },
  { title: "Analyzing results", description: "Cross-referencing 12 sources" },
  { title: "Drafting response", description: "Generating structured output" },
  { title: "Reviewing output", description: "Checking for accuracy and completeness" },
];

type StepStatus = CotItemStatus;

function useSimulation(running: boolean) {
  const [statuses, setStatuses] = useState<StepStatus[]>(
    AI_STEPS.map(() => "idle")
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!running) {
      setStatuses(AI_STEPS.map(() => "idle"));
      return;
    }

    let step = 0;

    const advance = () => {
      if (step >= AI_STEPS.length) return;

      // Mark current step as loading
      setStatuses((prev) => {
        const next = [...prev];
        next[step] = "loading";
        return next;
      });

      timerRef.current = setTimeout(() => {
        // Mark as complete, move to next
        setStatuses((prev) => {
          const next = [...prev];
          next[step] = "complete";
          return next;
        });
        step++;
        timerRef.current = setTimeout(advance, 300);
      }, 1400);
    };

    advance();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [running]);

  return statuses;
}

/* ── Playground ── */

export default function CotPlayground() {
  const [simRunning, setSimRunning] = useState(false);
  const [showExpandable, setShowExpandable] = useState(true);
  const [showSlot, setShowSlot] = useState(true);

  const simStatuses = useSimulation(simRunning);

  // Isolated item configurator
  const [isoVariant, setIsoVariant] = useState<CotItemVariant>("dot");
  const [isoStatus, setIsoStatus] = useState<CotItemStatus>("idle");
  const [isoShowTitle, setIsoShowTitle] = useState(true);
  const [isoShowDescription, setIsoShowDescription] = useState(true);
  const [isoExpandable, setIsoExpandable] = useState(false);
  const [isoDropdownOpen, setIsoDropdownOpen] = useState<"variant" | "status" | null>(null);
  const variantAnchorRef = useRef<HTMLButtonElement>(null);
  const statusAnchorRef = useRef<HTMLButtonElement>(null);

  return (
    <div style={s.page}>

      {/* ── Controls ── */}
      <div style={s.controls}>
        <div style={s.controlRow}>
          <Toggle checked={simRunning} onChange={setSimRunning} id="toggle-sim" size="sm" />
          <Label htmlFor="toggle-sim" size="sm" label="Run AI simulation" />
        </div>
        <div style={s.controlRow}>
          <Toggle checked={showExpandable} onChange={setShowExpandable} id="toggle-expand" size="sm" />
          <Label htmlFor="toggle-expand" size="sm" label="Show expandable section" />
        </div>
        <div style={s.controlRow}>
          <Toggle checked={showSlot} onChange={setShowSlot} id="toggle-slot" size="sm" />
          <Label htmlFor="toggle-slot" size="sm" label="Show slot content" />
        </div>
      </div>

      <div style={s.sections}>

        {/* ── Isolated item configurator ── */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>Isolated item</h3>

          {/* Config controls */}
          <div style={s.isoControls}>
            {/* Variant */}
            <div style={s.controlRow}>
              <span style={s.isoControlLabel}>Variant</span>
              <Button
                ref={variantAnchorRef}
                size="sm"
                variant="neutral"
                emphasis="low"
                trailingIcon={<Icon name="chevron_down" size={14} aria-hidden />}
                onClick={() => setIsoDropdownOpen((o) => o === "variant" ? null : "variant")}
                aria-haspopup="listbox"
                aria-expanded={isoDropdownOpen === "variant"}
              >
                {isoVariant}
              </Button>
              <Dropdown
                open={isoDropdownOpen === "variant"}
                onClose={() => setIsoDropdownOpen(null)}
                anchorRef={variantAnchorRef}
                width={120}
                role="listbox"
              >
                {(["dot", "icon", "todo"] as CotItemVariant[]).map((v) => (
                  <SingleSelectOption
                    key={v}
                    labelText={v}
                    description={false}
                    checked={isoVariant === v}
                    onChange={() => { setIsoVariant(v); setIsoDropdownOpen(null); }}
                  />
                ))}
              </Dropdown>
            </div>

            {/* Status */}
            <div style={s.controlRow}>
              <span style={s.isoControlLabel}>Status</span>
              <Button
                ref={statusAnchorRef}
                size="sm"
                variant="neutral"
                emphasis="low"
                trailingIcon={<Icon name="chevron_down" size={14} aria-hidden />}
                onClick={() => setIsoDropdownOpen((o) => o === "status" ? null : "status")}
                aria-haspopup="listbox"
                aria-expanded={isoDropdownOpen === "status"}
              >
                {isoStatus}
              </Button>
              <Dropdown
                open={isoDropdownOpen === "status"}
                onClose={() => setIsoDropdownOpen(null)}
                anchorRef={statusAnchorRef}
                width={140}
                role="listbox"
              >
                {(["idle", "loading", "complete", "error"] as CotItemStatus[]).map((st) => (
                  <SingleSelectOption
                    key={st}
                    labelText={st}
                    description={false}
                    checked={isoStatus === st}
                    onChange={() => { setIsoStatus(st); setIsoDropdownOpen(null); }}
                  />
                ))}
              </Dropdown>
            </div>

            {/* Title toggle */}
            <div style={s.controlRow}>
              <Toggle checked={isoShowTitle} onChange={setIsoShowTitle} id="iso-title" size="sm" />
              <Label htmlFor="iso-title" size="sm" label="Title" />
            </div>

            {/* Description toggle */}
            <div style={s.controlRow}>
              <Toggle checked={isoShowDescription} onChange={setIsoShowDescription} id="iso-desc" size="sm" />
              <Label htmlFor="iso-desc" size="sm" label="Description" />
            </div>

            {/* Expandable toggle */}
            <div style={s.controlRow}>
              <Toggle checked={isoExpandable} onChange={setIsoExpandable} id="iso-expand" size="sm" />
              <Label htmlFor="iso-expand" size="sm" label="Expandable" />
            </div>
          </div>

          {/* Preview */}
          <div style={s.isoPreview}>
            <Cot connector={false}>
              <CotItem
                variant={isoVariant}
                icon={isoVariant === "icon" ? <Icon name="robot" size={16} aria-hidden /> : undefined}
                title={isoShowTitle ? "Step title" : undefined}
                description={isoShowDescription ? "Step description" : undefined}
                status={isoStatus}
                expandable={isoExpandable}
                defaultExpanded={false}
              >
                {isoExpandable ? (
                  <div style={s.slotDemo}>
                    <p style={s.slotText}>Slot content is shown when expanded.</p>
                  </div>
                ) : undefined}
              </CotItem>
            </Cot>
          </div>
        </section>

        {/* ── Section 1: AI simulation (todo variant) ── */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>Todo — AI simulation</h3>
          <Cot aria-label="AI generation steps">
            {AI_STEPS.map((step, i) => (
              <CotItem
                key={step.title}
                variant="todo"
                title={step.title}
                description={step.description}
                status={simStatuses[i]}
                expandable={showExpandable && i === 1}
                defaultExpanded={false}
              >
                {showSlot && i === 1 ? (
                  <div style={s.slotDemo}>
                    <p style={s.slotText}>Found 12 relevant documents across 4 categories.</p>
                    <p style={s.slotText}>Top match: <em>Q3 Campaign Report</em> (94% relevance)</p>
                  </div>
                ) : undefined}
              </CotItem>
            ))}
          </Cot>
        </section>

        {/* ── Section 2: Dot variant ── */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>Dot variant</h3>
          <Cot aria-label="Dot variant steps">
            <CotItem variant="dot" title="Planning phase" description="Initialising workspace" status="complete" />
            <CotItem variant="dot" title="Execution" description="Running tasks in parallel" status="loading" />
            <CotItem variant="dot" title="Finalisation" description="Pending previous step" status="idle" />
          </Cot>
        </section>

        {/* ── Section 3: Icon variant ── */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>Icon variant</h3>
          <Cot aria-label="Icon variant steps">
            <CotItem
              variant="icon"
              icon={<Icon name="robot" size={16} aria-hidden />}
              title="AI agent assigned"
              description="Claude Opus 4.7"
              status="complete"
            />
            <CotItem
              variant="icon"
              icon={<Icon name="search" size={16} aria-hidden />}
              title="Web search"
              description="Querying external sources"
              status="loading"
            />
            <CotItem
              variant="icon"
              icon={<Icon name="edit" size={16} aria-hidden />}
              title="Write output"
              description="Composing final document"
              status="idle"
            />
          </Cot>
        </section>

        {/* ── Section 4: Error states ── */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>Error states</h3>
          <Cot aria-label="Error state examples">
            <CotItem variant="todo" title="Fetch data" description="Retrieved 240 records" status="complete" />
            <CotItem variant="todo" title="Validate schema" description="Unexpected field: user_id" status="error" />
            <CotItem variant="todo" title="Write to database" description="Blocked by previous error" status="idle" />
          </Cot>
        </section>

        {/* ── Section 5: Expandable — all variants ── */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>Expandable items</h3>
          <Cot aria-label="Expandable step examples">
            {(["dot", "icon", "todo"] as CotItemVariant[]).map((variant) => (
              <CotItem
                key={variant}
                variant={variant}
                icon={variant === "icon" ? <Icon name="folder" size={16} aria-hidden /> : undefined}
                title={`${variant} — expandable`}
                description="Click header to expand"
                status="complete"
                expandable
                defaultExpanded={variant === "dot"}
              >
                {showSlot && (
                  <div style={s.slotDemo}>
                    <p style={s.slotText}>This is the slot content for the <strong>{variant}</strong> variant.</p>
                    <Button size="sm" variant="neutral" emphasis="low">Action</Button>
                  </div>
                )}
              </CotItem>
            ))}
          </Cot>
        </section>

        {/* ── Section 6: Single item, no connector ── */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>Single item / no connector</h3>
          <Cot aria-label="Single step" connector={false}>
            <CotItem
              variant="todo"
              title="Standalone step"
              description="connector=false set at Cot level"
              status="idle"
            />
          </Cot>
        </section>

      </div>

      {/* ── CotContainer sections ── */}
      <div style={s.containerDivider} />
      <h2 style={s.containerHeading}>CotContainer</h2>
      <div style={s.sections}>

        {/* ── Task type: pre-start ── */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>Task — pre-start</h3>
          <CotContainer
            type="task"
            title="Build landing page"
            hint="Review the plan before starting"
            defaultExpanded={false}
            onEdit={() => {}}
            onCancel={() => {}}
            onStart={() => {}}
          >
            <Cot>
              <CotItem variant="todo" title="Set up project structure" description="Create folders and config files" status="idle" />
              <CotItem variant="todo" title="Implement hero section" description="Design and code the above-fold" status="idle" />
              <CotItem variant="todo" title="Add navigation bar" description="Responsive nav with links" status="idle" />
              <CotItem variant="todo" title="Write copy" description="Headlines and body text" status="idle" />
            </Cot>
          </CotContainer>
        </section>

        {/* ── Task type: pre-start (expanded) ── */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>Task — pre-start (expanded)</h3>
          <CotContainer
            type="task"
            title="Build landing page"
            hint="Review the plan before starting"
            defaultExpanded={true}
            onEdit={() => {}}
            onCancel={() => {}}
            onStart={() => {}}
          >
            <Cot>
              <CotItem variant="todo" title="Set up project structure" description="Create folders and config files" status="idle" />
              <CotItem variant="todo" title="Implement hero section" description="Design and code the above-fold" status="idle" />
              <CotItem variant="todo" title="Add navigation bar" description="Responsive nav with links" status="idle" />
              <CotItem variant="todo" title="Write copy" description="Headlines and body text" status="idle" />
            </Cot>
          </CotContainer>
        </section>

        {/* ── Task type: running ── */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>Task — running (progress 60%)</h3>
          <CotContainer
            type="task"
            title="Build landing page"
            hint="Working on it…"
            running
            progress={60}
            defaultExpanded={true}
            onStop={() => {}}
          >
            <Cot>
              <CotItem variant="todo" title="Set up project structure" description="Create folders and config files" status="complete" />
              <CotItem variant="todo" title="Implement hero section" description="Design and code the above-fold" status="complete" />
              <CotItem variant="todo" title="Add navigation bar" description="Responsive nav with links" status="loading" />
              <CotItem variant="todo" title="Write copy" description="Headlines and body text" status="idle" />
            </Cot>
          </CotContainer>
        </section>

        {/* ── Interactive task container ── */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>Task — interactive</h3>
          <TaskContainerDemo />
        </section>

        {/* ── Reasoning type: no header ── */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>Reasoning — no header (always expanded)</h3>
          <CotContainer
            type="reasoning"
            hint="The model reasoned through 4 steps"
          >
            <Cot>
              <CotItem variant="dot" title="Understood the request" description="Parsed user intent and constraints" status="complete" />
              <CotItem variant="dot" title="Retrieved context" description="Loaded relevant memory and docs" status="complete" />
              <CotItem variant="dot" title="Drafted answer" description="Generated structured response" status="complete" />
              <CotItem variant="dot" title="Reviewed output" description="Checked accuracy and tone" status="complete" />
            </Cot>
          </CotContainer>
        </section>

        {/* ── Reasoning type ── */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>Reasoning — collapsed</h3>
          <CotContainer
            type="reasoning"
            title="Thinking"
            hint="The model reasoned through 4 steps"
            defaultExpanded={false}
          >
            <Cot>
              <CotItem variant="dot" title="Understood the request" description="Parsed user intent and constraints" status="complete" />
              <CotItem variant="dot" title="Retrieved context" description="Loaded relevant memory and docs" status="complete" />
              <CotItem variant="dot" title="Drafted answer" description="Generated structured response" status="complete" />
              <CotItem variant="dot" title="Reviewed output" description="Checked accuracy and tone" status="complete" />
            </Cot>
          </CotContainer>
        </section>

        {/* ── Reasoning type (expanded) ── */}
        <section style={s.section}>
          <h3 style={s.sectionTitle}>Reasoning — expanded</h3>
          <CotContainer
            type="reasoning"
            title="Thinking"
            hint="The model reasoned through 4 steps"
            defaultExpanded={true}
          >
            <Cot>
              <CotItem variant="dot" title="Understood the request" description="Parsed user intent and constraints" status="complete" />
              <CotItem variant="dot" title="Retrieved context" description="Loaded relevant memory and docs" status="complete" />
              <CotItem variant="dot" title="Drafted answer" description="Generated structured response" status="complete" />
              <CotItem variant="dot" title="Reviewed output" description="Checked accuracy and tone" status="complete" />
            </Cot>
          </CotContainer>
        </section>

      </div>
    </div>
  );
}

/* ── Interactive task container demo ── */

function TaskContainerDemo() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statuses, setStatuses] = useState<CotItemStatus[]>(["idle", "idle", "idle", "idle"]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStart = () => {
    setRunning(true);
    setProgress(0);
    setStatuses(["idle", "idle", "idle", "idle"]);

    let step = 0;
    const advance = () => {
      if (step >= 4) {
        setProgress(100);
        setRunning(false);
        return;
      }
      setStatuses((prev) => {
        const next = [...prev] as CotItemStatus[];
        next[step] = "loading";
        return next;
      });
      setProgress(step * 25);
      timerRef.current = setTimeout(() => {
        setStatuses((prev) => {
          const next = [...prev] as CotItemStatus[];
          next[step] = "complete";
          return next;
        });
        step++;
        timerRef.current = setTimeout(advance, 400);
      }, 1200);
    };
    advance();
  };

  const handleStop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setRunning(false);
  };

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const STEPS = [
    { title: "Set up project structure", description: "Create folders and config files" },
    { title: "Implement hero section", description: "Design and code the above-fold" },
    { title: "Add navigation bar", description: "Responsive nav with links" },
    { title: "Write copy", description: "Headlines and body text" },
  ];

  return (
    <CotContainer
      type="task"
      title="Build landing page"
      hint={running ? "Working on it…" : progress === 100 ? "All steps completed" : "Review the plan before starting"}
      running={running}
      progress={progress}
      defaultExpanded={true}
      onEdit={() => {}}
      onCancel={() => setStatuses(["idle", "idle", "idle", "idle"])}
      onStart={handleStart}
      onStop={handleStop}
    >
      <Cot>
        {STEPS.map((step, i) => (
          <CotItem
            key={step.title}
            variant="todo"
            title={step.title}
            description={step.description}
            status={statuses[i]}
          />
        ))}
      </Cot>
    </CotContainer>
  );
}

/* ── Inline styles ── */

const s: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 32,
    paddingTop: 24,
    maxWidth: 600,
  },
  containerDivider: {
    borderTop: "1px solid var(--element-outline-neutral-default)",
    marginTop: 8,
  },
  containerHeading: {
    margin: 0,
    fontFamily: "var(--type-label-strong-md-family)",
    fontSize: "var(--type-label-strong-md-size)",
    fontWeight: "var(--type-label-strong-md-weight)" as React.CSSProperties["fontWeight"],
    color: "var(--text-neutral-primary)",
  },
  controls: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingBottom: 24,
    borderBottom: "1px solid var(--element-outline-neutral-default)",
  },
  controlRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sections: {
    display: "flex",
    flexDirection: "column",
    gap: 40,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  sectionTitle: {
    margin: 0,
    fontFamily: "var(--type-label-strong-sm-family)",
    fontSize: "var(--type-label-strong-sm-size)",
    fontWeight: "var(--type-label-strong-sm-weight)" as React.CSSProperties["fontWeight"],
    color: "var(--text-neutral-tertiary)",
    letterSpacing: "var(--type-label-strong-sm-letter-spacing)",
  },
  isoControls: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  isoControlLabel: {
    fontFamily: "var(--type-label-sm-family)",
    fontSize: "var(--type-label-sm-size)",
    color: "var(--text-neutral-secondary-default)",
    width: 72,
    flexShrink: 0,
  },
  isoPreview: {
    marginTop: 8,
    padding: "16px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--element-outline-neutral-default)",
    background: "var(--element-surface-default)",
  },
  slotDemo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    paddingBottom: 4,
  },
  slotText: {
    margin: 0,
    fontFamily: "var(--type-label-xs-family)",
    fontSize: "var(--type-label-xs-size)",
    color: "var(--text-neutral-secondary-default)",
    lineHeight: "var(--type-label-xs-line-height)",
  },
};
