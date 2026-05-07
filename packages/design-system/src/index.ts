// Auto-curated barrel for @sds/design-system.
// Generous export — everything in components/, hooks/, utils/, plus token types.

// ── Components ──
export * from './components/AISideEntry';
export * from './components/Accordion';
export * from './components/ActionCard';
export * from './components/AddItemOption';
export * from './components/AiButton';
export * from './components/AiEntityPreview';
export * from './components/AiGeneration';
export * from './components/AiGenerationSuggestion';
export * from './components/AiLoadingLabel';
export * from './components/AiResponseBubble';
export * from './components/AiThread';
export * from './components/AnimatedIcons';
export * from './components/AppShell';
export * from './components/Avatar';
export * from './components/Badge';
export * from './components/BarChart';
export * from './components/BodyText';
export * from './components/Breadcrumb';
export * from './components/BreadcrumbItem';
export * from './components/BreadcrumbSelectItem';
export * from './components/Button';
export * from './components/ButtonGroup';
export * from './components/Calendar';
export * from './components/Callout';
export * from './components/Card';
export * from './components/ChartPrimitives';
export * from './components/Checkbox';
export * from './components/Chip';
export * from './components/CodeBlock';
export * from './components/ComboChart';
export * from './components/Combobox';
export * from './components/Container';
export * from './components/ContentSwitcher';
export * from './components/ContentSwitcherItem';
export * from './components/CopyButton';
export * from './components/Cot';
export * from './components/CurrencyThumbnail';
export * from './components/DataCellContent';
export * from './components/DataTable';
export * from './components/DateInput';
export * from './components/Dimmer';
export * from './components/Divider';
export * from './components/DragHandle';
export * from './components/DragHandleMenu';
export * from './components/Drawer';
export * from './components/Dropdown';
export * from './components/EditorPopover';
export * from './components/EmptyState';
export * from './components/Entity';
export * from './components/ExpandableBadge';
export * from './components/Expander';
export * from './components/FeedbackBoolean';
export * from './components/Fieldset';
export * from './components/FileAttachment';
export * from './components/FileTypeThumbnail';
export * from './components/FileUpload';
export * from './components/FileUploadDropzone';
export * from './components/FileUploadFileItem';
export * from './components/FileUploadFolderItem';
export * from './components/FileUploadList';
export * from './components/Footer';
export * from './components/GenericSelectOption';
export * from './components/GlobalNavigationBar';
/* Grid re-exports `Container` / `ContainerProps` (the layout container,
 * max-width wrapper) which collides with `./components/Container` (the
 * card-style Container with density / elevated / title / etc.). Keep
 * the canonical Container at the top level via `./components/Container`
 * and import the Grid-flavoured layout container directly via
 * `@sds/components/Grid` when needed (already the convention in apps,
 * templates, and prototypes). */
export { Grid, Col } from './components/Grid';
export type {
  ContainerMaxWidth,
  GridProps,
  GridGutter,
  GridInset,
  ColProps,
} from './components/Grid';
export * from './components/Header';
export * from './components/HeroCard';
export * from './components/Hint';
export * from './components/Icon';
export * from './components/IconBadge';
export * from './components/IconButton';
export * from './components/IconContainer';
export * from './components/IconThumbnail';
export * from './components/IconThumbnailRow';
export * from './components/IconToggleButton';
export * from './components/Illustration';
export * from './components/ImageCard';
export * from './components/Imagery';
export * from './components/InlineCode';
export * from './components/InlineInput';
export * from './components/InlineMessage';
export * from './components/InlineTextarea';
export * from './components/Input';
export * from './components/InputClear';
export * from './components/KeyboardShortcut';
export * from './components/Label';
export * from './components/LineChart';
export * from './components/Link';
export * from './components/MediaCard';
export * from './components/Modal';
export * from './components/MoreTag';
export * from './components/MultiSelectInput';
export * from './components/MultiSelectOption';
export * from './components/NavBarContent';
export * from './components/Navbar';
export * from './components/NavigationBrandItem';
export * from './components/NavigationCategoryItem';
export * from './components/NavigationItem';
export * from './components/NavigationItemTest2';
export * from './components/NavigationProfileItem';
export * from './components/NavigationSelectOption';
export * from './components/NavigationSubItem';
export * from './components/NotificationBadge';
export * from './components/OptionItemLeading';
export * from './components/OptionItemTrailing';
export * from './components/OptionSeparator';
export * from './components/Pagination';
export * from './components/PasswordInput';
export * from './components/PieChart';
export * from './components/Popover';
export * from './components/ProgressBar';
export * from './components/ProgressiveBlur';
export * from './components/PromptInput';
export * from './components/PromptOptionInput';
export * from './components/Radio';
export * from './components/ResponseBody';
export * from './components/RichTextEditor';
export * from './components/RowContainer';
export * from './components/ScrollFade';
export * from './components/SearchInput';
export * from './components/SearchInputAttachment';
export * from './components/Select';
export * from './components/SelectButton';
export * from './components/SelectChip';
export * from './components/SelectInput';
export * from './components/SelectOptionHeader';
export * from './components/SelectTile';
export * from './components/Shimmer';
export * from './components/ShortcutTooltip';
export * from './components/Sidebar';
export * from './components/SingleSelectOption';
export * from './components/Slider';
export * from './components/SortableList';
export * from './components/Spinner';
export * from './components/Stat';
export * from './components/Stepper';
export * from './components/SwitchField';
export * from './components/TabBar';
export * from './components/TabItem';
export * from './components/Tag';
export * from './components/TagMultiSelectOption';
export * from './components/TagSingleSelectOption';
export * from './components/Textarea';
export * from './components/Thumbnail';
export * from './components/TimeInput';
export * from './components/TitleText';
export * from './components/Toast';
export * from './components/Toggle';
export * from './components/ToggleButton';
export * from './components/ToggleChip';
export * from './components/ToolbarButton';
export * from './components/Tooltip';
export * from './components/TreeIndent';
export * from './components/UserBubble';
export * from './components/VideoPlayer';

// ── Hooks ──
export * from './hooks/useBreakpoint';
export * from './hooks/useCollapsible';
export * from './hooks/useFocusTrap';
export * from './hooks/useGlidePosition';
export * from './hooks/useIsTruncated';
export * from './hooks/useNumericInput';
export * from './hooks/usePathMorph';
export * from './hooks/useSegmentedInput';
export * from './hooks/useSeriesAnimation';
export * from './hooks/useSmartHover';
export * from './hooks/useTypewriter';

// ── Utils ──
export * from './utils/cx';
export * from './utils/detectSurface';
export * from './utils/easedGradient';
export * from './utils/inferFileType';
export * from './utils/spacing';
export * from './utils/syntaxTokenizer';
export * from './utils/textareaCaretRect';
export * from './utils/textareaTrigger';
export * from './utils/treeConnectors';

// ── Tokens (types) ──
export * from './tokens/breakpoints';
