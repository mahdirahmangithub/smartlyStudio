import { useEffect, useRef, useState } from "react";
import { NavBarContent } from "@sds/components/NavBarContent";
import { Navbar } from "@sds/components/Navbar";
import { Sidebar } from "@sds/components/Sidebar";
import { NavigationBrandItem } from "@sds/components/NavigationBrandItem";
import { NavigationItem } from "@sds/components/NavigationItem";
import { NavigationCategoryItem } from "@sds/components/NavigationCategoryItem";
import { Dropdown } from "@sds/components/Dropdown";
import { GenericSelectOption } from "@sds/components/GenericSelectOption";
import { SingleSelectOption } from "@sds/components/SingleSelectOption";
import { Grid, Col } from "@sds/components/Grid";
import {
  AiThread,
  AiThreadIntro,
  AiThreadIntroActions,
  type AiThreadHandle,
} from "@sds/components/AiThread";
import { EmptyState } from "@sds/components/EmptyState";
import { ActionCard } from "@sds/components/ActionCard";
import { IconButton } from "@sds/components/IconButton";
import { Icon } from "@sds/components/Icon";
import { TitleText } from "@sds/components/TitleText";
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputFooterStart,
  PromptInputAddMenu,
  PromptInputSubmit,
} from "@sds/components/PromptInput";
import styles from "./AiChatTemplate.module.css";

/* ─────────────────────────── Placeholder data ─────────────────────────── */

/** Fake chat history for the template — no real scenario plumbing. */
const PLACEHOLDER_HISTORY: { id: string; label: string }[] = [
  { id: "h-1", label: "Q3 budget review for BMW" },
  { id: "h-2", label: "Why is CPM higher this week?" },
  { id: "h-3", label: "Headline ideas for X3 launch" },
  { id: "h-4", label: "Tapahtuma campaign follow-up" },
  { id: "h-5", label: "Daria campaign pacing check" },
  { id: "h-6", label: "Audience overlap report" },
];

const PLACEHOLDER_AGENTS: string[] = [
  "Campaign Creator",
  "Headroom Analyzer",
];

/* ─────────────────────────── Component ─────────────────────────── */

/**
 * AI Chat — Full view template.
 *
 * A non-functional demo of the AI chat surface: navbar, sidebar with
 * placeholder agents + chat history, empty AiThread with the welcome
 * intro, and a static PromptInput. There's no scenario logic, no
 * ChatProvider, and no streaming — purely a layout / styling reference.
 */
export function AiChatTemplate() {
  const [expanded, setExpanded] = useState(false);
  const [agentsExpanded, setAgentsExpanded] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(true);

  // Collapsed-sidebar dropdown anchors / open state (mirrors the demo
  // page's behavior so the icon-only sidebar still surfaces agents +
  // history through hover popovers).
  const collapsedAgentsAnchorRef = useRef<HTMLDivElement>(null);
  const collapsedHistoryAnchorRef = useRef<HTMLDivElement>(null);
  const [collapsedAgentsOpen, setCollapsedAgentsOpen] = useState(false);
  const [collapsedHistoryOpen, setCollapsedHistoryOpen] = useState(false);

  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // AiThread plumbing — we measure the prompt dock so the thread leaves
  // room above it, even though the thread is intentionally empty.
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

  return (
    <div className={styles.root}>
      <Navbar
        className={styles.navbar}
        logo={<NavigationBrandItem hideLogotype />}
        position="sticky"
      >
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
        >
          <NavigationItem
            label="New Chat"
            leadingIcon={<Icon name="edit_square_alt" size={20} />}
            iconOnly={!expanded}
          />
          <NavigationItem
            label="Search"
            leadingIcon={<Icon name="search" size={20} />}
            iconOnly={!expanded}
          />

          {expanded ? (
            <>
              <NavigationCategoryItem
                label="Agents"
                leadingIcon={<Icon name="robot" size={20} />}
                expanded={agentsExpanded}
                onClick={() => setAgentsExpanded((v) => !v)}
              >
                <NavigationItem
                  label="Create Agent"
                  leadingIcon={<Icon name="add" size={16} />}
                />
                {PLACEHOLDER_AGENTS.map((label) => (
                  <NavigationItem key={label} label={label} />
                ))}
              </NavigationCategoryItem>
              <NavigationCategoryItem
                label="Chat History"
                leadingIcon={<Icon name="history" size={20} />}
                expanded={historyExpanded}
                onClick={() => setHistoryExpanded((v) => !v)}
              >
                {PLACEHOLDER_HISTORY.map((item) => (
                  <NavigationItem
                    key={item.id}
                    label={item.label}
                    checked={activeHistoryId === item.id}
                    onClick={() => setActiveHistoryId(item.id)}
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
                <GenericSelectOption
                  labelText="Create Agent"
                  description={false}
                  leading={<Icon name="add" size={16} />}
                  onClick={() => setCollapsedAgentsOpen(false)}
                />
                {PLACEHOLDER_AGENTS.map((label) => (
                  <GenericSelectOption
                    key={label}
                    labelText={label}
                    description={false}
                    onClick={() => setCollapsedAgentsOpen(false)}
                  />
                ))}
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
                {PLACEHOLDER_HISTORY.map((item) => (
                  <SingleSelectOption
                    key={item.id}
                    labelText={item.label}
                    description={false}
                    checked={activeHistoryId === item.id}
                    onChange={() => {
                      setActiveHistoryId(item.id);
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
                messages={[]}
                scrollContainerRef={mainScrollRef}
                bottomOffset={promptHeight}
                style={{
                  ["--thread-min-height" as string]:
                    `calc(100dvh - var(--spacing-7xl) - ${promptHeight}px)`,
                }}
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
                <PromptInput onSubmit={() => {}}>
                  <PromptInputAttachments />
                  <PromptInputTextarea placeholder="Ask Smartly…" />
                  <PromptInputFooter>
                    <PromptInputFooterStart>
                      <PromptInputAddMenu />
                    </PromptInputFooterStart>
                    <PromptInputSubmit />
                  </PromptInputFooter>
                </PromptInput>
              </div>
            </Col>
          </Grid>
        </main>
      </div>
    </div>
  );
}
AiChatTemplate.displayName = "AiChatTemplate";
