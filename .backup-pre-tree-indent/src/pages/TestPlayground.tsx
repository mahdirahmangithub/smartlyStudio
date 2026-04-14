import { useState, useRef, useCallback } from "react";
import { Callout } from "../components/Callout";
import { Button } from "../components/Button";
import { ProgressBar } from "../components/ProgressBar";
import { AiLogoLoading } from "../components/AnimatedIcons/AiLogoLoading/AiLogoLoading";
import { Shimmer } from "../components/Shimmer";

function PublishingCallout() {
  const [value, setValue] = useState<number | undefined>(undefined);
  const rafRef = useRef<number>(0);

  const start = useCallback(() => {
    setValue(0);
    let startTs: number | null = null;
    const duration = 4000;

    function step(ts: number) {
      if (!startTs) startTs = ts;
      const pct = Math.min(((ts - startTs) / duration) * 100, 100);
      setValue(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(step);
      }
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
  }, []);

  return (
    <>
      <Button
        size="md"
        variant="neutral"
        emphasis="medium"
        onClick={start}
      >
        {value === undefined ? "Start publishing" : "Restart"}
      </Button>

      <div style={{ maxWidth: 688, marginTop: 48 }}>
        <Callout
          type="info"
          size="md"
          layout="vertical"
            customIcon={<AiLogoLoading active size={32} />}
          title={
            <Shimmer active={value !== undefined} pulse={false}>
              Publishing campaigns in progress...
            </Shimmer>
          }
          actions={
            <div style={{ paddingTop: 12, width: "100%" }}>
              <ProgressBar
                type="info"
                label="1 campaign publishing"
                value={value ?? 0}
              />
            </div>
          }
        />
      </div>
    </>
  );
}

export default function TestPlayground() {
  return (
    <>
      <h1>Test</h1>

      <section style={{ marginBottom: 48 }}>
        <h2>Callout with ProgressBar</h2>
        <p style={{ fontSize: 13, margin: "0 0 8px", opacity: 0.7 }}>
          Info callout with an embedded progress bar and shimmer title.
        </p>
        <PublishingCallout />
      </section>
    </>
  );
}
