import { type CSSProperties } from "react";
import { Entity } from "@sds/components/Entity";
import { Icon } from "@sds/components/Icon";
import { IconButton } from "@sds/components/IconButton";
import { Thumbnail } from "@sds/components/Thumbnail";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};
const colStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  maxWidth: 380,
};

export default function EntityPlayground() {
  return (
    <>
      <h1>Entity</h1>

      {/* ── Basic ──────────────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2>Basic — icon 16px leading</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Small icon leading, title only. Hint shown via info icon tooltip.
        </p>
        <div style={cardStyle}>
          <div style={colStyle}>
            <Entity
              leading={<Icon name="favorite" size={16} />}
              title="Campaign Alpha"
              hint="This is a hint tooltip"
            />
            <Entity
              leading={<Icon name="favorite" size={16} />}
              title="Campaign Alpha"
            />
            <Entity title="No leading icon, title only" />
          </div>
        </div>
      </section>

      {/* ── Large icon leading ─────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2>Large icon leading (20px)</h2>
        <div style={cardStyle}>
          <div style={colStyle}>
            <Entity
              leading={<Icon name="folder" size={20} />}
              title="Project folder"
              hint="Shared with team"
              description="Contains 24 files"
            />
          </div>
        </div>
      </section>

      {/* ── Thumbnail leading ──────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2>Thumbnail leading (md)</h2>
        <div style={cardStyle}>
          <div style={colStyle}>
            <Entity
              leading={
                <Thumbnail
                  size="md"
                  type="media"
                  src="https://picsum.photos/seed/entity1/80/80"
                  alt="Preview"
                />
              }
              title="Summer campaign visual"
              description="1920×1080 · PNG · 2.4 MB"
              hint="Uploaded yesterday"
            />
            <Entity
              leading={
                <Thumbnail
                  size="md"
                  type="media"
                  src="https://picsum.photos/seed/entity2/80/80"
                  alt="Preview"
                />
              }
              title="Holiday banner"
              description="This is a longer description that should still fit on one line when clamped"
              descriptionLineClamp={1}
            />
          </div>
        </div>
      </section>

      {/* ── With actions ───────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2>Persistent actions</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Always-visible action buttons on the right side.
        </p>
        <div style={cardStyle}>
          <div style={colStyle}>
            <Entity
              leading={<Icon name="favorite" size={16} />}
              title="Ad set — Lookalike US"
              description="Active · 12 ads"
              persistentActions={
                <>
                  <IconButton
                    icon={<Icon name="favorite_fill" size={16} />}
                    aria-label="Favorite"
                    variant="neutral"
                    emphasis="low"
                    size="sm"
                  />
                  <IconButton
                    icon={<Icon name="more_vert" size={16} />}
                    aria-label="More"
                    variant="neutral"
                    emphasis="low"
                    size="sm"
                  />
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* ── Hidden actions (hover) ─────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2>Hidden actions (hover to reveal)</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Actions that appear only on hover. If persistent actions also exist, hidden actions sit to their left.
        </p>
        <div style={cardStyle}>
          <div style={colStyle}>
            <Entity
              leading={<Icon name="description" size={16} />}
              title="Report Q4 2025"
              description="Last edited 2 hours ago"
              hiddenActions={
                <>
                  <IconButton
                    icon={<Icon name="edit" size={16} />}
                    aria-label="Edit"
                    variant="neutral"
                    emphasis="low"
                    size="sm"
                  />
                  <IconButton
                    icon={<Icon name="content_copy" size={16} />}
                    aria-label="Duplicate"
                    variant="neutral"
                    emphasis="low"
                    size="sm"
                  />
                  <IconButton
                    icon={<Icon name="delete" size={16} />}
                    aria-label="Delete"
                    variant="neutral"
                    emphasis="low"
                    size="sm"
                  />
                </>
              }
              persistentActions={
                <IconButton
                  icon={<Icon name="more_vert" size={16} />}
                  aria-label="More"
                  variant="neutral"
                  emphasis="low"
                  size="sm"
                />
              }
            />
            <Entity
              leading={<Icon name="reporting" size={16} />}
              title="Performance dashboard"
              hiddenActions={
                <>
                  <IconButton
                    icon={<Icon name="share" size={16} />}
                    aria-label="Share"
                    variant="neutral"
                    emphasis="low"
                    size="sm"
                  />
                  <IconButton
                    icon={<Icon name="download" size={16} />}
                    aria-label="Download"
                    variant="neutral"
                    emphasis="low"
                    size="sm"
                  />
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* ── Description line clamp ─────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2>Description line clamp</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Control how many lines the description shows before truncating.
        </p>
        <div style={cardStyle}>
          <div style={colStyle}>
            <Entity
              leading={<Icon name="description" size={16} />}
              title="Line clamp = 1"
              description="This is a really long description that should be truncated after a single line because we set the descriptionLineClamp to 1."
              descriptionLineClamp={1}
            />
            <Entity
              leading={<Icon name="description" size={16} />}
              title="Line clamp = 2"
              description="This is a really long description. It has multiple sentences that together form a paragraph. The second line should still be visible, but anything after line two will be clipped with ellipsis."
              descriptionLineClamp={2}
            />
            <Entity
              leading={<Icon name="description" size={16} />}
              title="No clamp (default)"
              description="This description has no line clamp and will show all lines no matter how long the text gets. It can wrap freely to as many lines as needed."
            />
          </div>
        </div>
      </section>

      {/* ── Error state ────────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2>Error state</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Title and description turn alert color.
        </p>
        <div style={cardStyle}>
          <div style={colStyle}>
            <Entity
              leading={<Icon name="error" size={16} />}
              title="Upload failed"
              description="File exceeds maximum size"
              hint="Retry or remove this file"
              error
            />
            <Entity
              leading={<Icon name="warning" size={16} />}
              title="Connection error"
              error
            />
          </div>
        </div>
      </section>

      {/* ── Disabled state ─────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2>Disabled state</h2>
        <div style={cardStyle}>
          <div style={colStyle}>
            <Entity
              leading={<Icon name="lock" size={16} />}
              title="Locked campaign"
              description="Cannot be edited"
              disabled
              persistentActions={
                <IconButton
                  icon={<Icon name="more_vert" size={16} />}
                  aria-label="More"
                  variant="neutral"
                  emphasis="low"
                  size="sm"
                />
              }
            />
          </div>
        </div>
      </section>

      {/* ── Vertical layout ──────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2>Vertical layout</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Leading on top, text below, actions at the bottom-right. Hidden actions reveal on hover.
        </p>
        <div style={cardStyle}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div style={{ width: 200 }}>
              <Entity
                layout="vertical"
                leading={<Icon name="favorite" size={16} />}
                title="Campaign Alpha"
                description="Active · 12 ads"
                hint="Performance hint"
                persistentActions={
                  <>
                    <IconButton icon={<Icon name="favorite_fill" size={16} />} aria-label="Favorite" variant="neutral" emphasis="low" size="sm" />
                    <IconButton icon={<Icon name="more_vert" size={16} />} aria-label="More" variant="neutral" emphasis="low" size="sm" />
                  </>
                }
              />
            </div>
            <div style={{ width: 200 }}>
              <Entity
                layout="vertical"
                leading={
                  <Thumbnail
                    size="md"
                    type="media"
                    src="https://picsum.photos/seed/vert1/80/80"
                    alt="Preview"
                  />
                }
                title="Summer visual"
                description="1920×1080 · PNG"
                hiddenActions={
                  <>
                    <IconButton icon={<Icon name="edit" size={16} />} aria-label="Edit" variant="neutral" emphasis="low" size="sm" />
                    <IconButton icon={<Icon name="delete" size={16} />} aria-label="Delete" variant="neutral" emphasis="low" size="sm" />
                  </>
                }
                persistentActions={
                  <IconButton icon={<Icon name="more_vert" size={16} />} aria-label="More" variant="neutral" emphasis="low" size="sm" />
                }
              />
            </div>
            <div style={{ width: 200 }}>
              <Entity
                layout="vertical"
                leading={<Icon name="error" size={16} />}
                title="Upload failed"
                description="File exceeds max size"
                error
                persistentActions={
                  <IconButton icon={<Icon name="more_vert" size={16} />} aria-label="More" variant="neutral" emphasis="low" size="sm" />
                }
              />
            </div>
            <div style={{ width: 200 }}>
              <Entity
                layout="vertical"
                leading={<Icon name="lock" size={16} />}
                title="Locked campaign"
                description="Cannot be edited"
                disabled
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Clickable entity ───────────────────────────────────────── */}
      <section style={sectionStyle}>
        <h2>Clickable entity</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Whole row is clickable. Hover and focus styles will be handled later.
        </p>
        <div style={cardStyle}>
          <div style={colStyle}>
            <Entity
              leading={<Icon name="open_in_new" size={16} />}
              title="Click me — opens an alert"
              description="Interactive entity with onClick"
              onClick={() => alert("Entity clicked!")}
            />
          </div>
        </div>
      </section>
    </>
  );
}
