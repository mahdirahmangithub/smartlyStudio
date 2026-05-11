import { useCallback, useEffect, useState, type ReactNode } from "react";
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
} from "@sds/components/PromptInput";
import { PromptOptionInput } from "@sds/components/PromptOptionInput";
import { SingleSelectOption } from "@sds/components/SingleSelectOption";
import { Icon } from "@sds/components/Icon";
import {
  AiEntityPreviewInlineTyped,
  AiEntityPreviewTyped,
  WORKSPACE_CONFIG,
  CAMPAIGN_CONFIG,
  type Campaign,
} from "@sds/components/AiEntityPreview";
import { useChat } from "../../shared/ChatContext";
import { ScenarioGuide } from "../../shared/ScenarioGuide";
import { AD_ACCOUNTS, type AdAccount } from "../../shared/data/adAccounts";
import { S2_WORKSPACE } from "../s2/constants";
import { OBJECTIVES, type Objective } from "../s2/constants";

export const S3_CONFIG = {
  id: "s-3",
  label: "Campaign Creation - Scoped",
} as const;

interface S3ScenarioProps {
  guideClassName?: string;
}

type CampaignStatus = "active" | "paused";

/**
 * Scenario s-3 — "Campaign Creation - Scoped".
 *
 * Premise: BMW Global is in the prompt context (same as s-2). The user
 * submits a free-text prompt; the assistant explains it needs three inputs
 * and the prompt area transforms into a 3-step PromptOptionInput
 * (ad account → objective → status). On final submit the same
 * campaign-generation response from s-2 runs.
 */
export function S3Scenario({ guideClassName }: S3ScenarioProps) {
  const chat = useChat();
  const [scenarioStep, setScenarioStep] = useState(0);

  const [adAccountSearch, setAdAccountSearch] = useState("");
  const [selectedAdAccountId, setSelectedAdAccountId] = useState<string | null>(null);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | null>(null);

  // Pre-populate the prompt context with BMW Global on mount; clear on unmount.
  useEffect(() => {
    chat.setContextItems([
      { id: S2_WORKSPACE.id, icon: "topic", label: S2_WORKSPACE.name },
    ]);
    return () => {
      chat.setContextItems([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset selections whenever we rewind to step 0.
  useEffect(() => {
    if (scenarioStep === 0) {
      setAdAccountSearch("");
      setSelectedAdAccountId(null);
      setSelectedObjectiveId(null);
      setSelectedStatus(null);
    }
  }, [scenarioStep]);

  /* ── Final submit — matches s-2's "campaign created" response ──── */

  const handleFinalSubmit = useCallback((data: {
    adAccount: AdAccount;
    objective: Objective;
    status: CampaignStatus;
  }) => {
    const { adAccount, objective, status } = data;
    const statusLabel = status === "active" ? "Active" : "Paused";

    const userMsg = {
      id: `u-${Date.now()}-form`,
      role: "user" as const,
      message: `Create campaign — Ad account: ${adAccount.label} · Objective: ${objective.label} · Status: ${statusLabel}`,
    };

    const createdCampaign: Campaign = {
      id: `c-${Date.now()}-s3`,
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
        s.id === S3_CONFIG.id ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    setScenarioStep(5);

    setTimeout(() => {
      if (chat.activeAssistIdRef.current !== aiId) return;
      chat.streamAiMessage(
        S3_CONFIG.id, aiId,
        `<p>I have created a campaign in <entity-preview id="${S2_WORKSPACE.id}"></entity-preview> and it is ready to be modified.</p>`,
        () => {
          chat.setScenarios((prev) => prev.map((s) =>
            s.id === S3_CONFIG.id ? {
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
          setScenarioStep(6);
        },
        true,
      );
    }, 1500);
  }, [chat]);

  /** Step-3 confirm — falls back to defaults so skipping doesn't strand the
   *  user with a half-filled campaign card. */
  const submitWithDefaults = useCallback(() => {
    const adAccount = AD_ACCOUNTS.find((a) => a.id === selectedAdAccountId) ?? AD_ACCOUNTS[0];
    const objective = OBJECTIVES.find((o) => o.id === selectedObjectiveId) ?? OBJECTIVES[0];
    const status = selectedStatus ?? "active";
    handleFinalSubmit({ adAccount, objective, status });
  }, [selectedAdAccountId, selectedObjectiveId, selectedStatus, handleFinalSubmit]);

  /* ── Initial prompt submit (step 0 → step 1) ───────────────────── */

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
          s.id === S3_CONFIG.id ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
        ));
      });
      chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");

      chat.streamAiMessage(
        S3_CONFIG.id, aiId,
        `<p>To create the campaign in <entity-preview id="${S2_WORKSPACE.id}"></entity-preview>, I'll need three things from you: the <strong>ad account</strong>, the campaign <strong>objective</strong>, and the <strong>initial status</strong>.</p>`,
        () => setScenarioStep(1),
      );
      chat.focusPromptTextarea();
      return;
    }

    // Default: just push the user message.
    flushSync(() => {
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S3_CONFIG.id ? { ...s, messages: [...s.messages, userMsg] } : s
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    chat.focusPromptTextarea();
  }, [scenarioStep, chat]);

  /* ── Trigger menus for the default PromptInput ──────────────────── */

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

  /* ── Prompt-area selector ──────────────────────────────────────── */

  const promptArea: ReactNode = scenarioStep === 1 ? (
    <PromptOptionInput
      label="Select an Ad account"
      steps={{ current: 1, total: 3 }}
      search={{
        value: adAccountSearch,
        onChange: setAdAccountSearch,
        placeholder: "Search ad accounts…",
      }}
      hasValue={selectedAdAccountId !== null}
      isLastStep={false}
      onClose={() => { setScenarioStep(0); chat.focusPromptTextarea(); }}
      onSkip={() => setScenarioStep(2)}
      onSubmit={() => setScenarioStep(2)}
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
  ) : scenarioStep === 2 ? (
    <PromptOptionInput
      label="Select Objective"
      steps={{ current: 2, total: 3, onPrev: () => setScenarioStep(1) }}
      hasValue={selectedObjectiveId !== null}
      isLastStep={false}
      onClose={() => { setScenarioStep(0); chat.focusPromptTextarea(); }}
      onSkip={() => setScenarioStep(3)}
      onSubmit={() => setScenarioStep(3)}
    >
      {OBJECTIVES.map((o) => (
        <SingleSelectOption
          key={o.id}
          labelText={o.label}
          description={false}
          checked={selectedObjectiveId === o.id}
          onChange={() => setSelectedObjectiveId(o.id)}
        />
      ))}
    </PromptOptionInput>
  ) : scenarioStep === 3 ? (
    <PromptOptionInput
      label="Campaign initial status"
      steps={{ current: 3, total: 3, onPrev: () => setScenarioStep(2) }}
      hasValue={selectedStatus !== null}
      isLastStep
      onClose={() => { setScenarioStep(0); chat.focusPromptTextarea(); }}
      onSkip={submitWithDefaults}
      onSubmit={submitWithDefaults}
    >
      <SingleSelectOption
        labelText="Active"
        description={false}
        leading={<Icon name="check_circle" size={20} />}
        checked={selectedStatus === "active"}
        onChange={() => setSelectedStatus("active")}
      />
      <SingleSelectOption
        labelText="Paused"
        description={false}
        leading={<Icon name="pause" size={20} />}
        checked={selectedStatus === "paused"}
        onChange={() => setSelectedStatus("paused")}
      />
    </PromptOptionInput>
  ) : (
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
  );

  /* ── Guide ─────────────────────────────────────────────────────── */

  const guide: ReactNode =
    scenarioStep === 0
      ? <>Submit a prompt (e.g. <em>"I want to create a campaign"</em>).</>
      : scenarioStep === 1
        ? <>Pick an ad account (e.g. <strong>BMW Global Meta Ads</strong>) and submit.</>
        : scenarioStep === 2
          ? <>Pick an objective and submit.</>
          : scenarioStep === 3
            ? <>Pick <strong>Active</strong> or <strong>Paused</strong> and submit.</>
            : null;

  return (
    <>
      {promptArea}
      {guide && <ScenarioGuide className={guideClassName}>{guide}</ScenarioGuide>}
    </>
  );
}
S3Scenario.displayName = "S3Scenario";
