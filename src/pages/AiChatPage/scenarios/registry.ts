import type { ComponentType } from "react";
import { S1_CONFIG, S1Scenario } from "./s1/S1Scenario";
import { S6_CONFIG, S6Scenario } from "./s6/S6Scenario";
import { S7_CONFIG, S7Scenario } from "./s7/S7Scenario";

export interface ScenarioConfig {
  id: string;
  label: string;
  /** Pre-mounted component that renders both the prompt area and any
   *  scenario-specific overlays (e.g. the ScenarioGuide popover). The page
   *  mounts only the active scenario, so each (re-)entry starts with fresh
   *  internal state. */
  Component: ComponentType<{ guideClassName?: string }>;
}

/** Registered scenarios, ordered for the chat-history list. Adding a new
 *  scenario = creating a new folder with a Component + config and adding the
 *  entry here. Nothing else in the page needs to change. */
export const SCENARIOS: ScenarioConfig[] = [
  { ...S1_CONFIG, Component: S1Scenario },
  { ...S6_CONFIG, Component: S6Scenario },
  { ...S7_CONFIG, Component: S7Scenario },
];

export const SCENARIO_IDS = SCENARIOS.map((s) => s.id);
