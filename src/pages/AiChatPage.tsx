import { useRef, useState, useCallback, useLayoutEffect } from "react";
import { NavBarContent } from "../components/NavBarContent";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { NavigationBrandItem } from "../components/NavigationBrandItem";
import { NavigationItem } from "../components/NavigationItem";
import { NavigationCategoryItem } from "../components/NavigationCategoryItem";
import { NavigationSubItem } from "../components/NavigationSubItem";
import { Dropdown } from "../components/Dropdown";
import { GenericSelectOption } from "../components/GenericSelectOption";
import { OptionSeparator } from "../components/OptionSeparator";
import { Grid, Col } from "../components/Grid";
import { AiThread, type AiThreadMessage } from "../components/AiThread";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputFooterStart,
  PromptInputAddMenu,
  PromptInputSubmit,
} from "../components/PromptInput";
import { IconButton } from "../components/IconButton";
import { Icon } from "../components/Icon";
import { TitleText } from "../components/TitleText";
import styles from "./AiChatPage.module.css";

function ChatHistoryItem({
  label,
  pinned,
  onPinToTop,
  onUnpin,
}: {
  label: string;
  pinned?: boolean;
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

export default function AiChatPage() {
  const [expanded, setExpanded] = useState(false);
  const [agentsExpanded, setAgentsExpanded] = useState(false);

  const [messages, setMessages] = useState<AiThreadMessage[]>([]);
  const promptRef = useRef<HTMLDivElement>(null);
  const [promptHeight, setPromptHeight] = useState(0);

  useLayoutEffect(() => {
    const el = promptRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setPromptHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleSubmit = useCallback((value: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user" as const, content: value },
    ]);
  }, []);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const [historyItems, setHistoryItems] = useState([
    { id: "h-1", label: "Q3 performance analysis",     pinned: false, order: 0 },
    { id: "h-2", label: "Campaign brief for BMW",      pinned: false, order: 1 },
    { id: "h-3", label: "Audience segmentation ideas", pinned: false, order: 2 },
    { id: "h-4", label: "Holiday promo strategy",      pinned: false, order: 3 },
    { id: "h-5", label: "TikTok creative review",      pinned: false, order: 4 },
  ]);

  const sortedHistory = [
    ...historyItems.filter((h) => h.pinned),
    ...historyItems.filter((h) => !h.pinned).sort((a, b) => a.order - b.order),
  ];

  const pinToTop = (id: string) =>
    setHistoryItems((prev) => prev.map((h) => h.id === id ? { ...h, pinned: true } : h));

  const unpin = (id: string) =>
    setHistoryItems((prev) => prev.map((h) => h.id === id ? { ...h, pinned: false } : h));

  return (
    <div className={styles.root}>
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
            <NavigationItem
              label="Settings"
              leadingIcon={<Icon name="settings" size={20} />}
              iconOnly={!expanded}
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
                onPinToTop={() => pinToTop(item.id)}
                onUnpin={() => unpin(item.id)}
              />
            ))}
          </NavigationCategoryItem>
        </Sidebar>

        {/* Content — always starts at the 72px collapsed rail offset */}
        <main className={styles.main}>
          <Grid inset="md" style={{ flex: 1, minHeight: 0, gridAutoRows: "1fr" }}>
            <Col span={8} md={6} offsetMd={3} style={{ position: "relative" }}>
              <AiThread
                messages={messages}
                bottomOffset={promptHeight}
                style={{ position: "absolute", inset: 0 }}
              />
              <div
                ref={promptRef}
                style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, padding: "0 0 var(--spacing-xl)" }}
              >
                <PromptInput onSubmit={handleSubmit}>
                  <PromptInputTextarea placeholder="Ask anything…" />
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
