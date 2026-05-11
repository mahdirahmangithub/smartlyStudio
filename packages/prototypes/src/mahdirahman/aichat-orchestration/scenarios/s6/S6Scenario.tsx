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
  TriggerMenu,
  DEFAULT_TRIGGER_MENUS,
  type PromptInputTriggerConfig,
  type MenuNode,
  type PromptInputContextItem,
} from "@sds/components/PromptInput";
import { PromptOptionInput } from "@sds/components/PromptOptionInput";
import { SingleSelectOption } from "@sds/components/SingleSelectOption";
import {
  AiEntityPreviewInlineTyped,
  AiEntityPreviewTyped,
  WORKSPACE_CONFIG,
  CAMPAIGN_CONFIG,
  type Campaign,
} from "@sds/components/AiEntityPreview";
import { CotContainer, CotItem, Cot } from "@sds/components/Cot";
import { useChat } from "../../shared/ChatContext";
import { AD_ACCOUNTS } from "../../shared/data/adAccounts";
import type { CampaignPlanStep } from "../../shared/types";
import { S6_LABELS, S6_PLAN_LABELS, S6_WORKSPACE, buildS6Campaign } from "./constants";
import { S6CreateCampaignPlanTask } from "./components";

export const S6_CONFIG = {
  id: "s-6",
  label: "Create campaign in current WS",
} as const;

const buildS6PlanCot = (completedUpTo: number) => (
  <CotContainer type="reasoning">
    <Cot>
      {S6_PLAN_LABELS.map((label, i) => (
        <CotItem
          key={i}
          title={label}
          variant="dot"
          status={i < completedUpTo ? "complete" : i === completedUpTo ? "loading" : "idle"}
        />
      ))}
    </Cot>
  </CotContainer>
);

const finalS6PlanReasoningCot = (
  <CotContainer type="reasoning" title="Reasoning">
    <Cot>
      {S6_PLAN_LABELS.map((label, i) => (
        <CotItem key={i} title={label} variant="dot" status="complete" />
      ))}
    </Cot>
  </CotContainer>
);

/**
 * Scenario s-6 — "Create campaign in current WS".
 *
 * Premise: the workspace is already in the user's working context (BMW Meta),
 * so a chip is auto-added on entry. User submits any prompt → loading labels
 * → ad-account picker → plan task (Start-only, animates to completion) →
 * confirmation bubble with the campaign single preview. After that, user can
 * click add-to-context on the campaign and submit a rename message to rename
 * the campaign in-place.
 */
export function S6Scenario() {
  const chat = useChat();

  const [scenarioStep, setScenarioStep] = useState(0);
  const [adAccountSearch, setAdAccountSearch] = useState("");
  const [selectedAdAccountId, setSelectedAdAccountId] = useState<string | null>(null);
  const [s6CreatedCampaign, setS6CreatedCampaign] = useState<Campaign | null>(null);
  const [s6CompletionMsgId, setS6CompletionMsgId] = useState<string | null>(null);

  // Pre-populate the prompt context row with the BMW Meta chip on mount; this
  // scenario's premise is that the workspace is already in the user's context.
  // The mount-only effect mirrors how scenarios remount on re-entry.
  useEffect(() => {
    chat.setContextItems([{ id: "ctx-bmw-meta", icon: "topic", label: "BMW Meta" }]);
    return () => {
      chat.setContextItems([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Submit handler ─────────────────────────────────────────────── */

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

    // ── Step 0: initial submit → loading labels → ad-account picker ──
    if (scenarioStep === 0) {
      const aiId = `a-${Date.now()}`;
      const aiMsg = {
        id: aiId,
        role: "assistant" as const,
        phase: "loading" as const,
        text: "",
        loadingLabel: S6_LABELS[0],
      };
      chat.activeAssistIdRef.current = aiId;
      flushSync(() => {
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S6_CONFIG.id ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
        ));
      });
      chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");

      setTimeout(() => {
        if (chat.activeAssistIdRef.current !== aiId) return;
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S6_CONFIG.id ? {
            ...s,
            messages: s.messages.map((m) => m.id === aiId ? { ...m, loadingLabel: S6_LABELS[1] } : m),
          } : s
        ));
      }, 1500);

      setTimeout(() => {
        if (chat.activeAssistIdRef.current !== aiId) return;
        chat.streamAiMessage(
          S6_CONFIG.id, aiId,
          "<p>To create a new campaign please set an ad account.</p>",
          () => {
            setAdAccountSearch("");
            setSelectedAdAccountId(null);
            setScenarioStep(4);
          },
          true,
        );
      }, S6_LABELS.length * 1500 + 200);

      chat.focusPromptTextarea();
      return;
    }

    // ── Step 5: rename submit (after the campaign card is rendered) ──
    if (scenarioStep === 5 && s6CreatedCampaign && s6CompletionMsgId) {
      // Hard-coded scripted name for the demo, regardless of what the user typed.
      const newName = "BMW summer sales";

      const renamedForOldSlot: Campaign = { ...s6CreatedCampaign, name: newName };
      const renamedForNewBubble: Campaign = { ...s6CreatedCampaign, name: newName, status: "Renamed" };

      const relabel = (items?: PromptInputContextItem[]) =>
        items?.map((ci) => ci.id === renamedForOldSlot.id ? { ...ci, label: newName } : ci);

      const renamedUserMsg = {
        ...userMsg,
        ...(userMsg.contextItems ? { contextItems: relabel(userMsg.contextItems)! } : {}),
      };

      const renameAiId = `a-${Date.now()}-s6r`;
      const renameMsg = {
        id: renameAiId,
        role: "assistant" as const,
        phase: "generating" as const,
        text: "",
        components: {
          "entity-preview": (_attrs: Record<string, string>) => (
            <AiEntityPreviewInlineTyped
              config={CAMPAIGN_CONFIG}
              data={renamedForNewBubble}
              status={renamedForNewBubble.status}
            />
          ),
        },
      };

      const completionId = s6CompletionMsgId;
      chat.activeAssistIdRef.current = renameAiId;
      flushSync(() => {
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S6_CONFIG.id ? {
            ...s,
            messages: [
              ...s.messages.map((m) => {
                if (m.id === completionId) {
                  return {
                    ...m,
                    slot: (
                      <AiEntityPreviewTyped
                        config={CAMPAIGN_CONFIG}
                        data={renamedForOldSlot}
                        onHeaderAction={() => chat.addContextItem({
                          id: renamedForOldSlot.id,
                          icon: "campaign_alt",
                          label: renamedForOldSlot.name,
                        })}
                      />
                    ),
                  };
                }
                if (m.role === "user" && m.contextItems) {
                  return { ...m, contextItems: relabel(m.contextItems)! };
                }
                return m;
              }),
              renamedUserMsg,
              renameMsg,
            ],
          } : s
        ));
      });
      chat.threadRef.current?.scrollToMessage(renamedUserMsg.id, "smooth");
      setS6CreatedCampaign(renamedForOldSlot);
      chat.setContextItems((prev) => prev.map((ci) =>
        ci.id === renamedForOldSlot.id ? { ...ci, label: newName } : ci
      ));

      chat.streamAiMessage(
        S6_CONFIG.id, renameAiId,
        `<p>The campaign name updated to <entity-preview id="${renamedForNewBubble.id}"></entity-preview>.</p>`,
        undefined,
        true,
      );

      chat.focusPromptTextarea();
      return;
    }

    // Default: just push the user message.
    flushSync(() => {
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S6_CONFIG.id ? { ...s, messages: [...s.messages, userMsg] } : s
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    chat.focusPromptTextarea();
  }, [scenarioStep, s6CreatedCampaign, s6CompletionMsgId, chat]);

  /* ── Ad-account picker submit — drives the plan flow ─────────── */

  const handleAdAccountSubmit = useCallback(() => {
    const adAccount = AD_ACCOUNTS.find((a) => a.id === selectedAdAccountId);
    const adAccountName = adAccount?.label ?? "the selected ad account";
    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user" as const,
      message: adAccount ? `Using ad account: ${adAccount.label}` : "Using selected ad account",
    };
    const aiId = `a-${Date.now() + 1}`;
    const aiMsg = {
      id: aiId,
      role: "assistant" as const,
      phase: "loading" as const,
      text: "",
      loadingLabel: S6_PLAN_LABELS[0],
      cotContent: buildS6PlanCot(0),
      components: {
        "entity-preview": (_attrs: Record<string, string>) => (
          <AiEntityPreviewInlineTyped config={WORKSPACE_CONFIG} data={S6_WORKSPACE} />
        ),
      },
    };

    chat.activeAssistIdRef.current = aiId;
    flushSync(() => {
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S6_CONFIG.id ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    setScenarioStep(5);

    S6_PLAN_LABELS.forEach((_label, i) => {
      if (i === 0) return;
      setTimeout(() => {
        if (chat.activeAssistIdRef.current !== aiId) return;
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S6_CONFIG.id ? {
            ...s,
            messages: s.messages.map((m) => m.id === aiId ? {
              ...m,
              loadingLabel: S6_PLAN_LABELS[i],
              cotContent: buildS6PlanCot(i),
            } : m),
          } : s
        ));
      }, i * 1500);
    });

    const handlePlanComplete = () => {
      const createdCampaign = buildS6Campaign(adAccountName);

      const completionAiId = `a-${Date.now()}-s6c`;
      const completionMsg = {
        id: completionAiId,
        role: "assistant" as const,
        phase: "generating" as const,
        text: "",
        components: {
          "entity-preview": (_attrs: Record<string, string>) => (
            <AiEntityPreviewInlineTyped config={WORKSPACE_CONFIG} data={S6_WORKSPACE} />
          ),
        },
      };

      chat.activeAssistIdRef.current = completionAiId;
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S6_CONFIG.id ? { ...s, messages: [...s.messages, completionMsg] } : s
      ));

      chat.streamAiMessage(
        S6_CONFIG.id, completionAiId,
        `<p>The new sales campaign added successfuly to <entity-preview id="${S6_WORKSPACE.id}"></entity-preview>.</p>`,
        () => {
          setS6CreatedCampaign(createdCampaign);
          setS6CompletionMsgId(completionAiId);
          chat.setScenarios((prev) => prev.map((s) =>
            s.id === S6_CONFIG.id ? {
              ...s,
              messages: s.messages.map((m) => m.id === completionAiId ? {
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
        },
        true,
      );
    };

    setTimeout(() => {
      if (chat.activeAssistIdRef.current !== aiId) return;
      chat.streamAiMessage(
        S6_CONFIG.id, aiId,
        `<p>I will generate a Campaign in <entity-preview id="${S6_WORKSPACE.id}"></entity-preview> with Sales as Objective.</p>`,
        () => {
          const planSteps: CampaignPlanStep[] = [
            { title: "Create Campaign Shell",                 description: `Create a Campaign in ${S6_WORKSPACE.name}` },
            { title: "Assign an Ad Account to the campaign", description: `This campaign will uses ${adAccountName}` },
            { title: "Fill objective of campaign",            description: "Set Sales as objective of the campaign" },
          ];
          chat.setScenarios((prev) => prev.map((s) =>
            s.id === S6_CONFIG.id ? {
              ...s,
              messages: s.messages.map((m) => m.id === aiId ? {
                ...m,
                cotContent: finalS6PlanReasoningCot,
                slot: <S6CreateCampaignPlanTask steps={planSteps} onComplete={handlePlanComplete} />,
              } : m),
            } : s
          ));
        },
        true,
      );
    }, S6_PLAN_LABELS.length * 1500 + 400);

    chat.focusPromptTextarea();
  }, [selectedAdAccountId, chat]);

  /* ── Trigger menus for the default PromptInput ── */

  const CONTEXT_CATEGORIES: MenuNode[] = [
    { id: "campaigns", icon: "campaign_alt", label: "Campaigns" },
    { id: "audiences", icon: "group", label: "Audiences" },
    { id: "reports", icon: "reporting", label: "Reports" },
  ];
  const TRIGGER_MENUS: PromptInputTriggerConfig[] = [
    ...DEFAULT_TRIGGER_MENUS,
    {
      char: "@",
      renderContent: (props) => (
        <TriggerMenu {...props} items={CONTEXT_CATEGORIES} />
      ),
    },
  ];

  /* ── Render ─────────────────────────────────────────────────────── */

  if (scenarioStep === 4) {
    return (
      <PromptOptionInput
        label="Select an Ad account"
        search={{ value: adAccountSearch, onChange: setAdAccountSearch, placeholder: "Search ad accounts…" }}
        hasValue={selectedAdAccountId !== null}
        isLastStep
        onClose={() => { setScenarioStep(0); chat.focusPromptTextarea(); }}
        onSkip={handleAdAccountSubmit}
        onSubmit={handleAdAccountSubmit}
      >
        {AD_ACCOUNTS
          .filter((a) => a.label.toLowerCase().includes(adAccountSearch.toLowerCase()))
          .map((a) => (
            <SingleSelectOption
              key={a.id}
              labelText={a.label}
              description={false}
              checked={selectedAdAccountId === a.id}
              onChange={() => setSelectedAdAccountId(a.id)}
            />
          ))}
      </PromptOptionInput>
    );
  }

  return (
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
  );
}
S6Scenario.displayName = "S6Scenario";
