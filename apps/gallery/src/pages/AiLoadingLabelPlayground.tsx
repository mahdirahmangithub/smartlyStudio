import { useState, useEffect, useRef } from "react";
import { AiLoadingLabel } from "@sds/components/AiLoadingLabel";
import { Toggle } from "@sds/components/Toggle";
import { Label } from "@sds/components/Label";
import { Input } from "@sds/components/Input";
import { Button } from "@sds/components/Button";
import { Dropdown } from "@sds/components/Dropdown";
import { SingleSelectOption } from "@sds/components/SingleSelectOption";
import { Icon } from "@sds/components/Icon";

const ALL_LABELS = [
  "Thinking…",
  "Analyzing your request",
  "Searching knowledge base",
  "Generating response",
  "Reviewing output",
  "Almost there…",
  "Done",
];

export default function AiLoadingLabelPlayground() {
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [sizeOpen, setSizeOpen] = useState(false);
  const sizeAnchorRef = useRef<HTMLButtonElement>(null);
  const [stepCount, setStepCount] = useState(5);
  const [intervalMs, setIntervalMs] = useState(1800);
  const [running, setRunning] = useState(true);
  const [labelIndex, setLabelIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clampedSteps = Math.max(1, Math.min(stepCount, ALL_LABELS.length));
  const sequence = ALL_LABELS.slice(0, clampedSteps);
  const label = sequence[labelIndex % sequence.length];

  // Restart interval whenever running, interval duration, or step count changes
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setLabelIndex((i) => (i + 1) % sequence.length);
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, intervalMs, sequence.length]);

  // Reset label index when step count shrinks below current index
  useEffect(() => {
    setLabelIndex((i) => i % sequence.length);
  }, [sequence.length]);

  const handleStepCountChange = (val: string) => {
    const n = parseInt(val, 10);
    if (!isNaN(n)) setStepCount(n);
  };

  const handleIntervalChange = (val: string) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) setIntervalMs(n);
  };

  return (
    <div style={s.page}>

      {/* Controls */}
      <div style={s.controls}>

        <div style={s.controlRow}>
          <Label size="sm" label="Size" />
          <Button
            ref={sizeAnchorRef}
            size="sm"
            variant="neutral"
            emphasis="low"
            trailingIcon={<Icon name="arrow_chevron_down" size={14} aria-hidden />}
            onClick={() => setSizeOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={sizeOpen}
          >
            {size}
          </Button>
          <Dropdown
            open={sizeOpen}
            onClose={() => setSizeOpen(false)}
            anchorRef={sizeAnchorRef}
            width={120}
            role="listbox"
          >
            {(["sm", "md", "lg"] as const).map((opt) => (
              <SingleSelectOption
                key={opt}
                labelText={opt}
                description={false}
                checked={size === opt}
                onChange={() => { setSize(opt); setSizeOpen(false); }}
              />
            ))}
          </Dropdown>
        </div>

        <div style={s.controlRow}>
          <Label htmlFor="step-count" size="sm" label="Steps" />
          <div style={s.inputWrap}>
            <Input
              id="step-count"
              type="number"
              size="md"
              value={stepCount}
              min={1}
              max={ALL_LABELS.length}
              onChange={(e) => handleStepCountChange(e.target.value)}
            />
          </div>
          <span style={s.hint}>max {ALL_LABELS.length}</span>
        </div>

        <div style={s.controlRow}>
          <Label htmlFor="interval-ms" size="sm" label="Interval (ms)" />
          <div style={s.inputWrap}>
            <Input
              id="interval-ms"
              type="number"
              size="md"
              value={intervalMs}
              min={100}
              step={100}
              onChange={(e) => handleIntervalChange(e.target.value)}
            />
          </div>
        </div>

        <div style={s.controlRow}>
          <Toggle checked={running} onChange={setRunning} id="toggle-running" size="sm" />
          <Label htmlFor="toggle-running" size="sm" label="Auto-cycle" />
        </div>

        {!running && (
          <div style={s.controlRow}>
            <button style={s.btn} onClick={() => setLabelIndex((i) => (i - 1 + sequence.length) % sequence.length)}>←</button>
            <span style={s.stepIndicator}>{(labelIndex % sequence.length) + 1} / {sequence.length}</span>
            <button style={s.btn} onClick={() => setLabelIndex((i) => (i + 1) % sequence.length)}>→</button>
          </div>
        )}
      </div>

      {/* Component */}
      <div style={s.preview}>
        <AiLoadingLabel label={label} size={size} style={s.labelWidth} />
      </div>

      {/* Active label readout */}
      <p style={s.readout}>
        Step {(labelIndex % sequence.length) + 1} of {sequence.length}: <strong>{label}</strong>
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 32,
    paddingTop: 24,
    maxWidth: 480,
  },
  controls: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingBottom: 24,
    borderBottom: "1px solid var(--element-outline-neutral-default)",
  },
  controlRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  controlLabel: {
    width: 100,
    flexShrink: 0,
  },
  inputWrap: { width: 100 },
  hint: {
    fontFamily: "var(--type-label-sm-family)",
    fontSize: "var(--type-label-sm-size)",
    color: "var(--text-neutral-tertiary)",
  },
  btn: {
    padding: "3px 10px",
    borderRadius: 6,
    border: "1px solid var(--element-outline-neutral-default)",
    background: "var(--element-fill-neutral-secondary-weak)",
    color: "var(--text-neutral-primary)",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13,
  },
  stepIndicator: {
    fontFamily: "var(--type-label-sm-family)",
    fontSize: "var(--type-label-sm-size)",
    color: "var(--text-neutral-secondary)",
    minWidth: 44,
    textAlign: "center",
  },
  preview: {
    display: "flex",
    alignItems: "center",
    minHeight: 48,
  },
  labelWidth: { width: 280 },
  readout: {
    margin: 0,
    fontFamily: "var(--type-body-lg-family)",
    fontSize: "var(--type-body-lg-size)",
    color: "var(--text-neutral-secondary)",
  },
};
