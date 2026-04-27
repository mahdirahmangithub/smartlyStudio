import { useState } from "react";
import {
  AiGenerationSuggestion,
  AiGenerationSuggestionCards,
  AiGenerationSuggestionEntities,
} from "../components/AiGenerationSuggestion";
import { ActionCard } from "../components/ActionCard";
import { Entity } from "../components/Entity";
import { CheckboxField } from "../components/Checkbox";
import { Icon } from "../components/Icon";

export default function AiGenerationSuggestionPlayground() {
  const [showCards, setShowCards] = useState(true);
  const [showEntities, setShowEntities] = useState(true);

  return (
    <>
      <h1>AiGenerationSuggestion</h1>

      <div style={{ display: "flex", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
        <CheckboxField
          label="Show cards"
          checked={showCards}
          onChange={setShowCards}
        />
        <CheckboxField
          label="Show entities"
          checked={showEntities}
          onChange={setShowEntities}
        />
      </div>

      <div style={{ maxWidth: 720 }}>
        <AiGenerationSuggestion>
          {showCards && (
            <AiGenerationSuggestionCards fadeSize={180}>
              <ActionCard
                title="Create a new campaign"
                description="Start fresh with an empty campaign shell"
                icon={<Icon name="campaign" size={20} />}
                onClick={() => console.log("Create campaign")}
              />
              <ActionCard
                title="Duplicate existing"
                description="Clone settings from a previous campaign"
                icon={<Icon name="content_copy" size={20} />}
                onClick={() => console.log("Duplicate")}
              />
              <ActionCard
                title="Use a template"
                description="Start from a pre-configured template"
                icon={<Icon name="description" size={20} />}
                onClick={() => console.log("Template")}
              />
              <ActionCard
                title="Import from CSV"
                description="Bulk-create campaigns from a file"
                icon={<Icon name="upload" size={20} />}
                onClick={() => console.log("Import")}
              />
            </AiGenerationSuggestionCards>
          )}

          {showEntities && (
            <AiGenerationSuggestionEntities>
              <Entity
                title="Summer Sale 2026"
                description="12 ad sets · Active"
                leading={<Icon name="campaign" size={20} />}
                persistentActions={<Icon name="chevron_right" size={16} />}
                onClick={() => console.log("Entity 1")}
              />
              <Entity
                title="Back-to-school Push"
                description="4 ad sets · Draft"
                leading={<Icon name="ad_level" size={20} />}
                persistentActions={<Icon name="chevron_right" size={16} />}
                onClick={() => console.log("Entity 2")}
              />
              <Entity
                title="Holiday Performance"
                description="8 ad sets · Paused"
                leading={<Icon name="trending_up" size={20} />}
                persistentActions={<Icon name="chevron_right" size={16} />}
                onClick={() => console.log("Entity 3")}
              />
            </AiGenerationSuggestionEntities>
          )}
        </AiGenerationSuggestion>
      </div>
    </>
  );
}
