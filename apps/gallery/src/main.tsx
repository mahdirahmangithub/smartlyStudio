import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@sds/fonts.css";
import "@sds/tokens/reset.css";
import "@sds/tokens/primitives.css";
import "@sds/tokens/colors.css";
import "@sds/tokens/spacing.css";
import "@sds/tokens/animation.css";
import "@sds/tokens/typography.css";
import "@sds/tokens/shadow.css";
import "@sds/tokens/breakpoints.css";
import "@sds/tokens/tokens.css";
import App from "./App.tsx";
import AiChatPage from "@prototypes/mahdirahman/aichat-orchestration";
import Shell from "./studio/Shell";
import PublicPreview from "./studio/PublicPreview";
import { TEMPLATE_COMPONENTS, type TemplateKey } from "./studio/templateRegistry";

const path = window.location.pathname;

function pickRoot() {
  if (path === "/chat") return <AiChatPage />;
  if (path === "/components") return <App />;
  const previewMatch = path.match(/^\/p\/([^/]+)\/?$/);
  if (previewMatch) {
    const key = previewMatch[1] as TemplateKey;
    if (key in TEMPLATE_COMPONENTS) {
      return <PublicPreview templateKey={key} />;
    }
  }
  return <Shell />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>{pickRoot()}</StrictMode>,
);
