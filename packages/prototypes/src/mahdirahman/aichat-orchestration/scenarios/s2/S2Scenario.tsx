import { useState, useCallback, useEffect } from "react";
import { flushSync } from "react-dom";
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputFooterStart,
  PromptInputAddMenu,
  PromptInputSubmit,
  PromptInputContextMenu,
  DEFAULT_TRIGGER_MENUS,
  type PromptInputTriggerConfig,
  type ContextMenuCategory,
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
import { S2_LABELS, S2_WORKSPACE } from "./constants";
import { CampaignCreationForm } from "./components";
import type { AdAccount } from "../../shared/data/adAccounts";
import type { Objective } from "./constants";

export const S2_CONFIG = {
  id: "s-2",
  label: "Campaign creation - inline form",
} as const;

interface S2ScenarioProps {
  guideClassName?: string;
}

/**
 * Scenario s-2 — "Campaign creation - inline form".
 *
 * Premise: the workspace is already in the user's prompt context
 * (BMW Global). On the first submit the assistant introduces a campaign
 * creation flow that runs inline inside an `AiGeneration` card (no header
 * / no version chip), letting the user fill the campaign fields without
 * leaving the chat.
 */
export function S2Scenario({ guideClassName }: S2ScenarioProps) {
  const chat = useChat();
  const [scenarioStep, setScenarioStep] = useState(0);

  // Pre-populate the prompt context row with the BMW Global chip on mount.
  // Mirrors s-6's pattern; the chip is cleared on unmount so other scenarios
  // start clean.
  useEffect(() => {
    chat.setContextItems([
      { id: S2_WORKSPACE.id, icon: "topic", label: S2_WORKSPACE.name },
    ]);
    return () => {
      chat.setContextItems([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Form submit ─ creates the campaign directly (no plan step) ─── */

  const handleFormSubmit = useCallback((data: {
    adAccount: AdAccount;
    objective: Objective;
    status: "active" | "paused";
  }) => {
    const { adAccount, objective, status } = data;
    const statusLabel = status === "active" ? "Active" : "Paused";

    const userMsg = {
      id: `u-${Date.now()}-form`,
      role: "user" as const,
      message: `Create campaign — Ad account: ${adAccount.label} · Objective: ${objective.label} · Status: ${statusLabel}`,
    };

    const createdCampaign: Campaign = {
      id: `c-${Date.now()}-s2`,
      name: `New ${objective.label.toLowerCase()} campaign in ${S2_WORKSPACE.name}`,
      workspace: S2_WORKSPACE.name,
      platform: S2_WORKSPACE.platform,
      adAccount: adAccount.label,
      adSetCount: 1,
      adCount: 1,
      status: status === "active" ? "Active" : "Draft",
      budget: "—",
      channel: S2_WORKSPACE.platform,
      start: "Today",
    };

    const aiId = `a-${Date.now() + 1}`;
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
    flushSync(() => {
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S2_CONFIG.id ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    setScenarioStep(2);

    setTimeout(() => {
      if (chat.activeAssistIdRef.current !== aiId) return;
      chat.streamAiMessage(
        S2_CONFIG.id, aiId,
        `<p>I have created a campaign in <entity-preview id="${S2_WORKSPACE.id}"></entity-preview> and it is ready to be modified.</p>`,
        () => {
          chat.setScenarios((prev) => prev.map((s) =>
            s.id === S2_CONFIG.id ? {
              ...s,
              messages: s.messages.map((m) => m.id === aiId ? {
                ...m,
                slot: (
                  <AiEntityPreviewTyped
                    config={CAMPAIGN_CONFIG}
                    data={createdCampaign}
                    onHeaderAction={() => chat.addContextItem({
                      id: createdCampaign.id,
                      icon: "campaign_alt",
                      label: createdCampaign.name,
                    })}
                  />
                ),
              } : m),
            } : s
          ));
          setScenarioStep(3);
        },
        true,
      );
    }, 1500);
  }, [chat]);

  /* ── Submit ─────────────────────────────────────────────────────── */

  const handleSubmit = useCallback((value: string) => {
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

    if (scenarioStep === 0) {
      const aiId = `a-${Date.now()}`;
      const aiMsg = {
        id: aiId,
        role: "assistant" as const,
        phase: "loading" as const,
        text: "",
        loadingLabel: S2_LABELS[0],
        components: {
          "entity-preview": (_attrs: Record<string, string>) => (
            <AiEntityPreviewInlineTyped config={WORKSPACE_CONFIG} data={S2_WORKSPACE} />
          ),
        },
        showFeedback: true,
        onFeedbackChange: chat.setFeedback(aiId),
      };

      chat.activeAssistIdRef.current = aiId;
      flushSync(() => {
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S2_CONFIG.id ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
        ));
      });
      chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");

      S2_LABELS.forEach((_label, i) => {
        if (i === 0) return;
        setTimeout(() => {
          if (chat.activeAssistIdRef.current !== aiId) return;
          chat.setScenarios((prev) => prev.map((s) =>
            s.id === S2_CONFIG.id ? {
              ...s,
              messages: s.messages.map((m) => m.id === aiId ? {
                ...m,
                loadingLabel: S2_LABELS[i],
              } : m),
            } : s
          ));
        }, i * 1500);
      });

      setTimeout(() => {
        if (chat.activeAssistIdRef.current !== aiId) return;
        chat.streamAiMessage(
          S2_CONFIG.id, aiId,
          `<p>To create a campaign in <entity-preview id="${S2_WORKSPACE.id}"></entity-preview> you need to define a few things.</p>`,
          () => {
            chat.setScenarios((prev) => prev.map((s) =>
              s.id === S2_CONFIG.id ? {
                ...s,
                messages: s.messages.map((m) => m.id === aiId ? {
                  ...m,
                  slot: <CampaignCreationForm onSubmit={handleFormSubmit} />,
                } : m),
              } : s
            ));
            setScenarioStep(1);
          },
          true,
        );
      }, S2_LABELS.length * 1500 + 200);

      chat.focusPromptTextarea();
      return;
    }

    // Default: just push the user message.
    flushSync(() => {
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S2_CONFIG.id ? { ...s, messages: [...s.messages, userMsg] } : s
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    chat.focusPromptTextarea();
  }, [scenarioStep, chat, handleFormSubmit]);

  /* ── Trigger menus for the default PromptInput ──────────────────── */

  const CONTEXT_CATEGORIES: ContextMenuCategory[] = [
    { id: "campaigns", icon: "campaign_alt", label: "Campaigns", onSelect: () => {} },
    { id: "audiences", icon: "group", label: "Audiences", onSelect: () => {} },
    { id: "reports", icon: "reporting", label: "Reports", onSelect: () => {} },
  ];
  const TRIGGER_MENUS: PromptInputTriggerConfig[] = [
    ...DEFAULT_TRIGGER_MENUS,
    {
      char: "@",
      renderContent: (props) => (
        <PromptInputContextMenu {...props} categories={CONTEXT_CATEGORIES} />
      ),
    },
  ];

  const guide = scenarioStep === 0
    ? <>Submit a prompt (e.g. <em>"I want to create a campaign"</em>).</>
    : null;

  return (
    <>
      <PromptInput
        onSubmit={handleSubmit}
        loading={chat.isGenerating}
        onStop={chat.handleStop}
        triggerMenus={TRIGGER_MENUS}
        contextItems={chat.contextItems}
        onContextItemsChange={chat.setContextItems}
        onAttachedFilesChange={chat.setAttachedFiles}
      >
        <PromptInputAttachments />
        <PromptInputTextarea
          placeholder="Ask Smartly…"
          animatedPlaceholders={[
            "Create a campaign",
            "Set up a new campaign in BMW Global",
          ]}
          showAnimatedPlaceholder={chat.activeMessages.length === 0}
        />
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
S2Scenario.displayName = "S2Scenario";
