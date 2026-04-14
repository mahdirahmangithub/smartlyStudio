import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./fonts.css";
import "./tokens/reset.css";
import "./tokens/primitives.css";
import "./tokens/colors.css";
import "./tokens/spacing.css";
import "./tokens/animation.css";
import "./tokens/typography.css";
import "./tokens/shadow.css";
import "./tokens/breakpoints.css";
import "./tokens/tokens.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
