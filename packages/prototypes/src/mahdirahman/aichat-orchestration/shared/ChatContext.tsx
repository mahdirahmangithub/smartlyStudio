import { createContext, useContext, useRef, useState, useCallback, type RefObject, type Dispatch, type SetStateAction } from "react";
import { flushSync } from "react-dom";
import type { AiThreadHandle, AiThreadMessage } from "@sds/components/AiThread";
import type { PromptInputContextItem } from "@sds/components/PromptInput";
import type { FeedbackValue } from "@sds/components/FeedbackBoolean";

/**
 * Shared chat infrastructure used by every scenario:
 *   - the messages array per scenario + the active scenario id
 *   - generic helpers (streamAiMessage, focusPromptTextarea, handleStop)
 *   - prompt-row state (contextItems, attachedFiles)
 *   - cross-cutting refs (threadRef, planRefsMap, in-flight assistant id)
 *
 * Scenarios consume this via the `useChat()` hook and own their own per-step
 * state internally. They never reach into other scenarios' state — only the
 * shared message array, which they identify by their own scenario id.
 */

export interface ScenarioRecord {
  id: string;
  label: string;
  messages: AiThreadMessage[];
  pinned: boolean;
  order: number;
}

/** Public API a scenario component can imperatively call (rare). */
export interface PlanTaskHandle {
  startEdit: () => void;
  cancelEdit: () => void;
  markEdited: () => void;
  stop: () => void;
}

export interface ChatContextValue {
  /* ── Scenarios ── */
  scenarios: ScenarioRecord[];
  setScenarios: Dispatch<SetStateAction<ScenarioRecord[]>>;
  activeScenarioId: string;
  setActiveScenarioId: (id: string) => void;
  activeMessages: AiThreadMessage[];

  /* ── Thread + prompt refs ── */
  threadRef: RefObject<AiThreadHandle | null>;
  promptRef: RefObject<HTMLDivElement | null>;
  focusPromptTextarea: () => void;

  /* ── Stream / stop coordination ── */
  streamRef: RefObject<ReturnType<typeof setInterval> | null>;
  activeAssistIdRef: RefObject<string | null>;
  streamAiMessage: (
    scenarioId: string,
    msgId: string,
    fullText: string,
    onComplete?: () => void,
    skipLoading?: boolean,
  ) => void;
  handleStop: () => void;
  isGenerating: boolean;

  /* ── Prompt row ── */
  contextItems: PromptInputContextItem[];
  setContextItems: Dispatch<SetStateAction<PromptInputContextItem[]>>;
  addContextItem: (item: PromptInputContextItem) => void;
  attachedFiles: File[];
  setAttachedFiles: Dispatch<SetStateAction<File[]>>;

  /* ── Plan running coordination (s-1's CampaignPlanTask drives stop button) ── */
  runningPlanId: string | null;
  setRunningPlanId: Dispatch<SetStateAction<string | null>>;
  runningPlanIdRef: RefObject<string | null>;
  planRefsMap: RefObject<Map<string, RefObject<PlanTaskHandle | null>>>;

  /* ── Per-message feedback state writer ── */
  setFeedback: (msgId: string) => (value: FeedbackValue) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}

interface ChatProviderProps {
  initialScenarios: ScenarioRecord[];
  initialActiveScenarioId: string;
  threadRef: RefObject<AiThreadHandle | null>;
  promptRef: RefObject<HTMLDivElement | null>;
  children: (value: ChatContextValue) => React.ReactNode;
}

/**
 * Provider that wires up all the shared chat infrastructure. Renders its
 * children via a render-prop so the page can reach into the value (e.g. to
 * read activeScenarioId for routing) while still being inside the provider.
 */
export function ChatProvider({
  initialScenarios,
  initialActiveScenarioId,
  threadRef,
  promptRef,
  children,
}: ChatProviderProps) {
  const [scenarios, setScenarios] = useState<ScenarioRecord[]>(initialScenarios);
  const [activeScenarioIdState, setActiveScenarioIdState] = useState(initialActiveScenarioId);

  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeAssistIdRef = useRef<string | null>(null);

  const focusPromptTextarea = useCallback(() => {
    promptRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus();
  }, [promptRef]);

  // Cancel any in-flight stream when the active scenario changes — scenarios
  // own their own message lifecycles, so we don't want s-1's pending updates
  // landing in s-6's bubble (or vice-versa).
  const setActiveScenarioId = useCallback((id: string) => {
    if (streamRef.current) { clearInterval(streamRef.current); streamRef.current = null; }
    activeAssistIdRef.current = null;
    setActiveScenarioIdState(id);
  }, []);

  const streamAiMessage = useCallback((
    scenarioId: string,
    msgId: string,
    fullText: string,
    onComplete?: () => void,
    skipLoading = false,
  ) => {
    if (streamRef.current) clearInterval(streamRef.current);
    activeAssistIdRef.current = msgId;

    const LOADING_MS = skipLoading ? 0 : 800;
    const CHARS_PER_TICK = 4;
    const TICK_MS = 25;

    const startGenerating = () => {
      if (activeAssistIdRef.current !== msgId) return;
      let idx = 0;
      streamRef.current = setInterval(() => {
        if (activeAssistIdRef.current !== msgId) {
          if (streamRef.current) { clearInterval(streamRef.current); streamRef.current = null; }
          return;
        }
        idx += CHARS_PER_TICK;
        const done = idx >= fullText.length;
        const slice = done ? fullText : fullText.slice(0, idx);
        setScenarios((prev) => prev.map((s) =>
          s.id === scenarioId
            ? { ...s, messages: s.messages.map((m) => m.id === msgId ? { ...m, phase: done ? "done" as const : "generating" as const, text: slice } : m) }
            : s
        ));
        if (done) {
          if (streamRef.current) { clearInterval(streamRef.current); streamRef.current = null; }
          activeAssistIdRef.current = null;
          onComplete?.();
        }
      }, TICK_MS);
    };

    if (skipLoading) {
      startGenerating();
    } else {
      setScenarios((prev) => prev.map((s) =>
        s.id === scenarioId
          ? { ...s, messages: s.messages.map((m) => m.id === msgId ? { ...m, phase: "loading" as const, text: "" } : m) }
          : s
      ));
      setTimeout(startGenerating, LOADING_MS);
    }
  }, []);

  const [contextItems, setContextItems] = useState<PromptInputContextItem[]>([]);
  const addContextItem = useCallback((item: PromptInputContextItem) => {
    setContextItems((prev) => prev.some((c) => c.id === item.id) ? prev : [...prev, item]);
  }, []);

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const [runningPlanId, setRunningPlanId] = useState<string | null>(null);
  const runningPlanIdRef = useRef<string | null>(null);
  const planRefsMap = useRef<Map<string, RefObject<PlanTaskHandle | null>>>(new Map());

  const handleStop = useCallback(() => {
    const planId = runningPlanIdRef.current;
    if (planId) {
      planRefsMap.current.get(planId)?.current?.stop();
      runningPlanIdRef.current = null;
      setRunningPlanId(null);
      focusPromptTextarea();
      return;
    }
    const aiId = activeAssistIdRef.current;
    if (!aiId) return;
    activeAssistIdRef.current = null;
    if (streamRef.current) { clearInterval(streamRef.current); streamRef.current = null; }
    setScenarios((prev) => prev.map((s) => ({
      ...s,
      messages: s.messages.map((m) => m.id === aiId ? { ...m, phase: "done" as const } : m),
    })));
    focusPromptTextarea();
  }, [focusPromptTextarea]);

  const setFeedback = useCallback((msgId: string) => (value: FeedbackValue) => {
    setScenarios((prev) => prev.map((s) => ({
      ...s,
      messages: s.messages.map((m) =>
        m.id === msgId && m.role === "assistant" ? { ...m, feedbackValue: value } : m
      ),
    })));
  }, []);

  const activeMessages = scenarios.find((s) => s.id === activeScenarioIdState)?.messages ?? [];

  // The prompt's "loading" state covers both AI streaming and plan progression
  // — both are async work the user might want to cancel via the stop button.
  const lastMsg = activeMessages[activeMessages.length - 1];
  const isStreaming = lastMsg?.role === "assistant"
    && (lastMsg.phase === "loading" || lastMsg.phase === "generating");
  const isGenerating = isStreaming || runningPlanId !== null;

  // Keep the runningPlanId ref in sync so handleStop can read synchronously.
  if (runningPlanIdRef.current !== runningPlanId) {
    runningPlanIdRef.current = runningPlanId;
  }

  const value: ChatContextValue = {
    scenarios,
    setScenarios,
    activeScenarioId: activeScenarioIdState,
    setActiveScenarioId,
    activeMessages,
    threadRef,
    promptRef,
    focusPromptTextarea,
    streamRef,
    activeAssistIdRef,
    streamAiMessage,
    handleStop,
    isGenerating,
    contextItems,
    setContextItems,
    addContextItem,
    attachedFiles,
    setAttachedFiles,
    runningPlanId,
    setRunningPlanId,
    runningPlanIdRef,
    planRefsMap,
    setFeedback,
  };

  return (
    <ChatContext.Provider value={value}>
      {children(value)}
    </ChatContext.Provider>
  );
}

export { flushSync };
