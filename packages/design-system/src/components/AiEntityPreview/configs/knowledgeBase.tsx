import { IconContainer } from "../../IconContainer";
import type { AiEntityConfig } from "../aiEntityTypes";

export interface KnowledgeBaseArticle {
  id: string;
  /** Article title shown as the header. */
  title: string;
  /** URL to the article — shown as the row description and used for inline navigation. */
  url: string;
}

export const KNOWLEDGE_BASE_CONFIG: AiEntityConfig<KnowledgeBaseArticle> = {
  getKey: (a) => a.id,
  getHref: (a) => a.url,
  tooltipStyle: { minWidth: 400 },
  inlineLabelStyle: {
    fontFamily: "var(--type-caption-sm-family)",
    fontWeight: "var(--type-caption-sm-weight)" as never,
    fontSize: "var(--type-caption-sm-size)",
    lineHeight: "var(--type-caption-sm-line-height)",
    letterSpacing: "var(--type-caption-sm-letter-spacing)",
  },
  inlineStyle: {
    borderRadius: "var(--radius-full)",
    transform: "translateY(-6px)",
    padding: "0 var(--spacing-2xs)",
    minWidth:"calc(var(--spacing-md) + var(--spacing-px))",
    justifyContent:"center",
  },
  single: {
    getTitle: (a) => a.title,
    headerCellContent: { leading: <IconContainer size="sm" name="auto_stories" /> },
    columns: [
      {
        key: "url",
        getDescription: (a) => a.url,
        getCellContent: (a) => ({
          leading: <IconContainer size="sm" name="link" />,
          description: a.url,
        }),
      },
    ],
  },
  multiple: {
    getTitle: (a) => a.title,
    getPrefixCellContent: (_a, index) => ({
      description: String(index + 1),
    }),
    getTitleCellContent: (a) => ({
      leading: <IconContainer size="sm" name="auto_stories" />,
      title: a.title,
      description: (
        <span
          style={{
            display: "inline-block",
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            verticalAlign: "bottom",
          }}
          title={a.url}
        >
          {a.url}
        </span>
      ),
    }),
    columns: [],
  },
};
