/* AI Chat Orchestration prototype — Mahdi's full chat surface with the
 * scenario-driven assistant flows (s1, s6, s7, s8). Registered in
 * `apps/gallery/src/studio/prototypeRegistry.ts`. The `meta` export
 * carries the card metadata (title, description, designer, cover, …)
 * so the registry stays a thin aggregator. */
import AiChatPage from "./AiChatPage";

export { AiChatPage as AiChatOrchestrationPrototype };
export { meta as aiChatOrchestrationMeta } from "./meta";
export default AiChatPage;
