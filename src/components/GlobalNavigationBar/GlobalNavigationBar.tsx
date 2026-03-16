import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Divider } from "../Divider";
import { Icon } from "../Icon";
import { NavigationBrandItem } from "../NavigationBrandItem";
import { NavigationItem } from "../NavigationItem";
import { NavigationProfileItem } from "../NavigationProfileItem";
import { ScrollFade } from "../ScrollFade";
import { useSmartHover } from "../../hooks/useSmartHover";
import styles from "./GlobalNavigationBar.module.css";
import { cx } from "../../utils/cx";

const NavBarContext = createContext(false);

/** Returns `true` when the GlobalNavigationBar is expanded */
export function useNavBarExpanded(): boolean {
  return useContext(NavBarContext);
}


export interface GlobalNavigationBarProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Content rendered inside the navigation bar */
  children?: ReactNode;
  /** Show notification badge on brand logo */
  brandBadge?: boolean;
  /** Callback when the brand item is clicked */
  onBrandClick?: () => void;
  /** Badge count for the inbox item */
  inboxBadgeCount?: number | string;
  /** Callback when Search is clicked */
  onSearchClick?: () => void;
  /** Callback when Inbox is clicked */
  onInboxClick?: () => void;
  /** Callback when Help & Feedback is clicked */
  onHelpClick?: () => void;
  /** Primary profile: avatar image URL */
  profileAvatarSrc?: string;
  /** Primary profile: initials fallback */
  profileInitials?: string;
  /** Primary profile: display name */
  profileLabel?: string;
  /** Callback when primary profile is clicked */
  onProfileClick?: () => void;
  /** Secondary profile: avatar image URL */
  secondaryAvatarSrc?: string;
  /** Secondary profile: initials fallback */
  secondaryInitials?: string;
  /** Secondary profile: display name */
  secondaryLabel?: string;
  /** Callback when secondary profile is clicked */
  onSecondaryProfileClick?: () => void;
  /** Layer 1 — ms the cursor must dwell before expanding (0 = disabled) */
  dwellDelay?: number;
  /** Layer 2 — px/ms velocity threshold; faster crossings are ignored (0 = disabled) */
  velocityThreshold?: number;
  /** Layer 3 — ms grace period before collapsing on leave (0 = disabled) */
  exitGrace?: number;
}

export const GlobalNavigationBar = forwardRef<HTMLElement, GlobalNavigationBarProps>(
  function GlobalNavigationBar(
    {
      children,
      brandBadge = false,
      onBrandClick,
      inboxBadgeCount,
      onSearchClick,
      onInboxClick,
      onHelpClick,
      profileAvatarSrc,
      profileInitials,
      profileLabel = "Account",
      onProfileClick,
      secondaryAvatarSrc,
      secondaryInitials,
      secondaryLabel = "Workspace",
      onSecondaryProfileClick,
      dwellDelay = 240,
      velocityThreshold = 0.6,
      exitGrace = 180,
      className,
      ...rest
    },
    ref,
  ) {
    const [expanded, setExpanded] = useState(false);

    const onEnter = useCallback(() => setExpanded(true), []);
    const onLeave = useCallback(() => setExpanded(false), []);

    const smartHover = useSmartHover({
      onEnter,
      onLeave,
      dwellDelay,
      velocityThreshold,
      exitGrace,
    });

    const iconOnly = !expanded;

    return (
      <NavBarContext.Provider value={expanded}>
        <nav
          ref={ref}
          aria-label="Global navigation"
          className={cx(
            styles.root,
            expanded && styles.expanded,
            className,
          )}
          onMouseEnter={smartHover.onMouseEnter}
          onMouseMove={smartHover.onMouseMove}
          onMouseLeave={smartHover.onMouseLeave}
          {...rest}
        >
          <div className={styles.bar}>
            <NavigationBrandItem
              iconOnly={iconOnly}
              badge={brandBadge}
              onClick={onBrandClick}
            />

            <ScrollFade
              direction="vertical"
              surface="over"
              className={styles.content}
              scrollAreaClassName={styles.scrollArea}
            >
              {children}
            </ScrollFade>

            <div className={styles.bottom}>
            <div className={styles.toolsGroup}>
              <NavigationItem
                label="Search"
                leadingIcon={<Icon name="search" size={20} />}
                iconOnly={iconOnly}
                onClick={onSearchClick}
              />
              <NavigationItem
                label="Inbox"
                leadingIcon={<Icon name="notifications" size={20} />}
                iconOnly={iconOnly}
                badgeCount={inboxBadgeCount}
                onClick={onInboxClick}
              />
              <NavigationItem
                label="Help & Feedback"
                leadingIcon={<Icon name="help" size={20} />}
                iconOnly={iconOnly}
                onClick={onHelpClick}
              />
            </div>

            <Divider />

            <div className={styles.profileGroup}>
              <NavigationProfileItem
                label={profileLabel}
                avatarSrc={profileAvatarSrc}
                avatarInitials={profileInitials}
                iconOnly={iconOnly}
                chevron
                onClick={onProfileClick}
              />
              <NavigationProfileItem
                label={secondaryLabel}
                avatarSrc={secondaryAvatarSrc}
                avatarInitials={secondaryInitials}
                iconOnly={iconOnly}
                chevron
                onClick={onSecondaryProfileClick}
              />
            </div>
          </div>
          </div>
        </nav>
      </NavBarContext.Provider>
    );
  },
);

GlobalNavigationBar.displayName = "GlobalNavigationBar";
