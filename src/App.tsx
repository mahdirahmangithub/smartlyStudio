import { useState, useMemo, useEffect, useCallback } from "react";
import { Icon, searchIcons, getCategories } from "./components/Icon";
import type { IconCategory, IconEntry } from "./components/Icon";
import ButtonPlayground from "./pages/ButtonPlayground";
import ScrollFadePage from "./pages/ScrollFadePage";
import ExpanderPlayground from "./pages/ExpanderPlayground";
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
import FieldsetPlayground from "./pages/FieldsetPlayground";
import "./App.css";

type Theme = "light" | "dark" | "dusk";
type Page = "button" | "icons" | "scroll-fade" | "expander" | "callout" | "divider" | "button-group" | "input-clear" | "input" | "chip" | "toggle-chip" | "select-chip" | "badge" | "icon-badge" | "notification-badge" | "expandable-badge" | "imagery" | "avatar" | "content-switcher-item" | "content-switcher" | "tooltip" | "keyboard-shortcut" | "hint" | "label" | "checkbox" | "radio" | "toggle" | "tag" | "row-container" | "option-leading" | "option-trailing" | "multi-select-option" | "single-select-option" | "generic-select-option" | "navigation-select-option" | "tag-multi-select-option" | "tag-single-select-option" | "add-item-option" | "option-separator" | "inline-input" | "search-input-attachment" | "search-input" | "select-option-header" | "dropdown" | "thumbnail" | "spinner" | "currency-thumbnail" | "file-type-thumbnail" | "file-attachment" | "select-button" | "select" | "select-input" | "multi-select-input" | "combobox" | "slider" | "inline-message" | "fieldset";

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
                      size={24}
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
                  size={24}
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

export default function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [density, setDensity] = useState<"normal" | "dense">("normal");
  const [page, setPageState] = useState<Page>(getPageFromPath);

  const setPage = useCallback((p: Page) => {
    setPageState(p);
    window.history.pushState(null, "", `/${p}`);
  }, []);

  useEffect(() => {
    const onPop = () => setPageState(getPageFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const pages: { key: Page; label: string }[] = [
    { key: "button", label: "Button" },
    { key: "icons", label: "Icons" },
    { key: "scroll-fade", label: "ScrollFade" },
    { key: "expander", label: "Expander" },
    { key: "callout", label: "Callout" },
    { key: "divider", label: "Divider" },
    { key: "button-group", label: "ButtonGroup" },
    { key: "input-clear", label: "InputClear" },
    { key: "input", label: "Input" },
    { key: "chip", label: "Chip" },
    { key: "toggle-chip", label: "ToggleChip" },
    { key: "select-chip", label: "SelectChip" },
    { key: "badge", label: "Badge" },
    { key: "icon-badge", label: "IconBadge" },
    { key: "notification-badge", label: "NotificationBadge" },
    { key: "expandable-badge", label: "ExpandableBadge" },
    { key: "imagery", label: "Imagery" },
    { key: "avatar", label: "Avatar" },
    { key: "content-switcher-item", label: "CSItem" },
    { key: "content-switcher", label: "ContentSwitcher" },
    { key: "tooltip", label: "Tooltip" },
    { key: "keyboard-shortcut", label: "KbdShortcut" },
    { key: "hint", label: "Hint" },
    { key: "label", label: "Label" },
    { key: "checkbox", label: "Checkbox" },
    { key: "radio", label: "Radio" },
    { key: "toggle", label: "Toggle" },
    { key: "tag", label: "Tag" },
    { key: "row-container", label: "RowContainer" },
    { key: "option-leading", label: "OptionLeading" },
    { key: "option-trailing", label: "OptionTrailing" },
    { key: "multi-select-option", label: "MultiSelectOpt" },
    { key: "single-select-option", label: "SingleSelectOpt" },
    { key: "generic-select-option", label: "GenericOpt" },
    { key: "navigation-select-option", label: "NavOpt" },
    { key: "tag-multi-select-option", label: "TagMultiOpt" },
    { key: "tag-single-select-option", label: "TagSingleOpt" },
    { key: "add-item-option", label: "AddItemOpt" },
    { key: "option-separator", label: "OptionSeparator" },
    { key: "inline-input", label: "InlineInput" },
    { key: "search-input-attachment", label: "SearchAttach" },
    { key: "search-input", label: "SearchInput" },
    { key: "select-option-header", label: "SelectOptHeader" },
    { key: "dropdown", label: "Dropdown" },
    { key: "thumbnail", label: "Thumbnail" },
    { key: "spinner", label: "Spinner" },
    { key: "currency-thumbnail", label: "CurrencyThumb" },
    { key: "file-type-thumbnail", label: "FileTypeThumb" },
    { key: "file-attachment", label: "FileAttachment" },
    { key: "select-button", label: "SelectButton" },
    { key: "select", label: "Select" },
    { key: "select-input", label: "SelectInput" },
    { key: "multi-select-input", label: "MultiSelectInput" },
    { key: "combobox", label: "Combobox" },
    { key: "slider", label: "Slider" },
    { key: "inline-message", label: "InlineMessage" },
    { key: "fieldset", label: "Fieldset" },
  ];

  return (
    <div className="app" data-theme={theme} data-density={density}>
      <div className="app-shell">
        <main className="app-main">
          <div className="app-topbar">
            <div className="mode-switcher">
              {(["light", "dark", "dusk"] as const).map((t) => (
                <button
                  key={t}
                  className={`mode-btn ${theme === t ? "active" : ""}`}
                  onClick={() => setTheme(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div className="mode-switcher">
              {(["normal", "dense"] as const).map((d) => (
                <button
                  key={d}
                  className={`mode-btn ${density === d ? "active" : ""}`}
                  onClick={() => setDensity(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="app-content">
            {page === "button" && <ButtonPlayground />}
            {page === "icons" && <IconsPage />}
            {page === "scroll-fade" && <ScrollFadePage />}
            {page === "expander" && <ExpanderPlayground />}
            {page === "callout" && <CalloutPlayground />}
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
            {page === "imagery" && <ImageryPlayground />}
            {page === "avatar" && <AvatarPlayground />}
            {page === "content-switcher-item" && <ContentSwitcherItemPlayground />}
            {page === "content-switcher" && <ContentSwitcherPlayground />}
            {page === "tooltip" && <TooltipPlayground />}
            {page === "keyboard-shortcut" && <KeyboardShortcutPlayground />}
            {page === "hint" && <HintPlayground />}
            {page === "label" && <LabelPlayground />}
            {page === "checkbox" && <CheckboxPlayground />}
            {page === "radio" && <RadioPlayground />}
            {page === "toggle" && <TogglePlayground />}
            {page === "tag" && <TagPlayground />}
            {page === "row-container" && <RowContainerPlayground />}
            {page === "option-leading" && <OptionItemLeadingPlayground />}
            {page === "option-trailing" && <OptionItemTrailingPlayground />}
            {page === "multi-select-option" && <MultiSelectOptionPlayground />}
            {page === "single-select-option" && <SingleSelectOptionPlayground />}
            {page === "generic-select-option" && <GenericSelectOptionPlayground />}
            {page === "navigation-select-option" && <NavigationSelectOptionPlayground />}
            {page === "tag-multi-select-option" && <TagMultiSelectOptionPlayground />}
            {page === "tag-single-select-option" && <TagSingleSelectOptionPlayground />}
            {page === "add-item-option" && <AddItemOptionPlayground />}
            {page === "option-separator" && <OptionSeparatorPlayground />}
            {page === "inline-input" && <InlineInputPlayground />}
            {page === "search-input-attachment" && <SearchInputAttachmentPlayground />}
            {page === "search-input" && <SearchInputPlayground />}
            {page === "select-option-header" && <SelectOptionHeaderPlayground />}
            {page === "dropdown" && <DropdownPlayground />}
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
            {page === "fieldset" && <FieldsetPlayground />}
          </div>
        </main>

        <aside className="app-sidebar">
          <nav className="sidebar-nav">
            {pages.map((p) => (
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
      </div>
    </div>
  );
}
