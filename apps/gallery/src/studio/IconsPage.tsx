import { useState, useRef, useEffect, useMemo } from "react";
import { SearchInput } from "@sds/components/SearchInput";
import { TitleText } from "@sds/components/TitleText";
import { ToggleChip } from "@sds/components/ToggleChip";
import { RowContainer } from "@sds/components/RowContainer";
import { Divider } from "@sds/components/Divider";
import { Icon, searchIcons, getIconMeta } from "@sds/components/Icon";
import type { IconCategory } from "@sds/components/Icon";
import { iconMeta } from "@sds/components/Icon/iconData";
import { BodyText } from "@sds/components/BodyText";
import type { IconName } from "@sds/components/Icon";
import { EmptyState } from "@sds/components/EmptyState";
import { Drawer } from "@sds/components/Drawer";
import { CodeBlock } from "@sds/components/CodeBlock";
import { CopyButton } from "@sds/components/CopyButton";
import { Button } from "@sds/components/Button";
import { useScrollFade } from "@sds/components/ScrollFade";
import { easedGradient } from "@sds/utils/easedGradient";
import shellStyles from "./Shell.module.css";
import styles from "./IconsPage.module.css";
import { IconCard } from "./IconCard";

const FADE_COLOR = "var(--element-surface-default)";
const TOP_GRADIENT = easedGradient("to bottom", FADE_COLOR, "transparent", "ease-out");
const BOTTOM_GRADIENT = easedGradient("to top", FADE_COLOR, "transparent", "ease-out");

const formatIconName = (name: string) =>
  name
    .split("_")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");

const CATEGORY_CHIPS: {
  value: IconCategory;
  label: string;
  icon: IconName;
  categories: IconCategory[];
}[] = [
  { value: "originals", label: "Original", icon: "google_fonts_color", categories: ["originals"] },
  { value: "custom", label: "Custom", icon: "draw", categories: ["custom"] },
  { value: "logo", label: "Logo", icon: "diamond_shine", categories: ["logo", "logo-color"] },
  { value: "flag", label: "Flag", icon: "emoji_flags", categories: ["flag"] },
];

export default function IconsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<IconCategory | null>(null);
  const [drawerIcon, setDrawerIcon] = useState<IconName | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollRef = useRef<HTMLElement>(document.documentElement);
  const { showStart, showEnd, onScroll } = useScrollFade(scrollRef, "vertical");

  const filteredIcons = useMemo(() => {
    const results = searchIcons(query);
    if (!category) return results;
    const allowed = CATEGORY_CHIPS.find((c) => c.value === category)?.categories;
    if (!allowed) return results;
    return results.filter((icon) => allowed.includes(icon.category));
  }, [query, category]);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleIconClick = (name: IconName) => {
    if (drawerOpen && drawerIcon === name) {
      setDrawerOpen(false);
      return;
    }
    setDrawerIcon(name);
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);

  const downloadIcon = (name: IconName) => {
    const svg = iconMeta[name].svg.trim();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!drawerOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (gridRef.current?.contains(target)) return;
      if ((target as HTMLElement).closest?.('[role="dialog"]')) return;
      setDrawerOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [drawerOpen]);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <>
      <TitleText size="lg" title="Icons" paddingBottom="lg" />
      <div className={shellStyles.searchSection}>
        <div className={shellStyles.searchRow}>
          <div className={shellStyles.search}>
            <SearchInput
              size="lg"
              placeholder="Search icons…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              clearable
              onClear={() => setQuery("")}
            />
          </div>
        </div>
        <Divider />
        <RowContainer density="md" paddingTop="sm" className={styles.chipsRow}>
          {CATEGORY_CHIPS.map((chip) => (
            <ToggleChip
              key={chip.value}
              size="md"
              emphasis="medium"
              checked={category === chip.value}
              onChange={(checked) =>
                setCategory(checked ? chip.value : null)
              }
              leadingIcon={<Icon name={chip.icon} size={16} />}
            >
              {chip.label}
            </ToggleChip>
          ))}
        </RowContainer>
        <div
          className={`${shellStyles.topFade}${showStart ? ` ${shellStyles.fadeVisible}` : ""}`}
          style={{ background: TOP_GRADIENT }}
          aria-hidden="true"
        />
      </div>
      {filteredIcons.length === 0 ? (
        <div className={shellStyles.emptyState}>
          <EmptyState
            size="sm"
            illustration="no-result"
            title="No icons found"
            description={`No icons match “${query}”.`}
          />
        </div>
      ) : (
        <div ref={gridRef} className={styles.grid}>
          {filteredIcons.map((icon) => (
            <IconCard
              key={icon.name}
              name={icon.name}
              label={formatIconName(icon.name)}
              active={drawerOpen && drawerIcon === icon.name}
              onClick={() => handleIconClick(icon.name)}
            />
          ))}
        </div>
      )}
      <div
        className={`${shellStyles.bottomFade}${showEnd ? ` ${shellStyles.fadeVisible}` : ""}`}
        style={{ background: BOTTOM_GRADIENT }}
        aria-hidden="true"
      />
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        side="right"
        mode="overlay"
        placement="viewport"
        title={drawerIcon ? formatIconName(drawerIcon) : undefined}
        headerSize="md"
        headerDivider={false}
        footerDivider={false}
        scrollFade
        width={360}
        backdrop={false}
        lockScroll={false}
        className={styles.iconDrawer}
        footerFullWidth
        footerActions={
          <Button
            variant="brand"
            emphasis="high"
            size="md"
            onClick={() => drawerIcon && downloadIcon(drawerIcon)}
          >
            Download
          </Button>
        }
      >
        {drawerIcon && (() => {
          const meta = getIconMeta(drawerIcon);
          const importSnippet = `import { Icon } from "@sds/components/Icon";\n\n<Icon name="${drawerIcon}" size={24} />`;
          const svgSnippet = iconMeta[drawerIcon].svg.trim();
          return (
            <div className={styles.drawerBody}>
              <div className={styles.drawerPreview}>
                <Icon name={drawerIcon} size={80} />
              </div>
              {meta?.description && (
                <section className={styles.drawerSection}>
                  <TitleText size="2xs" title="Description" />
                  <BodyText size="sm" emphasis="low">
                    {meta.description}
                  </BodyText>
                </section>
              )}
              <section className={styles.drawerSectionUsage}>
                <TitleText size="2xs" title="Usage" />
                <CodeBlock
                  size="sm"
                  language="tsx"
                  title="Import"
                  description="React"
                  code={importSnippet}
                  actions={<CopyButton value={importSnippet} size="sm" />}
                />
                <CodeBlock
                  size="sm"
                  language="svg"
                  title="Shape"
                  description="SVG"
                  code={svgSnippet}
                  visibleLines={4}
                  actions={<CopyButton value={svgSnippet} size="sm" />}
                />
              </section>
            </div>
          );
        })()}
      </Drawer>
    </>
  );
}
