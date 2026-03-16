import { useState, type CSSProperties, type ReactNode } from "react";
import { Navbar } from "../components/Navbar";
import { NavBarContent, type NavBarAction } from "../components/NavBarContent";
import { NavigationBrandItem } from "../components/NavigationBrandItem";
import { Breadcrumb } from "../components/Breadcrumb";
import { BreadcrumbItem } from "../components/BreadcrumbItem";
import { TitleText } from "../components/TitleText";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { SelectButton } from "../components/SelectButton";
import { Badge } from "../components/Badge";
import { Toggle } from "../components/Toggle";
import { Divider } from "../components/Divider";
import { Icon } from "../components/Icon";
import { IconContainer } from "../components/IconContainer";
import { Tag } from "../components/Tag";
import { Label } from "../components/Label";
import { Link } from "../components/Link";


const sectionStyle: CSSProperties = { marginBottom: 48 };

function StatefulToggle(props: Omit<React.ComponentProps<typeof Toggle>, "checked" | "onChange">) {
  const [checked, setChecked] = useState(false);
  return <Toggle {...props} checked={checked} onChange={setChecked} />;
}


/* ═══════════════════════════════════════════════════════════════════════
   Variant definitions
   ═══════════════════════════════════════════════════════════════════════ */

type VariantKey =
  | "automation-feeds"
  | "briefs-and-storyboards"
  | "budget-pools"
  | "budget-simulator"
  | "catalogs"
  | "gen-on-feeds"
  | "generated-feed"
  | "image-video-template"
  | "pba-editor"
  | "producer"
  | "creative-approvals"
  | "reporting"
  | "inspect-campaign"
  | "template-qa"
  | "triggers"
  | "workspaces-defaults"
  | "workspaces-editor"
  | "workspaces-review"
  | "ai-chat";

interface VariantConfig {
  label: string;
  left: ReactNode;
  description?: ReactNode;
  actions: NavBarAction[];
}

function makeVariants(): Record<VariantKey, VariantConfig> {
  return {
    /* ── 1. Automation feeds ── */
    "automation-feeds": {
      label: "Automation feeds",
      left: (
        <Breadcrumb size="md">
          <BreadcrumbItem>Automation feed</BreadcrumbItem>
          <BreadcrumbItem current>Feed name</BreadcrumbItem>
        </Breadcrumb>
      ),
      actions: [
        {
          id: "dismiss",
          element: <Button size="md" variant="neutral" emphasis="medium">Dismiss</Button>,
        },
        {
          id: "save",
          element: <Button size="md" variant="brand" emphasis="high">Save</Button>,
        },
      ],
    },

    /* ── 2. Briefs and storyboards ── */
    "briefs-and-storyboards": {
      label: "Briefs & storyboards",
      left: (
        <Breadcrumb size="md">
          <BreadcrumbItem>Creative project name</BreadcrumbItem>
          <BreadcrumbItem current>Requested template</BreadcrumbItem>
        </Breadcrumb>
      ),
      actions: [
        {
          id: "storyboards-badge",
          element: (
            <Badge size="md" variant="info" emphasis="medium" leadingIcon={<Icon name="info" size={12} />}>
              Storyboards in progress
            </Badge>
          ),
        },
        {
          id: "dismiss",
          element: <Button size="md" variant="neutral" emphasis="medium">Dismiss</Button>,
        },
      ],
    },

    /* ── 3. Budget pools ── */
    "budget-pools": {
      label: "Budget pools",
      left: (
        <>
          <Breadcrumb size="md">
            <BreadcrumbItem>Budget pools</BreadcrumbItem>
            <BreadcrumbItem current>BP name</BreadcrumbItem>
          </Breadcrumb>
          <IconButton
            size="md"
            variant="neutral"
            emphasis="low"
            icon={<Icon name="edit" size={16} />}
            aria-label="Edit name"
          />
        </>
      ),
      description: <span>Description</span>,
      actions: [
        {
          id: "warnings",
          element: (
            <Badge size="md" variant="warning" emphasis="medium" leadingIcon={<Icon name="warning" size={12} />}>
              Warnings (2)
            </Badge>
          ),
        },
        {
          id: "delete",
          element: <Button size="md" variant="alert" emphasis="medium">Delete</Button>,
        },
        {
          id: "save",
          element: <Button size="md" variant="brand" emphasis="high">Save</Button>,
        },
      ],
    },

    /* ── 4. Budget simulator ── */
    "budget-simulator": {
      label: "Budget simulator",
      left: (
        <Breadcrumb size="md">
          <BreadcrumbItem>Budget simulation</BreadcrumbItem>
          <BreadcrumbItem current>Simulation</BreadcrumbItem>
        </Breadcrumb>
      ),
      description: <span>Description</span>,
      actions: [
        {
          id: "campaigns",
          element: <SelectButton size="md" emphasis="medium" leadingIcon={<Icon name="campaign" size={16} />} selectedCount={5}>Campaigns</SelectButton>,
        },
        {
          id: "divider-1",
          type: "divider",
          element: <Divider orientation="vertical" className="self-stretch" />,
        },
        {
          id: "save-pdf",
          element: <Button size="md" variant="brand" emphasis="high">Save as .pdf</Button>,
        },
      ],
    },

    /* ── 5. Catalogs ── */
    catalogs: {
      label: "Catalogs",
      left: (
        <>
          <Breadcrumb size="md">
            <BreadcrumbItem>Catalogs</BreadcrumbItem>
            <BreadcrumbItem current>Global Hotel List (ID: 0912010401174)</BreadcrumbItem>
          </Breadcrumb>
          <IconButton
            size="md"
            variant="neutral"
            emphasis="low"
            icon={<Icon name="content_copy" size={16} />}
            aria-label="Copy ID"
          />
        </>
      ),
      description: (
        <>
          <IconContainer name="Meta_color" size="md" />
          <Tag size="md" variant="neutral" emphasis="low" label="645226 Hotels" leadingIcon={<Icon name="hotel" size={12} />} />
          <Link size="md" type="brand" strong icon>34 campaigns</Link>
        </>
      ),
      actions: [
        {
          id: "event-stats",
          element: <Button size="md" variant="neutral" emphasis="medium">Event stats</Button>,
          overflow: true,
          overflowLabel: "Event stats",
          overflowIcon: "event",
        },
        {
          id: "diagnostic",
          element: (
            <Button size="md" variant="neutral" emphasis="medium" trailingIcon={<Icon name="open_in_new" size={16} />}>
              Diagnostic
            </Button>
          ),
          overflow: true,
          overflowLabel: "Diagnostic",
          overflowIcon: "open_in_new",
        },
        {
          id: "business-manager",
          element: (
            <Button size="md" variant="neutral" emphasis="medium" trailingIcon={<Icon name="open_in_new" size={16} />}>
              Business Manager
            </Button>
          ),
          overflow: true,
          overflowLabel: "Business Manager",
          overflowIcon: "open_in_new",
        },
      ],
    },

    /* ── 6. Gen on feeds ── */
    "gen-on-feeds": {
      label: "Gen on feeds",
      left: (
        <>
          <Breadcrumb size="md">
            <BreadcrumbItem>Generation on feeds</BreadcrumbItem>
            <BreadcrumbItem current>SummerSaleSpectactular_CA-2023-Mil...</BreadcrumbItem>
          </Breadcrumb>
          <IconButton
            size="md"
            variant="neutral"
            emphasis="low"
            icon={<Icon name="edit" size={16} />}
            aria-label="Edit name"
          />
        </>
      ),
      description: (
        <Tag size="md" variant="neutral" emphasis="low" label="Scene generation" leadingIcon={<Icon name="imagesmode" size={12} />} />
      ),
      actions: [
        {
          id: "create-recurring",
          element: <Button size="md" variant="neutral" emphasis="medium">Create recurring generation</Button>,
          overflow: true,
          overflowLabel: "Create recurring generation",
          overflowIcon: "refresh",
        },
        {
          id: "push-to-source",
          element: <Button size="md" variant="neutral" emphasis="medium">Push to source</Button>,
          overflow: true,
          overflowLabel: "Push to source",
          overflowIcon: "publish",
        },
        {
          id: "share",
          element: (
            <IconButton
              size="md"
              variant="neutral"
              emphasis="medium"
              icon={<Icon name="link" size={16} />}
              aria-label="Share"
            />
          ),
          overflow: true,
          overflowLabel: "Share",
          overflowIcon: "link",
        },
      ],
    },

    /* ── 7. Generated feed ── */
    "generated-feed": {
      label: "Generated feed",
      left: (
        <>
          <Breadcrumb size="md">
            <BreadcrumbItem>Generation on feeds</BreadcrumbItem>
            <BreadcrumbItem current>SummerSaleSpectactular_CA-2023-Mil...</BreadcrumbItem>
          </Breadcrumb>
          <IconButton
            size="md"
            variant="neutral"
            emphasis="low"
            icon={<Icon name="edit" size={16} />}
            aria-label="Edit name"
          />
        </>
      ),
      actions: [
        {
          id: "view-feed-settings",
          element: <Button size="md" variant="neutral" emphasis="medium">View feed settings</Button>,
          overflow: true,
          overflowLabel: "View feed settings",
          overflowIcon: "settings",
        },
        {
          id: "refresh-feed",
          element: <Button size="md" variant="neutral" emphasis="medium">Refresh feed</Button>,
          overflow: true,
          overflowLabel: "Refresh feed",
          overflowIcon: "refresh",
        },
        {
          id: "feed-explorer",
          element: <Button size="md" variant="neutral" emphasis="medium">Feed explorer</Button>,
          overflow: true,
          overflowLabel: "Feed explorer",
          overflowIcon: "search",
        },
      ],
    },

    /* ── 8. Image / video template ── */
    "image-video-template": {
      label: "Image/video template",
      left: (
        <>
          <Breadcrumb size="md">
            <BreadcrumbItem>Media library</BreadcrumbItem>
            <BreadcrumbItem current>Back to school 2024</BreadcrumbItem>
          </Breadcrumb>
          <IconButton
            size="md"
            variant="neutral"
            emphasis="low"
            icon={<Icon name="edit" size={16} />}
            aria-label="Edit name"
          />
        </>
      ),
      description: (
        <>
          <IconContainer name="campaign" size="md" color="var(--text-neutral-tertiary-default)" />
          <span>Description</span>
        </>
      ),
      actions: [
        {
          id: "undo",
          element: (
            <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="undo" size={16} />} aria-label="Undo" />
          ),
          overflow: true,
          overflowLabel: "Undo",
          overflowIcon: "undo",
        },
        {
          id: "redo",
          element: (
            <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="redo" size={16} />} aria-label="Redo" />
          ),
          overflow: true,
          overflowLabel: "Redo",
          overflowIcon: "redo",
        },
        {
          id: "divider-1",
          type: "divider",
          element: <Divider orientation="vertical" className="self-stretch" />,
          overflow: true,
        },
        {
          id: "connected-badge",
          element: (
            <Badge size="md" variant="success" emphasis="medium" leadingIcon={<Icon name="check_circle" size={12} />}>
              Connected
            </Badge>
          ),
          overflow: true,
          overflowLabel: "Connected",
          overflowIcon: "check_circle",
        },
        {
          id: "preview-btn",
          element: <Button size="md" variant="neutral" emphasis="medium">Preview</Button>,
          overflow: true,
          overflowLabel: "Preview",
          overflowIcon: "preview",
        },
        {
          id: "slideshow",
          element: (
            <IconButton
              size="md"
              variant="neutral"
              emphasis="medium"
              icon={<Icon name="slideshow" size={16} />}
              aria-label="Slideshow"
            />
          ),
          overflow: true,
          overflowLabel: "Slideshow",
          overflowIcon: "slideshow",
        },
        {
          id: "save",
          element: <Button size="md" variant="brand" emphasis="high">Save</Button>,
        },
      ],
    },

    /* ── 9. PBA editor ── */
    "pba-editor": {
      label: "PBA editor",
      left: (
        <>
          <Breadcrumb size="md">
            <BreadcrumbItem>Budget pools</BreadcrumbItem>
            <BreadcrumbItem current>BP name</BreadcrumbItem>
          </Breadcrumb>
          <IconButton
            size="md"
            variant="neutral"
            emphasis="low"
            icon={<Icon name="edit" size={16} />}
            aria-label="Edit name"
          />
        </>
      ),
      description: (
        <>
          <IconContainer name="YouTube_color" size="md" />
          <IconContainer name="Meta_color" size="md" />
          <IconContainer name="Snapchat_color" size="md" />
          <IconContainer name="Google_color" size="md" />
          <Tag size="md" variant="brand" emphasis="low" label="(GMT+02:00) Helsinki Time" leadingIcon={<Icon name="public" size={12} />} />
        </>
      ),
      actions: [
        {
          id: "warnings",
          element: (
            <Badge size="md" variant="warning" emphasis="medium" leadingIcon={<Icon name="warning" size={12} />}>
              Warnings (2)
            </Badge>
          ),
        },
        {
          id: "delete",
          element: <Button size="md" variant="alert" emphasis="medium">Delete</Button>,
        },
        {
          id: "save",
          element: <Button size="md" variant="brand" emphasis="high">Save</Button>,
        },
      ],
    },

    /* ── 10. Producer ── */
    producer: {
      label: "Producer",
      left: (
        <Breadcrumb size="md">
          <BreadcrumbItem>Producers</BreadcrumbItem>
          <BreadcrumbItem current>Key HTML producer</BreadcrumbItem>
        </Breadcrumb>
      ),
      description: (
        <>
          <IconContainer name="YouTube_color" size="md" />
          <span>Description</span>
        </>
      ),
      actions: [
        {
          id: "add-variant",
          element: <Button size="md" variant="brand" emphasis="high">Add variant</Button>,
        },
      ],
    },

    /* ── 11. Creative approvals ── */
    "creative-approvals": {
      label: "Creative approvals",
      left: (
        <Breadcrumb size="md">
          <BreadcrumbItem>Producers</BreadcrumbItem>
          <BreadcrumbItem current>Key HTML producer</BreadcrumbItem>
        </Breadcrumb>
      ),
      description: (
        <>
          <IconContainer name="YouTube_color" size="md" />
          <span>Description</span>
        </>
      ),
      actions: [
        {
          id: "comments",
          element: (
            <Button size="md" variant="neutral" emphasis="medium" leadingIcon={<Icon name="comment" size={16} />}>
              Comments
            </Button>
          ),
          compactElement: (
            <IconButton size="md" variant="neutral" emphasis="medium" icon={<Icon name="comment" size={16} />} aria-label="Comments" />
          ),
        },
        {
          id: "share",
          element: <Button size="md" variant="brand" emphasis="high">Share</Button>,
        },
      ],
    },

    /* ── 12. Reporting ── */
    reporting: {
      label: "Reporting",
      left: (
        <Breadcrumb size="md">
          <BreadcrumbItem>Reporting</BreadcrumbItem>
          <BreadcrumbItem current>Report name</BreadcrumbItem>
        </Breadcrumb>
      ),
      description: <span>Description</span>,
      actions: [
        {
          id: "more-actions",
          element: <SelectButton size="md" emphasis="medium">More actions</SelectButton>,
          overflow: true,
          overflowLabel: "More actions",
          overflowIcon: "more_horiz",
        },
        {
          id: "share",
          element: <SelectButton size="md" emphasis="medium" leadingIcon={<Icon name="share" size={16} />}>Share</SelectButton>,
          overflow: true,
          overflowLabel: "Share",
          overflowIcon: "share",
        },
        {
          id: "download",
          element: (
            <IconButton
              size="md"
              variant="neutral"
              emphasis="medium"
              icon={<Icon name="download" size={16} />}
              aria-label="Download"
            />
          ),
          overflow: true,
          overflowLabel: "Download",
          overflowIcon: "download",
        },
        {
          id: "save",
          element: <Button size="md" variant="brand" emphasis="high">Save</Button>,
        },
      ],
    },

    /* ── 13. Inspect campaign ── */
    "inspect-campaign": {
      label: "Inspect campaign",
      left: (
        <Breadcrumb size="md">
          <BreadcrumbItem>Reporting</BreadcrumbItem>
          <BreadcrumbItem icon={<IconContainer name="Meta_color" size="sm" />}>Report name</BreadcrumbItem>
          <BreadcrumbItem current>MJ_NL_THINK_FB/IG_Engagement_jun24</BreadcrumbItem>
        </Breadcrumb>
      ),
      description: <span>Description</span>,
      actions: [
        {
          id: "more-actions",
          element: <SelectButton size="md" emphasis="medium">More actions</SelectButton>,
          overflow: true,
          overflowLabel: "More actions",
          overflowIcon: "more_horiz",
        },
        {
          id: "download",
          element: (
            <IconButton
              size="md"
              variant="neutral"
              emphasis="medium"
              icon={<Icon name="download" size={16} />}
              aria-label="Download"
            />
          ),
          overflow: true,
          overflowLabel: "Download",
          overflowIcon: "download",
        },
        {
          id: "edit-in-workspaces",
          element: (
            <Button size="md" variant="brand" emphasis="high" leadingIcon={<Icon name="edit" size={16} />}>
              Edit in workspaces
            </Button>
          ),
          compactElement: (
            <Button size="md" variant="brand" emphasis="high" leadingIcon={<Icon name="edit" size={16} />}>
              Edit
            </Button>
          ),
        },
      ],
    },

    /* ── 14. Template QA ── */
    "template-qa": {
      label: "Template QA",
      left: (
        <>
          <Breadcrumb size="md">
            <BreadcrumbItem>HTML template set</BreadcrumbItem>
            <BreadcrumbItem current>Name</BreadcrumbItem>
          </Breadcrumb>
          <Divider orientation="vertical" />
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", flexShrink: 0 }}>
            <Label size="sm" label="QA Complete" htmlFor="toggle-qa" />
            <StatefulToggle size="sm" id="toggle-qa" aria-label="QA Complete" />
          </div>
        </>
      ),
      description: (
        <Tag size="md" variant="neutral" emphasis="low" label="QA view" leadingIcon={<Icon name="search_check" size={12} />} />
      ),
      actions: [
        {
          id: "share",
          element: <Button size="md" variant="neutral" emphasis="medium" leadingIcon={<Icon name="link" size={16} />}>Share</Button>,
        },
      ],
    },

    /* ── 15. Triggers ── */
    triggers: {
      label: "Triggers",
      left: (
        <>
          <Breadcrumb size="md">
            <BreadcrumbItem>Triggers</BreadcrumbItem>
            <BreadcrumbItem current>Trigger set name</BreadcrumbItem>
          </Breadcrumb>
          <IconButton
            size="md"
            variant="neutral"
            emphasis="low"
            icon={<Icon name="edit" size={16} />}
            aria-label="Edit name"
          />
          <Divider orientation="vertical" />
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", flexShrink: 0 }}>
            <Label size="sm" label="Trigger set" htmlFor="toggle-trigger" />
            <StatefulToggle size="sm" id="toggle-trigger" aria-label="Trigger set" />
          </div>
        </>
      ),
      description: (
        <>
          <Tag size="md" variant="brand" emphasis="low" label="Ad Account level" leadingIcon={<Icon name="create_new_folder" size={12} />} />
          <Tag size="md" variant="brand" emphasis="low" label="(GMT+02:00) Helsinki Time" leadingIcon={<Icon name="public" size={12} />} />
        </>
      ),
      actions: [
        {
          id: "delete",
          element: <Button size="md" variant="alert" emphasis="medium">Delete</Button>,
        },
        {
          id: "publish",
          element: <Button size="md" variant="brand" emphasis="high">Publish</Button>,
        },
      ],
    },

    /* ── 16. Workspaces defaults ── */
    "workspaces-defaults": {
      label: "Workspaces defaults",
      left: (
        <Breadcrumb size="md">
          <BreadcrumbItem>Workspaces</BreadcrumbItem>
          <BreadcrumbItem current>Workspace defaults</BreadcrumbItem>
        </Breadcrumb>
      ),
      actions: [
        {
          id: "create-new",
          element: <Button size="md" variant="brand" emphasis="high">Create new</Button>,
        },
      ],
    },

    /* ── 17. Workspaces editor ── */
    "workspaces-editor": {
      label: "Workspaces editor",
      left: (
        <>
          <IconButton
            size="md"
            variant="neutral"
            emphasis="low"
            icon={<Icon name="chevron_left" size={16} />}
            aria-label="Back"
          />
          <TitleText
            size="xs"
            title="Campaign name"
            leadingIcon={<IconContainer name="Meta_color" size="md" />}
          />
          <IconButton
            size="md"
            variant="neutral"
            emphasis="low"
            icon={<Icon name="edit" size={16} />}
            aria-label="Rename"
          />
          <IconButton
            size="md"
            variant="neutral"
            emphasis="low"
            icon={<Icon name="star" size={16} />}
            aria-label="Favorite"
          />
          <Divider orientation="vertical" />
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", flexShrink: 0 }}>
            <Label size="sm" label="Autosave" htmlFor="toggle-autosave" />
            <StatefulToggle size="sm" id="toggle-autosave" aria-label="Autosave" />
          </div>
        </>
      ),
      actions: [
        {
          id: "publishing",
          element: (
            <Button size="md" variant="neutral" emphasis="medium" leadingIcon={<Icon name="schedule" size={16} />}>
              Publishing events
            </Button>
          ),
          overflow: true,
          overflowLabel: "Publishing events",
          overflowIcon: "schedule",
        },
        {
          id: "folder",
          element: (
            <IconButton
              size="md"
              variant="neutral"
              emphasis="medium"
              icon={<Icon name="folder" size={16} />}
              aria-label="Folder"
            />
          ),
          overflow: true,
          overflowLabel: "Folder",
          overflowIcon: "folder",
        },
        {
          id: "no-defaults",
          element: <SelectButton size="md" emphasis="medium">No defaults</SelectButton>,
          overflow: true,
          overflowLabel: "No defaults",
        },
        {
          id: "divider-1",
          type: "divider",
          element: <Divider orientation="vertical" className="self-stretch" />,
          overflow: true,
        },
        {
          id: "folder-2",
          element: (
            <IconButton
              size="md"
              variant="neutral"
              emphasis="medium"
              icon={<Icon name="folder" size={16} />}
              aria-label="Folder"
            />
          ),
          overflow: true,
          overflowLabel: "Folder",
          overflowIcon: "folder",
        },
        {
          id: "fix-issues",
          element: <SelectButton size="md" emphasis="medium" selectedCount={2} error>Fix issues</SelectButton>,
        },
        {
          id: "review-all",
          element: <Button size="md" variant="neutral" emphasis="medium">Review all</Button>,
          overflow: true,
          overflowLabel: "Review all",
          overflowIcon: "preview",
        },
        {
          id: "review-campaign",
          element: <Button size="md" variant="brand" emphasis="high">Review 1 campaign</Button>,
          compactElement: <Button size="sm" variant="brand" emphasis="high">Review</Button>,
        },
      ],
    },

    /* ── 18. Workspaces review ── */
    "workspaces-review": {
      label: "Workspaces review",
      left: (
        <Breadcrumb size="md">
          <BreadcrumbItem>Campaign name</BreadcrumbItem>
          <BreadcrumbItem current>Review</BreadcrumbItem>
        </Breadcrumb>
      ),
      actions: [
        {
          id: "qa-review",
          element: (
            <Button size="md" variant="neutral" emphasis="medium" leadingIcon={<Icon name="check_circle" size={16} />}>
              QA Review
            </Button>
          ),
          overflow: true,
          overflowLabel: "QA Review",
          overflowIcon: "check_circle",
        },
        {
          id: "timer",
          element: (
            <IconButton
              size="md"
              variant="neutral"
              emphasis="medium"
              icon={<Icon name="timer" size={16} />}
              aria-label="Timer"
            />
          ),
          overflow: true,
          overflowLabel: "Timer",
          overflowIcon: "timer",
        },
        {
          id: "preview-ads",
          element: <Button size="md" variant="neutral" emphasis="medium">Preview Ads</Button>,
          overflow: true,
          overflowLabel: "Preview Ads",
          overflowIcon: "preview",
        },
        {
          id: "publish-selected",
          element: <Button size="md" variant="brand" emphasis="high">Publish selected (1)</Button>,
          compactElement: <Button size="md" variant="brand" emphasis="high">Publish (1)</Button>,
        },
      ],
    },

    /* ── 19. AI chat ── */
    "ai-chat": {
      label: "AI chat",
      left: <TitleText size="xs" title="Title" />,
      actions: [
        {
          id: "minimize",
          element: (
            <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="minimize" size={16} />} aria-label="Minimize" />
          ),
        },
        {
          id: "close",
          element: (
            <IconButton size="md" variant="neutral" emphasis="low" icon={<Icon name="collapse_content" size={16} />} aria-label="Collapse" />
          ),
        },
      ],
    },
  };
}

const VARIANTS = makeVariants();
const VARIANT_KEYS = Object.keys(VARIANTS) as VariantKey[];

/* ═══════════════════════════════════════════════════════════════════════
   Playground
   ═══════════════════════════════════════════════════════════════════════ */

export default function NavBarContentPlayground() {
  const [variant, setVariant] = useState<VariantKey>("automation-feeds");
  const config = VARIANTS[variant];

  return (
    <>
      <h1>NavBarContent</h1>

      <section style={sectionStyle}>
        <h2>Interactive demo</h2>
        <p style={{ fontSize: 13, margin: "0 0 12px", opacity: 0.7 }}>
          Switch variant via the dropdown. Drag the right edge of the container to resize and see compact mode.
        </p>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, marginRight: 8 }}>Variant:</label>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as VariantKey)}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 13,
            }}
          >
            {VARIANT_KEYS.map((key) => (
              <option key={key} value={key}>
                {VARIANTS[key].label}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            resize: "horizontal",
            overflow: "auto",
            border: "1px solid #ddd",
            borderRadius: 8,
            minWidth: 400,
            width: "100%",
            paddingBottom: "var(--spacing-xl)",
          }}
        >
          <Navbar logo={<NavigationBrandItem hideLogotype />}>
            <NavBarContent
              description={config.description}
              actions={config.actions}
            >
              {config.left}
            </NavBarContent>
          </Navbar>
        </div>
      </section>
    </>
  );
}
