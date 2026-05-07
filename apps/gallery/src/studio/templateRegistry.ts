import type { TagType } from "@sds/components/Tag";
import { HomeTemplate } from "@templates/home";
import { AiChatTemplate } from "@templates/ai-chat";

export type TemplateKey = "home" | "ai-chat";

export interface TemplateMeta {
  key: TemplateKey;
  title: string;
  image: string;
  tags: { label: string; variant: TagType }[];
}

export const TEMPLATES: TemplateMeta[] = [
  {
    key: "home",
    title: "Home",
    image: "/prototypes/prototype-1.png",
    tags: [
      { label: "Home", variant: "neutral" },
      { label: "Dashboard", variant: "neutral" },
    ],
  },
  {
    key: "ai-chat",
    title: "AI Chat - Full view",
    // Placeholder thumbnail — swap in a dedicated screenshot of the
    // AI chat surface once one is available in /public/prototypes.
    image: "/prototypes/prototype-2.png",
    tags: [
      { label: "AI", variant: "neutral" },
      { label: "Orchestration", variant: "neutral" },
      { label: "Agent", variant: "neutral" },
    ],
  },
];

export const TEMPLATE_COMPONENTS: Record<TemplateKey, () => React.ReactElement> = {
  home: HomeTemplate,
  "ai-chat": AiChatTemplate,
};
