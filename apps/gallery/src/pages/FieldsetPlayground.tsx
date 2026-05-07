import { useState, useCallback } from "react";
import { Fieldset, FieldGroup } from "@sds/components/Fieldset";
import { Input } from "@sds/components/Input";
import { ToggleField } from "@sds/components/Toggle";
import { CheckboxField } from "@sds/components/Checkbox";
import { Slider } from "@sds/components/Slider";
import { FileUpload, type FileUploadItem, type DroppedEntry } from "@sds/components/FileUpload";

const sectionStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 12,
};

const cardStyle = {
  padding: 24,
  border: "1px solid var(--element-outline-neutral-subtlest)",
  borderRadius: 12,
  display: "flex",
  flexDirection: "column" as const,
  gap: 32,
};

const groupStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 12,
  width: "100%",
};

export default function FieldsetPlayground() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [volume, setVolume] = useState(50);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const maxBio = 200;

  const [uploadItems, setUploadItems] = useState<FileUploadItem[]>([]);

  const handleUploadFiles = useCallback((files: File[]) => {
    const newItems: FileUploadItem[] = files.map((f) => ({
      id: `file-${Date.now()}-${f.name}`,
      name: f.name,
      type: "file" as const,
      status: "normal" as const,
      fileSize: f.size < 1024 * 1024
        ? `${(f.size / 1024).toFixed(0)} KB`
        : `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setUploadItems((prev) => [...prev, ...newItems]);
  }, []);

  const handleDropEntries = useCallback((entries: DroppedEntry[]) => {
    function toItems(list: DroppedEntry[]): FileUploadItem[] {
      return list.map((e) =>
        e.type === "file"
          ? {
              id: `file-${Date.now()}-${e.name}`,
              name: e.name,
              type: "file" as const,
              status: "normal" as const,
              fileSize: e.file.size < 1024 * 1024
                ? `${(e.file.size / 1024).toFixed(0)} KB`
                : `${(e.file.size / (1024 * 1024)).toFixed(1)} MB`,
            }
          : {
              id: `folder-${Date.now()}-${e.name}`,
              name: e.name,
              type: "folder" as const,
              children: toItems(e.children),
            }
      );
    }
    setUploadItems((prev) => [...prev, ...toItems(entries)]);
  }, []);

  const removeFromTree = (
    items: FileUploadItem[],
    id: string,
    path: string[]
  ): FileUploadItem[] => {
    if (path.length === 0) return items.filter((i) => i.id !== id);
    return items.map((item) =>
      item.id === path[0] && item.children
        ? { ...item, children: removeFromTree(item.children, id, path.slice(1)) }
        : item
    );
  };

  const emailError =
    email.length > 0 && !email.includes("@")
      ? "Please enter a valid email address"
      : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h2 style={{ margin: 0 }}>Fieldset</h2>

      {/* ── Basic with Input ────────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Basic — Input with Hint</h3>
        <div style={cardStyle}>
          <Fieldset
            label="Full Name"
            description="As it appears on your ID"
            message="Enter your legal name"
            required
          >
            <Input
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Fieldset>
        </div>
      </div>

      {/* ── Error state ─────────────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Error State</h3>
        <div style={cardStyle}>
          <Fieldset
            label="Email"
            message={emailError ?? "We'll never share your email"}
            messageType={emailError ? "alert" : "neutral"}
            required
          >
            <Input
              aria-invalid={!!emailError}
              type="email"
              placeholder="email@example.com"
              value={email}
              error={!!emailError}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Fieldset>
        </div>
      </div>

      {/* ── Character counter ───────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Character Counter</h3>
        <div style={cardStyle}>
          <Fieldset
            label="Bio"
            description="Tell us about yourself"
            message={
              bio.length >= maxBio
                ? "Character limit reached"
                : "Keep it brief"
            }
            messageType={bio.length >= maxBio ? "alert" : "none"}
            charCount={bio.length}
            charMax={maxBio}
          >
            <Input
              placeholder="I like building things…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={maxBio}
            />
          </Fieldset>
        </div>
      </div>

      {/* ── Switch Group (role="group") ─────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Switch Group</h3>
        <div style={cardStyle}>
          <FieldGroup
            label="Preferences"
            description="Configure your experience"
            message="Changes are saved automatically"
          >
            <div style={groupStyle}>
              <ToggleField label="Dark mode" checked={darkMode} onChange={setDarkMode} />
              <ToggleField label="Notifications" checked={notifications} onChange={setNotifications} />
              <ToggleField label="Sound effects" checked={sounds} onChange={setSounds} />
            </div>
          </FieldGroup>
        </div>
      </div>

      {/* ── Checkbox Group (role="group") ─────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Checkbox Group</h3>
        <div style={cardStyle}>
          <FieldGroup
            label="Agreements"
            message="You must accept terms to continue"
            messageType={termsAccepted ? "success" : "warning"}
            required
          >
            <div style={groupStyle}>
              <CheckboxField label="I agree to the terms and conditions" checked={termsAccepted} onChange={setTermsAccepted} />
              <CheckboxField label="Send me marketing emails" checked={marketingAccepted} onChange={setMarketingAccepted} />
            </div>
          </FieldGroup>
        </div>
      </div>

      {/* ── With Slider ─────────────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>With Slider</h3>
        <div style={cardStyle}>
          <Fieldset
            label="Volume"
            description="Adjust the output volume"
            message={`Current: ${volume}%`}
            messageType="info"
          >
            <Slider
              value={volume}
              onChange={setVolume}
              min={0}
              max={100}
              step={1}
            />
          </Fieldset>
        </div>
      </div>

      {/* ── With FileUpload ─────────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>With FileUpload</h3>
        <div style={cardStyle}>
          <Fieldset
            label="Attachments"
            description="Upload supporting documents"
            optional
          >
            <FileUpload
              items={uploadItems}
              onFiles={handleUploadFiles}
              onDropEntries={handleDropEntries}
              hintText="PDF, PNG, JPG up to 100 MB"
              onItemRemove={(id, path) =>
                setUploadItems((prev) => removeFromTree(prev, id, path))
              }
              onItemRetry={(id) => alert(`Retry: ${id}`)}
              onDeleteAll={() => setUploadItems([])}
            />
          </Fieldset>
        </div>
      </div>

      {/* ── Optional + no icon ──────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Optional, No Message Icon</h3>
        <div style={cardStyle}>
          <Fieldset
            label="Nickname"
            optional
            message="This is how others will see you"
            showMessageIcon={false}
          >
            <Input placeholder="cooldev42" />
          </Fieldset>
        </div>
      </div>

      {/* ── Success state ───────────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Success Message</h3>
        <div style={cardStyle}>
          <Fieldset
            label="Username"
            message="Username is available!"
            messageType="success"
          >
            <Input value="designengineer" readOnly />
          </Fieldset>
        </div>
      </div>

      {/* ── Disabled ────────────────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>Disabled</h3>
        <div style={cardStyle}>
          <Fieldset
            label="Organisation"
            message="Contact admin to change"
            disabled
          >
            <Input value="Acme Corp" disabled />
          </Fieldset>
        </div>
      </div>

      {/* ── No label ────────────────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>No Label (message only)</h3>
        <div style={cardStyle}>
          <Fieldset
            message="Search across all documents"
            messageType="info"
          >
            <Input placeholder="Search…" aria-label="Search" />
          </Fieldset>
        </div>
      </div>

      {/* ── High emphasis message ────────────────── */}
      <div style={sectionStyle}>
        <h3 style={{ margin: 0 }}>High Emphasis Alert</h3>
        <div style={cardStyle}>
          <Fieldset
            label="Password"
            required
            message="Password must be at least 8 characters"
            messageType="alert"
            messageEmphasis="high"
          >
            <Input type="password" error placeholder="••••••••" />
          </Fieldset>
        </div>
      </div>
    </div>
  );
}
