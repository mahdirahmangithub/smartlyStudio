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
  function AiThread({ messages, introContent, bottomOffset = 0, hasMore, onLoadMore, className, style }, handle) {
    const lastMsg = messages[messages.length - 1];
    const generating =
      lastMsg?.role === "assistant" &&
      (lastMsg.phase === "loading" || lastMsg.phase === "generating");

    const { containerRef, sentinelRef, spacerRef, showFab, onFabClick, scrollToBottom, scrollToMessage, scrollIfSticking } =
      useThreadScroll({ generating, bottomOffset });

    useImperativeHandle(handle, () => ({ scrollToBottom, scrollToMessage }), [scrollToBottom, scrollToMessage]);

    const [faderColor, setFaderColor] = useState("var(--element-surface-default)");
    useEffect(() => {
      if (containerRef.current) setFaderColor(detectFadeColor(containerRef.current));
    }, []);

    useEffect(() => {
      if (generating) scrollIfSticking();
    }, [messages, generating, scrollIfSticking]);

    const topSentinelRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!hasMore || !onLoadMore) return;
      const sentinel = topSentinelRef.current;
      const container = containerRef.current;
      if (!sentinel || !container) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) onLoadMore(); },
        { root: container, rootMargin: "120px 0px 0px 0px" },
      );
      observer.observe(sentinel);
      return () => observer.disconnect();
    }, [hasMore, onLoadMore, containerRef]);

    const fabBottom = bottomOffset + 32;

    return (
      <div className={cx(styles.root, className)} style={style}>
        <div
          ref={containerRef}
          className={styles.scroll}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          tabIndex={0}
        >
          <div className={styles.list} style={{ paddingBottom: bottomOffset }}>
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

            {/* Sentinel: marks actual content end — scroll targets are based on this,
                never on scrollHeight, so the spacer below never affects auto-follow. */}
            <div ref={sentinelRef} className={styles.sentinel} aria-hidden />

            {/* Spacer: purely visual space managed imperatively by useThreadScroll.
                Height = containerHeight on generation start, dissolves on user scroll. */}
            <div ref={spacerRef} className={styles.spacer} aria-hidden />
          </div>
        </div>

        {bottomOffset > 0 && (
          <div
            className={styles.fader}
            style={{
              height: `calc(${bottomOffset}px + var(--spacing-2xl))`,
              background: `linear-gradient(180deg, transparent 0%, ${faderColor} var(--spacing-4xl))`,
            }}
            aria-hidden
          />
        )}

        <div
          className={styles.fab}
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
