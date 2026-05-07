/* Shared metadata shape used by every prototype's `meta.ts`. The
 * Studio's prototypeRegistry imports each prototype's meta and renders
 * it as a card on PrototypesPage. */

export interface PrototypeMeta {
  /** Card title (e.g. "AI Chat Orchestration"). */
  title: string;
  /** Short label rendered under the title. */
  description: string;
  /** Designer who owns the prototype. `file` resolves the avatar from
   *  `apps/gallery/public/designers/<file>`. */
  designer: { name: string; file: string };
  /** Edited / last-updated label rendered next to the avatar. */
  editedLabel: string;
  /** Card cover image. Use a colocated `import cover from "./cover.png"`
   *  from the prototype folder so Vite hashes + bundles the asset. */
  image: string;
}
