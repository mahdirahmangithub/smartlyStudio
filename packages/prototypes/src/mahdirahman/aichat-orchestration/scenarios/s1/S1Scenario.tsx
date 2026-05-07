import { useState, useRef, useCallback, useEffect, createRef, type RefObject, type ReactNode } from "react";
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
  PromptInputInfo,
  PromptInputRecommendations,
  DEFAULT_TRIGGER_MENUS,
  type PromptInputTriggerConfig,
  type ContextMenuCategory,
} from "@sds/components/PromptInput";
import { PromptOptionInput } from "@sds/components/PromptOptionInput";
import { GenericSelectOption } from "@sds/components/GenericSelectOption";
import { SingleSelectOption } from "@sds/components/SingleSelectOption";
import { Icon } from "@sds/components/Icon";
import {
  AiEntityPreviewInlineTyped,
  AiEntityPreviewTyped,
  AiEntityPreviewMultipleTyped,
  WORKSPACE_CONFIG,
  CAMPAIGN_CONFIG,
  CAMPAIGN_FIELD_CONFIG,
  KNOWLEDGE_BASE_CONFIG,
  useCitationGroup,
  type Campaign,
} from "@sds/components/AiEntityPreview";
import { AiGenerationSuggestion, AiGenerationSuggestionEntities } from "@sds/components/AiGenerationSuggestion";
import { Entity } from "@sds/components/Entity";
import { useChat, type PlanTaskHandle } from "../../shared/ChatContext";
import { ScenarioGuide } from "../../shared/ScenarioGuide";
import { WORKSPACES } from "../../shared/data/workspaces";
import { AD_ACCOUNTS } from "../../shared/data/adAccounts";
import type { CampaignPlanStep } from "../../shared/types";
import {
  LOADING_LABELS,
  EXTRACT_LABELS,
  APPLY_LABELS,
  PLAN_DETAILS_CODE,
  KB_SOURCES,
  buildExtractedFields,
  buildPostCreationRecommendations,
} from "./constants";
import {
  CampaignPlanTask,
  UpdateFieldsTask,
  buildLoadingCot,
  buildFinalReasoningCot,
} from "./components";

export const S1_CONFIG = {
  id: "s-1",
  label: "Campaign Creation",
} as const;

interface S1ScenarioProps {
  /** Class applied to the ScenarioGuide popover (yellow background, etc.). */
  guideClassName?: string;
}

/**
 * Scenario s-1 — "Campaign Creation".
 *
 * Owns its own step state and selection state. Steps walk the user from a
 * free-text prompt (step 0) through a workspace/ad-account picker flow
 * (steps 1 → 2 → 4), into a plan task (step 5), then a post-creation
 * field-extraction flow (steps 6 → 7) ending with an Apply task.
 *
 * Mounted only when active; re-mounted on every re-entry so step state
 * resets cleanly. Pulls shared infrastructure (messages, refs, helpers)
 * from `useChat()`.
 */
export function S1Scenario({ guideClassName }: S1ScenarioProps) {
  const chat = useChat();

  // KB citation group — bound to KB_SOURCES; produces numbered inline
  // <Citation> chips and a <Sources> multi-mode preview with hover sync.
  const kb = useCitationGroup({ config: KNOWLEDGE_BASE_CONFIG, data: KB_SOURCES });

  const [scenarioStep, setScenarioStep] = useState(0);
  const [workspaceChoice, setWorkspaceChoice] = useState<"new" | "existing" | null>(null);
  const [campaignNameInput, setCampaignNameInput] = useState("");
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [adAccountSearch, setAdAccountSearch] = useState("");
  const [selectedAdAccountId, setSelectedAdAccountId] = useState<string | null>(null);
  const [createdCampaign, setCreatedCampaign] = useState<Campaign | null>(null);

  // Plan-edit flow — editingPlanIdRef captures the id synchronously for use
  // inside submit callbacks.
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const editingPlanIdRef = useRef<string | null>(null);

  // ScenarioGuide flags — flipped during the demo flow so the guide can
  // advance to the next instruction (e.g. "Click Start" after the Edit detour).
  const [hasEditedPlan, setHasEditedPlan] = useState(false);
  const [fieldsApplied, setFieldsApplied] = useState(false);

  // Reset guide flags whenever the scenario rewinds to step 0.
  useEffect(() => {
    if (scenarioStep === 0) {
      setHasEditedPlan(false);
      setFieldsApplied(false);
    }
  }, [scenarioStep]);

  /* ── Plan-edit handlers ────────────────────────────────────────────── */

  const handlePlanEditStart = useCallback((planAssistId: string) => {
    setEditingPlanId(planAssistId);
    editingPlanIdRef.current = planAssistId;
    chat.focusPromptTextarea();
  }, [chat]);

  const handleCancelEdit = useCallback(() => {
    const id = editingPlanIdRef.current;
    if (id) chat.planRefsMap.current.get(id)?.current?.cancelEdit();
    setEditingPlanId(null);
    editingPlanIdRef.current = null;
  }, [chat]);

  /* ── handleSubmit ──────────────────────────────────────────────────── */

  const handleSubmit = useCallback((value: string) => {
    // ── Edit-mode branch: user is editing an existing plan ──
    const capturedEditId = editingPlanIdRef.current;
    if (capturedEditId) {
      setEditingPlanId(null);
      editingPlanIdRef.current = null;
      setHasEditedPlan(true);

      const userMsg = { id: `u-${Date.now()}`, role: "user" as const, message: value, replyLabel: "Editing plan" };
      const aiId = `a-${Date.now() + 1}`;
      const aiMsg = { id: aiId, role: "assistant" as const, phase: "loading" as const, text: "" };
      flushSync(() => {
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S1_CONFIG.id ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
        ));
      });
      chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");

      // Reset ad-account selection so the user picks a fresh one in step 4.
      setAdAccountSearch("");
      setSelectedAdAccountId(null);

      chat.streamAiMessage(
        S1_CONFIG.id, aiId,
        "<p>Sure — please select a different ad account and I'll update the plan.</p>",
        () => {
          chat.planRefsMap.current.get(capturedEditId)?.current?.markEdited();
          setScenarioStep(4);
        },
      );
      chat.focusPromptTextarea();
      return;
    }

    // Snapshot files + context at submit time so the user bubble carries them
    // even though PromptInput clears attachments right after onSubmit returns.
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
        copyValue: "Do you want to create this campaign in a new workspace or use an existing one?",
        showFeedback: true,
        onFeedbackChange: chat.setFeedback(aiId),
      };
      flushSync(() => {
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S1_CONFIG.id ? { ...s, messages: [userMsg, aiMsg] } : s
        ));
      });
      chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
      chat.streamAiMessage(
        S1_CONFIG.id, aiId,
        "<p>Do you want to create this campaign in a new workspace or use an existing one?</p>",
        () => setScenarioStep(1),
      );
      chat.focusPromptTextarea();
      return;
    }

    // ── Step 6 → Field extraction flow ──
    if (scenarioStep === 6 && createdCampaign) {
      const aiId = `a-${Date.now() + 1}`;
      const campaign = createdCampaign;
      const aiMsg = {
        id: aiId,
        role: "assistant" as const,
        phase: "loading" as const,
        text: "",
        loadingLabel: EXTRACT_LABELS[0],
        cotContent: buildLoadingCot(EXTRACT_LABELS, 0),
        components: {
          "entity-preview": (_attrs: Record<string, string>) => (
            <AiEntityPreviewInlineTyped config={CAMPAIGN_CONFIG} data={campaign} />
          ),
        },
      };

      chat.activeAssistIdRef.current = aiId;
      flushSync(() => {
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S1_CONFIG.id ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
        ));
      });
      chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
      setScenarioStep(7);

      EXTRACT_LABELS.forEach((_label, i) => {
        if (i === 0) return;
        setTimeout(() => {
          if (chat.activeAssistIdRef.current !== aiId) return;
          chat.setScenarios((prev) => prev.map((s) =>
            s.id === S1_CONFIG.id ? {
              ...s,
              messages: s.messages.map((m) => m.id === aiId ? {
                ...m,
                loadingLabel: EXTRACT_LABELS[i],
                cotContent: buildLoadingCot(EXTRACT_LABELS, i),
              } : m),
            } : s
          ));
        }, i * 1500);
      });

      setTimeout(() => {
        if (chat.activeAssistIdRef.current !== aiId) return;
        chat.streamAiMessage(
          S1_CONFIG.id, aiId,
          `<p>I've extracted the following data for the <entity-preview id="${campaign.id}"></entity-preview> fields. Could you review and confirm if everything looks correct? Let me know if there's anything to add so I can update the list.</p>`,
          () => {
            const fields = buildExtractedFields(campaign.name);

            // Apply click → strip actions from the campaignField slot, then
            // push a loading bubble that cycles APPLY_LABELS, transitions
            // into a self-driven task cot, and finally appends a streamed
            // confirmation bubble with an inline campaign preview.
            const handleApplyFields = () => {
              setFieldsApplied(true);
              chat.setScenarios((prev) => prev.map((s) =>
                s.id === S1_CONFIG.id ? {
                  ...s,
                  messages: s.messages.map((m) => m.id === aiId ? {
                    ...m,
                    slot: (
                      <AiEntityPreviewMultipleTyped
                        config={CAMPAIGN_FIELD_CONFIG}
                        data={fields}
                        itemName="campaign fields"
                        visibleCount={3}
                      />
                    ),
                  } : m),
                } : s
              ));

              const applyAiId = `a-${Date.now()}-apply`;
              const applyMsg = {
                id: applyAiId,
                role: "assistant" as const,
                phase: "loading" as const,
                text: "",
                loadingLabel: APPLY_LABELS[0],
              };
              chat.activeAssistIdRef.current = applyAiId;
              chat.setScenarios((prev) => prev.map((s) =>
                s.id === S1_CONFIG.id ? { ...s, messages: [...s.messages, applyMsg] } : s
              ));

              setTimeout(() => {
                if (chat.activeAssistIdRef.current !== applyAiId) return;
                chat.setScenarios((prev) => prev.map((s) =>
                  s.id === S1_CONFIG.id ? {
                    ...s,
                    messages: s.messages.map((m) => m.id === applyAiId
                      ? { ...m, loadingLabel: APPLY_LABELS[1] }
                      : m),
                  } : s
                ));
              }, 1500);

              setTimeout(() => {
                if (chat.activeAssistIdRef.current !== applyAiId) return;

                const handleApplyComplete = () => {
                  const finalAiId = `a-${Date.now()}-applied`;
                  const finalMsg = {
                    id: finalAiId,
                    role: "assistant" as const,
                    phase: "loading" as const,
                    text: "",
                    components: {
                      "entity-preview": (_attrs: Record<string, string>) => (
                        <AiEntityPreviewInlineTyped config={CAMPAIGN_CONFIG} data={campaign} />
                      ),
                    },
                    copyValue: `All the field values have been applied and are now updated in your ${campaign.name}.`,
                    showFeedback: true,
                    onFeedbackChange: chat.setFeedback(finalAiId),
                  };
                  chat.activeAssistIdRef.current = finalAiId;
                  chat.setScenarios((prev) => prev.map((s) =>
                    s.id === S1_CONFIG.id ? { ...s, messages: [...s.messages, finalMsg] } : s
                  ));
                  chat.streamAiMessage(
                    S1_CONFIG.id, finalAiId,
                    `<p>All the field values have been applied and are now updated in your <entity-preview id="${campaign.id}"></entity-preview>.</p>`,
                  );
                };

                chat.setScenarios((prev) => prev.map((s) =>
                  s.id === S1_CONFIG.id ? {
                    ...s,
                    messages: s.messages.map((m) => m.id === applyAiId ? {
                      ...m,
                      phase: "done" as const,
                      text: "",
                      loadingLabel: undefined,
                      slot: <UpdateFieldsTask fields={fields} onComplete={handleApplyComplete} />,
                    } : m),
                  } : s
                ));
                chat.activeAssistIdRef.current = null;
              }, 3000);
            };

            chat.setScenarios((prev) => prev.map((s) =>
              s.id === S1_CONFIG.id ? {
                ...s,
                messages: s.messages.map((m) => m.id === aiId ? {
                  ...m,
                  cotContent: buildFinalReasoningCot(EXTRACT_LABELS),
                  slot: (
                    <AiEntityPreviewMultipleTyped
                      config={CAMPAIGN_FIELD_CONFIG}
                      data={fields}
                      itemName="campaign fields"
                      visibleCount={3}
                      onEdit={() => {}}
                      onCancel={() => {}}
                      onCreate={handleApplyFields}
                      createLabel="Apply"
                    />
                  ),
                } : m),
              } : s
            ));
          },
          true,
        );
      }, EXTRACT_LABELS.length * 1500 + 400);

      chat.focusPromptTextarea();
      return;
    }

    // Default: just push the user message (no AI response).
    flushSync(() => {
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S1_CONFIG.id ? { ...s, messages: [...s.messages, userMsg] } : s
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    chat.focusPromptTextarea();
  }, [scenarioStep, createdCampaign, chat]);

  /* ── Workspace-picker handlers ────────────────────────────────────── */

  const handleWorkspaceSelect = useCallback((type: "new" | "existing") => {
    setWorkspaceChoice(type);
    setCampaignNameInput("");
    setWorkspaceSearch("");
    setSelectedWorkspaceId(null);
    setScenarioStep(2);
  }, []);

  const handleFinalSubmit = useCallback(() => {
    let message = "";
    if (workspaceChoice === "new") {
      message = campaignNameInput.trim()
        ? `Create a new workspace named "${campaignNameInput.trim()}"`
        : "Create a new workspace";
    } else {
      const workspace = WORKSPACES.find((w) => w.id === selectedWorkspaceId);
      message = workspace
        ? `Use existing workspace: ${workspace.name}`
        : "Use an existing workspace";
    }
    const userMsg = { id: `u-${Date.now()}`, role: "user" as const, message };
    const aiId = `a-${Date.now() + 1}`;
    const aiMsg = {
      id: aiId,
      role: "assistant" as const,
      phase: "loading" as const,
      text: "",
      loadingLabel: "Thinking...",
      copyValue: "For setup the campaign select an Ad account then I will finalize the plan to create the campaign.",
      showFeedback: true,
      onFeedbackChange: chat.setFeedback(aiId),
    };
    chat.activeAssistIdRef.current = aiId;
    flushSync(() => {
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S1_CONFIG.id ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    setScenarioStep(3);
    setAdAccountSearch("");
    setSelectedAdAccountId(null);

    setTimeout(() => {
      if (chat.activeAssistIdRef.current !== aiId) return;
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S1_CONFIG.id
          ? { ...s, messages: s.messages.map((m) => m.id === aiId ? { ...m, loadingLabel: "Checking ad accounts..." } : m) }
          : s
      ));
    }, 1500);

    setTimeout(() => {
      if (chat.activeAssistIdRef.current !== aiId) return;
      chat.streamAiMessage(
        S1_CONFIG.id, aiId,
        "<p>For setup the campaign select an Ad account then I will finalize the plan to create the campaign.</p>",
        () => setScenarioStep(4),
        true,
      );
    }, 2800);
  }, [workspaceChoice, campaignNameInput, selectedWorkspaceId, chat]);

  /* ── Ad-account-picker handler — drives the plan flow ────────────── */

  const handleAdAccountSubmit = useCallback(() => {
    const adAccount = AD_ACCOUNTS.find((a) => a.id === selectedAdAccountId);
    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user" as const,
      message: adAccount ? `Using ad account: ${adAccount.label}` : "Using selected ad account",
    };
    const aiId = `a-${Date.now() + 1}`;
    const workspace = (workspaceChoice === "existing"
      ? WORKSPACES.find((w) => w.id === selectedWorkspaceId)
      : null) ?? WORKSPACES[0];
    const workspaceName = workspaceChoice === "new"
      ? (campaignNameInput.trim() || workspace.name)
      : workspace.name;
    const adAccountName = adAccount?.label ?? "the selected ad account";

    const planSteps: CampaignPlanStep[] = [
      { title: "Set up campaign structure", description: `Create the campaign shell in ${workspaceName} workspace` },
      { title: "Assign the Ad account to campaign", description: `Add ${adAccountName} as ad account` },
      { title: "Finalize Ad set and Ad structure", description: "One Ad set and Ad will be added to campaign shell automatically" },
    ];

    const planRef = createRef<PlanTaskHandle>();
    chat.planRefsMap.current.set(aiId, planRef);

    const createdCampaignLocal: Campaign = {
      id: `c-${Date.now()}`,
      name: `New campaign in ${workspaceName}`,
      workspace: workspaceName,
      platform: workspace.platform,
      adAccount: adAccountName,
      adSetCount: 1,
      adCount: 1,
      status: "Draft",
      budget: "—",
      channel: workspace.platform,
      start: "Today",
    };

    const handlePlanStart = () => {
      chat.runningPlanIdRef.current = aiId;
      chat.setRunningPlanId(aiId);
    };

    const handlePlanComplete = () => {
      chat.runningPlanIdRef.current = null;
      chat.setRunningPlanId(null);
      setCreatedCampaign(createdCampaignLocal);
      const completionAiId = `a-${Date.now()}-c`;
      const completionMsg = {
        id: completionAiId,
        role: "assistant" as const,
        phase: "loading" as const,
        text: "",
        components: {
          "entity-preview": (_attrs: Record<string, string>) => (
            <AiEntityPreviewInlineTyped config={WORKSPACE_CONFIG} data={workspace} />
          ),
        },
      };
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S1_CONFIG.id ? { ...s, messages: [...s.messages, completionMsg] } : s
      ));

      chat.streamAiMessage(
        S1_CONFIG.id, completionAiId,
        `<p>I have created a campaign in <entity-preview id="${workspace.id}"></entity-preview> and it is ready to be modified.</p>`,
        () => {
          // Bubble 1 — attach the campaign card slot only.
          chat.setScenarios((prev) => prev.map((s) =>
            s.id === S1_CONFIG.id ? {
              ...s,
              messages: s.messages.map((m) => m.id === completionAiId ? {
                ...m,
                slot: (
                  <AiEntityPreviewTyped
                    config={CAMPAIGN_CONFIG}
                    data={createdCampaignLocal}
                    onHeaderAction={() => chat.addContextItem({
                      id: createdCampaignLocal.id,
                      icon: "campaign_alt",
                      label: createdCampaignLocal.name,
                    })}
                  />
                ),
              } : m),
            } : s
          ));

          // Bubble 2 — guidance paragraphs streamed in, then the
          // AiGenerationSuggestion entities + KB sources list attached as
          // the slot. Inline `<entity-preview id="...">` tags resolve to
          // numbered citation chips via the kb group; pointer hover on a
          // chip lights up the matching row in the slotted Sources list.
          const guidanceAiId = `a-${Date.now()}-g`;
          const guidanceMsg = {
            id: guidanceAiId,
            role: "assistant" as const,
            phase: "loading" as const,
            text: "",
            components: {
              "entity-preview": (attrs: Record<string, string>) => <kb.Citation id={attrs.id} />,
            },
            showFeedback: true,
            onFeedbackChange: chat.setFeedback(guidanceAiId),
          };
          chat.setScenarios((prev) => prev.map((s) =>
            s.id === S1_CONFIG.id ? { ...s, messages: [...s.messages, guidanceMsg] } : s
          ));
          chat.streamAiMessage(
            S1_CONFIG.id, guidanceAiId,
            `<p>To make this campaign <strong>valid for publishing</strong> <entity-preview id="kb-publishing-requirements"></entity-preview> you need to take a few more steps. you can use Automation Feeds <entity-preview id="kb-automation-feeds"></entity-preview> to automate your campaign or add one of your previous campaigns to filling the fields. easiest way is to mention that campaign in prompt input by typing <code> @ </code> and search for campaign name.</p>
<p>or you can start by filling each field one by one. Based on your campaign structure I suggest to define your Objective first.</p>`,
            () => {
              chat.setScenarios((prev) => prev.map((s) =>
                s.id === S1_CONFIG.id ? {
                  ...s,
                  messages: s.messages.map((m) => m.id === guidanceAiId ? {
                    ...m,
                    slot: (
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
                        <AiGenerationSuggestion style={{ paddingTop: "var(--spacing-md)", paddingBottom: "var(--spacing-md)" }}>
                          <AiGenerationSuggestionEntities>
                            <Entity
                              title="Automate Campaign"
                              description="Automate your campaigns, ad sets, and ads using an automation feed."
                              leading={<Icon name="automation_feeds" size={20} />}
                              persistentActions={<Icon name="chevron_right" size={16} />}
                            />
                            <Entity
                              title="Set campaign objective"
                              description="Select the goal for your campaign to guide optimization and setup."
                              leading={<Icon name="emoji_flags" size={20} />}
                              persistentActions={<Icon name="chevron_right" size={16} />}
                            />
                            <Entity
                              title="Select conversion location"
                              description="Choose where your conversions will happen (e.g. website, app, or lead form)."
                              leading={<Icon name="ads_click" size={20} />}
                              persistentActions={<Icon name="chevron_right" size={16} />}
                            />
                          </AiGenerationSuggestionEntities>
                        </AiGenerationSuggestion>
                        <kb.Sources itemName="sources" hideRowAction />
                      </div>
                    ),
                  } : m),
                } : s
              ));
              setScenarioStep(6);
            },
          );
        },
      );
    };

    const finalSlot = (
      <CampaignPlanTask
        ref={planRef as RefObject<PlanTaskHandle>}
        steps={planSteps}
        onEdit={() => handlePlanEditStart(aiId)}
        onStart={handlePlanStart}
        onComplete={handlePlanComplete}
        planDetailsCode={PLAN_DETAILS_CODE}
      />
    );

    const aiMsg = {
      id: aiId,
      role: "assistant" as const,
      phase: "loading" as const,
      text: "",
      loadingLabel: LOADING_LABELS[0],
      cotContent: buildLoadingCot(LOADING_LABELS, 0),
      showFeedback: true,
      onFeedbackChange: chat.setFeedback(aiId),
    };

    chat.activeAssistIdRef.current = aiId;
    flushSync(() => {
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S1_CONFIG.id ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    setScenarioStep(5);

    LOADING_LABELS.forEach((_label, i) => {
      if (i === 0) return;
      setTimeout(() => {
        if (chat.activeAssistIdRef.current !== aiId) return;
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S1_CONFIG.id ? {
            ...s,
            messages: s.messages.map((m) => m.id === aiId ? {
              ...m,
              loadingLabel: LOADING_LABELS[i],
              cotContent: buildLoadingCot(LOADING_LABELS, i),
            } : m),
          } : s
        ));
      }, i * 1500);
    });

    setTimeout(() => {
      if (chat.activeAssistIdRef.current !== aiId) return;
      chat.streamAiMessage(
        S1_CONFIG.id, aiId,
        `<p>I have prepared a plan to create the campaign. Please confirm the plan by clicking start.</p>`,
        () => {
          chat.setScenarios((prev) => prev.map((s) =>
            s.id === S1_CONFIG.id ? {
              ...s,
              messages: s.messages.map((m) => m.id === aiId ? {
                ...m,
                cotContent: buildFinalReasoningCot(LOADING_LABELS),
                slot: finalSlot,
              } : m),
            } : s
          ));
        },
        true,
      );
    }, LOADING_LABELS.length * 1500 + 400);
  }, [selectedAdAccountId, workspaceChoice, selectedWorkspaceId, campaignNameInput, chat, handlePlanEditStart, kb]);

  /* ── Trigger menus + recommendations for the default PromptInput ── */

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

  const POST_CREATION_RECOMMENDATIONS = buildPostCreationRecommendations(
    (name) => <Icon name={name as never} size={16} />,
    chat.focusPromptTextarea,
  );

  /* ── Render: prompt area + ScenarioGuide ──────────────────────────── */

  const promptArea: ReactNode = scenarioStep === 4 ? (
    <PromptOptionInput
      label="Select an Ad account"
      search={{ value: adAccountSearch, onChange: setAdAccountSearch, placeholder: "Search ad accounts…" }}
      hasValue={selectedAdAccountId !== null}
      isLastStep
      onClose={() => setScenarioStep(0)}
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
  ) : scenarioStep === 2 && workspaceChoice === "new" ? (
    <PromptOptionInput
      label="Input your workspace name"
      steps={{ current: 2, total: 2, onPrev: () => setScenarioStep(1) }}
      input={{ value: campaignNameInput, onChange: setCampaignNameInput, placeholder: "e.g. Summer 2026 – Run BMW" }}
      hasValue={campaignNameInput.length > 0}
      isLastStep
      onClose={() => setScenarioStep(0)}
      onSkip={handleFinalSubmit}
      onSubmit={handleFinalSubmit}
    />
  ) : scenarioStep === 2 && workspaceChoice === "existing" ? (
    <PromptOptionInput
      label="Select an existing workspace"
      steps={{ current: 2, total: 2, onPrev: () => setScenarioStep(1) }}
      search={{ value: workspaceSearch, onChange: setWorkspaceSearch, placeholder: "Search workspaces…" }}
      hasValue={selectedWorkspaceId !== null}
      isLastStep
      onClose={() => setScenarioStep(0)}
      onSkip={handleFinalSubmit}
      onSubmit={handleFinalSubmit}
    >
      {WORKSPACES
        .filter((w) => w.name.toLowerCase().includes(workspaceSearch.toLowerCase()))
        .map((w) => (
          <SingleSelectOption
            key={w.id}
            leading={<Icon name={`${w.platform}_color` as never} size={20} />}
            labelText={w.name}
            description={false}
            checked={selectedWorkspaceId === w.id}
            onChange={() => setSelectedWorkspaceId(w.id)}
          />
        ))}
    </PromptOptionInput>
  ) : scenarioStep === 1 ? (
    <PromptOptionInput
      label="Where should this campaign live?"
      onClose={() => setScenarioStep(0)}
      onSkip={() => setScenarioStep(0)}
      hasValue={false}
      isLastStep={false}
    >
      <GenericSelectOption
        labelText="Create a new workspace"
        description={false}
        leading={<Icon name="add_circle" size={16} />}
        onClick={() => handleWorkspaceSelect("new")}
      />
      <GenericSelectOption
        labelText="Use an existing workspace"
        description={false}
        leading={<Icon name="topic" size={16} />}
        onClick={() => handleWorkspaceSelect("existing")}
      />
    </PromptOptionInput>
  ) : (
    <PromptInput
      onSubmit={handleSubmit}
      loading={chat.isGenerating}
      onStop={chat.handleStop}
      triggerMenus={TRIGGER_MENUS}
      contextItems={chat.contextItems}
      onContextItemsChange={chat.setContextItems}
      onAttachedFilesChange={chat.setAttachedFiles}
    >
      {scenarioStep === 6 && (
        <PromptInputRecommendations title="Enrich campaign by:" items={POST_CREATION_RECOMMENDATIONS} />
      )}
      {editingPlanId && (
        <PromptInputInfo
          type="edit"
          title="Editing campaign creation plan"
          onAction={handleCancelEdit}
        />
      )}
      <PromptInputAttachments />
      <PromptInputTextarea
        placeholder="Ask Smartly…"
        animatedPlaceholders={[
          "Summarize your capabilities",
          "Create an automation feed",
          "Set up a new campaign for summer 2026",
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

  /* ── Guide ─────────────────────────────────────────────────────────── */

  const guide = getS1Guide({ scenarioStep, workspaceChoice, editingPlanId, hasEditedPlan, fieldsApplied });

  return (
    <>
      {promptArea}
      {guide && <ScenarioGuide className={guideClassName}>{guide}</ScenarioGuide>}
    </>
  );
}
S1Scenario.displayName = "S1Scenario";

/** Resolves the guide message for the current s-1 state. Returns null when no
 *  guidance applies (transient steps, post-Apply). */
function getS1Guide(args: {
  scenarioStep: number;
  workspaceChoice: "new" | "existing" | null;
  editingPlanId: string | null;
  hasEditedPlan: boolean;
  fieldsApplied: boolean;
}): ReactNode {
  const { scenarioStep, workspaceChoice, editingPlanId, hasEditedPlan, fieldsApplied } = args;
  if (scenarioStep === 0) {
    return <>Submit a prompt to start (e.g. <em>"Create a new campaign for summer 2026"</em>).</>;
  }
  if (scenarioStep === 1) {
    return <>Pick <strong>Use an existing workspace</strong>.</>;
  }
  if (scenarioStep === 2 && workspaceChoice === "existing") {
    return <>Pick <strong>BMW Global</strong> and submit.</>;
  }
  if (scenarioStep === 4 && !hasEditedPlan) {
    return <>Pick an ad account (e.g. <strong>BMW Global Meta Ads</strong>) and submit.</>;
  }
  if (scenarioStep === 5 && !editingPlanId && !hasEditedPlan) {
    return <>Click <strong>Edit</strong> on the plan to swap the ad account.</>;
  }
  if (scenarioStep === 5 && editingPlanId) {
    return <>Type any message and submit to update the plan.</>;
  }
  if (scenarioStep === 4 && hasEditedPlan) {
    return <>Pick a <strong>different</strong> ad account and submit.</>;
  }
  if (scenarioStep === 5 && !editingPlanId && hasEditedPlan) {
    return <>Click <strong>Start</strong> on the plan.</>;
  }
  if (scenarioStep === 6) {
    return <>Click the <strong>add-to-context</strong> icon on the campaign preview, attach a file via <strong>+</strong> or drag-drop, then submit.</>;
  }
  if (scenarioStep === 7 && !fieldsApplied) {
    return <>Click <strong>Apply</strong> on the campaign-field card.</>;
  }
  return null;
}
