import { useState, useEffect } from "react";
import { Container } from "@sds/components/Grid";
import { Icon } from "@sds/components/Icon";
import { Sidebar } from "@sds/components/Sidebar";
import { NavigationItem } from "@sds/components/NavigationItem";
import { SettingsMenu, type Theme, type Typeface } from "@prototypes/mahdirahman/aichat-orchestration/shared/SettingsMenu";
import PrototypesPage from "./PrototypesPage";
import TemplatesPage from "./TemplatesPage";
import IconsPage from "./IconsPage";
import { TEMPLATE_COMPONENTS, type TemplateKey } from "./templateRegistry";
import { PROTOTYPE_COMPONENTS, type PrototypeKey } from "./prototypeRegistry";
import styles from "./Shell.module.css";

export type NavKey = "prototypes" | "templates" | "components" | "icons";

interface RouteState {
  nav: NavKey;
  template: TemplateKey | null;
  prototype: PrototypeKey | null;
}

function parsePath(path: string): RouteState {
  const segments = path.split("/").filter(Boolean);
  const [first, second] = segments;
  if (first === "templates") {
    const key = second as TemplateKey | undefined;
    return {
      nav: "templates",
      template: key && key in TEMPLATE_COMPONENTS ? key : null,
      prototype: null,
    };
  }
  if (first === "prototypes") {
    const key = second as PrototypeKey | undefined;
    return {
      nav: "prototypes",
      template: null,
      prototype: key && key in PROTOTYPE_COMPONENTS ? key : null,
    };
  }
  if (first === "icons") return { nav: "icons", template: null, prototype: null };
  if (first === "components") return { nav: "components", template: null, prototype: null };
  return { nav: "prototypes", template: null, prototype: null };
}

function buildPath(state: RouteState): string {
  if (state.template) return `/templates/${state.template}`;
  if (state.prototype) return `/prototypes/${state.prototype}`;
  if (state.nav === "prototypes") return "/";
  return `/${state.nav}`;
}

export default function Shell() {
  const [theme, setTheme] = useState<Theme>("light");
  const [typeface, setTypeface] = useState<Typeface>("mac");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [route, setRoute] = useState<RouteState>(() => parsePath(window.location.pathname));
  const { nav: activeNav, template: selectedTemplate, prototype: selectedPrototype } = route;

  const setActiveNav = (nav: NavKey) => {
    if (nav === "components") {
      window.location.href = "/components";
      return;
    }
    navigate({ nav, template: null, prototype: null });
  };
  const setSelectedTemplate = (template: TemplateKey | null) =>
    navigate({ nav: "templates", template, prototype: null });
  const setSelectedPrototype = (prototype: PrototypeKey | null) =>
    navigate({ nav: "prototypes", template: null, prototype });

  function navigate(next: RouteState) {
    setRoute(next);
    const nextPath = buildPath(next);
    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, "", nextPath);
    }
  }

  useEffect(() => {
    const onPopState = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.altKey && e.shiftKey && e.code === "KeyT") {
        e.preventDefault();
        setTheme((t) => (t === "light" ? "dark" : t === "dark" ? "dusk" : "light"));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.dataset.theme;
    html.dataset.theme = theme;
    return () => {
      if (prev === undefined) delete html.dataset.theme;
      else html.dataset.theme = prev;
    };
  }, [theme]);

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.dataset.typeface;
    html.dataset.typeface = typeface;
    return () => {
      if (prev === undefined) delete html.dataset.typeface;
      else html.dataset.typeface = prev;
    };
  }, [typeface]);

  useEffect(() => {
    const body = document.body;
    const prev = body.style.background;
    body.style.background = "var(--element-surface-default)";
    return () => { body.style.background = prev; };
  }, []);

  if (selectedTemplate) {
    const SelectedTemplate = TEMPLATE_COMPONENTS[selectedTemplate];
    return (
      <div className={styles.templateFullscreen}>
        <SelectedTemplate />
      </div>
    );
  }

  if (selectedPrototype) {
    const SelectedPrototype = PROTOTYPE_COMPONENTS[selectedPrototype];
    return (
      <div className={styles.templateFullscreen}>
        <SelectedPrototype />
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar
        className={styles.sidebar}
        collapsible
        expandBehavior="overlay"
        expanded={sidebarExpanded}
        onExpandedChange={setSidebarExpanded}
        title="Studio"
        footer={
          <SettingsMenu
            sidebarExpanded={sidebarExpanded}
            theme={theme}
            setTheme={setTheme}
            typeface={typeface}
            setTypeface={setTypeface}
          />
        }
      >
        <div className={styles.sidebarNav}>
          <NavigationItem
            label="Prototypes"
            leadingIcon={<Icon name="graph_horizontal" size={20} />}
            iconOnly={!sidebarExpanded}
            checked={activeNav === "prototypes"}
            onClick={() => setActiveNav("prototypes")}
          />
          <NavigationItem
            label="Templates"
            leadingIcon={<Icon name="file_stack" size={20} />}
            iconOnly={!sidebarExpanded}
            checked={activeNav === "templates"}
            onClick={() => setActiveNav("templates")}
          />
          <NavigationItem
            label="Components"
            leadingIcon={<Icon name="cursor_click" size={20} />}
            iconOnly={!sidebarExpanded}
            checked={activeNav === "components"}
            onClick={() => setActiveNav("components")}
          />
          <NavigationItem
            label="Icons"
            leadingIcon={<Icon name="lightbulb" size={20} />}
            iconOnly={!sidebarExpanded}
            checked={activeNav === "icons"}
            onClick={() => setActiveNav("icons")}
          />
        </div>
      </Sidebar>
      <Container maxWidth="md" className={styles.page}>
        {activeNav === "icons" ? (
          <IconsPage />
        ) : activeNav === "templates" ? (
          <TemplatesPage onSelectTemplate={setSelectedTemplate} />
        ) : (
          <PrototypesPage onSelectPrototype={setSelectedPrototype} />
        )}
      </Container>
    </div>
  );
}
