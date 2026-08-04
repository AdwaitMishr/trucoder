import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";

/** Turn `:::tip` / `:::warning` / `:::note` / `:::example` container
 *  directives into a `callout` element we can render as a styled component. */
function remarkCallout() {
  return (tree: unknown) => {
    visit(tree as any, (node: any) => {
      if (node.type === "containerDirective") {
        const data = node.data || (node.data = {});
        data.hName = "callout";
        data.hProperties = { type: node.name };
      }
    });
  };
}

function Callout({ type, children }: { type: string; children: React.ReactNode }) {
  return (
    <div className={`callout callout-${type || "note"}`}>
      <span className="callout-label">{type || "note"}</span>
      <div className="callout-body">{children}</div>
    </div>
  );
}

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkDirective, remarkCallout]}
      components={{ callout: Callout } as unknown as React.ComponentProps<typeof ReactMarkdown>["components"]}
    >
      {children}
    </ReactMarkdown>
  );
}
