import type { KnowledgeBaseArticle } from "../../../../components/AiEntityPreview";

export const KB_LABELS = [
  "Talking to knowledge base",
  "Meta Workspace creation",
];

/** Sources cited in the assistant's response. Order in this array drives the
 *  inline-chip number — index 0 → "1", index 1 → "2", etc. The same array
 *  drives the multiple-mode source list rendered as the bubble's slot. */
export const KB_SOURCES: KnowledgeBaseArticle[] = [
  { id: "kb-1", title: "How to create a Meta workspace",      url: "https://help.smartly.io/articles/how-to-create-a-meta-workspace" },
  { id: "kb-2", title: "Cloning campaigns across workspaces", url: "https://help.smartly.io/articles/cloning-campaigns" },
  { id: "kb-3", title: "Importing campaigns from CSV",        url: "https://help.smartly.io/articles/importing-campaigns" },
  { id: "kb-4", title: "What a Campaign Workspace is",        url: "https://help.smartly.io/articles/workspace-overview" },
];

export const KB_RESPONSE_HTML = `<p>The knowledge base doesn't provide a single step-by-step "Create Meta workspace" guide, but it does describe how workspaces are created and used.<entity-preview id="kb-1"></entity-preview></p>
<h4>How to create a Meta workspace</h4>
<p>You typically create a Meta workspace when starting a new setup or during related actions:</p>
<h6>Option 1: Create a new workspace directly</h6>
<ul>
<li>Go to Media > <a href="/campaign-workspaces" data-link-type="brand" data-link-strong>Campaign Workspaces</a> in the main navigation.</li>
<li>Choose to create a new workspace.</li>
<li>Select Meta as the channel.</li>
<li>Enter a name for the workspace.</li>
</ul>
<h6>Option 2: Create a workspace while cloning or importing</h6>
<ul>
<li>When you clone campaigns<entity-preview id="kb-2"></entity-preview> or import campaigns<entity-preview id="kb-3"></entity-preview>, you'll see an option to:
<ul>
<li>Select an existing workspace, or</li>
<li>Create a new workspace (enter a name and confirm)</li>
</ul>
</li>
</ul>
<h4>What a workspace is<entity-preview id="kb-4"></entity-preview></h4>
<ul>
<li>A workspace is a place where you build, edit, manage, and launch campaigns.</li>
<li>It can contain multiple campaigns, even across multiple ad accounts.</li>
</ul>
</br>
<h6>Sources:</h6>`;
