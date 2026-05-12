import type { ComponentType } from "react";
import { S1_CONFIG, S1Scenario } from "./s1/S1Scenario";
import { S2_CONFIG, S2Scenario } from "./s2/S2Scenario";
import { S3_CONFIG, S3Scenario } from "./s3/S3Scenario";
import { S6_CONFIG, S6Scenario } from "./s6/S6Scenario";
import { S7_CONFIG, S7Scenario } from "./s7/S7Scenario";
import { S8_CONFIG, S8Scenario } from "./s8/S8Scenario";
import { S9_CONFIG, S9Scenario } from "./s9/S9Scenario";

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
  { ...S2_CONFIG, Component: S2Scenario },
  { ...S3_CONFIG, Component: S3Scenario },
  { ...S6_CONFIG, Component: S6Scenario },
  { ...S7_CONFIG, Component: S7Scenario },
  { ...S8_CONFIG, Component: S8Scenario },
  { ...S9_CONFIG, Component: S9Scenario },
];

export const SCENARIO_IDS = SCENARIOS.map((s) => s.id);
