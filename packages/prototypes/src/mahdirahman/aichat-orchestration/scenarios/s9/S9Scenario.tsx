import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputFooterStart,
  PromptInputAddMenu,
  PromptInputSubmit,
  TriggerMenu,
  MENTION_MENU_ITEMS,
  type PromptInputTriggerConfig,
} from "@sds/components/PromptInput";
import {
  AiEntityPreviewInlineTyped,
  AiEntityPreviewTyped,
  WORKSPACE_CONFIG,
  CAMPAIGN_CONFIG,
  type Campaign,
} from "@sds/components/AiEntityPreview";
import { useChat } from "../../shared/ChatContext";
import { ScenarioGuide } from "../../shared/ScenarioGuide";
import { AD_ACCOUNTS } from "../../shared/data/adAccounts";
import { S2_WORKSPACE } from "../s2/constants";

export const S9_CONFIG = {
  id: "s-9",
  label: "Campaign Creation - Text Based",
} as const;

interface S9ScenarioProps {
  guideClassName?: string;
}

const TRIGGER_MENUS: PromptInputTriggerConfig[] = [
  { char: "/" },
  {
    char: "@",
    renderContent: (props) => (
      <TriggerMenu {...props} items={MENTION_MENU_ITEMS} />
    ),
  },
];

/**
 * Scenario s-9 — "Campaign Creation - Text Based".
 *
 * Fully conversational: no pickers. The user types their intent, the model
 * asks for ad account + objective in a single question (with an inline
 * workspace preview), the user replies in natural language, and the model
 * creates the campaign and shows its entity card.
 *
 * Steps:
 *  0 — initial, waiting for first user message
 *  1 — model has asked for ad account + objective
 *  2 — model is creating / has created the campaign
 */
export function S9Scenario({ guideClassName }: S9ScenarioProps) {
  const chat = useChat();
  // 0 = initial, 1 = asked for ad account + objective,
  // 2 = ad account not found (offered alternatives), 3 = done
  const [scenarioStep, setScenarioStep] = useState(0);

  // Persists the objective across the not-found disambiguation step.
  const pendingObjectiveRef = useRef<string>("new");
  // The 3 alternative ad accounts shown when the user's input contains "2024".
  const suggestedAccountsRef = useRef(AD_ACCOUNTS.slice(0, 3));

  // Pre-populate context with BMW Global workspace.
  useEffect(() => {
    chat.setContextItems([
      { id: S2_WORKSPACE.id, icon: "topic", label: S2_WORKSPACE.name },
    ]);
    return () => { chat.setContextItems([]); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Step 1: user's first message → model asks for ad account + objective */

  const handleFirstSubmit = useCallback((value: string) => {
    if (!value.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}-s9-1`,
      role: "user" as const,
      message: value,
    };

    const aiId = `a-${Date.now() + 1}-s9-1`;
    const aiMsg = {
      id: aiId,
      role: "assistant" as const,
      phase: "loading" as const,
      text: "",
      loadingLabel: "Checking workspace...",
      components: {
        "entity-preview": (_attrs: Record<string, string>) => (
          <AiEntityPreviewInlineTyped config={WORKSPACE_CONFIG} data={S2_WORKSPACE} />
        ),
      },
    };

    chat.activeAssistIdRef.current = aiId;
    flushSync(() => {
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S9_CONFIG.id
          ? { ...s, messages: [...s.messages, userMsg, aiMsg] }
          : s,
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    chat.focusPromptTextarea();

    setTimeout(() => {
      if (chat.activeAssistIdRef.current !== aiId) return;
      chat.streamAiMessage(
        S9_CONFIG.id,
        aiId,
        `<p>Sure! To create a campaign in <entity-preview id="${S2_WORKSPACE.id}"></entity-preview>, I need a couple of details — which <strong>ad account</strong> would you like to use, and what <strong>campaign objective</strong> do you have in mind?</p>`,
        () => setScenarioStep(1),
        true,
      );
    }, 800);
  }, [chat]);

  /* ── Shared helper: create campaign and stream the final response ── */

  const streamCampaignCreation = useCallback((adAccountLabel: string, objectiveLabel: string) => {
    const createdCampaign: Campaign = {
      id: `c-${Date.now()}-s9`,
      name: "New Campaign",
      workspace: S2_WORKSPACE.name,
      platform: S2_WORKSPACE.platform,
      adAccount: adAccountLabel,
      adSetCount: 1,
      adCount: 1,
      status: "Draft",
      budget: "—",
      channel: S2_WORKSPACE.platform,
      start: "Today",
    };

    const aiId = `a-${Date.now() + 1}-s9-final`;
    const aiMsg = {
      id: aiId,
      role: "assistant" as const,
      phase: "loading" as const,
      text: "",
      loadingLabel: "Creating campaign...",
      components: {
        "entity-preview": (_attrs: Record<string, string>) => (
          <AiEntityPreviewInlineTyped config={WORKSPACE_CONFIG} data={S2_WORKSPACE} />
        ),
      },
      showFeedback: true,
      onFeedbackChange: chat.setFeedback(aiId),
    };

    chat.activeAssistIdRef.current = aiId;
    chat.setScenarios((prev) => prev.map((s) =>
      s.id === S9_CONFIG.id ? { ...s, messages: [...s.messages, aiMsg] } : s,
    ));
    setScenarioStep(3);

    setTimeout(() => {
      if (chat.activeAssistIdRef.current !== aiId) return;
      chat.streamAiMessage(
        S9_CONFIG.id,
        aiId,
        `<p>Done! I've generated a <strong>${objectiveLabel}</strong> campaign in <entity-preview id="${S2_WORKSPACE.id}"></entity-preview>. Here it is:</p>`,
        () => {
          chat.setScenarios((prev) => prev.map((s) =>
            s.id === S9_CONFIG.id
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === aiId
                      ? {
                          ...m,
                          slot: (
                            <AiEntityPreviewTyped
                              config={CAMPAIGN_CONFIG}
                              data={createdCampaign}
                              onHeaderAction={() =>
                                chat.addContextItem({
                                  id: createdCampaign.id,
                                  icon: "campaign_alt",
                                  label: createdCampaign.name,
                                })
                              }
                            />
                          ),
                        }
                      : m,
                  ),
                }
              : s,
          ));
        },
        true,
      );
    }, 1500);
  }, [chat]);

  /* ── Step 2a: ad account contains "2024" → not found, offer alternatives ── */

  const handleNotFound = useCallback((adAccountTyped: string, objectiveLabel: string) => {
    // Pick 3 accounts whose name is loosely similar (shares a word) or just
    // the first 3 as fallback.
    const words = adAccountTyped.toLowerCase().split(/\s+/);
    const similar = AD_ACCOUNTS.filter((a) =>
      words.some((w) => w.length > 2 && a.label.toLowerCase().includes(w)),
    ).slice(0, 3);
    const suggestions = similar.length > 0 ? similar : AD_ACCOUNTS.slice(0, 3);
    suggestedAccountsRef.current = suggestions;

    const listHtml = suggestions
      .map((a) => `<li>${a.label}</li>`)
      .join("");

    const aiId = `a-${Date.now() + 1}-s9-nf`;
    const aiMsg = {
      id: aiId,
      role: "assistant" as const,
      phase: "loading" as const,
      text: "",
      loadingLabel: "Searching ad accounts...",
    };

    chat.activeAssistIdRef.current = aiId;
    chat.setScenarios((prev) => prev.map((s) =>
      s.id === S9_CONFIG.id ? { ...s, messages: [...s.messages, aiMsg] } : s,
    ));

    setTimeout(() => {
      if (chat.activeAssistIdRef.current !== aiId) return;
      chat.streamAiMessage(
        S9_CONFIG.id,
        aiId,
        `<p>I couldn't find an ad account named <strong>"${adAccountTyped}"</strong>, but I found these with a similar name:</p><ol>${listHtml}</ol><p>Which one would you like to use?</p>`,
        () => setScenarioStep(2),
        true,
      );
    }, 900);
  }, [chat]);

  /* ── Step 2: user replies with ad account + objective ── */

  const handleSecondSubmit = useCallback((value: string) => {
    if (!value.trim()) return;

    const knownObjectives = ["app promotion", "awareness", "traffic", "engagement", "leads", "sales"];
    const lc = value.toLowerCase();

    // Identify objective (longer patterns checked first to avoid partial matches).
    const matched = knownObjectives.find((o) => lc.includes(o)) ?? "new";
    const objectiveLabel = matched.charAt(0).toUpperCase() + matched.slice(1);

    // Strip objective keywords (+ optional "objective" suffix + surrounding
    // conjunctions / whitespace) to isolate the ad account name.
    // e.g. "summer 2024\nsales objective" → "summer 2024"
    //      "BMW Meta and awareness"       → "BMW Meta"
    const objectiveRegex = new RegExp(
      `\\s*(?:and\\s+|,\\s*)?${matched}(?:\\s+objective)?`,
      "gi",
    );
    const adAccountLabel = value
      .replace(objectiveRegex, "")   // remove the objective phrase
      .split(/[\n,]+/)[0]            // take the first line/segment
      .trim() || "BMW Meta";

    const userMsg = {
      id: `u-${Date.now()}-s9-2`,
      role: "user" as const,
      message: value,
    };

    flushSync(() => {
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S9_CONFIG.id ? { ...s, messages: [...s.messages, userMsg] } : s,
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    chat.focusPromptTextarea();

    // If the ad account name contains "2024" → trigger the not-found flow.
    if (adAccountLabel.toLowerCase().includes("2024")) {
      pendingObjectiveRef.current = objectiveLabel;
      handleNotFound(adAccountLabel, objectiveLabel);
    } else {
      streamCampaignCreation(adAccountLabel, objectiveLabel);
    }
  }, [chat, handleNotFound, streamCampaignCreation]);

  /* ── Step 3 (not-found path): user picks from the suggested list ── */

  const handleAccountSelection = useCallback((value: string) => {
    if (!value.trim()) return;

    const suggestions = suggestedAccountsRef.current;
    const lc = value.toLowerCase().trim();

    // Try ordinal ("second one", "the 2nd", "2", etc.)
    const ordinals: Record<string, number> = {
      first: 0, "1st": 0, "1": 0,
      second: 1, "2nd": 1, "2": 1,
      third: 2, "3rd": 2, "3": 2,
    };
    const ordinalKey = Object.keys(ordinals).find((k) => lc.includes(k));
    const byOrdinal = ordinalKey !== undefined ? suggestions[ordinals[ordinalKey]] : undefined;

    // Fall back to label substring match.
    const byLabel = suggestions.find((a) =>
      a.label.toLowerCase().includes(lc) || lc.includes(a.label.toLowerCase()),
    );

    const chosen = byOrdinal ?? byLabel ?? suggestions[0];

    const userMsg = {
      id: `u-${Date.now()}-s9-3`,
      role: "user" as const,
      message: value,
    };

    flushSync(() => {
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S9_CONFIG.id ? { ...s, messages: [...s.messages, userMsg] } : s,
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    chat.focusPromptTextarea();

    streamCampaignCreation(chosen.label, pendingObjectiveRef.current);
  }, [chat, streamCampaignCreation]);

  const handleSubmit = useCallback((value: string) => {
    if (scenarioStep === 0) handleFirstSubmit(value);
    else if (scenarioStep === 1) handleSecondSubmit(value);
    else if (scenarioStep === 2) handleAccountSelection(value);
  }, [scenarioStep, handleFirstSubmit, handleSecondSubmit, handleAccountSelection]);

  const guide = scenarioStep === 0
    ? <>Submit a message like <em>"I want to create a campaign"</em>.</>
    : scenarioStep === 1
    ? <>Reply with an ad account and objective. Use a name containing <em>"2024"</em> to trigger the not-found flow.</>
    : scenarioStep === 2
    ? <>Pick one of the suggested accounts — by name or ordinal like <em>"second one"</em>.</>
    : null;

  return (
    <>
      <PromptInput
        ref={chat.promptInputRef}
        onSubmit={handleSubmit}
        loading={chat.isGenerating}
        onStop={chat.handleStop}
        triggerMenus={TRIGGER_MENUS}
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

      {guide && (
        <ScenarioGuide className={guideClassName}>{guide}</ScenarioGuide>
      )}
    </>
  );
}

S9Scenario.displayName = "S9Scenario";
