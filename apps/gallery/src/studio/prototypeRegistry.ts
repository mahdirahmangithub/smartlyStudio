import {
  AiChatOrchestrationPrototype,
  aiChatOrchestrationMeta,
} from "@prototypes/mahdirahman/aichat-orchestration";
import type { PrototypeMeta } from "@prototypes";

/* Registry of designer-owned prototypes. Cards are now driven by each
 * prototype's own `meta.ts` (colocated with the component); the
 * registry only pairs each route key with its imported `meta` + the
 * runnable component. To add a new prototype:
 *   1. Drop it under packages/prototypes/src/<designer>/<slug>/
 *   2. Inside that folder, add `meta.ts` (typed as `PrototypeMeta`)
 *      and a colocated `cover.png`
 *   3. Register an entry below */

export type PrototypeKey = "aichat-orchestration";

export interface PrototypeEntry {
  key: PrototypeKey;
  meta: PrototypeMeta;
  Component: () => React.ReactElement;
}

export const PROTOTYPES: PrototypeEntry[] = [
  {
    key: "aichat-orchestration",
    meta: aiChatOrchestrationMeta,
    Component: AiChatOrchestrationPrototype,
  },
];

export const PROTOTYPE_COMPONENTS: Record<PrototypeKey, () => React.ReactElement> =
  Object.fromEntries(
    PROTOTYPES.map((p) => [p.key, p.Component]),
  ) as Record<PrototypeKey, () => React.ReactElement>;
