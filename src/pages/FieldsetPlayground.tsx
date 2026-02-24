import { useState } from "react";
import { Fieldset, FieldGroup } from "../components/Fieldset";
import { Input } from "../components/Input";
import { ToggleField } from "../components/Toggle";
import { CheckboxField } from "../components/Checkbox";
import { Slider } from "../components/Slider";

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
            <Input placeholder="Search…" />
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
