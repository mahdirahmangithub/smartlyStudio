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
  CardDescription,
  CardSlot,
} from "@sds/components/Card";
import { Avatar } from "@sds/components/Avatar";
import { BodyText } from "@sds/components/BodyText";
import { Tooltip } from "@sds/components/Tooltip";
import { EmptyState } from "@sds/components/EmptyState";
import { useScrollFade } from "@sds/components/ScrollFade";
import { easedGradient } from "@sds/utils/easedGradient";
import { PROTOTYPES, type PrototypeKey } from "./prototypeRegistry";
import shellStyles from "./Shell.module.css";
import styles from "./PrototypesPage.module.css";

const FADE_COLOR = "var(--element-surface-default)";
const TOP_GRADIENT = easedGradient("to bottom", FADE_COLOR, "transparent", "ease-out");
const BOTTOM_GRADIENT = easedGradient("to top", FADE_COLOR, "transparent", "ease-out");

const designerAvatarSrc = (file: string) =>
  `/designers/${encodeURIComponent(file.normalize("NFD"))}`;

export interface PrototypesPageProps {
  onSelectPrototype: (key: PrototypeKey) => void;
}

export default function PrototypesPage({ onSelectPrototype }: PrototypesPageProps) {
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLElement>(document.documentElement);
  const { showStart, showEnd, onScroll } = useScrollFade(scrollRef, "vertical");

  const filteredPrototypes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROTOTYPES;
    return PROTOTYPES.filter(
      (p) =>
        p.meta.title.toLowerCase().includes(q) ||
        p.meta.designer.name.toLowerCase().includes(q) ||
        p.meta.description.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return (
    <>
      <TitleText
        size="lg"
        title="Prototypes"
        paddingBottom="lg"
      />
      <div className={shellStyles.searchSection}>
        <div className={shellStyles.searchRow}>
          <div className={shellStyles.search}>
            <SearchInput
              size="lg"
              placeholder="Search prototypes…"
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
      {filteredPrototypes.length === 0 ? (
        <div className={shellStyles.emptyState}>
          <EmptyState
            size="sm"
            illustration="no-result"
            title="No prototypes found"
            description={`No prototypes match “${query}”.`}
          />
        </div>
      ) : (
        <Grid gutter="md" className={styles.cardsGrid}>
          {filteredPrototypes.map((p) => (
            <Col key={p.key} span={8} sm={4} md={4} lg={3}>
              <Card
                variant="outline-hairline"
                radius="sm"
                onClick={() => onSelectPrototype(p.key)}
              >
                <CardMedia>
                  <CardMediaContent type="image" aspectRatio="16:9">
                    <img
                      src={p.meta.image}
                      alt={p.meta.title}
                      loading="lazy"
                    />
                  </CardMediaContent>
                </CardMedia>
                <CardContent>
                  <CardBody>
                    <CardTitle size="sm" title={p.meta.title} />
                    <CardDescription size="sm" lineClamp={1}>
                      {p.meta.description}
                    </CardDescription>
                    <CardSlot className={styles.metaRow}>
                      <Tooltip label={p.meta.designer.name} placement="top" showTail={false}>
                        <Avatar
                          size="xs"
                          round
                          src={designerAvatarSrc(p.meta.designer.file)}
                          alt={p.meta.designer.name}
                        />
                      </Tooltip>
                      <BodyText
                        size="sm"
                        emphasis="low"
                        className={styles.metaText}
                      >
                        {p.meta.editedLabel}
                      </BodyText>
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
