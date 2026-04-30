import { useRef, useState, useEffect } from "react";
import { NavBarContent } from "../../components/NavBarContent";
import { Navbar } from "../../components/Navbar";
import { Sidebar } from "../../components/Sidebar";
import { NavigationBrandItem } from "../../components/NavigationBrandItem";
import { NavigationItem } from "../../components/NavigationItem";
import { NavigationCategoryItem } from "../../components/NavigationCategoryItem";
import { Dropdown } from "../../components/Dropdown";
import { GenericSelectOption } from "../../components/GenericSelectOption";
import { SingleSelectOption } from "../../components/SingleSelectOption";
import { Grid, Col } from "../../components/Grid";
import { AiThread, AiThreadIntro, AiThreadIntroActions, type AiThreadHandle } from "../../components/AiThread";
import { EmptyState } from "../../components/EmptyState";
import { ActionCard } from "../../components/ActionCard";
import { IconButton } from "../../components/IconButton";
import { Icon } from "../../components/Icon";
import { TitleText } from "../../components/TitleText";

import { ChatProvider, type ScenarioRecord } from "./shared/ChatContext";
import { ChatHistoryItem } from "./shared/ChatHistoryItem";
import { SettingsMenu, type Theme, type Typeface } from "./shared/SettingsMenu";
import { SCENARIOS } from "./scenarios/registry";
import styles from "./AiChatPage.module.css";

export default function AiChatPage() {
  const [expanded, setExpanded] = useState(false);
  const [agentsExpanded, setAgentsExpanded] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const collapsedAgentsAnchorRef = useRef<HTMLDivElement>(null);
  const collapsedHistoryAnchorRef = useRef<HTMLDivElement>(null);
  const [collapsedAgentsOpen, setCollapsedAgentsOpen] = useState(false);
  const [collapsedHistoryOpen, setCollapsedHistoryOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [typeface, setTypeface] = useState<Typeface>("mac");

  const mainScrollRef = useRef<HTMLElement>(null);
  const threadRef = useRef<AiThreadHandle>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const [promptHeight, setPromptHeight] = useState(0);

  useEffect(() => {
    const el = promptRef.current;
    if (!el) return;
    const update = () => setPromptHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const initialScenarios: ScenarioRecord[] = SCENARIOS.map((cfg, i) => ({
    id: cfg.id,
    label: cfg.label,
    messages: [],
    pinned: false,
    order: i,
  }));

  return (
    <ChatProvider
      initialScenarios={initialScenarios}
      initialActiveScenarioId={SCENARIOS[0].id}
      threadRef={threadRef}
      promptRef={promptRef}
    >
      {(chat) => {
        const sortedHistory = [
          ...chat.scenarios.filter((s) => s.pinned),
          ...chat.scenarios.filter((s) => !s.pinned).sort((a, b) => a.order - b.order),
        ];
        const pinToTop = (id: string) =>
          chat.setScenarios((prev) => prev.map((s) => s.id === id ? { ...s, pinned: true } : s));
        const unpin = (id: string) =>
          chat.setScenarios((prev) => prev.map((s) => s.id === id ? { ...s, pinned: false } : s));

        const ActiveScenario = SCENARIOS.find((s) => s.id === chat.activeScenarioId)?.Component;

        return (
          <div className={styles.root} data-theme={theme} data-typeface={typeface}>
            <Navbar logo={<NavigationBrandItem hideLogotype />} position="sticky">
              <NavBarContent
                actions={[
                  {
                    id: "minimize",
                    element: (
                      <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="minimize" size={16} />} aria-label="Minimize" />
                    ),
                  },
                  {
                    id: "collapse",
                    element: (
                      <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="collapse_content" size={16} />} aria-label="Collapse" />
                    ),
                  },
                ]}
              >
                <TitleText size="xs" title="AI Assistant" />
              </NavBarContent>
            </Navbar>

            <div className={styles.body}>
              <Sidebar
                className={styles.sidebar}
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
                <NavigationItem label="New Chat" leadingIcon={<Icon name="edit_square_alt" size={20} />} iconOnly={!expanded} />
                <NavigationItem label="Search" leadingIcon={<Icon name="search" size={20} />} iconOnly={!expanded} />
                {expanded ? (
                  <>
                    <NavigationCategoryItem
                      label="Agents"
                      leadingIcon={<Icon name="robot" size={20} />}
                      expanded={agentsExpanded}
                      onClick={() => setAgentsExpanded((v) => !v)}
                    >
                      <NavigationItem label="Create Agent" leadingIcon={<Icon name="add" size={16} />} />
                      <NavigationItem label="Campaign Creator" />
                      <NavigationItem label="Headroom Analyzer" />
                    </NavigationCategoryItem>
                    <NavigationCategoryItem
                      label="Chat History"
                      leadingIcon={<Icon name="history" size={20} />}
                      expanded={historyExpanded}
                      onClick={() => setHistoryExpanded((v) => !v)}
                    >
                      {sortedHistory.map((item) => (
                        <ChatHistoryItem
                          key={item.id}
                          label={item.label}
                          pinned={item.pinned}
                          checked={item.id === chat.activeScenarioId}
                          onSelect={() => chat.setActiveScenarioId(item.id)}
                          onPinToTop={() => pinToTop(item.id)}
                          onUnpin={() => unpin(item.id)}
                        />
                      ))}
                    </NavigationCategoryItem>
                  </>
                ) : (
                  <>
                    <div ref={collapsedAgentsAnchorRef}>
                      <NavigationItem
                        label="Agents"
                        leadingIcon={<Icon name="robot" size={20} />}
                        iconOnly
                        onClick={() => setCollapsedAgentsOpen((v) => !v)}
                      />
                    </div>
                    <Dropdown
                      open={collapsedAgentsOpen}
                      onClose={() => setCollapsedAgentsOpen(false)}
                      anchorRef={collapsedAgentsAnchorRef}
                      placement="right-start"
                      width={220}
                    >
                      <GenericSelectOption labelText="Create Agent" description={false} leading={<Icon name="add" size={16} />} onClick={() => setCollapsedAgentsOpen(false)} />
                      <GenericSelectOption labelText="Campaign Creator" description={false} onClick={() => setCollapsedAgentsOpen(false)} />
                      <GenericSelectOption labelText="Headroom Analyzer" description={false} onClick={() => setCollapsedAgentsOpen(false)} />
                    </Dropdown>

                    <div ref={collapsedHistoryAnchorRef}>
                      <NavigationItem
                        label="Chat History"
                        leadingIcon={<Icon name="history" size={20} />}
                        iconOnly
                        onClick={() => setCollapsedHistoryOpen((v) => !v)}
                      />
                    </div>
                    <Dropdown
                      open={collapsedHistoryOpen}
                      onClose={() => setCollapsedHistoryOpen(false)}
                      anchorRef={collapsedHistoryAnchorRef}
                      placement="right-start"
                      width={320}
                    >
                      {sortedHistory.map((item) => (
                        <SingleSelectOption
                          key={item.id}
                          labelText={item.label}
                          description={false}
                          checked={item.id === chat.activeScenarioId}
                          onChange={() => {
                            chat.setActiveScenarioId(item.id);
                            setCollapsedHistoryOpen(false);
                          }}
                        />
                      ))}
                    </Dropdown>
                  </>
                )}
              </Sidebar>

              <main className={styles.main} ref={mainScrollRef}>
                <Grid inset="md">
                  <Col span={8} md={8} offsetMd={2}>
                    <AiThread
                      ref={threadRef}
                      messages={chat.activeMessages}
                      scrollContainerRef={mainScrollRef}
                      bottomOffset={promptHeight}
                      style={{ ["--thread-min-height" as string]: `calc(100dvh - var(--spacing-7xl) - ${promptHeight}px)` }}
                      introContent={
                        <AiThreadIntro>
                          <EmptyState size="sm" illustration="bolt" title="Hi there!" description="Here are a few things I can do" />
                          <AiThreadIntroActions fadeSize={180}>
                            <ActionCard title="Summarize capabilities" description="See what I can help with" icon={<Icon name="article_forecasting" size={16} />} onClick={() => {}} />
                            <ActionCard title="Create a campaign" description="Set up a new campaign" icon={<Icon name="campaign_alt" size={16} />} onClick={() => {}} />
                            <ActionCard title="Analyze performance" description="Review your Q3 results" icon={<Icon name="chart_forecasting" size={16} />} onClick={() => {}} />
                            <ActionCard title="Automation Feed" description="Automate campaign setup" icon={<Icon name="automation_feeds" size={16} />} onClick={() => {}} />
                          </AiThreadIntroActions>
                        </AiThreadIntro>
                      }
                    />
                    <div ref={promptRef} className={styles.promptDock}>
                      {/* Active scenario owns its prompt area + any guide popover.
                          Mounted only when active so internal state resets on
                          re-entry — no leakage between scenarios. */}
                      {ActiveScenario && <ActiveScenario guideClassName={styles.scenarioGuide} />}
                    </div>
                  </Col>
                </Grid>
              </main>
            </div>
          </div>
        );
      }}
    </ChatProvider>
  );
}
