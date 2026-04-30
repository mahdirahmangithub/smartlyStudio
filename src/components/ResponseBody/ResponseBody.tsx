import { useMemo, type HTMLAttributes, type ReactNode } from "react";
import { InlineCode } from "../InlineCode";
import { CodeBlock } from "../CodeBlock";
import { Link } from "../Link";
import { cx } from "../../utils/cx";
import styles from "./ResponseBody.module.css";

type ComponentMap = Record<string, (attrs: Record<string, string>) => ReactNode>;

function renderNodes(nodes: NodeListOf<ChildNode>, prefix: string, components?: ComponentMap): ReactNode[] {
  return Array.from(nodes).map((node, i) => renderNode(node, `${prefix}${i}`, components));
}

function renderNode(node: ChildNode, key: string, components?: ComponentMap): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || null;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const kids = renderNodes(el.childNodes, `${key}.`, components);

  switch (tag) {
    case "h1": return <h1 key={key} className={styles.h1}>{kids}</h1>;
    case "h2": return <h2 key={key} className={styles.h2}>{kids}</h2>;
    case "h3": return <h3 key={key} className={styles.h3}>{kids}</h3>;
    case "h4": return <h4 key={key} className={styles.h4}>{kids}</h4>;
    case "h5": return <h5 key={key} className={styles.h5}>{kids}</h5>;
    case "h6": return <h6 key={key} className={styles.h6}>{kids}</h6>;

    case "p": return <p key={key} className={styles.p}>{kids}</p>;

    case "strong":
    case "b": return <strong key={key} className={styles.strong}>{kids}</strong>;

    case "em":
    case "i": return <em key={key} className={styles.em}>{kids}</em>;

    case "ul": return <ul key={key} className={styles.ul}>{kids}</ul>;
    case "ol": return <ol key={key} className={styles.ol}>{kids}</ol>;
    case "li": return <li key={key} className={styles.li}>{kids}</li>;

    case "code": {
      // Inside a <pre> — handled by the pre case below
      if (el.parentElement?.tagName.toLowerCase() === "pre") return kids;
      return <InlineCode key={key}>{el.textContent ?? ""}</InlineCode>;
    }

    case "pre": {
      const codeEl = el.querySelector("code");
      const lang = codeEl?.className.match(/language-(\w+)/)?.[1];
      const codeText = (codeEl ?? el).textContent ?? "";
      return (
        <CodeBlock
          key={key}
          code={codeText}
          description={lang}
        />
      );
    }

    case "a": {
      const href = el.getAttribute("href") ?? "#";
      const isExternal = href.startsWith("http");
      const linkType = el.getAttribute("data-link-type") === "brand" ? "brand" : undefined;
      const linkStrong = el.hasAttribute("data-link-strong");
      return (
        <Link
          key={key}
          href={href}
          inline
          external={isExternal}
          type={linkType}
          strong={linkStrong}
        >
          {kids}
        </Link>
      );
    }

    case "blockquote": return <blockquote key={key} className={styles.blockquote}>{kids}</blockquote>;

    case "hr": return <hr key={key} className={styles.hr} />;
    case "br": return <br key={key} />;

    default: {
      if (components?.[tag]) {
        const attrs = Object.fromEntries(
          Array.from(el.attributes).map((a) => [a.name, a.value])
        );
        return <span key={key}>{components[tag](attrs)}</span>;
      }
      return <span key={key}>{kids}</span>;
    }
  }
}

export interface ResponseBodyProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Raw HTML string from the model. Parsed safely via DOMParser — no dangerouslySetInnerHTML. */
  html: string;
  /**
   * Custom element renderers — called when an unrecognised tag is encountered.
   * Key: tag name (e.g. "entity-preview"). Value: function receiving the element's
   * attributes and returning a ReactNode.
   */
  components?: ComponentMap;
}

export function ResponseBody({ html, className, components, ...rest }: ResponseBodyProps) {
  const nodes = useMemo(() => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return renderNodes(doc.body.childNodes, "n", components);
  }, [html, components]);

  return (
    <div className={cx(styles.root, className)} {...rest}>
      {nodes}
    </div>
  );
}

ResponseBody.displayName = "ResponseBody";
