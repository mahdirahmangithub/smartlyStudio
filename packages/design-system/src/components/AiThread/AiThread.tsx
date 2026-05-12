import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { UserBubble } from "../UserBubble";
import { AiResponseBubble } from "../AiResponseBubble";
import { AiButton } from "../AiButton";
import { IconButton } from "../IconButton";
import { Icon } from "../Icon";
import { cx } from "../../utils/cx";
import { detectFadeColor } from "../../utils/detectSurface";
import { useThreadScroll } from "./useThreadScroll";
import styles from "./AiThread.module.css";
import type { AiThreadHandle, AiThreadProps } from "./aiThreadTypes";

export const AiThread = forwardRef<AiThreadHandle, AiThreadProps>(
  function AiThread({ messages, scrollContainerRef, introContent, bottomOffset = 0, hasMore, onLoadMore, className, style }, handle) {
    const external = !!scrollContainerRef;

    const lastMsg = messages[messages.length - 1];
    const generating =
      lastMsg?.role === "assistant" &&
      (lastMsg.phase === "loading" || lastMsg.phase === "generating");

    const { containerRef, sentinelRef, spacerRef, showFab, onFabClick, scrollToBottom, scrollToMessage, scrollIfSticking } =
      useThreadScroll({ generating, bottomOffset, scrollContainerRef });

    useImperativeHandle(
      handle,
      () => ({
        scrollToBottom,
        scrollToMessage,
        getScrollContainer: () => scrollContainerRef?.current ?? containerRef.current,
      }),
      [scrollToBottom, scrollToMessage, scrollContainerRef, containerRef],
    );

    const [faderColor, setFaderColor] = useState("var(--element-surface-default)");
    useEffect(() => {
      if (containerRef.current) setFaderColor(detectFadeColor(containerRef.current));
    }, []);

    // Track the AiThread root's viewport-x bounds so fixed-position children
    // (FAB, fader) can centre on the thread itself instead of the page —
    // avoids sidebar/asymmetric layout offsets.
    const rootRef = useRef<HTMLDivElement>(null);
    const [rootRect, setRootRect] = useState<{ left: number; width: number } | null>(null);
    useEffect(() => {
      if (!external) return;
      const el = rootRef.current;
      if (!el) return;
      const update = () => {
        const rect = el.getBoundingClientRect();
        setRootRect({ left: rect.left, width: rect.width });
      };
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      window.addEventListener("resize", update);
      return () => {
        ro.disconnect();
        window.removeEventListener("resize", update);
      };
    }, [external]);

    useEffect(() => {
      if (generating) scrollIfSticking();
    }, [messages, generating, scrollIfSticking]);

    const topSentinelRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!hasMore || !onLoadMore) return;
      const sentinel = topSentinelRef.current;
      // In external mode use the external scroll container as the observer root.
      const root = scrollContainerRef?.current ?? containerRef.current;
      if (!sentinel || !root) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) onLoadMore(); },
        { root, rootMargin: "120px 0px 0px 0px" },
      );
      observer.observe(sentinel);
      return () => observer.disconnect();
    }, [hasMore, onLoadMore, scrollContainerRef, containerRef]);

    const fabBottom = bottomOffset + 32;

    return (
      <div
        ref={rootRef}
        className={cx(styles.root, external && styles.rootExternal, className)}
        style={external && rootRect
          ? {
              ...style,
              ["--ai-fab-center" as string]: `${rootRect.left + rootRect.width / 2}px`,
              ["--ai-thread-left" as string]: `${rootRect.left}px`,
              ["--ai-thread-width" as string]: `${rootRect.width}px`,
            }
          : style}
      >
        <div
          ref={containerRef}
          className={cx(styles.scroll, external && styles.scrollExternal)}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          tabIndex={external ? undefined : 0}
        >
          {/* In external mode bottomOffset does not pad the list — PromptInput
              is in-flow below the thread, not overlapping it. */}
          <div className={cx(styles.list, external && styles.listExternal)} style={{ paddingBottom: external ? undefined : bottomOffset }}>
            <div ref={topSentinelRef} className={styles.topSentinel} aria-hidden />

            {messages.length === 0 && introContent && (
              <div className={styles.intro}>{introContent}</div>
            )}

            {messages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className={styles.item} data-message-id={msg.id}>
                  <UserBubble
                    message={msg.message}
                    attachments={msg.attachments}
                    contextItems={msg.contextItems}
                    replyLabel={msg.replyLabel}
                    onCopy={msg.onCopy}
                    onEdit={msg.onEdit}
                  />
                </div>
              ) : (
                <div key={msg.id} className={styles.item} data-message-id={msg.id}>
                  <AiResponseBubble
                    phase={msg.phase}
                    loadingLabel={msg.loadingLabel}
                    text={msg.text}
                    cotContent={msg.cotContent}
                    cotTitle={msg.cotTitle}
                    cotExpanded={msg.cotExpanded}
                    cotDefaultExpanded={msg.cotDefaultExpanded}
                    onCotExpandedChange={msg.onCotExpandedChange}
                    copyValue={msg.copyValue}
                    onRegenerate={msg.onRegenerate}
                    showFeedback={msg.showFeedback}
                    feedbackValue={msg.feedbackValue}
                    onFeedbackChange={msg.onFeedbackChange}
                    slot={msg.slot}
                    components={msg.components}
                  />
                </div>
              ),
            )}

            <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
            <div ref={spacerRef} className={styles.spacer} aria-hidden />
          </div>
        </div>

        {bottomOffset > 0 && (external ? (
          <div
            className={styles.faderFixed}
            style={{ height: `calc(${bottomOffset}px + var(--spacing-2xl))` }}
            aria-hidden
          >
            <div
              className={styles.faderFixedInner}
              style={{ background: `linear-gradient(180deg, transparent 0%, ${faderColor} var(--spacing-4xl))` }}
            />
          </div>
        ) : (
          <div
            className={styles.fader}
            style={{
              height: `calc(${bottomOffset}px + var(--spacing-2xl))`,
              background: `linear-gradient(180deg, transparent 0%, ${faderColor} var(--spacing-4xl))`,
            }}
            aria-hidden
          />
        ))}

        <div
          className={external ? styles.fabFixed : styles.fab}
          style={{
            bottom: fabBottom,
            transform: `translateX(-50%) translateY(${showFab ? "0" : "calc(100% + 48px)"}) scale(${showFab ? 1 : 0.4})`,
            opacity: showFab ? 1 : 0,
            pointerEvents: showFab ? "auto" : "none",
          }}
          aria-hidden={!showFab}
        >
          <AiButton size="md" style={{ borderRadius: "var(--radius-full)", boxShadow: "var(--shadow-md)", backgroundColor:"var(--util-subtle-inverse-strongest)", backdropFilter:"blur(4px)" }}>
            <IconButton
              size="md"
              variant="neutral"
              emphasis="low"
              icon={<Icon name="arrow_chevron_down" size={16} aria-hidden />}
              aria-label="Scroll to latest message"
              hideTooltip
              onClick={onFabClick}
              style={{ borderRadius: "var(--radius-full)" }}
            />
          </AiButton>
        </div>
      </div>
    );
  },
);

AiThread.displayName = "AiThread";
