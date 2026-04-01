import { useState, useMemo, useEffect, useCallback } from "react";
import { Icon, searchIcons, getCategories } from "./components/Icon";
import type { IconCategory, IconEntry } from "./components/Icon";
import { ContentSwitcher } from "./components/ContentSwitcher";
import { ContentSwitcherItem } from "./components/ContentSwitcherItem";
import ButtonPlayground from "./pages/ButtonPlayground";
import ScrollFadePage from "./pages/ScrollFadePage";
import EmptyStatePlayground from "./pages/EmptyStatePlayground";
import ExpanderPlayground from "./pages/ExpanderPlayground";
import CardPlayground from "./pages/CardPlayground";
import CodeBlockPlayground from "./pages/CodeBlockPlayground";
import ContainerPlayground from "./pages/ContainerPlayground";
import CopyButtonPlayground from "./pages/CopyButtonPlayground";
import InlineCodePlayground from "./pages/InlineCodePlayground";
import CalloutPlayground from "./pages/CalloutPlayground";
import DividerPlayground from "./pages/DividerPlayground";
import ButtonGroupPlayground from "./pages/ButtonGroupPlayground";
import InputClearPlayground from "./pages/InputClearPlayground";
import ChipPlayground from "./pages/ChipPlayground";
import ToggleChipPlayground from "./pages/ToggleChipPlayground";
import SelectChipPlayground from "./pages/SelectChipPlayground";
import BadgePlayground from "./pages/BadgePlayground";
import IconBadgePlayground from "./pages/IconBadgePlayground";
import NotificationBadgePlayground from "./pages/NotificationBadgePlayground";
import ExpandableBadgePlayground from "./pages/ExpandableBadgePlayground";
import IllustrationPlayground from "./pages/IllustrationPlayground";
import ImageryPlayground from "./pages/ImageryPlayground";
import AvatarPlayground from "./pages/AvatarPlayground";
import ContentSwitcherItemPlayground from "./pages/ContentSwitcherItemPlayground";
import ContentSwitcherPlayground from "./pages/ContentSwitcherPlayground";
import TooltipPlayground from "./pages/TooltipPlayground";
import InputPlayground from "./pages/InputPlayground";
import KeyboardShortcutPlayground from "./pages/KeyboardShortcutPlayground";
import HintPlayground from "./pages/HintPlayground";
import LabelPlayground from "./pages/LabelPlayground";
import CheckboxPlayground from "./pages/CheckboxPlayground";
import RadioPlayground from "./pages/RadioPlayground";
import TogglePlayground from "./pages/TogglePlayground";
import TagPlayground from "./pages/TagPlayground";
import RowContainerPlayground from "./pages/RowContainerPlayground";
import OptionItemLeadingPlayground from "./pages/OptionItemLeadingPlayground";
import OptionItemTrailingPlayground from "./pages/OptionItemTrailingPlayground";
import MultiSelectOptionPlayground from "./pages/MultiSelectOptionPlayground";
import SingleSelectOptionPlayground from "./pages/SingleSelectOptionPlayground";
import GenericSelectOptionPlayground from "./pages/GenericSelectOptionPlayground";
import GridPlayground from "./pages/GridPlayground";
import NavigationSelectOptionPlayground from "./pages/NavigationSelectOptionPlayground";
import TagMultiSelectOptionPlayground from "./pages/TagMultiSelectOptionPlayground";
import TagSingleSelectOptionPlayground from "./pages/TagSingleSelectOptionPlayground";
import AddItemOptionPlayground from "./pages/AddItemOptionPlayground";
import OptionSeparatorPlayground from "./pages/OptionSeparatorPlayground";
import InlineInputPlayground from "./pages/InlineInputPlayground";
import SearchInputAttachmentPlayground from "./pages/SearchInputAttachmentPlayground";
import SearchInputPlayground from "./pages/SearchInputPlayground";
import SelectOptionHeaderPlayground from "./pages/SelectOptionHeaderPlayground";
import DropdownPlayground from "./pages/DropdownPlayground";
import EntityPlayground from "./pages/EntityPlayground";
import FeedbackBooleanPlayground from "./pages/FeedbackBooleanPlayground";
import ThumbnailPlayground from "./pages/ThumbnailPlayground";
import SpinnerPlayground from "./pages/SpinnerPlayground";
import CurrencyThumbnailPlayground from "./pages/CurrencyThumbnailPlayground";
import FileTypeThumbnailPlayground from "./pages/FileTypeThumbnailPlayground";
import FileAttachmentPlayground from "./pages/FileAttachmentPlayground";
import SelectButtonPlayground from "./pages/SelectButtonPlayground";
import SelectPlayground from "./pages/SelectPlayground";
import SelectInputPlayground from "./pages/SelectInputPlayground";
import MultiSelectInputPlayground from "./pages/MultiSelectInputPlayground";
import ComboboxPlayground from "./pages/ComboboxPlayground";
import SliderPlayground from "./pages/SliderPlayground";
import InlineMessagePlayground from "./pages/InlineMessagePlayground";
import DimmerPlayground from "./pages/DimmerPlayground";
import DragHandlePlayground from "./pages/DragHandlePlayground";
import DrawerPlayground from "./pages/DrawerPlayground";
import ModalPlayground from "./pages/ModalPlayground";
import FieldsetPlayground from "./pages/FieldsetPlayground";
import FooterPlayground from "./pages/FooterPlayground";
import TitleTextPlayground from "./pages/TitleTextPlayground";
import BodyTextPlayground from "./pages/BodyTextPlayground";
import BarChartPlayground from "./pages/BarChartPlayground";
import ChartLegendPlayground from "./pages/ChartLegendPlayground";
import LineChartPlayground from "./pages/LineChartPlayground";
import PieChartPlayground from "./pages/PieChartPlayground";
import LinkPlayground from "./pages/LinkPlayground";
import TextShowcase from "./pages/TextShowcase";
import TextareaPlayground from "./pages/TextareaPlayground";
import DataTablePlayground from "./pages/DataTablePlayground";
import DataVizColorsPlayground from "./pages/DataVizColorsPlayground";
import AnimatedIconsPlayground from "./pages/AnimatedIconsPlayground";
import CheckboxAnimTestPlayground from "./pages/CheckboxAnimTestPlayground";
import TypographyPlayground from "./pages/TypographyPlayground";
import ShimmerPlayground from "./pages/ShimmerPlayground";
import DataCellContentPlayground from "./pages/DataCellContentPlayground";
import AccordionPlayground from "./pages/AccordionPlayground";
import BreadcrumbPlayground from "./pages/BreadcrumbPlayground";
import AITextGenerationPlayground from "./pages/AITextGenerationPlayground";
import GlobalNavigationBarPlayground from "./pages/GlobalNavigationBarPlayground";
import HeaderPlayground from "./pages/HeaderPlayground";
import IconContainerPlayground from "./pages/IconContainerPlayground";
import NavigationBrandItemPlayground from "./pages/NavigationBrandItemPlayground";
import NavigationCategoryItemPlayground from "./pages/NavigationCategoryItemPlayground";
import NavigationItemPlayground from "./pages/NavigationItemPlayground";
import NavigationItemTest2Playground from "./pages/NavigationItemTest2Playground";
import NavBarContentPlayground from "./pages/NavBarContentPlayground";
import NavbarPlayground from "./pages/NavbarPlayground";
import NavigationProfileItemPlayground from "./pages/NavigationProfileItemPlayground";
import NavigationSubItemPlayground from "./pages/NavigationSubItemPlayground";
import ShortcutTooltipPlayground from "./pages/ShortcutTooltipPlayground";
import SidebarPlayground from "./pages/SidebarPlayground";
import SortableListPlayground from "./pages/SortableListPlayground";
import StepperPlayground from "./pages/StepperPlayground";
import SpecialInputPlayground from "./pages/SpecialInputPlayground";
import TestProgressiveBlurPlayground from "./pages/TestProgressiveBlurPlayground";
import TabBarPlayground from "./pages/TabBarPlayground";
import ToastPlayground from "./pages/ToastPlayground";
import ToolbarButtonPlayground from "./pages/ToolbarButtonPlayground";
import VideoPlayerPlayground from "./pages/VideoPlayerPlayground";
import "./App.css";

type Theme = "light" | "dark" | "dusk";
type Page = "button" | "icons" | "scroll-fade" | "expander" | "callout" | "divider" | "button-group" | "input-clear" | "input" | "chip" | "toggle-chip" | "select-chip" | "badge" | "icon-badge" | "notification-badge" | "expandable-badge" | "imagery" | "avatar" | "content-switcher-item" | "content-switcher" | "tooltip" | "keyboard-shortcut" | "hint" | "label" | "checkbox" | "radio" | "toggle" | "tag" | "row-container" | "option-leading" | "option-trailing" | "multi-select-option" | "single-select-option" | "generic-select-option" | "navigation-select-option" | "tag-multi-select-option" | "tag-single-select-option" | "add-item-option" | "option-separator" | "inline-input" | "search-input-attachment" | "search-input" | "select-option-header" | "dropdown" | "thumbnail" | "spinner" | "currency-thumbnail" | "file-type-thumbnail" | "file-attachment" | "select-button" | "select" | "select-input" | "multi-select-input" | "combobox" | "slider" | "inline-message" | "fieldset" | "title-text" | "body-text" | "link" | "text-showcase" | "textarea" | "data-table" | "animated-icons" | "typography" | "shimmer" | "data-cell-content"
| "data-viz-colors"
| "card"
| "code-block"
| "copy-button"
| "inline-code"
| "icon-container"
| "illustration"
| "bar-chart"
| "chart-legend"
| "line-chart"
| "pie-chart"
| "breadcrumb"
| "dimmer"
| "drag-handle"
| "modal"
| "accordion"
| "grid"
| "drawer"
| "footer"
| "global-navigation-bar"
| "header"
| "navigation-brand-item"
| "navigation-category-item"
| "navigation-item"
| "navigation-item-test2"
| "navbar"
| "navbar-content"
| "navigation-sub-item"
| "navigation-profile-item"
| "empty-state"
| "entity"
| "feedback-boolean"
| "shortcut-tooltip"
| "sidebar"
| "sortable-list"
| "special-input"
| "tab-bar"
| "test-progressive-blur"
| "toast"
| "toolbar-button"
| "ai-text-generation"
| "container"
| "stepper"
| "video-player"
| "checkbox-anim-test"


const MONOCHROME = new Set<string>(["originals", "custom", "logo"]);
const CATEGORY_LABELS: Record<IconCategory, string> = {
  originals: "Originals",
  custom: "Custom",
  logo: "Logo",
  "logo-color": "Logo Color",
  flag: "Flag",
};

function IconsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IconCategory | "all">("all");
  const [iconSize, setIconSize] = useState<number>(24);

  const results = useMemo(() => {
    const cat = category === "all" ? undefined : category;
    return searchIcons(query, cat);
  }, [query, category]);

  const grouped = useMemo(() => {
    const map = new Map<string, IconEntry[]>();
    for (const icon of results) {
      const cat = icon.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(icon);
    }
    return map;
  }, [results]);

  return (
    <>
      <div className="search-bar">
        <Icon name="search" size={20} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search icons by name or keyword…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => setQuery("")}>
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      <div className="size-filter">
        {[14, 16, 20, 24, 32].map((s) => (
          <button
            key={s}
            className={`cat-btn ${iconSize === s ? "active" : ""}`}
            onClick={() => setIconSize(s)}
          >
            {s}px
          </button>
        ))}
      </div>

      <div className="category-filter">
        <button
          className={`cat-btn ${category === "all" ? "active" : ""}`}
          onClick={() => setCategory("all")}
        >
          All ({results.length})
        </button>
        {getCategories().map((cat) => {
          const count = grouped.get(cat)?.length ?? 0;
          return (
            <button
              key={cat}
              className={`cat-btn ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {CATEGORY_LABELS[cat]} ({category === "all" ? count : category === cat ? results.length : count})
            </button>
          );
        })}
      </div>

      <p className="results-count">{results.length} icon{results.length !== 1 ? "s" : ""}</p>

      {category === "all" ? (
        Array.from(grouped.entries()).map(([cat, icons]) => (
          <section key={cat} className="icon-section">
            <h2 className="section-title">{CATEGORY_LABELS[cat as IconCategory]}</h2>
            <div className="icon-grid">
              {icons.map((icon) => (
                <div key={icon.name} className="icon-cell" title={icon.description}>
                  <div className="icon-preview">
                    <Icon
                      name={icon.name}
                      size={iconSize}
                      className={MONOCHROME.has(icon.category) ? "icon-mono" : ""}
                    />
                  </div>
                  <span className="icon-name">{icon.name}</span>
                </div>
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="icon-grid">
          {results.map((icon) => (
            <div key={icon.name} className="icon-cell" title={icon.description}>
              <div className="icon-preview">
                <Icon
                  name={icon.name}
                  size={iconSize}
                  className={MONOCHROME.has(icon.category) ? "icon-mono" : ""}
                />
              </div>
              <span className="icon-name">{icon.name}</span>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && (
        <div className="empty-state">
          <Icon name="search_off" size={48} className="icon-mono" />
          <p>No icons found for "{query}"</p>
        </div>
      )}
    </>
  );
}

function getPageFromPath(): Page {
  const path = window.location.pathname.replace(/^\//, "") || "button";
  return path as Page;
}

const PAGES: { key: Page; label: string }[] = [
  { key: "accordion", label: "Accordion" },
  { key: "add-item-option", label: "AddItemOpt" },
  { key: "ai-text-generation", label: "AI TextGen" },
  { key: "animated-icons", label: "AnimatedIcons" },
  { key: "avatar", label: "Avatar" },
  { key: "badge", label: "Badge" },
  { key: "bar-chart", label: "BarChart" },
  { key: "body-text", label: "BodyText" },
  { key: "breadcrumb", label: "Breadcrumb" },
  { key: "button", label: "Button" },
  { key: "button-group", label: "ButtonGroup" },
  { key: "callout", label: "Callout" },
  { key: "card", label: "Card" },
  { key: "chart-legend", label: "ChartLegend" },
  { key: "code-block", label: "CodeBlock" },
  { key: "checkbox", label: "Checkbox" },
  { key: "checkbox-anim-test", label: "CheckboxAnimTest" },
  { key: "chip", label: "Chip" },
  { key: "combobox", label: "Combobox" },
  { key: "container", label: "Container" },
  { key: "copy-button", label: "CopyButton" },
  { key: "content-switcher", label: "ContentSwitcher" },
  { key: "content-switcher-item", label: "CSItem" },
  { key: "currency-thumbnail", label: "CurrencyThumb" },
  { key: "data-cell-content", label: "DataCellContent" },
  { key: "data-table", label: "DataTable" },
  { key: "data-viz-colors", label: "DataVizColors" },
  { key: "dimmer", label: "Dimmer" },
  { key: "divider", label: "Divider" },
  { key: "drag-handle", label: "DragHandle" },
  { key: "drawer", label: "Drawer" },
  { key: "dropdown", label: "Dropdown" },
  { key: "empty-state", label: "EmptyState" },
  { key: "entity", label: "Entity" },
  { key: "expandable-badge", label: "ExpandableBadge" },
  { key: "expander", label: "Expander" },
  { key: "feedback-boolean", label: "FeedbackBoolean" },
  { key: "fieldset", label: "Fieldset" },
  { key: "file-attachment", label: "FileAttachment" },
  { key: "file-type-thumbnail", label: "FileTypeThumb" },
  { key: "footer", label: "Footer" },
  { key: "generic-select-option", label: "GenericOpt" },
  { key: "global-navigation-bar", label: "GlobalNavBar" },
  { key: "grid", label: "Grid" },
  { key: "header", label: "Header" },
  { key: "hint", label: "Hint" },
  { key: "icon-badge", label: "IconBadge" },
  { key: "icon-container", label: "IconContainer" },
  { key: "icons", label: "Icons" },
  { key: "illustration", label: "Illustration" },
  { key: "imagery", label: "Imagery" },
  { key: "inline-code", label: "InlineCode" },
  { key: "inline-input", label: "InlineInput" },
  { key: "inline-message", label: "InlineMessage" },
  { key: "input", label: "Input" },
  { key: "input-clear", label: "InputClear" },
  { key: "keyboard-shortcut", label: "KbdShortcut" },
  { key: "label", label: "Label" },
  { key: "line-chart", label: "LineChart" },
  { key: "link", label: "Link" },
  { key: "modal", label: "Modal" },
  { key: "multi-select-input", label: "MultiSelectInput" },
  { key: "multi-select-option", label: "MultiSelectOpt" },
  { key: "navbar", label: "Navbar" },
  { key: "navbar-content", label: "NavBarContent" },
  { key: "navigation-brand-item", label: "NavBrandItem" },
  { key: "navigation-category-item", label: "NavCategoryItem" },
  { key: "navigation-item", label: "NavItem" },
  { key: "navigation-item-test2", label: "NavItemTest2" },
  { key: "navigation-profile-item", label: "NavProfileItem" },
  { key: "navigation-sub-item", label: "NavSubItem" },
  { key: "navigation-select-option", label: "NavOpt" },
  { key: "notification-badge", label: "NotificationBadge" },
  { key: "option-leading", label: "OptionLeading" },
  { key: "option-separator", label: "OptionSeparator" },
  { key: "option-trailing", label: "OptionTrailing" },
  { key: "pie-chart", label: "PieChart" },
  { key: "radio", label: "Radio" },
  { key: "row-container", label: "RowContainer" },
  { key: "scroll-fade", label: "ScrollFade" },
  { key: "search-input", label: "SearchInput" },
  { key: "search-input-attachment", label: "SearchAttach" },
  { key: "select", label: "Select" },
  { key: "select-button", label: "SelectButton" },
  { key: "select-chip", label: "SelectChip" },
  { key: "select-input", label: "SelectInput" },
  { key: "select-option-header", label: "SelectOptHeader" },
  { key: "shimmer", label: "Shimmer" },
  { key: "shortcut-tooltip", label: "ShortcutTooltip" },
  { key: "sidebar", label: "Sidebar" },
  { key: "single-select-option", label: "SingleSelectOpt" },
  { key: "slider", label: "Slider" },
  { key: "sortable-list", label: "SortableList" },
  { key: "special-input", label: "SpecialInput" },
  { key: "spinner", label: "Spinner" },
  { key: "stepper", label: "Stepper" },
  { key: "tab-bar", label: "TabBar" },
  { key: "tag", label: "Tag" },
  { key: "tag-multi-select-option", label: "TagMultiOpt" },
  { key: "tag-single-select-option", label: "TagSingleOpt" },
  { key: "test-progressive-blur", label: "TestProgBlur" },
  { key: "textarea", label: "Textarea" },
  { key: "text-showcase", label: "TextShowcase" },
  { key: "thumbnail", label: "Thumbnail" },
  { key: "title-text", label: "TitleText" },
  { key: "toast", label: "Toast" },
  { key: "toggle", label: "Toggle" },
  { key: "toggle-chip", label: "ToggleChip" },
  { key: "toolbar-button", label: "ToolbarButton" },
  { key: "tooltip", label: "Tooltip" },
  { key: "typography", label: "Typography" },
  { key: "video-player", label: "VideoPlayer" },
];

export default function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [density, setDensity] = useState<"normal" | "dense">("normal");
  const [typeface, setTypeface] = useState<"mac" | "windows" | "marketing" | "inter">("mac");
  const [page, setPageState] = useState<Page>(getPageFromPath);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  const setPage = useCallback((p: Page) => {
    setPageState(p);
    setSidebarOpen(false);
    window.history.pushState(null, "", `/${p}`);
  }, []);

  useEffect(() => {
    const onPop = () => setPageState(getPageFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const filteredPages = useMemo(() => {
    if (!navSearch.trim()) return PAGES;
    const q = navSearch.toLowerCase();
    return PAGES.filter((p) => p.label.toLowerCase().includes(q) || p.key.toLowerCase().includes(q));
  }, [navSearch]);

  return (
    <div className="app" data-theme={theme} data-density={density} data-typeface={typeface}>
      <div className="app-shell">
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
        <aside className={`app-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-search">
            <input
              type="text"
              className="sidebar-search-input"
              placeholder="Search…"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
            />
          </div>
          <nav className="sidebar-nav">
            {filteredPages.map((p) => (
              <button
                key={p.key}
                className={`sidebar-btn ${page === p.key ? "active" : ""}`}
                onClick={() => setPage(p.key)}
              >
                {p.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="app-main">
          <div className="app-topbar" data-density="normal" data-typeface="mac">
            <button className="burger-btn" onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle menu">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <ContentSwitcher
              size="lg"
              emphasis="high"
              value={theme}
              onChange={(v) => setTheme(v as Theme)}
            >
              <ContentSwitcherItem value="light">Light</ContentSwitcherItem>
              <ContentSwitcherItem value="dark">Dark</ContentSwitcherItem>
              <ContentSwitcherItem value="dusk">Dusk</ContentSwitcherItem>
            </ContentSwitcher>

            <ContentSwitcher
              size="lg"
              emphasis="high"
              value={density}
              onChange={(v) => setDensity(v as "normal" | "dense")}
            >
              <ContentSwitcherItem value="normal">Normal</ContentSwitcherItem>
              <ContentSwitcherItem value="dense">Dense</ContentSwitcherItem>
            </ContentSwitcher>

            <ContentSwitcher
              size="lg"
              emphasis="high"
              value={typeface}
              onChange={(v) => setTypeface(v as "mac" | "windows" | "marketing" | "inter")}
            >
              <ContentSwitcherItem value="mac">Mac</ContentSwitcherItem>
              <ContentSwitcherItem value="windows">Windows</ContentSwitcherItem>
              <ContentSwitcherItem value="marketing">Marketing</ContentSwitcherItem>
              <ContentSwitcherItem value="inter">Inter</ContentSwitcherItem>
            </ContentSwitcher>
          </div>

          <div className="app-content" style={page === "navbar-content" ? { maxWidth: "none" } : undefined}>
            {page === "button" && <ButtonPlayground />}
            {page === "icon-container" && <IconContainerPlayground />}
            {page === "icons" && <IconsPage />}
            {page === "scroll-fade" && <ScrollFadePage />}
            {page === "expander" && <ExpanderPlayground />}
            {page === "callout" && <CalloutPlayground />}
            {page === "card" && <CardPlayground />}
            {page === "code-block" && <CodeBlockPlayground />}
            {page === "container" && <ContainerPlayground />}
            {page === "copy-button" && <CopyButtonPlayground />}
            {page === "divider" && <DividerPlayground />}
            {page === "button-group" && <ButtonGroupPlayground />}
            {page === "input-clear" && <InputClearPlayground />}
            {page === "input" && <InputPlayground />}
            {page === "chip" && <ChipPlayground />}
            {page === "toggle-chip" && <ToggleChipPlayground />}
            {page === "select-chip" && <SelectChipPlayground />}
            {page === "badge" && <BadgePlayground />}
            {page === "icon-badge" && <IconBadgePlayground />}
            {page === "notification-badge" && <NotificationBadgePlayground />}
            {page === "expandable-badge" && <ExpandableBadgePlayground />}
            {page === "illustration" && <IllustrationPlayground />}
            {page === "imagery" && <ImageryPlayground />}
            {page === "avatar" && <AvatarPlayground />}
            {page === "content-switcher-item" && <ContentSwitcherItemPlayground />}
            {page === "content-switcher" && <ContentSwitcherPlayground />}
            {page === "tooltip" && <TooltipPlayground />}
            {page === "keyboard-shortcut" && <KeyboardShortcutPlayground />}
            {page === "hint" && <HintPlayground />}
            {page === "label" && <LabelPlayground />}
            {page === "checkbox" && <CheckboxPlayground />}
            {page === "checkbox-anim-test" && <CheckboxAnimTestPlayground />}
            {page === "radio" && <RadioPlayground />}
            {page === "toggle" && <TogglePlayground />}
            {page === "tag" && <TagPlayground />}
            {page === "row-container" && <RowContainerPlayground />}
            {page === "option-leading" && <OptionItemLeadingPlayground />}
            {page === "option-trailing" && <OptionItemTrailingPlayground />}
            {page === "multi-select-option" && <MultiSelectOptionPlayground />}
            {page === "single-select-option" && <SingleSelectOptionPlayground />}
            {page === "generic-select-option" && <GenericSelectOptionPlayground />}
            {page === "dimmer" && <DimmerPlayground />}
            {page === "drawer" && <DrawerPlayground />}
            {page === "footer" && <FooterPlayground />}
            {page === "global-navigation-bar" && <GlobalNavigationBarPlayground />}
            {page === "grid" && <GridPlayground />}
            {page === "header" && <HeaderPlayground />}
            {page === "navigation-brand-item" && <NavigationBrandItemPlayground />}
            {page === "navigation-category-item" && <NavigationCategoryItemPlayground />}
            {page === "navigation-item" && <NavigationItemPlayground />}
            {page === "navigation-item-test2" && <NavigationItemTest2Playground />}
            {page === "navigation-profile-item" && <NavigationProfileItemPlayground />}
            {page === "navigation-sub-item" && <NavigationSubItemPlayground />}
            {page === "navigation-select-option" && <NavigationSelectOptionPlayground />}
            {page === "tag-multi-select-option" && <TagMultiSelectOptionPlayground />}
            {page === "tag-single-select-option" && <TagSingleSelectOptionPlayground />}
            {page === "add-item-option" && <AddItemOptionPlayground />}
            {page === "option-separator" && <OptionSeparatorPlayground />}
            {page === "inline-code" && <InlineCodePlayground />}
            {page === "inline-input" && <InlineInputPlayground />}
            {page === "search-input-attachment" && <SearchInputAttachmentPlayground />}
            {page === "search-input" && <SearchInputPlayground />}
            {page === "select-option-header" && <SelectOptionHeaderPlayground />}
            {page === "drag-handle" && <DragHandlePlayground />}
            {page === "dropdown" && <DropdownPlayground />}
            {page === "empty-state" && <EmptyStatePlayground />}
            {page === "entity" && <EntityPlayground />}
            {page === "feedback-boolean" && <FeedbackBooleanPlayground />}
            {page === "thumbnail" && <ThumbnailPlayground />}
            {page === "spinner" && <SpinnerPlayground />}
            {page === "currency-thumbnail" && <CurrencyThumbnailPlayground />}
            {page === "file-type-thumbnail" && <FileTypeThumbnailPlayground />}
            {page === "file-attachment" && <FileAttachmentPlayground />}
            {page === "select-button" && <SelectButtonPlayground />}
            {page === "select" && <SelectPlayground />}
            {page === "select-input" && <SelectInputPlayground />}
            {page === "multi-select-input" && <MultiSelectInputPlayground />}
            {page === "combobox" && <ComboboxPlayground />}
            {page === "slider" && <SliderPlayground />}
            {page === "inline-message" && <InlineMessagePlayground />}
            {page === "modal" && <ModalPlayground />}
            {page === "fieldset" && <FieldsetPlayground />}
            {page === "title-text" && <TitleTextPlayground />}
            {page === "body-text" && <BodyTextPlayground />}
            {page === "bar-chart" && <BarChartPlayground />}
            {page === "chart-legend" && <ChartLegendPlayground />}
            {page === "line-chart" && <LineChartPlayground />}
            {page === "pie-chart" && <PieChartPlayground />}
            {page === "link" && <LinkPlayground />}
            {page === "text-showcase" && <TextShowcase />}
            {page === "textarea" && <TextareaPlayground />}
            {page === "data-table" && <DataTablePlayground />}
            {page === "data-viz-colors" && <DataVizColorsPlayground />}
            {page === "animated-icons" && <AnimatedIconsPlayground />}
            {page === "typography" && <TypographyPlayground />}
            {page === "video-player" && <VideoPlayerPlayground />}
            {page === "shimmer" && <ShimmerPlayground />}
            {page === "navbar" && <NavbarPlayground />}
            {page === "navbar-content" && <NavBarContentPlayground />}
            {page === "shortcut-tooltip" && <ShortcutTooltipPlayground />}
            {page === "test-progressive-blur" && <TestProgressiveBlurPlayground />}
            {page === "toast" && <ToastPlayground />}
            {page === "toolbar-button" && <ToolbarButtonPlayground />}
            {page === "sidebar" && <SidebarPlayground />}
            {page === "sortable-list" && <SortableListPlayground />}
            {page === "tab-bar" && <TabBarPlayground />}
            {page === "special-input" && <SpecialInputPlayground />}
            {page === "stepper" && <StepperPlayground />}
            {page === "data-cell-content" && <DataCellContentPlayground />}
            {page === "accordion" && <AccordionPlayground />}
            {page === "breadcrumb" && <BreadcrumbPlayground />}
            {page === "ai-text-generation" && <AITextGenerationPlayground />}
          </div>
        </main>
      </div>
    </div>
  );
}
