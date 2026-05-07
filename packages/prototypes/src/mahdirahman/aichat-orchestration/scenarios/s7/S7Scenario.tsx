import { useState, useCallback, type ReactNode } from "react";
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
import { CotContainer, CotItem, Cot } from "@sds/components/Cot";
import {
  KNOWLEDGE_BASE_CONFIG,
  useCitationGroup,
} from "@sds/components/AiEntityPreview";
import { useChat } from "../../shared/ChatContext";
import { ScenarioGuide } from "../../shared/ScenarioGuide";
import { KB_LABELS, KB_RESPONSE_HTML, KB_SOURCES } from "./constants";

export const S7_CONFIG = {
  id: "s-7",
  label: "Conversation with Knowledge base",
} as const;

interface S7ScenarioProps {
  guideClassName?: string;
}

const buildKbCot = (completedUpTo: number) => (
  <CotContainer type="reasoning">
    <Cot>
      {KB_LABELS.map((label, i) => (
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

const finalKbCot = (
  <CotContainer type="reasoning" title="Talked to Knowledge base">
    <Cot>
      {KB_LABELS.map((label, i) => (
        <CotItem key={i} title={label} variant="dot" status="complete" />
      ))}
    </Cot>
  </CotContainer>
);

/**
 * Scenario s-7 — "Conversation with Knowledge base".
 *
 * Step 0: user submits a question. Assistant cycles two loading labels with
 * a reasoning cot ("Talking to knowledge base" → "Gathering Sales objective"),
 * then transitions to a generating bubble whose cot is retitled "Talked with
 * Knowledge base" and streams the long markdown answer.
 */
export function S7Scenario({ guideClassName }: S7ScenarioProps) {
  const chat = useChat();
  const [scenarioStep, setScenarioStep] = useState(0);

  // KB citation group — bound to KB_SOURCES; produces numbered inline
  // <Citation> chips and a <Sources> multi-mode preview with hover sync.
  const kb = useCitationGroup({ config: KNOWLEDGE_BASE_CONFIG, data: KB_SOURCES });

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
      const aiId = `a-${Date.now() + 1}`;

      const aiMsg = {
        id: aiId,
        role: "assistant" as const,
        phase: "loading" as const,
        text: "",
        loadingLabel: KB_LABELS[0],
        cotContent: buildKbCot(0),
        components: {
          "entity-preview": (attrs: Record<string, string>) => <kb.Citation id={attrs.id} />,
        },
      };

      chat.activeAssistIdRef.current = aiId;
      flushSync(() => {
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S7_CONFIG.id ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
        ));
      });
      chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
      setScenarioStep(1);

      // Cycle to second label/cot stage after 1.5s.
      setTimeout(() => {
        if (chat.activeAssistIdRef.current !== aiId) return;
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S7_CONFIG.id ? {
            ...s,
            messages: s.messages.map((m) => m.id === aiId ? {
              ...m,
              loadingLabel: KB_LABELS[1],
              cotContent: buildKbCot(1),
            } : m),
          } : s
        ));
      }, 1500);

      // After both labels complete, retitle the cot and stream the response.
      // Atomically flip phase + cotContent + clear loadingLabel before the
      // first stream tick so the bubble doesn't briefly show the dropdown
      // version of the cot with the new title.
      setTimeout(() => {
        if (chat.activeAssistIdRef.current !== aiId) return;
        chat.setScenarios((prev) => prev.map((s) =>
          s.id === S7_CONFIG.id ? {
            ...s,
            messages: s.messages.map((m) => m.id === aiId ? {
              ...m,
              phase: "generating" as const,
              text: "",
              loadingLabel: undefined,
              cotContent: finalKbCot,
            } : m),
          } : s
        ));
        chat.streamAiMessage(
          S7_CONFIG.id, aiId,
          KB_RESPONSE_HTML,
          () => {
            // After streaming completes, attach the source list as the slot.
            chat.setScenarios((prev) => prev.map((s) =>
              s.id === S7_CONFIG.id ? {
                ...s,
                messages: s.messages.map((m) => m.id === aiId ? {
                  ...m,
                  slot: (
                    <kb.Sources
                      itemName="sources"
                      onRowAction={(article) => chat.addContextItem({
                        id: article.id,
                        icon: "auto_stories",
                        label: article.title,
                      })}
                    />
                  ),
                } : m),
              } : s
            ));
          },
          true,
        );
      }, KB_LABELS.length * 1500 + 200);

      chat.focusPromptTextarea();
      return;
    }

    // Default: just push the user message.
    flushSync(() => {
      chat.setScenarios((prev) => prev.map((s) =>
        s.id === S7_CONFIG.id ? { ...s, messages: [...s.messages, userMsg] } : s
      ));
    });
    chat.threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    chat.focusPromptTextarea();
  }, [scenarioStep, chat, kb]);

  const guide: ReactNode = scenarioStep === 0
    ? <>Submit: <em>"How I can Create a Meta campaign?"</em></>
    : null;

  return (
    <>
      <PromptInput
        onSubmit={handleSubmit}
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
S7Scenario.displayName = "S7Scenario";
