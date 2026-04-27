import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle, createRef, type ReactNode, type RefObject } from "react";
import { flushSync } from "react-dom";
import { NavBarContent } from "../components/NavBarContent";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { NavigationBrandItem } from "../components/NavigationBrandItem";
import { NavigationItem } from "../components/NavigationItem";
import { NavigationCategoryItem } from "../components/NavigationCategoryItem";
import { NavigationSubItem } from "../components/NavigationSubItem";
import { Dropdown } from "../components/Dropdown";
import { GenericSelectOption } from "../components/GenericSelectOption";
import { SingleSelectOption } from "../components/SingleSelectOption";
import { OptionSeparator } from "../components/OptionSeparator";
import { Grid, Col } from "../components/Grid";
import { AiThread, AiThreadIntro, AiThreadIntroActions, type AiThreadMessage, type AiThreadHandle } from "../components/AiThread";
import { CotContainer, CotItem, Cot } from "../components/Cot";
import { AiEntityPreviewInlineTyped, AiEntityPreviewTyped, AiEntityPreviewMultipleTyped, WORKSPACE_CONFIG, CAMPAIGN_CONFIG, CAMPAIGN_FIELD_CONFIG, type Workspace, type Campaign, type CampaignField } from "../components/AiEntityPreview";
import { AiGenerationSuggestion, AiGenerationSuggestionEntities } from "../components/AiGenerationSuggestion";
import { Entity } from "../components/Entity";
import { BodyText } from "../components/BodyText";
import type { FeedbackValue } from "../components/FeedbackBoolean";
import { EmptyState } from "../components/EmptyState";
import { ActionCard } from "../components/ActionCard";
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
  type RecommendationItem,
  type PromptInputContextItem,
} from "../components/PromptInput";
import { PromptOptionInput } from "../components/PromptOptionInput";
import { IconButton } from "../components/IconButton";
import { Icon } from "../components/Icon";
import { TitleText } from "../components/TitleText";
import styles from "./AiChatPage.module.css";

function ChatHistoryItem({
  label,
  pinned,
  checked,
  onSelect,
  onPinToTop,
  onUnpin,
}: {
  label: string;
  pinned?: boolean;
  checked?: boolean;
  onSelect?: () => void;
  onPinToTop?: () => void;
  onUnpin?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={anchorRef}>
        <NavigationSubItem
          label={label}
          pinned={pinned}
          checked={checked}
          onClick={onSelect}
          actionIcon="more_horiz"
          actionLabel="More options"
          onAction={() => setOpen((v) => !v)}
        />
      </div>
      <Dropdown
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        placement="bottom-start"
        width={200}
      >
        <GenericSelectOption
          labelText="Share"
          description={false}
          leading={<Icon name="link" size={16} />}
          onClick={() => setOpen(false)}
        />
        <GenericSelectOption
          labelText="Rename"
          description={false}
          leading={<Icon name="edit" size={16} />}
          onClick={() => setOpen(false)}
        />
        {pinned ? (
          <GenericSelectOption
            labelText="Unpin"
            description={false}
            leading={<Icon name="keep_off" size={16} />}
            onClick={() => { onUnpin?.(); setOpen(false); }}
          />
        ) : (
          <GenericSelectOption
            labelText="Pin to top"
            description={false}
            leading={<Icon name="keep" size={16} />}
            onClick={() => { onPinToTop?.(); setOpen(false); }}
          />
        )}
        <OptionSeparator />
        <GenericSelectOption
          labelText="Delete"
          description={false}
          leading={<Icon name="delete" size={16} />}
          alert
          onClick={() => setOpen(false)}
        />
      </Dropdown>
    </>
  );
}

type DrillLevel = null | "theme" | "typeface";
type Theme = "light" | "dark" | "dusk";
type Typeface = "mac" | "windows" | "marketing" | "inter";

function SettingsMenu({
  sidebarExpanded,
  theme,
  setTheme,
  typeface,
  setTypeface,
}: {
  sidebarExpanded: boolean;
  theme: Theme;
  setTheme: (t: Theme) => void;
  typeface: Typeface;
  setTypeface: (f: Typeface) => void;
}) {
  const [open, setOpen] = useState(false);
  const [drill, setDrill] = useState<DrillLevel>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

  const close = () => { setOpen(false); setDrill(null); };

  const THEMES: { value: Theme; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark",  label: "Dark" },
    { value: "dusk",  label: "Dusk" },
  ];

  const TYPEFACES: { value: Typeface; label: string }[] = [
    { value: "mac",       label: "Mac" },
    { value: "windows",   label: "Windows" },
    { value: "marketing", label: "Marketing" },
    { value: "inter",     label: "Inter" },
  ];

  const renderBack = (label: string) => (
    <GenericSelectOption
      labelText={label}
      description={false}
      leading={<Icon name="chevron_left" size={16} />}
      onClick={() => setDrill(null)}
    />
  );


  let dropdownContent: ReactNode;

  if (drill === "theme") {
    dropdownContent = (
      <>
        {renderBack("Theme")}
        {THEMES.map((t) => (
          <SingleSelectOption
            key={t.value}
            labelText={t.label}
            description={false}
            checked={theme === t.value}
            onChange={() => { setTheme(t.value); close(); }}
          />
        ))}
      </>
    );
  } else if (drill === "typeface") {
    dropdownContent = (
      <>
        {renderBack("Font Face")}
        {TYPEFACES.map((f) => (
          <SingleSelectOption
            key={f.value}
            labelText={f.label}
            description={false}
            checked={typeface === f.value}
            onChange={() => { setTypeface(f.value); close(); }}
          />
        ))}
      </>
    );
  } else {
    dropdownContent = (
      <>
        <GenericSelectOption
          labelText="Theme"
          description={false}
          leading={<Icon name={theme === "light" ? "sunny" : "dark_mode"} size={16} />}
          subMenu
          onClick={() => setDrill("theme")}
        />
        <GenericSelectOption
          labelText="Font Face"
          description={false}
          leading={<Icon name="text_layer" size={16} />}
          subMenu
          onClick={() => setDrill("typeface")}
        />
      </>
    );
  }

  return (
    <div ref={anchorRef}>
      <NavigationItem
        label="Settings"
        leadingIcon={<Icon name="settings" size={20} />}
        iconOnly={!sidebarExpanded}
        onClick={() => { setOpen((v) => !v); setDrill(null); }}
      />
      <Dropdown
        open={open}
        onClose={close}
        anchorRef={anchorRef}
        placement="right-start"
        width={200}
      >
        {dropdownContent}
      </Dropdown>
    </div>
  );
}

interface CampaignPlanStep {
  title: string;
  description: string;
}

export interface CampaignPlanTaskHandle {
  startEdit: () => void;
  cancelEdit: () => void;
  markEdited: () => void;
  /** Stop a running plan progression and reset to idle. */
  stop: () => void;
}

const CampaignPlanTask = forwardRef<CampaignPlanTaskHandle, { steps: CampaignPlanStep[]; onEdit?: () => void; onStart?: () => void; onComplete?: () => void }>(
  ({ steps, onEdit, onStart, onComplete }, ref) => {
    const [status, setStatus] = useState<"idle" | "running" | "cancelled" | "completed" | "editing" | "edited">("idle");
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // Guards onComplete from firing twice — React StrictMode double-invokes
    // state updater functions in dev, which would otherwise duplicate side effects.
    const completedRef = useRef(false);

    useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

    useImperativeHandle(ref, () => ({
      startEdit: () => setStatus("editing"),
      cancelEdit: () => setStatus("idle"),
      markEdited: () => setStatus("edited"),
      stop: () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        completedRef.current = false;
        setStatus("idle");
        setProgress(0);
      },
    }));

    const handleEdit = () => {
      setStatus("editing");
      onEdit?.();
    };

    const handleStart = () => {
      setStatus("running");
      setProgress(0);
      completedRef.current = false;
      onStart?.();
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          const next = p + 2;
          if (next >= 100) {
            if (!completedRef.current) {
              completedRef.current = true;
              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = null;
              setStatus("completed");
              onComplete?.();
            }
            return 100;
          }
          return next;
        });
      }, 80);
    };

    const handleStop = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setStatus("idle");
    };

    const handleCancel = () => {
      handleStop();
      setProgress(0);
      setStatus("cancelled");
    };

    return (
      <CotContainer
        type="task"
        title="Campaign creation plan"
        defaultExpanded
        status={status}
        progress={progress}
        onStart={status === "idle" ? handleStart : undefined}
        onStop={status === "running" ? handleStop : undefined}
        onCancel={status === "idle" ? handleCancel : undefined}
        onEdit={status === "idle" ? handleEdit : undefined}
      >
        <Cot>
          {steps.map((step, i) => (
            <CotItem
              key={i}
              variant="todo"
              title={step.title}
              description={step.description}
              connector={i < steps.length - 1}
            />
          ))}
        </Cot>
      </CotContainer>
    );
  },
);
CampaignPlanTask.displayName = "CampaignPlanTask";

// Self-driven task cot that animates progress 0 → 100 from mount, transitions
// to "completed" when done, and notifies the parent via onComplete. Used by
// the "Apply campaign fields" flow after the user accepts extracted values.
function UpdateFieldsTask({
  fields,
  onComplete,
}: {
  fields: CampaignField[];
  onComplete: () => void;
}) {
  const [status, setStatus] = useState<"running" | "completed">("running");
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + 2;
        if (next >= 100) {
          if (!completedRef.current) {
            completedRef.current = true;
            clearInterval(id);
            setStatus("completed");
            onCompleteRef.current();
          }
          return 100;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(id);
  }, []);

  return (
    <CotContainer
      type="task"
      title="Update campaign fields"
      defaultExpanded
      status={status}
      progress={progress}
    >
      <Cot>
        {fields.map((f) => (
          <CotItem
            key={f.id}
            variant="icon"
            icon={<Icon name={f.icon} size={16} aria-hidden />}
            title={f.fieldName}
            description={`apply ${f.value}`}
          />
        ))}
      </Cot>
    </CotContainer>
  );
}
UpdateFieldsTask.displayName = "UpdateFieldsTask";

export default function AiChatPage() {
  const [expanded, setExpanded] = useState(false);
  const [agentsExpanded, setAgentsExpanded] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [typeface, setTypeface] = useState<Typeface>("mac");

  const mainScrollRef = useRef<HTMLElement>(null);
  const threadRef = useRef<AiThreadHandle>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const [promptHeight, setPromptHeight] = useState(0);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Active assistant message id during generation. Pending setTimeouts and the
  // streaming interval check this ref before doing work — handleStop sets it
  // to null to short-circuit any further updates.
  const activeAssistIdRef = useRef<string | null>(null);

  useEffect(() => {
    const el = promptRef.current;
    if (!el) return;
    // Use border-box (full element height incl. padding) so the calc accounts
    // for the wrapper's padding-bottom — contentRect would exclude it and
    // leave the page slightly taller than the viewport.
    const update = () => setPromptHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Per-message feedback handler — updates the message's feedbackValue in
  // place so the FeedbackBoolean inside the bubble reflects the chosen state.
  const setFeedback = useCallback((msgId: string) => (value: FeedbackValue) => {
    setScenarios((prev) => prev.map((s) => ({
      ...s,
      messages: s.messages.map((m) =>
        m.id === msgId && m.role === "assistant" ? { ...m, feedbackValue: value } : m
      ),
    })));
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
      // Bail if the user stopped (or moved on) while loading was pending.
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

  interface Scenario {
    id: string;
    label: string;
    messages: AiThreadMessage[];
    pinned: boolean;
    order: number;
  }

  const [scenarioStep, setScenarioStep] = useState(0);
  const [workspaceChoice, setWorkspaceChoice] = useState<"new" | "existing" | null>(null);
  const [campaignNameInput, setCampaignNameInput] = useState("");
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [adAccountSearch, setAdAccountSearch] = useState("");
  const [selectedAdAccountId, setSelectedAdAccountId] = useState<string | null>(null);

  const WORKSPACES: Workspace[] = [
    { id: "w-1",  name: "BMW Global",            platform: "Meta",      campaignCount: 8,  adSetCount: 24, adCount: 72  },
    { id: "w-2",  name: "Nike EMEA",             platform: "Google",    campaignCount: 5,  adSetCount: 15, adCount: 45  },
    { id: "w-3",  name: "Acme Corp",             platform: "TikTok",    campaignCount: 3,  adSetCount: 9,  adCount: 27  },
    { id: "w-4",  name: "Unilever NA",           platform: "Meta",      campaignCount: 12, adSetCount: 38, adCount: 104 },
    { id: "w-5",  name: "Adidas APAC",           platform: "TikTok",    campaignCount: 6,  adSetCount: 18, adCount: 54  },
    { id: "w-6",  name: "Spotify Brand",         platform: "Google",    campaignCount: 4,  adSetCount: 12, adCount: 36  },
    { id: "w-7",  name: "Zara EU",               platform: "Meta",      campaignCount: 9,  adSetCount: 27, adCount: 81  },
    { id: "w-8",  name: "L'Oréal Global",        platform: "Pinterest", campaignCount: 7,  adSetCount: 21, adCount: 63  },
    { id: "w-9",  name: "Sephora Beauty",        platform: "Snapchat",  campaignCount: 5,  adSetCount: 15, adCount: 45  },
    { id: "w-10", name: "Coca-Cola US",          platform: "Meta",      campaignCount: 11, adSetCount: 33, adCount: 99  },
    { id: "w-11", name: "Pepsi Latam",           platform: "TikTok",    campaignCount: 6,  adSetCount: 18, adCount: 54  },
    { id: "w-12", name: "Heineken EU",           platform: "Google",    campaignCount: 4,  adSetCount: 12, adCount: 36  },
    { id: "w-13", name: "Toyota Motor Co",       platform: "Meta",      campaignCount: 8,  adSetCount: 24, adCount: 72  },
    { id: "w-14", name: "Samsung Mobile",        platform: "Google",    campaignCount: 10, adSetCount: 30, adCount: 90  },
    { id: "w-15", name: "Netflix Originals",     platform: "TikTok",    campaignCount: 7,  adSetCount: 21, adCount: 63  },
    { id: "w-16", name: "Airbnb Travel",         platform: "Pinterest", campaignCount: 5,  adSetCount: 15, adCount: 45  },
    { id: "w-17", name: "Uber Mobility",         platform: "Meta",      campaignCount: 6,  adSetCount: 18, adCount: 54  },
    { id: "w-18", name: "Shopify Merchants",     platform: "Google",    campaignCount: 4,  adSetCount: 12, adCount: 36  },
  ];

  const AD_ACCOUNTS = [
    { id: "aa-1",  label: "BMW Global Meta Ads" },
    { id: "aa-2",  label: "BMW EU Meta Ads" },
    { id: "aa-3",  label: "BMW US Meta Ads" },
    { id: "aa-4",  label: "BMW Motorrad Meta Ads" },
    { id: "aa-5",  label: "BMW M Performance Meta Ads" },
    { id: "aa-6",  label: "BMW i Electric Meta Ads" },
    { id: "aa-7",  label: "MINI Cooper Meta Ads" },
    { id: "aa-8",  label: "Rolls-Royce Motor Cars Meta Ads" },
  ];

  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: "s-1", label: "Campaign Creation",               messages: [],                      pinned: false, order: 0 },
    { id: "s-2", label: "Q3 performance analysis",         messages: [],                      pinned: false, order: 1 },
    { id: "s-3", label: "Campaign brief for BMW",          messages: [],                      pinned: false, order: 2 },
    { id: "s-4", label: "Audience segmentation ideas",     messages: [],                      pinned: false, order: 3 },
    { id: "s-5", label: "TikTok creative review",          messages: [],                      pinned: false, order: 4 },
  ]);

  const [activeScenarioId, setActiveScenarioId] = useState<string>("s-1");
  const [historyExpanded, setHistoryExpanded] = useState(false);

  useEffect(() => {
    if (streamRef.current) { clearInterval(streamRef.current); streamRef.current = null; }
    activeAssistIdRef.current = null;
  }, [activeScenarioId]);

  const activeMessages = scenarios.find((s) => s.id === activeScenarioId)?.messages ?? [];

  // Tracks which plan is currently running its progress bar (after user clicks
  // Start). Mirrors via ref for synchronous access in handleStop.
  const [runningPlanId, setRunningPlanId] = useState<string | null>(null);
  const runningPlanIdRef = useRef<string | null>(null);

  // Context chips shown in the prompt input. Items are added when the user
  // clicks "Add to context" on an AiEntityPreview header.
  const [contextItems, setContextItems] = useState<PromptInputContextItem[]>([]);
  const addContextItem = useCallback((item: PromptInputContextItem) => {
    setContextItems((prev) => prev.some((c) => c.id === item.id) ? prev : [...prev, item]);
  }, []);

  // Mirror of the prompt's currently-attached files so handleSubmit can capture
  // them at submit time (PromptInput clears its internal list afterwards).
  // onAttachedFilesChange passes plain File[] — works for both add-menu and drag-drop.
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Campaign created during the plan flow — lifted to state so the post-creation
  // file-extraction step (after step 6 submit) can reference it.
  const [createdCampaign, setCreatedCampaign] = useState<Campaign | null>(null);

  const lastMsg = activeMessages[activeMessages.length - 1];
  const isStreaming = lastMsg?.role === "assistant"
    && (lastMsg.phase === "loading" || lastMsg.phase === "generating");
  // The prompt's "loading" state covers both AI streaming AND plan progression
  // — both are async work the user might want to cancel via the stop button.
  const isGenerating = isStreaming || runningPlanId !== null;

  // ── Plan-edit flow ──
  // editingPlanIdRef captures the id synchronously for use in submit callbacks;
  // planRefsMap holds a handle to each rendered plan so we can call markEdited
  // / cancelEdit on the right one.
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const editingPlanIdRef = useRef<string | null>(null);
  const planRefsMap = useRef<Map<string, RefObject<CampaignPlanTaskHandle | null>>>(new Map());

  // Restores focus to the PromptInput textarea — used after any prompt-internal
  // action (submit, stop, recommendation click) that might shift focus to a
  // button. The user only loses focus when they intentionally click elsewhere.
  const focusPromptTextarea = useCallback(() => {
    promptRef.current?.querySelector<HTMLTextAreaElement>("textarea")?.focus();
  }, []);

  const handlePlanEditStart = useCallback((planAssistId: string) => {
    setEditingPlanId(planAssistId);
    editingPlanIdRef.current = planAssistId;
    focusPromptTextarea();
  }, [focusPromptTextarea]);

  const handleCancelEdit = useCallback(() => {
    const id = editingPlanIdRef.current;
    if (id) planRefsMap.current.get(id)?.current?.cancelEdit();
    setEditingPlanId(null);
    editingPlanIdRef.current = null;
  }, []);

  const handleStop = useCallback(() => {
    // If a plan is mid-progression, stop it (no AI streaming in this case).
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
    // Clear ref FIRST so any pending setTimeout/interval callback short-circuits.
    activeAssistIdRef.current = null;
    if (streamRef.current) { clearInterval(streamRef.current); streamRef.current = null; }
    // Mark the in-flight assistant message as done with whatever text it has.
    setScenarios((prev) => prev.map((s) => ({
      ...s,
      messages: s.messages.map((m) => m.id === aiId ? { ...m, phase: "done" as const } : m),
    })));
    focusPromptTextarea();
  }, [focusPromptTextarea]);

  const handleSubmit = useCallback((value: string) => {
    // ── Edit-mode branch: user is editing an existing plan ──
    const capturedEditId = editingPlanIdRef.current;
    if (capturedEditId) {
      setEditingPlanId(null);
      editingPlanIdRef.current = null;

      const userMsg = { id: `u-${Date.now()}`, role: "user" as const, message: value, replyLabel: "Editing plan" };
      const aiId = `a-${Date.now() + 1}`;
      const aiMsg = { id: aiId, role: "assistant" as const, phase: "loading" as const, text: "" };
      flushSync(() => {
        setScenarios((prev) => prev.map((s) =>
          s.id === "s-1" ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
        ));
      });
      threadRef.current?.scrollToMessage(userMsg.id, "smooth");

      // Reset ad-account selection so the user picks a fresh one in step 4.
      setAdAccountSearch("");
      setSelectedAdAccountId(null);

      streamAiMessage(
        "s-1", aiId,
        "<p>Sure — please select a different ad account and I'll update the plan.</p>",
        () => {
          // Mark the previous plan as edited and re-show the ad-account picker.
          planRefsMap.current.get(capturedEditId)?.current?.markEdited();
          setScenarioStep(4);
        },
      );
      focusPromptTextarea();
      return;
    }

    // Snapshot files + context at submit time so the user bubble carries them
    // even though PromptInput clears attachments right after onSubmit returns.
    const attachmentsSnapshot = attachedFiles.map((file, i) => ({
      id: `att-${Date.now()}-${i}`,
      file,
      fileName: file.name,
    }));
    const contextSnapshot = contextItems;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user" as const,
      message: value,
      ...(attachmentsSnapshot.length ? { attachments: attachmentsSnapshot } : {}),
      ...(contextSnapshot.length ? { contextItems: contextSnapshot } : {}),
    };

    if (activeScenarioId === "s-1" && scenarioStep === 0) {
      const aiId = `a-${Date.now()}`;
      const aiMsg = {
        id: aiId,
        role: "assistant" as const,
        phase: "loading" as const,
        text: "",
        copyValue: "Do you want to create this campaign in a new workspace or use an existing one?",
        showFeedback: true,
        onFeedbackChange: setFeedback(aiId),
      };
      flushSync(() => {
        setScenarios((prev) => prev.map((s) =>
          s.id === "s-1" ? { ...s, messages: [userMsg, aiMsg] } : s
        ));
      });
      threadRef.current?.scrollToMessage(userMsg.id, "smooth");
      streamAiMessage(
        "s-1", aiId,
        "<p>Do you want to create this campaign in a new workspace or use an existing one?</p>",
        () => setScenarioStep(1),
      );
      focusPromptTextarea();
      return;
    }

    // ── Step 6 → Field extraction flow ──
    // After a campaign is created and the post-creation recommendations are
    // visible, the user submits a file (and optional message). The assistant
    // "extracts" fields from the attachment via a 4-stage cot then renders
    // the resulting CampaignField multiple-mode preview as a slot.
    if (activeScenarioId === "s-1" && scenarioStep === 6 && createdCampaign) {
      const aiId = `a-${Date.now() + 1}`;
      const campaign = createdCampaign;
      const aiMsg = {
        id: aiId,
        role: "assistant" as const,
        phase: "loading" as const,
        text: "",
        loadingLabel: EXTRACT_LABELS[0],
        cotContent: buildExtractCot(0),
        components: {
          "entity-preview": (_attrs: Record<string, string>) => (
            <AiEntityPreviewInlineTyped config={CAMPAIGN_CONFIG} data={campaign} />
          ),
        },
      };

      activeAssistIdRef.current = aiId;
      flushSync(() => {
        setScenarios((prev) => prev.map((s) =>
          s.id === "s-1" ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
        ));
      });
      threadRef.current?.scrollToMessage(userMsg.id, "smooth");
      setScenarioStep(7);

      // Cycle through extract labels
      EXTRACT_LABELS.forEach((_label, i) => {
        if (i === 0) return;
        setTimeout(() => {
          if (activeAssistIdRef.current !== aiId) return;
          setScenarios((prev) => prev.map((s) =>
            s.id === "s-1" ? {
              ...s,
              messages: s.messages.map((m) => m.id === aiId ? {
                ...m,
                loadingLabel: EXTRACT_LABELS[i],
                cotContent: buildExtractCot(i),
              } : m),
            } : s
          ));
        }, i * 1500);
      });

      // Stream the response after all labels complete, then attach the
      // CampaignField multiple-mode preview as the slot.
      setTimeout(() => {
        if (activeAssistIdRef.current !== aiId) return;
        streamAiMessage(
          "s-1", aiId,
          `<p>I've extracted the following data for the <entity-preview id="${campaign.id}"></entity-preview> fields. Could you review and confirm if everything looks correct? Let me know if there's anything to add so I can update the list.</p>`,
          () => {
            const fields = buildExtractedFields(campaign.name);

            // Apply click → strip actions from the campaignField slot, then
            // push a loading bubble that cycles APPLY_LABELS, transitions
            // into a self-driven task cot, and finally appends a streamed
            // confirmation bubble with an inline campaign preview.
            const handleApplyFields = () => {
              setScenarios((prev) => prev.map((s) =>
                s.id === "s-1" ? {
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
              activeAssistIdRef.current = applyAiId;
              setScenarios((prev) => prev.map((s) =>
                s.id === "s-1" ? { ...s, messages: [...s.messages, applyMsg] } : s
              ));

              setTimeout(() => {
                if (activeAssistIdRef.current !== applyAiId) return;
                setScenarios((prev) => prev.map((s) =>
                  s.id === "s-1" ? {
                    ...s,
                    messages: s.messages.map((m) => m.id === applyAiId
                      ? { ...m, loadingLabel: APPLY_LABELS[1] }
                      : m),
                  } : s
                ));
              }, 1500);

              setTimeout(() => {
                if (activeAssistIdRef.current !== applyAiId) return;

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
                    onFeedbackChange: setFeedback(finalAiId),
                  };
                  activeAssistIdRef.current = finalAiId;
                  setScenarios((prev) => prev.map((s) =>
                    s.id === "s-1" ? { ...s, messages: [...s.messages, finalMsg] } : s
                  ));
                  streamAiMessage(
                    "s-1", finalAiId,
                    `<p>All the field values have been applied and are now updated in your <entity-preview id="${campaign.id}"></entity-preview>.</p>`,
                  );
                };

                setScenarios((prev) => prev.map((s) =>
                  s.id === "s-1" ? {
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
                activeAssistIdRef.current = null;
              }, 3000);
            };

            setScenarios((prev) => prev.map((s) =>
              s.id === "s-1" ? {
                ...s,
                messages: s.messages.map((m) => m.id === aiId ? {
                  ...m,
                  cotContent: finalExtractReasoningCot,
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

      focusPromptTextarea();
      return;
    }

    flushSync(() => {
      setScenarios((prev) => prev.map((s) =>
        s.id === activeScenarioId
          ? { ...s, messages: [...s.messages, userMsg] }
          : s
      ));
    });
    threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    focusPromptTextarea();
  }, [activeScenarioId, scenarioStep, streamAiMessage, focusPromptTextarea, attachedFiles, contextItems, createdCampaign, setFeedback]);

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
      onFeedbackChange: setFeedback(aiId),
    };
    activeAssistIdRef.current = aiId;
    flushSync(() => {
      setScenarios((prev) => prev.map((s) =>
        s.id === "s-1" ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
      ));
    });
    threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    setScenarioStep(3);
    setAdAccountSearch("");
    setSelectedAdAccountId(null);

    // Label: "Thinking..." → "Checking ad accounts..."
    setTimeout(() => {
      if (activeAssistIdRef.current !== aiId) return;
      setScenarios((prev) => prev.map((s) =>
        s.id === "s-1"
          ? { ...s, messages: s.messages.map((m) => m.id === aiId ? { ...m, loadingLabel: "Checking ad accounts..." } : m) }
          : s
      ));
    }, 1500);

    // Start streaming after extended loading
    setTimeout(() => {
      if (activeAssistIdRef.current !== aiId) return;
      streamAiMessage(
        "s-1", aiId,
        "<p>For setup the campaign select an Ad account then I will finalize the plan to create the campaign.</p>",
        () => setScenarioStep(4),
        true, // skip internal loading — already loading
      );
    }, 2800);
  }, [workspaceChoice, campaignNameInput, selectedWorkspaceId, streamAiMessage, setFeedback]);

  const LOADING_LABELS = [
    "Thinking...",
    "Loading best tools...",
    "Constructing the plan...",
    "Generating campaign creation plan...",
  ];

  // Loading state: reasoning WITHOUT title, dot variant, current stage loading
  const buildLoadingCot = (completedUpTo: number) => (
    <CotContainer type="reasoning">
      <Cot>
        {LOADING_LABELS.map((label, i) => (
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

  // After streaming: reasoning WITH title, all complete
  const finalReasoningCot = (
    <CotContainer type="reasoning" title="Reasoning">
      <Cot>
        {LOADING_LABELS.map((label, i) => (
          <CotItem key={i} title={label} variant="dot" status="complete" />
        ))}
      </Cot>
    </CotContainer>
  );

  // ── Field extraction step (after user submits a file in step 6) ──
  const EXTRACT_LABELS = [
    "Reading attachment",
    "Analyzing content",
    "Mapping the fields",
    "Creating campaign field entity",
  ];

  const buildExtractCot = (completedUpTo: number) => (
    <CotContainer type="reasoning">
      <Cot>
        {EXTRACT_LABELS.map((label, i) => (
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

  const finalExtractReasoningCot = (
    <CotContainer type="reasoning" title="Reasoning">
      <Cot>
        {EXTRACT_LABELS.map((label, i) => (
          <CotItem key={i} title={label} variant="dot" status="complete" />
        ))}
      </Cot>
    </CotContainer>
  );

  // ── Apply-fields step (after user clicks Apply on the campaignField multiple) ──
  const APPLY_LABELS = [
    "Create a plan to update fields",
    "Get access to Objective",
  ];

  // Synthetic field set "extracted" from the user's attachment, anchored to
  // the just-created campaign for realistic in-bubble rendering.
  const buildExtractedFields = (campaignName: string): CampaignField[] => [
    { id: "ef-1", fieldName: "Objective",           icon: "emoji_flags",     value: "Conversions",                    campaignName },
    { id: "ef-2", fieldName: "Conversion location", icon: "ads_click",       value: "Website",                        campaignName },
    { id: "ef-3", fieldName: "Optimization event",  icon: "page_info",       value: "Purchase",                       campaignName },
    { id: "ef-4", fieldName: "Budget",              icon: "attach_money",    value: "$48,000 lifetime",               campaignName },
    { id: "ef-5", fieldName: "Schedule",            icon: "calendar_clock",  value: "Jun 1 – Aug 31, 2026",           campaignName },
    { id: "ef-6", fieldName: "Targeting",           icon: "target",          value: "US · 18–34 · Auto enthusiasts",  campaignName },
    { id: "ef-7", fieldName: "Creative",            icon: "animated_images", value: "12 video assets · 4 statics",    campaignName },
  ];

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

    const planRef = createRef<CampaignPlanTaskHandle>();
    planRefsMap.current.set(aiId, planRef);

    // Campaign data — populated when the user presses Start on the plan and it
    // finishes its progress. Captured in this closure so workspace/ad-account
    // selections at plan creation time are stable.
    const createdCampaign: Campaign = {
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
      runningPlanIdRef.current = aiId;
      setRunningPlanId(aiId);
    };

    const handlePlanComplete = () => {
      runningPlanIdRef.current = null;
      setRunningPlanId(null);
      // Lift to state so handleSubmit can reference the campaign in step 7+.
      setCreatedCampaign(createdCampaign);
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
        showFeedback: true,
        onFeedbackChange: setFeedback(completionAiId),
      };

      setScenarios((prev) => prev.map((s) =>
        s.id === "s-1" ? { ...s, messages: [...s.messages, completionMsg] } : s
      ));

      streamAiMessage(
        "s-1", completionAiId,
        `<p>I have created a campaign in <entity-preview id="${workspace.id}"></entity-preview> and it is ready to be modified.</p>`,
        () => {
          // After streaming, attach the campaign single-mode preview as the slot
          // and advance to step 6 so the prompt shows post-creation recommendations.
          setScenarios((prev) => prev.map((s) =>
            s.id === "s-1" ? {
              ...s,
              messages: s.messages.map((m) => m.id === completionAiId ? {
                ...m,
                slot: (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <AiEntityPreviewTyped
                      config={CAMPAIGN_CONFIG}
                      data={createdCampaign}
                      onHeaderAction={() => addContextItem({
                        id: createdCampaign.id,
                        icon: "campaign_alt",
                        label: createdCampaign.name,
                      })}
                    />
                    <BodyText size="md" style={{ marginTop: "var(--spacing-md)" }}>For next step enrich your campaign:</BodyText>
                    <AiGenerationSuggestion style={{ marginTop: "var(--spacing-2xl)" }}>
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
                  </div>
                ),
              } : m),
            } : s
          ));
          setScenarioStep(6);
        },
      );
    };

    const finalSlot = (
      <CampaignPlanTask
        ref={planRef}
        steps={planSteps}
        onEdit={() => handlePlanEditStart(aiId)}
        onStart={handlePlanStart}
        onComplete={handlePlanComplete}
      />
    );

    const aiMsg = {
      id: aiId,
      role: "assistant" as const,
      phase: "loading" as const,
      text: "",
      loadingLabel: LOADING_LABELS[0],
      cotContent: buildLoadingCot(0),
      showFeedback: true,
      onFeedbackChange: setFeedback(aiId),
    };

    activeAssistIdRef.current = aiId;
    flushSync(() => {
      setScenarios((prev) => prev.map((s) =>
        s.id === "s-1" ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
      ));
    });
    threadRef.current?.scrollToMessage(userMsg.id, "smooth");
    setScenarioStep(5);

    // Cycle through loading labels + cot stages; complete previous before next
    LOADING_LABELS.forEach((_label, i) => {
      if (i === 0) return;
      setTimeout(() => {
        if (activeAssistIdRef.current !== aiId) return;
        setScenarios((prev) => prev.map((s) =>
          s.id === "s-1" ? {
            ...s,
            messages: s.messages.map((m) => m.id === aiId ? {
              ...m,
              loadingLabel: LOADING_LABELS[i],
              cotContent: buildLoadingCot(i),
            } : m),
          } : s
        ));
      }, i * 1500);
    });

    // Start streaming after all labels — all cot items complete at this point
    setTimeout(() => {
      if (activeAssistIdRef.current !== aiId) return;
      streamAiMessage(
        "s-1", aiId,
        `<p>I have prepared a plan to create the campaign. Please confirm the plan by clicking start.</p>`,
        () => {
          // On complete: all reasoning items done + show task plan slot
          setScenarios((prev) => prev.map((s) =>
            s.id === "s-1" ? {
              ...s,
              messages: s.messages.map((m) => m.id === aiId ? {
                ...m,
                cotContent: finalReasoningCot,
                slot: finalSlot,
              } : m),
            } : s
          ));
        },
        true,
      );
    }, LOADING_LABELS.length * 1500 + 400);
  }, [selectedAdAccountId, workspaceChoice, selectedWorkspaceId, campaignNameInput, streamAiMessage, handlePlanEditStart, setFeedback]);

  const sortedHistory = [
    ...scenarios.filter((s) => s.pinned),
    ...scenarios.filter((s) => !s.pinned).sort((a, b) => a.order - b.order),
  ];

  const pinToTop = (id: string) =>
    setScenarios((prev) => prev.map((s) => s.id === id ? { ...s, pinned: true } : s));

  const unpin = (id: string) =>
    setScenarios((prev) => prev.map((s) => s.id === id ? { ...s, pinned: false } : s));

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
        <PromptInputContextMenu
          {...props}
          categories={CONTEXT_CATEGORIES}
        />
      ),
    },
  ];

  // Recommendations shown after the campaign-creation entity bubble appears.
  const POST_CREATION_RECOMMENDATIONS: RecommendationItem[] = [
    { id: "rec-objective",    label: "Objective",            leadingIcon: <Icon name="emoji_flags"     size={16} />, onSelect: () => focusPromptTextarea() },
    { id: "rec-conversion",   label: "Conversion location",  leadingIcon: <Icon name="ads_click"       size={16} />, onSelect: () => focusPromptTextarea() },
    { id: "rec-optimization", label: "Optimization event",   leadingIcon: <Icon name="page_info"       size={16} />, onSelect: () => focusPromptTextarea() },
    { id: "rec-budget",       label: "Budget",               leadingIcon: <Icon name="attach_money"    size={16} />, onSelect: () => focusPromptTextarea() },
    { id: "rec-schedule",     label: "Schedule",             leadingIcon: <Icon name="calendar_clock"  size={16} />, onSelect: () => focusPromptTextarea() },
    { id: "rec-targeting",    label: "Targeting",            leadingIcon: <Icon name="target"          size={16} />, onSelect: () => focusPromptTextarea() },
    { id: "rec-creative",     label: "Creative",             leadingIcon: <Icon name="animated_images" size={16} />, onSelect: () => focusPromptTextarea() },
  ];

  return (
    <div className={styles.root} data-theme={theme} data-typeface={typeface}>
      {/* ── Navbar ── */}
      <Navbar logo={<NavigationBrandItem hideLogotype />} position="sticky">
        <NavBarContent
          actions={[
            {
              id: "minimize",
              element: (
                <IconButton
                  size="md"
                  variant="neutral"
                  emphasis="low"
                  icon={<Icon name="minimize" size={16} />}
                  aria-label="Minimize"
                />
              ),
            },
            {
              id: "collapse",
              element: (
                <IconButton
                  size="md"
                  variant="neutral"
                  emphasis="low"
                  icon={<Icon name="collapse_content" size={16} />}
                  aria-label="Collapse"
                />
              ),
            },
          ]}
        >
          <TitleText size="xs" title="AI Assistant" />
        </NavBarContent>
      </Navbar>

      {/* ── Body ── */}
      <div className={styles.body}>
        <Sidebar
          collapsible
          expandBehavior="overlay"
          resizable
          expanded={expanded}
          onExpandedChange={setExpanded}
          title="Chats & Agents"
          minWidth={240}
          maxWidth={400}
          footer={
            <SettingsMenu
              sidebarExpanded={expanded}
              theme={theme}
              setTheme={setTheme}
              typeface={typeface}
              setTypeface={setTypeface}
            />
          }
        >
          <NavigationItem
            label="New Chat"
            leadingIcon={<Icon name="edit_square" size={20} />}
            iconOnly={!expanded}
          />
          <NavigationItem
            label="Search"
            leadingIcon={<Icon name="search" size={20} />}
            iconOnly={!expanded}
          />
          <NavigationCategoryItem
            label="Agents"
            leadingIcon={<Icon name="robot" size={20} />}
            iconOnly={!expanded}
            expanded={agentsExpanded}
            onClick={() => setAgentsExpanded((v) => !v)}
          >
            <NavigationSubItem
              label="Create Agent"
              leadingIcon={<Icon name="add" size={16} />}
            />
            <NavigationSubItem label="Campaign Creator" />
            <NavigationSubItem label="Headroom Analyzer" />
          </NavigationCategoryItem>
          <NavigationCategoryItem
            label="Chat History"
            leadingIcon={<Icon name="history" size={20} />}
            iconOnly={!expanded}
            expanded={historyExpanded}
            onClick={() => setHistoryExpanded((v) => !v)}
          >
            {sortedHistory.map((item) => (
              <ChatHistoryItem
                key={item.id}
                label={item.label}
                pinned={item.pinned}
                checked={item.id === activeScenarioId}
                onSelect={() => { setActiveScenarioId(item.id); setScenarioStep(0); }}
                onPinToTop={() => pinToTop(item.id)}
                onUnpin={() => unpin(item.id)}
              />
            ))}
          </NavigationCategoryItem>
        </Sidebar>

        {/* Content — always starts at the 72px collapsed rail offset.
            This <main> is the scroll container; the navbar sits outside it. */}
        <main className={styles.main} ref={mainScrollRef}>
          <Grid inset="md">
            <Col span={8} md={8} offsetMd={2}>
              <AiThread
                  ref={threadRef}
                  messages={activeMessages}
                  scrollContainerRef={mainScrollRef}
                  bottomOffset={promptHeight}
                  style={{ ["--thread-min-height" as string]: `calc(100dvh - var(--spacing-7xl) - ${promptHeight}px)` }}
                  introContent={
                    <AiThreadIntro>
                      <EmptyState
                        size="sm"
                        illustration="bolt"
                        title="Hi there!"
                        description="Here are a few things I can do"
                      />
                      <AiThreadIntroActions fadeSize={180}>
                        <ActionCard
                          title="Summarize capabilities"
                          description="See what I can help with"
                          icon={<Icon name="article_forecasting" size={16} />}
                          onClick={() => {}}
                        />
                        <ActionCard
                          title="Create a campaign"
                          description="Set up a new campaign"
                          icon={<Icon name="campaign_alt" size={16} />}
                          onClick={() => {}}
                        />
                        <ActionCard
                          title="Analyze performance"
                          description="Review your Q3 results"
                          icon={<Icon name="chart_forecasting" size={16} />}
                          onClick={() => {}}
                        />
                        <ActionCard
                          title="Automation Feed"
                          description="Automate campaign setup"
                          icon={<Icon name="automation_feeds" size={16} />}
                          onClick={() => {}}
                        />
                      </AiThreadIntroActions>
                    </AiThreadIntro>
                  }
                />
                <div ref={promptRef} className={styles.promptDock}>
                  {activeScenarioId === "s-1" && scenarioStep === 4 ? (
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
                  ) : activeScenarioId === "s-1" && scenarioStep === 2 && workspaceChoice === "new" ? (
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
                  ) : activeScenarioId === "s-1" && scenarioStep === 2 && workspaceChoice === "existing" ? (
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
                  ) : activeScenarioId === "s-1" && scenarioStep === 1 ? (
                    <PromptOptionInput
                      label="Where should this campaign live?"
                      steps={{ current: 1, total: 2 }}
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
                      loading={isGenerating}
                      onStop={handleStop}
                      triggerMenus={TRIGGER_MENUS}
                      contextItems={contextItems}
                      onContextItemsChange={setContextItems}
                      onAttachedFilesChange={setAttachedFiles}
                    >
                      {activeScenarioId === "s-1" && scenarioStep === 6 && (
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
                        showAnimatedPlaceholder={activeMessages.length === 0}
                      />
                      <PromptInputFooter>
                        <PromptInputFooterStart>
                          <PromptInputAddMenu />
                        </PromptInputFooterStart>
                        <PromptInputSubmit />
                      </PromptInputFooter>
                    </PromptInput>
                  )}
                </div>
            </Col>
          </Grid>
        </main>
      </div>
    </div>
  );
}
