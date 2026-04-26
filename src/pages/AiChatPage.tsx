import { useRef, useState, useCallback, useLayoutEffect, type ReactNode } from "react";
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
import { AiThread, AiThreadIntro, AiThreadIntroActions, AiThreadIntroEntities, type AiThreadMessage } from "../components/AiThread";
import { CotContainer, CotItem, Cot } from "../components/Cot";
import { AiEntityPreviewInlineTyped, WORKSPACE_CONFIG, type Workspace } from "../components/AiEntityPreview";
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
  DEFAULT_TRIGGER_MENUS,
  type PromptInputTriggerConfig,
  type ContextMenuCategory,
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

export default function AiChatPage() {
  const [expanded, setExpanded] = useState(false);
  const [agentsExpanded, setAgentsExpanded] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [typeface, setTypeface] = useState<Typeface>("mac");

  const promptRef = useRef<HTMLDivElement>(null);
  const [promptHeight, setPromptHeight] = useState(0);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const streamAiMessage = useCallback((
    scenarioId: string,
    msgId: string,
    fullText: string,
    onComplete?: () => void,
    skipLoading = false,
  ) => {
    if (streamRef.current) clearInterval(streamRef.current);

    const LOADING_MS = skipLoading ? 0 : 800;
    const CHARS_PER_TICK = 4;
    const TICK_MS = 25;

    const startGenerating = () => {
      let idx = 0;
      streamRef.current = setInterval(() => {
        idx += CHARS_PER_TICK;
        const done = idx >= fullText.length;
        const slice = done ? fullText : fullText.slice(0, idx);
        setScenarios((prev) => prev.map((s) =>
          s.id === scenarioId
            ? { ...s, messages: s.messages.map((m) => m.id === msgId ? { ...m, phase: done ? "done" as const : "generating" as const, text: slice } : m) }
            : s
        ));
        if (done) { clearInterval(streamRef.current!); onComplete?.(); }
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

  useLayoutEffect(() => {
    const el = promptRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setPromptHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
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
  const [campaignSearch, setCampaignSearch] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [adAccountSearch, setAdAccountSearch] = useState("");
  const [selectedAdAccountId, setSelectedAdAccountId] = useState<string | null>(null);

  const WORKSPACES: Workspace[] = [
    { id: "w-1", name: "BMW Global",     platform: "Meta",   campaignCount: 8, adSetCount: 24, adCount: 72 },
    { id: "w-2", name: "Nike EMEA",      platform: "Google", campaignCount: 5, adSetCount: 15, adCount: 45 },
    { id: "w-3", name: "Acme Corp",      platform: "TikTok", campaignCount: 3, adSetCount: 9,  adCount: 27 },
  ];

  const AD_ACCOUNTS = [
    { id: "aa-1",  label: "BMW Meta Ads" },
    { id: "aa-2",  label: "BMW Google Ads" },
    { id: "aa-3",  label: "Nike EU Meta" },
    { id: "aa-4",  label: "Acme TikTok Biz" },
    { id: "aa-5",  label: "Acme Search Ads" },
    { id: "aa-6",  label: "Unilever EU Ads" },
    { id: "aa-7",  label: "Unilever US Search" },
    { id: "aa-8",  label: "Nike YouTube EU" },
  ];

  const EXISTING_CAMPAIGNS = [
    { id: "ec-1",  label: "Summer 2026 – Run BMW" },
    { id: "ec-2",  label: "Campaign_1209" },
    { id: "ec-3",  label: "Q4 Retargeting" },
    { id: "ec-4",  label: "Spring Brand Awareness" },
    { id: "ec-5",  label: "Holiday Promo" },
    { id: "ec-6",  label: "Loyalty Reactivation" },
    { id: "ec-7",  label: "New User Acquisition" },
    { id: "ec-8",  label: "Retargeting – EMEA" },
    { id: "ec-9",  label: "Video Push – TikTok" },
    { id: "ec-10", label: "Performance Max – US" },
    { id: "ec-11", label: "Brand Lift – YouTube" },
    { id: "ec-12", label: "App Install – Android" },
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

  useLayoutEffect(() => {
    if (streamRef.current) clearInterval(streamRef.current);
  }, [activeScenarioId]);

  const activeMessages = scenarios.find((s) => s.id === activeScenarioId)?.messages ?? [];

  const handleSubmit = useCallback((value: string) => {
    const userMsg = { id: `u-${Date.now()}`, role: "user" as const, message: value };

    if (activeScenarioId === "s-1" && scenarioStep === 0) {
      const aiId = `a-${Date.now()}`;
      const aiMsg = { id: aiId, role: "assistant" as const, phase: "loading" as const, text: "" };
      setScenarios((prev) => prev.map((s) =>
        s.id === "s-1" ? { ...s, messages: [userMsg, aiMsg] } : s
      ));
      streamAiMessage(
        "s-1", aiId,
        "<p>Do you want to create this campaign in a new workspace or use an existing one?</p>",
        () => setScenarioStep(1),
      );
      return;
    }

    setScenarios((prev) => prev.map((s) =>
      s.id === activeScenarioId
        ? { ...s, messages: [...s.messages, userMsg] }
        : s
    ));
  }, [activeScenarioId, scenarioStep]);

  const handleWorkspaceSelect = useCallback((type: "new" | "existing") => {
    setWorkspaceChoice(type);
    setCampaignNameInput("");
    setCampaignSearch("");
    setSelectedCampaignId(null);
    setScenarioStep(2);
  }, []);

  const handleFinalSubmit = useCallback(() => {
    let message = "";
    if (workspaceChoice === "new") {
      message = campaignNameInput.trim()
        ? `Create a new campaign named "${campaignNameInput.trim()}"`
        : "Create a new campaign in a new workspace";
    } else {
      const campaign = EXISTING_CAMPAIGNS.find((c) => c.id === selectedCampaignId);
      message = campaign
        ? `Use existing campaign: ${campaign.label}`
        : "Use an existing campaign";
    }
    const userMsg = { id: `u-${Date.now()}`, role: "user" as const, message };
    const aiId = `a-${Date.now() + 1}`;
    const aiMsg = { id: aiId, role: "assistant" as const, phase: "loading" as const, text: "", loadingLabel: "Thinking..." };
    setScenarios((prev) => prev.map((s) =>
      s.id === "s-1" ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
    ));
    setScenarioStep(3);
    setAdAccountSearch("");
    setSelectedAdAccountId(null);

    // Label: "Thinking..." → "Checking ad accounts..."
    setTimeout(() => {
      setScenarios((prev) => prev.map((s) =>
        s.id === "s-1"
          ? { ...s, messages: s.messages.map((m) => m.id === aiId ? { ...m, loadingLabel: "Checking ad accounts..." } : m) }
          : s
      ));
    }, 1500);

    // Start streaming after extended loading
    setTimeout(() => {
      streamAiMessage(
        "s-1", aiId,
        "<p>For setup the campaign select an Ad account then I will finalize the plan to create the campaign.</p>",
        () => setScenarioStep(4),
        true, // skip internal loading — already loading
      );
    }, 2800);
  }, [workspaceChoice, campaignNameInput, selectedCampaignId, streamAiMessage]);

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

  const handleAdAccountSubmit = useCallback(() => {
    const adAccount = AD_ACCOUNTS.find((a) => a.id === selectedAdAccountId);
    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user" as const,
      message: adAccount ? `Using ad account: ${adAccount.label}` : "Using selected ad account",
    };
    const aiId = `a-${Date.now() + 1}`;
    const workspace = WORKSPACES[0];

    const finalSlot = (
      <CotContainer
        type="task"
        title="Campaign creation plan"
        defaultExpanded
        onEdit={() => {}}
        onCancel={() => {}}
        onStart={() => {}}
      >
        <Cot>
          <CotItem title="Set up campaign structure" description="Create the campaign shell in BMW Global workspace" variant="dot" connector />
          <CotItem title="Configure audience targeting" description="Set audience segments and targeting parameters" variant="dot" connector />
          <CotItem title="Set budget & schedule" description="Define daily budget, lifetime budget, and flight dates" variant="dot" connector />
          <CotItem title="Prepare ad creatives" description="Upload or generate ad copy and visuals" variant="dot" connector />
          <CotItem title="Review & activate campaign" description="Final review before going live" variant="dot" />
        </Cot>
      </CotContainer>
    );

    const aiMsg = {
      id: aiId,
      role: "assistant" as const,
      phase: "loading" as const,
      text: "",
      loadingLabel: LOADING_LABELS[0],
      cotContent: buildLoadingCot(0),
      components: {
        "entity-preview": (_attrs: Record<string, string>) => (
          <AiEntityPreviewInlineTyped config={WORKSPACE_CONFIG} data={workspace} />
        ),
      },
    };

    setScenarios((prev) => prev.map((s) =>
      s.id === "s-1" ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s
    ));
    setScenarioStep(5);

    // Cycle through loading labels + cot stages; complete previous before next
    LOADING_LABELS.forEach((_label, i) => {
      if (i === 0) return;
      setTimeout(() => {
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
      streamAiMessage(
        "s-1", aiId,
        `<p>I will generate a campaign in <entity-preview id="${workspace.id}"></entity-preview>. Please confirm the plan by clicking start.</p>`,
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
  }, [selectedAdAccountId, streamAiMessage]);

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
        {/* Persistent · Collapsible · Overlay · Resizable */}
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

        {/* Content — always starts at the 72px collapsed rail offset */}
        <main className={styles.main}>
          <Grid inset="md" style={{ flex: 1, minHeight: 0, gridAutoRows: "1fr" }}>
            <Col span={8} md={8} offsetMd={2} style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: 0,  marginInline: "auto" }}>
                <AiThread
                  messages={activeMessages}
                  bottomOffset={promptHeight}
                  style={{ position: "absolute", inset: 0 }}
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
                <div
                  ref={promptRef}
                  style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, padding: "0 0 var(--spacing-xl)", maxWidth: 720, marginInline: "auto" }}
                >
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
                      label="Input your campaign name"
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
                      label="Select an existing campaign"
                      steps={{ current: 2, total: 2, onPrev: () => setScenarioStep(1) }}
                      search={{ value: campaignSearch, onChange: setCampaignSearch, placeholder: "Search campaigns…" }}
                      hasValue={selectedCampaignId !== null}
                      isLastStep
                      onClose={() => setScenarioStep(0)}
                      onSkip={handleFinalSubmit}
                      onSubmit={handleFinalSubmit}
                    >
                      {EXISTING_CAMPAIGNS
                        .filter((c) => c.label.toLowerCase().includes(campaignSearch.toLowerCase()))
                        .map((c) => (
                          <SingleSelectOption
                            key={c.id}
                            labelText={c.label}
                            description={false}
                            checked={selectedCampaignId === c.id}
                            onChange={() => setSelectedCampaignId(c.id)}
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
                    <PromptInput onSubmit={handleSubmit} triggerMenus={TRIGGER_MENUS}>
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
              </div>
            </Col>
          </Grid>
        </main>
      </div>
    </div>
  );
}
