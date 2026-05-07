import { useState, useRef, useEffect, useMemo } from "react";
import { Grid, Col } from "@sds/components/Grid";
import { SearchInput } from "@sds/components/SearchInput";
import { IconButton } from "@sds/components/IconButton";
import { Icon } from "@sds/components/Icon";
import { Divider } from "@sds/components/Divider";
import { TitleText } from "@sds/components/TitleText";
import {
  Card,
  CardMedia,
  CardMediaContent,
  CardContent,
  CardBody,
  CardTitle,
  CardSlot,
} from "@sds/components/Card";
import { Tag } from "@sds/components/Tag";
import { EmptyState } from "@sds/components/EmptyState";
import { useScrollFade } from "@sds/components/ScrollFade";
import { easedGradient } from "@sds/utils/easedGradient";
import { TEMPLATES, type TemplateKey } from "./templateRegistry";
import shellStyles from "./Shell.module.css";
import styles from "./TemplatesPage.module.css";

const FADE_COLOR = "var(--element-surface-default)";
const TOP_GRADIENT = easedGradient("to bottom", FADE_COLOR, "transparent", "ease-out");
const BOTTOM_GRADIENT = easedGradient("to top", FADE_COLOR, "transparent", "ease-out");

export interface TemplatesPageProps {
  onSelectTemplate: (key: TemplateKey) => void;
}

export default function TemplatesPage({ onSelectTemplate }: TemplatesPageProps) {
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLElement>(document.documentElement);
  const { showStart, showEnd, onScroll } = useScrollFade(scrollRef, "vertical");

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TEMPLATES;
    return TEMPLATES.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.label.toLowerCase().includes(q)),
    );
  }, [query]);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <>
      <TitleText size="lg" title="Templates" paddingBottom="lg" />
      <div className={shellStyles.searchSection}>
        <div className={shellStyles.searchRow}>
          <div className={shellStyles.search}>
            <SearchInput
              size="lg"
              placeholder="Search templates…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              clearable
              onClear={() => setQuery("")}
            />
          </div>
          <IconButton
            size="md"
            variant="neutral"
            emphasis="low"
            aria-label="Filter"
            icon={<Icon name="filter_list" size={20} />}
          />
        </div>
        <Divider />
        <div
          className={`${shellStyles.topFade}${showStart ? ` ${shellStyles.fadeVisible}` : ""}`}
          style={{ background: TOP_GRADIENT }}
          aria-hidden="true"
        />
      </div>
      {filteredTemplates.length === 0 ? (
        <div className={shellStyles.emptyState}>
          <EmptyState
            size="sm"
            illustration="no-result"
            title="No templates found"
            description={`No templates match “${query}”.`}
          />
        </div>
      ) : (
        <Grid gutter="md" className={styles.cardsGrid}>
          {filteredTemplates.map((t) => (
            <Col key={t.key} span={8} sm={4} md={4} lg={3}>
              <Card
                variant="outline-hairline"
                radius="sm"
                onClick={() => onSelectTemplate(t.key)}
              >
                <CardMedia>
                  <CardMediaContent type="image" aspectRatio="16:9">
                    <img src={t.image} alt={t.title} loading="lazy" />
                  </CardMediaContent>
                </CardMedia>
                <CardContent>
                  <CardBody>
                    <CardTitle size="sm" title={t.title} />
                    <CardSlot className={styles.tagsRow}>
                      {t.tags.map((tag) => (
                        <Tag
                          key={tag.label}
                          size="md"
                          variant={tag.variant}
                          emphasis="low"
                          label={tag.label}
                        />
                      ))}
                    </CardSlot>
                  </CardBody>
                </CardContent>
              </Card>
            </Col>
          ))}
        </Grid>
      )}
      <div
        className={`${shellStyles.bottomFade}${showEnd ? ` ${shellStyles.fadeVisible}` : ""}`}
        style={{ background: BOTTOM_GRADIENT }}
        aria-hidden="true"
      />
    </>
  );
}
