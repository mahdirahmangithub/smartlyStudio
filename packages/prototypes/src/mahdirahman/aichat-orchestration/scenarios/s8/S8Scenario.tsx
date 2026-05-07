import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputFooterStart,
  PromptInputAddMenu,
  PromptInputSubmit,
} from "@sds/components/PromptInput";
import {
  PromptOptionInput,
  usePromptOptionInput,
} from "@sds/components/PromptOptionInput";
import { SingleSelectOption } from "@sds/components/SingleSelectOption";
import { MultiSelectOption } from "@sds/components/MultiSelectOption";
import { CotItem, Cot } from "@sds/components/Cot";
import {
  AiEntityPreviewInlineTyped,
  AiEntityPreviewMultipleTyped,
  CAMPAIGN_CONFIG,
  CAMPAIGN_FIELD_CONFIG,
} from "@sds/components/AiEntityPreview";
import { Badge } from "@sds/components/Badge";
import { useChat } from "../../shared/ChatContext";
import { ScenarioGuide } from "../../shared/ScenarioGuide";
import {
  S8_CAMPAIGN,
  S8_LOADING_LABELS,
  S8_RESPONSE_HTML,
  S8_OPTION_STEPS,
  S8_PREVIEW_COT_STEPS,
  S8_PREVIEW_LOADING_LABELS,
  S8_PREVIEW_RESPONSE_HTML,
  S8_PREVIEW_FIELDS,
  S8_PREVIEW_FIELDS_REFINED,
} from "./constants";
import type { CampaignField } from "@sds/components/AiEntityPreview";

export const S8_CONFIG = {
  id: "s-8",
  label: "Edit budget & message",
} as const;

interface S8ScenarioProps {
  guideClassName?: string;
}

/* ─────────────────────────── Cot step content ─────────────────────────── */

const S8_COT_STEPS: { title: string; description?: string }[] = [
  { title: "Intent Detection",     description: "Budget increase, Message edit" },
  { title: "Scope resolution",     description: "4 ad sets, 12 ads" },
  { title: "Constraint Validation" },
  {
    title: "Edge Case Detection",
    description:
      "Zero budgets, Max limit breach, Missing text matches, Exact vs semantic text replace",
  },
  { title: "Response Planning" },
];

const buildLoadingCot = (completedUpTo: number) => (
  <Cot>
    {S8_COT_STEPS.map((step, i) => (
      <CotItem
        key={step.title}
        title={step.title}
        description={step.description}
        variant="dot"
        status={
          i < completedUpTo ? "complete"
            : i === completedUpTo ? "loading"
            : "idle"
        }
      />
    ))}
  </Cot>
);

const FINAL_COT = (
  <Cot>
    {S8_COT_STEPS.map((step) => (
      <CotItem
        key={step.title}
        title={step.title}
        description={step.description}
        variant="dot"
        status="complete"
      />
    ))}
  </Cot>
);

/* Cot helpers for the second (preview) response. Same loading-cursor
 * pattern as the first response, but with the preview-specific titles. */
const buildPreviewLoadingCot = (completedUpTo: number) => (
  <Cot>
    {S8_PREVIEW_COT_STEPS.map((step, i) => (
      <CotItem
        key={step.title}
        title={step.title}
        variant="dot"
        status={
          i < completedUpTo ? "complete"
            : i === completedUpTo ? "loading"
            : "idle"
        }
      />
    ))}
  </Cot>
);

const PREVIEW_FINAL_COT = (
  <Cot>
    {S8_PREVIEW_COT_STEPS.map((step) => (
      <CotItem
        key={step.title}
        title={step.title}
        variant="dot"
        status="complete"
      />
    ))}
  </Cot>
);

/* ─────────────────────────── Option wrappers ─────────────────────────── */
/* Use the PromptOptionInput context so options auto-disable when the
 * user starts typing in the inline custom-value input. */

const RECOMMENDED_TRAILING = {
  type: "helper-text" as const,
  helperText: "Recommended",
  helperIcon: false,
};

function S8SingleOption({
  label,
  recommended,
  checked,
  onChange,
}: {
  label: string;
  recommended?: boolean;
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
      trailing={recommended ? RECOMMENDED_TRAILING : undefined}
      onChange={onChange}
    />
  );
}

function S8MultiOption({
  label,
  recommended,
  checked,
  onChange,
}: {
  label: string;
  recommended?: boolean;
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
      trailing={recommended ? RECOMMENDED_TRAILING : undefined}
      onChange={onChange}
    />
  );
}

/* ─────────────────────────── State helpers ─────────────────────────── */

interface StepState {
  /** For single-select steps: chosen option value (or null). */
  selected: string | null;
  /** For multi-select steps: set of chosen option values. */
  multiSelected: Set<string>;
  /** For steps with an inline custom-value input. */
  custom: string;
}

const emptyStepState = (): StepState => ({
  selected: null,
  multiSelected: new Set(),
  custom: "",
});

/** "Go with recommendations" preset — picks the recommended option for
 *  every step, and selects all options for multi-select steps without a
 *  specific recommendation (intent: apply across everything). Computed
 *  at module scope from the static S8_OPTION_STEPS config so it stays
 *  in sync if the recommendations change. */
const RECOMMENDED_STATES: StepState[] = S8_OPTION_STEPS.map((cfg) => {
  const recommended = cfg.options.find((o) => o.recommended);
  if (cfg.multi) {
    return {
      selected: null,
      multiSelected: recommended
        ? new Set([recommended.value])
        : new Set(cfg.options.map((o) => o.value)),
      custom: "",
    };
  }
  return {
    selected: recommended?.value ?? null,
    multiSelected: new Set<string>(),
    custom: "",
  };
});

/* ─────────────────────────── Component ─────────────────────────── */

/**
 * Scenario s-8 — "Edit budget & message".
 *
 * Phase 0 (prompt): a normal PromptInput pre-seeded with workspace +
 * campaign context chips. On submit the assistant runs through 5 cot
 * steps, then streams a markdown response that embeds an inline
 * AiEntityPreview of the BMW-Summer-2026 campaign.
 *
 * Phase 1 (options): once the response finishes streaming, the prompt
 * area transforms into a PromptOptionInput with 5 clarifying-question
 * steps (single / multi-select, some with inline custom inputs). Each
 * step's selection is stored locally; "Submit" on the final step pushes
 * a user-message summary of the chosen answers and reverts to the
 * regular PromptInput.
 */
export function S8Scenario({ guideClassName }: S8ScenarioProps) {
  const chat = useChat();
  const [phase, setPhase] = useState<
    "prompt" | "options" | "refinement" | "done"
  >("prompt");
  // optionStep 0 = initial "go with recommendations / let me decide" choice
  // (no step indicator). 1..5 = the detailed clarifying questions.
  const [optionStep, setOptionStep] = useState(0);
  // Tracks the current "live" preview (id + fields rendered) so we can
  // freeze it — strip the action bar + per-row "Add to context"
  // buttons — before moving the conversation to the next step.
  const activePreviewRef = useRef<{ id: string; fields: CampaignField[] } | null>(null);
  const [stepStates, setStepStates] = useState<StepState[]>(() =>
    S8_OPTION_STEPS.map(emptyStepState),
  );

  // Pre-populate the prompt context row with workspace + campaign chips
  // on mount; cleared on unmount so re-entry starts fresh.
  useEffect(() => {
    chat.setContextItems([
      { id: "ctx-ws-meta-summer-sale", icon: "topic", label: "WS Meta summer sale" },
      { id: "ctx-bmw-summer-2026",     icon: "campaign_alt", label: "BMW-Summer-2026" },
    ]);
    return () => {
      chat.setContextItems([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Preview action handlers (slot's onCreate / onCancel) ───────── */

  /**
   * Strip the action bar (Edit / Cancel / Start) and per-row "Add to
   * context" trailing buttons from the most recently emitted preview.
   * Called whenever the conversation moves forward — clicking Start /
   * Cancel on a preview, or submitting a refinement — so previews
   * earlier in the thread can't be re-actioned after the user has
   * already moved past them. The slot is replaced with the same
   * AiEntityPreviewMultipleTyped data, just without callbacks and with
   * `hideRowAction` set, which both removes the trailing column and
   * (since none of `onEdit / onCancel / onCreate` are passed) hides
   * the bottom action bar.
   */
  const freezeActivePreview = useCallback(() => {
    const active = activePreviewRef.current;
    if (!active) return;
    chat.setScenarios((prev) => prev.map((s) =>
      s.id === S8_CONFIG.id ? {
        ...s,
        messages: s.messages.map((m) => m.id === active.id ? {
          ...m,
          slot: (
            <AiEntityPreviewMultipleTyped
              config={CAMPAIGN_FIELD_CONFIG}
              data={active.fields}
              itemName="changes"
              visibleCount={4}
              hideRowAction
            />
          ),
        } : m),
      } : s
    ));
    activePreviewRef.current = null;
  }, [chat]);

  const handleApplyChanges = useCallback(() => {
    freezeActivePreview();
    const aiId = `a-${Date.now()}-applied`;
    const aiMsg = {
      id: aiId,
      role: "assistant" as const,
      phase: "generating" as const,
      text: "",
    };
    chat.activeAssistIdRef.current = aiId;
    chat.setScenarios((prev) => prev.map((s) =>
      s.id === S8_CONFIG.id ? { ...s, messages: [...s.messages, aiMsg] } : s
    ));
    chat.streamAiMessage(
      S8_CONFIG.id, aiId,
      `<p>Changes applied successfully to <strong>${S8_CAMPAIGN.name}</strong>. The 2 budget updates and 5 message edits are now live.</p>`,
      undefined,
      true,
    );
  }, [chat, freezeActivePreview]);

  const handleEditChanges = useCallback(() => {
    // "Edit" focuses the prompt textarea so the user can refine the
    // proposed changes via free-form chat. The preview itself stays
    // interactive — the user can still flip context chips or click
    // Start / Cancel — until they move to the next step.
    chat.focusPromptTextarea();
  }, [chat]);

  const handleCancelChanges = useCallback(() => {
    freezeActivePreview();
    const aiId = `a-${Date.now()}-cancelled`;
    const aiMsg = {
      id: aiId,
      role: "assistant" as const,
      phase: "generating" as const,
      text: "",
    };
    chat.activeAssistIdRef.current = aiId;
    chat.setScenarios((prev) => prev.map((s) =>
      s.id === S8_CONFIG.id ? { ...s, messages: [...s.messages, aiMsg] } : s
    ));
    chat.streamAiMessage(
      S8_CONFIG.id, aiId,
      `<p>OK, cancelled. Let me know if you'd like to make different changes.</p>`,
      undefined,
      true,
    );
  }, [chat, freezeActivePreview]);

  /* ── Preview response runner (loading → cot → stream → slot) ────── */

  /**
   * Drives one preview response: pushes a loading bubble, cycles the cot
   * cursor through `S8_PREVIEW_COT_STEPS` with `S8_PREVIEW_LOADING_LABELS`,
   * then transitions to streaming and attaches the multi-row preview slot
   * with Cancel + Start actions and a per-row "Add to context" handler.
   * `fields` selects whether the slot renders the original or the refined
   * change set.
   */
  const runPreviewResponse = useCallback((fields: CampaignField[]) => {
    const aiId = `a-${Date.now()}-preview`;
    const aiMsg = {
      id: aiId,
      role: "assistant" as const,
      phase: "loading" as const,
      text: "",
      loadingLabel: S8_PREVIEW_LOADING_LABELS[0],
      cotContent: buildPreviewLoadingCot(0),
    };

    chat.activeAssistIdRef.current = aiId;
    chat.setScenarios((prev) => prev.map((s) =>
      s.id === S8_CONFIG.id ? { ...s, messages: [...s.messages, aiMsg] } : s
    ));

    const STEP_MS = 1500;
    for (let i = 1; i < S8_PREVIEW_COT_STEPS.length; i++) {
      setTimeout(() => {
        if (chat.activeAssistIdRef.current !== aiId) return;
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S8_CONFIG.id ? {
            ...s,
            messages: s.messages.map((m) => m.id === aiId ? {
              ...m,
              loadingLabel: S8_PREVIEW_LOADING_LABELS[i],
              cotContent: buildPreviewLoadingCot(i),
            } : m),
          } : s
        ));
      }, i * STEP_MS);
    }

    setTimeout(() => {
      if (chat.activeAssistIdRef.current !== aiId) return;
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S8_CONFIG.id ? {
          ...s,
          messages: s.messages.map((m) => m.id === aiId ? {
            ...m,
            phase: "generating" as const,
            text: "",
            loadingLabel: undefined,
            cotContent: PREVIEW_FINAL_COT,
            cotTitle: "Reasoned",
          } : m),
        } : s
      ));
      chat.streamAiMessage(
        S8_CONFIG.id, aiId,
        S8_PREVIEW_RESPONSE_HTML,
        () => {
          chat.setScenarios((prev) => prev.map((s) =>
            s.id === S8_CONFIG.id ? {
              ...s,
              messages: s.messages.map((m) => m.id === aiId ? {
                ...m,
                slot: (
                  <AiEntityPreviewMultipleTyped
                    config={CAMPAIGN_FIELD_CONFIG}
                    data={fields}
                    itemName="changes"
                    visibleCount={4}
                    createLabel="Start"
                    onEdit={handleEditChanges}
                    onCreate={handleApplyChanges}
                    onCancel={handleCancelChanges}
                    onRowAction={(field) => chat.addContextItem({
                      id: field.id,
                      icon: field.icon,
                      label: `${field.fieldName} · ${field.campaignName}`,
                    })}
                  />
                ),
              } : m),
            } : s
          ));
          // Mark this preview as the live one so it can be frozen
          // (action bar + per-row buttons stripped) when the user
          // moves to the next step.
          activePreviewRef.current = { id: aiId, fields };
        },
        true,
      );
    }, S8_PREVIEW_COT_STEPS.length * STEP_MS + 200);
  }, [chat, handleApplyChanges, handleCancelChanges, handleEditChanges]);

  /* ── Initial prompt submit ──────────────────────────────────────── */

  const handlePromptSubmit = useCallback((value: string) => {
    const attachmentsSnapshot = chat.attachedFiles.map((file, i) => ({
      id: `att-${Date.now()}-${i}`,
      file,
      fileName: file.name,
    }));
    const contextSnapshot = chat.contextItems;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user" as const,
      message: value,
      ...(attachmentsSnapshot.length ? { attachments: attachmentsSnapshot } : {}),
      ...(contextSnapshot.length ? { contextItems: contextSnapshot } : {}),
    };

    if (phase === "prompt") {
      const aiId = `a-${Date.now() + 1}`;
      const aiMsg = {
        id: aiId,
        role: "assistant" as const,
        phase: "loading" as const,
        text: "",
        loadingLabel: S8_LOADING_LABELS[0],
        cotContent: buildLoadingCot(0),
        components: {
          "entity-preview": (_attrs: Record<string, string>) => (
            <AiEntityPreviewInlineTyped config={CAMPAIGN_CONFIG} data={S8_CAMPAIGN} />
          ),
          // <recommended-badge></recommended-badge> tags inside the
          // markdown render as a low-emphasis brand "Recommended" pill
          // next to each suggested option.
          "recommended-badge": () => (
            <Badge size="sm" variant="brand" emphasis="low">Recommended</Badge>
          ),
        },
      };

      chat.activeAssistIdRef.current = aiId;
      flushSync(() => {
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S8_CONFIG.id ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
        ));
      });
      chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");

      const STEP_MS = 1500;
      for (let i = 1; i < S8_COT_STEPS.length; i++) {
        setTimeout(() => {
          if (chat.activeAssistIdRef.current !== aiId) return;
          chat.setScenarios((prev) => prev.map((s) =>
            s.id === S8_CONFIG.id ? {
              ...s,
              messages: s.messages.map((m) => m.id === aiId ? {
                ...m,
                loadingLabel: S8_LOADING_LABELS[i],
                cotContent: buildLoadingCot(i),
              } : m),
            } : s
          ));
        }, i * STEP_MS);
      }

      setTimeout(() => {
        if (chat.activeAssistIdRef.current !== aiId) return;
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S8_CONFIG.id ? {
            ...s,
            messages: s.messages.map((m) => m.id === aiId ? {
              ...m,
              phase: "generating" as const,
              text: "",
              loadingLabel: undefined,
              cotContent: FINAL_COT,
              cotTitle: "Reasoned",
            } : m),
          } : s
        ));
        chat.streamAiMessage(
          S8_CONFIG.id, aiId,
          S8_RESPONSE_HTML,
          // Once the response finishes streaming, swap the prompt area
          // into the 5-step PromptOptionInput so the user can answer
          // the clarifying questions inline.
          () => setPhase("options"),
          true,
        );
      }, S8_COT_STEPS.length * STEP_MS + 200);

      chat.focusPromptTextarea();
      return;
    }

    // Refinement — user has reviewed the first preview, added some rows
    // to context via "Add to context", and now types a refinement
    // request (e.g. "keep discount after 50%"). Freeze the previous
    // preview's actions so it reads as historical, then push the user
    // message and trigger a second runPreviewResponse pass with the
    // refined change set.
    if (phase === "refinement") {
      freezeActivePreview();
      flushSync(() => {
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S8_CONFIG.id ? { ...s, messages: [...s.messages, userMsg] } : s
        ));
      });
      chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
      setPhase("done");
      runPreviewResponse(S8_PREVIEW_FIELDS_REFINED);
      chat.focusPromptTextarea();
      return;
    }

    // Subsequent submits in the "done" phase — just push the user message.
    flushSync(() => {
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S8_CONFIG.id ? { ...s, messages: [...s.messages, userMsg] } : s
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    chat.focusPromptTextarea();
  }, [phase, chat, runPreviewResponse, freezeActivePreview]);

  /* ── Option step navigation + state ─────────────────────────────── */
  /* For optionStep 1..5, indices into S8_OPTION_STEPS are (optionStep-1).
   * optionStep 0 has its own render branch and no entry in S8_OPTION_STEPS,
   * so currentConfig / currentState may be undefined — every downstream
   * accessor must guard against that. */

  const currentConfig = S8_OPTION_STEPS[optionStep - 1];
  const currentState = stepStates[optionStep - 1];

  const updateCurrent = useCallback((patch: Partial<StepState>) => {
    setStepStates((prev) => prev.map((s, i) =>
      i === optionStep - 1 ? { ...s, ...patch } : s,
    ));
  }, [optionStep]);

  const goPrev = useCallback(() => {
    // Stop at step 1 — never bounce back to the initial step-0 choice
    // once the user has committed to the per-step path.
    setOptionStep((s) => Math.max(1, s - 1));
  }, []);

  const goNext = useCallback(() => {
    setOptionStep((s) => Math.min(S8_OPTION_STEPS.length, s + 1));
  }, []);

  const isLastStep = optionStep === S8_OPTION_STEPS.length;

  // hasValue per current step. Uses the typed custom value if present,
  // otherwise the (multi or single) selection. Defaults to false on the
  // initial step (optionStep 0) where there's no S8_OPTION_STEPS entry.
  const hasSelectionValue = currentConfig && currentState
    ? (currentConfig.multi
        ? currentState.multiSelected.size > 0
        : currentState.selected !== null)
    : false;

  /* ── Submit synthesized answer when the user finishes step 5 ────── */

  const finalizeAnswers = useCallback((overrideStates?: StepState[]) => {
    // Build a human-readable summary of all answers and push it as a
    // user message. Use the typed custom value when present, else the
    // selection. Skipped steps render as "Skipped".
    // `overrideStates` lets the initial "go with recommendations" path
    // submit RECOMMENDED_STATES directly, sidestepping React's batched
    // setState (we'd otherwise read stale stepStates here).
    const sourceStates = overrideStates ?? stepStates;
    const lines = S8_OPTION_STEPS.map((cfg, i) => {
      const st = sourceStates[i];
      let answer: string;
      if (st.custom.trim()) {
        answer = st.custom.trim();
      } else if (cfg.multi) {
        answer = st.multiSelected.size
          ? [...st.multiSelected].join(", ")
          : "Skipped";
      } else {
        answer = st.selected ?? "Skipped";
      }
      return `${i + 1}. ${cfg.label}\n   → ${answer}`;
    });
    const summary = lines.join("\n");

    const userMsg = {
      id: `u-${Date.now()}-summary`,
      role: "user" as const,
      message: summary,
      ...(chat.contextItems.length ? { contextItems: chat.contextItems } : {}),
    };

    flushSync(() => {
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S8_CONFIG.id ? { ...s, messages: [...s.messages, userMsg] } : s
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");

    // Flip the prompt area back to the regular PromptInput. While the
    // preview generates, `loading={chat.isGenerating}` keeps it disabled
    // — but the user can still type a refinement message right after the
    // slot lands. The `"refinement"` phase routes that submit through a
    // second runPreviewResponse pass with the refined fields.
    setPhase("refinement");
    runPreviewResponse(S8_PREVIEW_FIELDS);

    chat.focusPromptTextarea();
  }, [chat, stepStates, runPreviewResponse]);

  const handleOptionSubmit = useCallback(() => {
    if (isLastStep) finalizeAnswers();
    else goNext();
  }, [isLastStep, finalizeAnswers, goNext]);

  /* ── Initial step (0) handler ───────────────────────────────────── */
  /* Clicking either option drives the next transition immediately —
   * no separate submit click required. */

  const handleInitialChoice = useCallback((choice: "recommendations" | "decide") => {
    if (choice === "recommendations") {
      // Apply recommended defaults to every step's state for UI
      // consistency, then finalize directly with the same values so the
      // next-response pipeline doesn't read stale stepStates from the
      // batched setState.
      setStepStates(RECOMMENDED_STATES);
      finalizeAnswers(RECOMMENDED_STATES);
      return;
    }
    // "let me decide one by one" → enter the 5-step detailed flow.
    setOptionStep(1);
  }, [finalizeAnswers]);

  /* ── Render the options for the current step ────────────────────── */

  const optionList = useMemo(() => {
    // No options for the initial step (optionStep 0) — its render
    // branch supplies its own children directly.
    if (!currentConfig || !currentState) return null;
    if (currentConfig.multi) {
      return currentConfig.options.map((opt) => (
        <S8MultiOption
          key={opt.value}
          label={opt.value}
          recommended={opt.recommended}
          checked={currentState.multiSelected.has(opt.value)}
          onChange={() => {
            const next = new Set(currentState.multiSelected);
            if (next.has(opt.value)) next.delete(opt.value);
            else next.add(opt.value);
            updateCurrent({ multiSelected: next });
          }}
        />
      ));
    }
    return currentConfig.options.map((opt) => (
      <S8SingleOption
        key={opt.value}
        label={opt.value}
        recommended={opt.recommended}
        checked={currentState.selected === opt.value}
        onChange={() => updateCurrent({
          selected: currentState.selected === opt.value ? null : opt.value,
        })}
      />
    ));
  }, [currentConfig, currentState, updateCurrent]);

  /* ── Render ─────────────────────────────────────────────────────── */

  if (phase === "options") {
    // Initial step (0) — no step indicator, no submit/skip button row.
    // Clicking either option immediately drives the next transition.
    if (optionStep === 0) {
      return (
        <PromptOptionInput
          label="How would you like to proceed?"
          onClose={() => setPhase("done")}
        >
          <SingleSelectOption
            labelText="Go with recommendations"
            checked={false}
            description={false}
            onChange={() => handleInitialChoice("recommendations")}
          />
          <SingleSelectOption
            labelText="Let me decide one by one"
            checked={false}
            description={false}
            onChange={() => handleInitialChoice("decide")}
          />
        </PromptOptionInput>
      );
    }

    return (
      <PromptOptionInput
        label={currentConfig.label}
        onClose={() => setPhase("done")}
        steps={{
          current: optionStep,
          total: S8_OPTION_STEPS.length,
          onPrev: goPrev,
          onNext: goNext,
        }}
        input={currentConfig.hasInput
          ? {
              value: currentState.custom,
              onChange: (v) => updateCurrent({ custom: v }),
              placeholder: "Or type a custom answer...",
            }
          : undefined
        }
        hasValue={hasSelectionValue}
        isLastStep={isLastStep}
        onSkip={handleOptionSubmit}
        onSubmit={handleOptionSubmit}
      >
        {optionList}
      </PromptOptionInput>
    );
  }

  const guide: ReactNode = phase === "prompt"
    ? <>Submit: <em>"edit budget to all ad sets to 20% more. and edit the message of all my ads from 30% discount to 50%."</em></>
    : null;

  return (
    <>
      <PromptInput
        onSubmit={handlePromptSubmit}
        loading={chat.isGenerating}
        onStop={chat.handleStop}
        contextItems={chat.contextItems}
        onContextItemsChange={chat.setContextItems}
        onAttachedFilesChange={chat.setAttachedFiles}
      >
        <PromptInputAttachments />
        <PromptInputTextarea placeholder="Ask Smartly…" />
        <PromptInputFooter>
          <PromptInputFooterStart>
            <PromptInputAddMenu />
          </PromptInputFooterStart>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
      {guide && <ScenarioGuide className={guideClassName}>{guide}</ScenarioGuide>}
    </>
  );
}
S8Scenario.displayName = "S8Scenario";
