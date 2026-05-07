import { useState, type CSSProperties } from "react";
import {
  PromptOptionInput,
  usePromptOptionInput,
} from "@sds/components/PromptOptionInput";
import { SingleSelectOption } from "@sds/components/SingleSelectOption";
import { MultiSelectOption } from "@sds/components/MultiSelectOption";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const promptWrapper: CSSProperties = {
  maxWidth: 444,
  width: "100%",
  margin: "80px auto",
};

// ── Context-aware option wrappers ─────────────────────────────────────────────

function ContextSingleOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  const { optionsDisabled } = usePromptOptionInput();
  return (
    <SingleSelectOption
      labelText={label}
      checked={checked}
      disabled={optionsDisabled}
      description={false}
      onChange={onChange}
    />
  );
}

function ContextMultiOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  const { optionsDisabled } = usePromptOptionInput();
  return (
    <MultiSelectOption
      labelText={label}
      checked={checked}
      disabled={optionsDisabled}
      description={false}
      onChange={onChange}
    />
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const TONES = [
  "Professional",
  "Friendly",
  "Casual",
  "Formal",
  "Empathetic",
  "Direct",
  "Humorous",
  "Inspirational",
];

const FORMATS = [
  "Bullet points",
  "Numbered list",
  "Short paragraph",
  "Long paragraph",
  "Table",
  "Outline",
];

const LANGUAGES = ["English", "Spanish", "French", "German", "Japanese", "Portuguese"];

// ── Demo 1: Single step, single-select, search + custom input ─────────────────

function SingleStepDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [dismissed, setDismissed] = useState(false);

  const reset = () => {
    setDismissed(false);
    setSelected(null);
    setSearch("");
    setCustomValue("");
  };

  if (dismissed) {
    return (
      <button onClick={reset} style={{ padding: "8px 16px", cursor: "pointer" }}>
        Reset
      </button>
    );
  }

  const filtered = TONES.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PromptOptionInput
      label="Choose a tone"
      onClose={() => setDismissed(true)}
      search={{ value: search, onChange: setSearch }}
      input={{ value: customValue, onChange: setCustomValue, placeholder: "Or describe your own tone..." }}
      hasValue={selected !== null}
      isLastStep
      onSkip={() => setDismissed(true)}
      onSubmit={() => alert(`Submitted: ${customValue || selected}`)}
    >
      {filtered.map((tone) => (
        <ContextSingleOption
          key={tone}
          label={tone}
          checked={selected === tone}
          onChange={() => setSelected(selected === tone ? null : tone)}
        />
      ))}
    </PromptOptionInput>
  );
}

// ── Demo 2: Multi-step, multi-select ─────────────────────────────────────────

function MultiStepDemo() {
  const [step, setStep] = useState(1);
  const [selectedTones, setSelectedTones] = useState<Set<string>>(new Set());
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set());
  const [customValue, setCustomValue] = useState("");
  const [done, setDone] = useState(false);

  const reset = () => {
    setDone(false);
    setStep(1);
    setSelectedTones(new Set());
    setSelectedFormats(new Set());
    setCustomValue("");
  };

  if (done) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ margin: 0, fontSize: 13 }}>
          <strong>Tones:</strong> {[...selectedTones].join(", ") || "—"}
        </p>
        <p style={{ margin: 0, fontSize: 13 }}>
          <strong>Format:</strong> {[...selectedFormats].join(", ") || "—"}
          {customValue ? ` / Custom: ${customValue}` : ""}
        </p>
        <button onClick={reset} style={{ marginTop: 8, padding: "8px 16px", cursor: "pointer", alignSelf: "flex-start" }}>
          Reset
        </button>
      </div>
    );
  }

  const isLastStep = step === 2;
  const hasValue = step === 1 ? selectedTones.size > 0 : selectedFormats.size > 0;

  const toggleTone = (t: string) =>
    setSelectedTones((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  const toggleFormat = (f: string) =>
    setSelectedFormats((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });

  return (
    <PromptOptionInput
      label={step === 1 ? "Select tone(s)" : "Select format"}
      steps={{
        current: step,
        total: 2,
        onPrev: () => setStep((s) => Math.max(1, s - 1)),
        onNext: () => setStep((s) => Math.min(2, s + 1)),
      }}
      input={isLastStep ? { value: customValue, onChange: setCustomValue, placeholder: "Or describe a custom format..." } : undefined}
      hasValue={hasValue}
      isLastStep={isLastStep}
      onSkip={() => (isLastStep ? setDone(true) : setStep(2))}
      onSubmit={() => (isLastStep ? setDone(true) : setStep(2))}
    >
      {step === 1
        ? TONES.map((tone) => (
            <ContextMultiOption
              key={tone}
              label={tone}
              checked={selectedTones.has(tone)}
              onChange={() => toggleTone(tone)}
            />
          ))
        : FORMATS.map((fmt) => (
            <ContextMultiOption
              key={fmt}
              label={fmt}
              checked={selectedFormats.has(fmt)}
              onChange={() => toggleFormat(fmt)}
            />
          ))}
    </PromptOptionInput>
  );
}

// ── Demo 3: No search, no input ───────────────────────────────────────────────

function MinimalDemo() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <PromptOptionInput
      label="Pick a language"
      hasValue={selected !== null}
      isLastStep
      onSkip={() => setSelected(null)}
      onSubmit={() => alert(`Selected: ${selected}`)}
    >
      {LANGUAGES.map((lang) => (
        <ContextSingleOption
          key={lang}
          label={lang}
          checked={selected === lang}
          onChange={() => setSelected(selected === lang ? null : lang)}
        />
      ))}
    </PromptOptionInput>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PromptOptionInputPlayground() {
  return (
    <div>
      <section style={sectionStyle}>
        <div style={promptWrapper}>
          <SingleStepDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={promptWrapper}>
          <MultiStepDemo />
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={promptWrapper}>
          <MinimalDemo />
        </div>
      </section>
    </div>
  );
}
