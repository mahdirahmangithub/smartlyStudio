import { useCallback, useEffect, useRef, useState } from "react";
import { AISideEntry } from "../components/AISideEntry";
import { Drawer } from "../components/Drawer";
import { Popover } from "../components/Popover";
import { Button } from "../components/Button";
import { CheckboxField } from "../components/Checkbox";

const DRAWER_EXIT_DURATION = 400;

export default function AISideEntryPlayground() {
  const [usePopover, setUsePopover] = useState(false);
  const [open, setOpen] = useState(false);
  const [buttonHidden, setButtonHidden] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleOpen = useCallback(() => {
    clearTimeout(exitTimer.current);
    setOpen(true);
    setButtonHidden(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    if (usePopover) {
      setButtonHidden(false);
    } else {
      exitTimer.current = setTimeout(
        () => setButtonHidden(false),
        DRAWER_EXIT_DURATION,
      );
    }
  }, [usePopover]);

  useEffect(() => () => clearTimeout(exitTimer.current), []);

  const panelId = "ai-panel-demo";

  return (
    <>
      <h1>AI Side Entry</h1>

      <CheckboxField
        label="Use Popover instead of Drawer"
        checked={usePopover}
        onChange={setUsePopover}
      />

      <AISideEntry
        ref={anchorRef}
        panelOpen={buttonHidden}
        panelType={usePopover ? "true" : "dialog"}
        panelId={panelId}
        onClick={handleOpen}
      />

      {usePopover ? (
        <Popover
          open={open}
          anchorRef={anchorRef}
          onClose={handleClose}
          placement="left-end"
          role="dialog"
          id={panelId}
        >
          <div style={{ padding: 16, maxWidth: 280 }}>
            <p style={{ margin: "0 0 8px" }}>AI Popover content.</p>
            <Button onClick={handleClose}>Done</Button>
          </div>
        </Popover>
      ) : (
        <Drawer
          open={open}
          onClose={handleClose}
          title="AI Assistant"
          description="Ask anything about your campaigns."
          id={panelId}
        >
          <div style={{ padding: 16 }}>
            <p>Drawer content goes here.</p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </Drawer>
      )}
    </>
  );
}
