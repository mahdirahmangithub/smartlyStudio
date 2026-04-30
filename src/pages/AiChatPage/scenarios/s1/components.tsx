import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { CotContainer, CotItem, Cot } from "../../../../components/Cot";
import { Icon } from "../../../../components/Icon";
import type { CampaignField } from "../../../../components/AiEntityPreview";
import type { CampaignPlanStep } from "../../shared/types";
import type { PlanTaskHandle } from "../../shared/ChatContext";

/* ── Loading + final reasoning cot helpers (campaign creation plan) ── */

export const buildLoadingCot = (labels: string[], completedUpTo: number) => (
  <CotContainer type="reasoning">
    <Cot>
      {labels.map((label, i) => (
        <CotItem
          key={i}
          title={label}
          variant="dot"
          status={i < completedUpTo ? "complete" : i === completedUpTo ? "loading" : "idle"}
        />
      ))}
    </Cot>
  </CotContainer>
);

export const buildFinalReasoningCot = (labels: string[]) => (
  <CotContainer type="reasoning" title="Reasoning">
    <Cot>
      {labels.map((label, i) => (
        <CotItem key={i} title={label} variant="dot" status="complete" />
      ))}
    </Cot>
  </CotContainer>
);

/* ── CampaignPlanTask — Edit/Cancel/Start, exposes a handle for stop/edit ── */

export const CampaignPlanTask = forwardRef<
  PlanTaskHandle,
  {
    steps: CampaignPlanStep[];
    onEdit?: () => void;
    onStart?: () => void;
    onComplete?: () => void;
    /** Optional CodeBlock content shown above the task card. */
    planDetailsCode?: string;
    /** Header title for the plan-details CodeBlock. Defaults to "Plan detail". */
    planDetailsTitle?: string;
  }
>(({ steps, onEdit, onStart, onComplete, planDetailsCode, planDetailsTitle }, ref) => {
  const [status, setStatus] = useState<"idle" | "running" | "cancelled" | "completed" | "editing" | "edited">("idle");
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Guards onComplete from firing twice — React StrictMode double-invokes
  // state updater functions in dev, which would otherwise duplicate side effects.
  const completedRef = useRef(false);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  useImperativeHandle(ref, () => ({
    startEdit: () => setStatus("editing"),
    cancelEdit: () => setStatus("idle"),
    markEdited: () => setStatus("edited"),
    stop: () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      completedRef.current = false;
      setStatus("idle");
      setProgress(0);
    },
  }));

  const handleEdit = () => {
    setStatus("editing");
    onEdit?.();
  };

  const handleStart = () => {
    setStatus("running");
    setProgress(0);
    completedRef.current = false;
    onStart?.();
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + 2;
        if (next >= 100) {
          if (!completedRef.current) {
            completedRef.current = true;
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            setStatus("completed");
            onComplete?.();
          }
          return 100;
        }
        return next;
      });
    }, 80);
  };

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setStatus("idle");
  };

  const handleCancel = () => {
    handleStop();
    setProgress(0);
    setStatus("cancelled");
  };

  return (
    <CotContainer
      type="task"
      title="Campaign creation plan"
      defaultExpanded
      status={status}
      progress={progress}
      onStart={status === "idle" ? handleStart : undefined}
      onStop={status === "running" ? handleStop : undefined}
      onCancel={status === "idle" ? handleCancel : undefined}
      onEdit={status === "idle" ? handleEdit : undefined}
      planDetailsCode={planDetailsCode}
      planDetailsTitle={planDetailsTitle}
    >
      <Cot>
        {steps.map((step, i) => (
          <CotItem
            key={i}
            variant="todo"
            title={step.title}
            description={step.description}
            connector={i < steps.length - 1}
          />
        ))}
      </Cot>
    </CotContainer>
  );
});
CampaignPlanTask.displayName = "CampaignPlanTask";

/* ── UpdateFieldsTask — self-driven progress 0→100 from mount, then onComplete ── */

export function UpdateFieldsTask({
  fields,
  onComplete,
}: {
  fields: CampaignField[];
  onComplete: () => void;
}) {
  const [status, setStatus] = useState<"running" | "completed">("running");
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + 2;
        if (next >= 100) {
          if (!completedRef.current) {
            completedRef.current = true;
            clearInterval(id);
            setStatus("completed");
            onCompleteRef.current();
          }
          return 100;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(id);
  }, []);

  return (
    <CotContainer
      type="task"
      title="Update campaign fields"
      defaultExpanded
      status={status}
      progress={progress}
    >
      <Cot>
        {fields.map((f) => (
          <CotItem
            key={f.id}
            variant="icon"
            icon={<Icon name={f.icon} size={16} aria-hidden />}
            title={f.fieldName}
            description={`apply ${f.value}`}
          />
        ))}
      </Cot>
    </CotContainer>
  );
}
UpdateFieldsTask.displayName = "UpdateFieldsTask";
