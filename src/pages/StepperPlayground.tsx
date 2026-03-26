import { type CSSProperties, useState } from "react";
import { Stepper, Step } from "../components/Stepper";
import { Icon } from "../components/Icon";

const sectionStyle: CSSProperties = { marginBottom: 48 };
const cardStyle: CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: 16,
  marginTop: 12,
};

function HorizontalBasic() {
  return (
    <Stepper activeStep={1}>
      <Step label="Account" description="Create your account" />
      <Step label="Profile" description="Set up profile" />
      <Step label="Review" description="Confirm details" />
      <Step label="Done" description="All set" />
    </Stepper>
  );
}

function VerticalBasic() {
  return (
    <div style={{ height: 400 }}>
      <Stepper activeStep={1} orientation="vertical">
        <Step label="Account" description="Create your account" />
        <Step label="Profile" description="Set up profile" />
        <Step label="Review" description="Confirm details" />
        <Step label="Done" description="All set" />
      </Stepper>
    </div>
  );
}

function WithIcons() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <Stepper activeStep={1}>
        <Step label="Home" description="Start here" icon={<Icon name="home" size={16} />} />
        <Step label="Settings" description="Configure" icon={<Icon name="settings" size={16} />} />
        <Step label="Profile" description="Your info" icon={<Icon name="person" size={16} />} />
        <Step label="Finish" description="All done" icon={<Icon name="star" size={16} />} />
      </Stepper>
      <Stepper activeStep={1} orientation="vertical">
        <Step label="Home" description="Start here" icon={<Icon name="home" size={16} />} />
        <Step label="Settings" description="Configure" icon={<Icon name="settings" size={16} />} />
        <Step label="Profile" description="Your info" icon={<Icon name="person" size={16} />} />
        <Step label="Finish" description="All done" icon={<Icon name="star" size={16} />} />
      </Stepper>
    </div>
  );
}

function Interactive() {
  const [step, setStep] = useState(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Stepper activeStep={step} onChange={setStep}>
        <Step label="Account" description="Create your account" />
        <Step label="Profile" description="Set up profile" />
        <Step label="Review" description="Confirm details" />
        <Step label="Done" description="All set" />
      </Stepper>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</button>
        <button onClick={() => setStep((s) => Math.min(3, s + 1))}>Next</button>
        <span style={{ opacity: 0.6, fontSize: 13 }}>Active: {step}</span>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <Stepper activeStep={2}>
      <Step label="Account" description="Created" />
      <Step label="Payment" description="Added" />
      <Step label="Verification" description="Failed" status="error" />
      <Step label="Done" description="Pending" />
    </Stepper>
  );
}

function DisabledSteps() {
  return (
    <Stepper activeStep={1}>
      <Step label="Account" description="Created" />
      <Step label="Profile" description="Set up profile" />
      <Step label="Review" description="Locked" disabled />
      <Step label="Done" description="Locked" disabled />
    </Stepper>
  );
}

function NonLinear() {
  const [step, setStep] = useState(1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Stepper activeStep={step} nonLinear onChange={setStep}>
        <Step label="Account" description="Optional" />
        <Step label="Profile" description="Optional" />
        <Step label="Review" description="Optional" status="error" />
        <Step label="Done" description="Optional" />
      </Stepper>
      <span style={{ opacity: 0.6, fontSize: 13 }}>Non-linear: click any step. Active: {step}</span>
    </div>
  );
}

function AllStates() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 8px" }}>Without icons:</p>
        <Stepper activeStep={1}>
          <Step label="Normal" description="subtext" status="normal" />
          <Step label="Active" description="subtext" status="active" />
          <Step label="Success" description="subtext" status="success" />
          <Step label="Error" description="subtext" status="error" />
        </Stepper>
      </div>
      <div>
        <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 8px" }}>With icons:</p>
        <Stepper activeStep={1}>
          <Step label="Normal" description="subtext" status="normal" icon={<Icon name="apps" size={16} />} />
          <Step label="Active" description="subtext" status="active" icon={<Icon name="apps" size={16} />} />
          <Step label="Success" description="subtext" status="success" icon={<Icon name="apps" size={16} />} />
          <Step label="Error" description="subtext" status="error" icon={<Icon name="apps" size={16} />} />
        </Stepper>
      </div>
      <div>
        <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 8px" }}>Disabled:</p>
        <Stepper activeStep={-1}>
          <Step label="Normal" description="subtext" status="normal" disabled />
          <Step label="Active" description="subtext" status="active" disabled />
          <Step label="Success" description="subtext" status="success" disabled />
          <Step label="Error" description="subtext" status="error" disabled />
        </Stepper>
      </div>
    </div>
  );
}

export default function StepperPlayground() {
  return (
    <>
      <h1>Stepper</h1>

      <section style={sectionStyle}>
        <h2>Horizontal</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Basic horizontal stepper with step 2 active.
        </p>
        <div style={cardStyle}>
          <HorizontalBasic />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Vertical</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Vertical orientation with step 2 active.
        </p>
        <div style={cardStyle}>
          <VerticalBasic />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>With Icons</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Custom icons instead of step numbers.
        </p>
        <div style={cardStyle}>
          <WithIcons />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Interactive</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Click steps or use Back/Next buttons. Steps are clickable buttons.
        </p>
        <div style={cardStyle}>
          <Interactive />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Error State</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Step 3 has a status override of &quot;error&quot;.
        </p>
        <div style={cardStyle}>
          <ErrorState />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Disabled Steps</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Steps 3 and 4 are disabled.
        </p>
        <div style={cardStyle}>
          <DisabledSteps />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>Non-Linear</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Non-linear mode: past steps are not auto-marked as success.
        </p>
        <div style={cardStyle}>
          <NonLinear />
        </div>
      </section>

      <section style={sectionStyle}>
        <h2>All States</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          All type variants: normal, active, success, error (with/without icons, disabled).
        </p>
        <div style={cardStyle}>
          <AllStates />
        </div>
      </section>
    </>
  );
}
