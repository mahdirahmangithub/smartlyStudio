import { useState, useEffect, useRef } from "react";
import { CotContainer, CotItem, Cot } from "../../../../components/Cot";
import type { CampaignPlanStep } from "../../shared/types";

/** Scenario s-6 plan task — Start-only (no live Edit/Cancel handlers, but the
 *  buttons still render via CotContainer so the chrome looks complete).
 *  CotContainer auto-derives item status from container progress. */
export function S6CreateCampaignPlanTask({
  steps,
  onComplete,
}: {
  steps: CampaignPlanStep[];
  onComplete?: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "running" | "completed">("idle");
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const handleStart = () => {
    setStatus("running");
    setProgress(0);
    completedRef.current = false;
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + 2;
        if (next >= 100) {
          if (!completedRef.current) {
            completedRef.current = true;
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            setStatus("completed");
            onCompleteRef.current?.();
          }
          return 100;
        }
        return next;
      });
    }, 80);
  };

  return (
    <CotContainer
      type="task"
      title="Campaign creation plan"
      defaultExpanded
      status={status}
      progress={progress}
      onStart={status === "idle" ? handleStart : undefined}
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
}
S6CreateCampaignPlanTask.displayName = "S6CreateCampaignPlanTask";
