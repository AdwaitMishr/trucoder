import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import katex from "katex";
import { visit } from "unist-util-visit";
import { useState } from "react";
import { PiCheck, PiCopy } from "react-icons/pi";
import VideoEmbed from "./VideoEmbed";

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

/** Turn `:::video url="..." title="..." credit="..."` container directives
 *  into a `videoEmbed` element we render as a styled YouTube player. */
function remarkVideo() {
  return (tree: unknown) => {
    visit(tree as any, (node: any) => {
      if (
        (node.type === "containerDirective" || node.type === "leafDirective") &&
        node.name === "video"
      ) {
        const data = node.data || (node.data = {});
        data.hName = "videoEmbed";
        data.hProperties = {
          url: node.attributes?.url ?? "",
          title: node.attributes?.title ?? "",
          credit: node.attributes?.credit ?? "",
        };
      }
    });
  };
}

/** Math parsing done HERE, not remark-math: remark-math v6 mis-parses
 *  `$$...$$` as inline math (display math never gets a block wrapper), and
 *  rehype-katex v7 loses display mode with react-markdown 9.0.1. This plugin
 *  splits text nodes on `$$...$$` (display) and `$...$` (inline) and emits
 *  custom nodes our KaTeX components render with explicit displayMode.
 *  Inline math is extracted ONLY OUTSIDE display spans, so a `$$...$$`
 *  block can never also produce an inline render. */
function extractInline(segment: string, parts: { kind: "text" | "display" | "inline"; value: string }[]) {
  const re = /\$([^$\n]+)\$/g;
  let im: RegExpExecArray | null;
  let last = 0;
  while ((im = re.exec(segment)) !== null) {
    if (im.index > last) parts.push({ kind: "text", value: segment.slice(last, im.index) });
    parts.push({ kind: "inline", value: im[1] });
    last = im.index + im[0].length;
  }
  if (last < segment.length) parts.push({ kind: "text", value: segment.slice(last) });
}

function splitMath(value: string) {
  const displaySpans: { start: number; end: number; value: string }[] = [];
  const dispRe = /\$\$([\s\S]+?)\$\$/g;
  let m: RegExpExecArray | null;
  while ((m = dispRe.exec(value)) !== null) {
    displaySpans.push({ start: m.index, end: m.index + m[0].length, value: m[1] });
  }
  const parts: { kind: "text" | "display" | "inline"; value: string }[] = [];
  let pos = 0;
  for (const ds of displaySpans) {
    if (ds.start > pos) extractInline(value.slice(pos, ds.start), parts);
    parts.push({ kind: "display", value: ds.value });
    pos = ds.end;
  }
  if (pos < value.length) extractInline(value.slice(pos), parts);
  return parts;
}

function remarkMathCustom() {
  return (tree: unknown) => {
    visit(tree as any, "text", (node: any, index: number | undefined, parent: any) => {
      if (!parent || index === undefined) return;
      const parts = splitMath(node.value);
      // a text node that is EXACTLY one math expression (e.g. a table cell
      // "$3/6 = 0.5$") yields a single math part — replace it, don't skip
      if (parts.length === 1 && parts[0].kind === "text") return;
      const children = parts.map((p) => {
        if (p.kind === "text") return { type: "text", value: p.value };
        const type = p.kind === "display" ? "mathblock" : "inlinemath";
        return {
          type,
          value: p.value,
          data: { hName: type, hProperties: { value: p.value } },
        };
      });
      parent.children.splice(index, 1, ...children);
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

// Math is rendered DIRECTLY with KaTeX. Custom components keep full
// control: display math always gets .katex-display.
function renderMath(value: string, displayMode: boolean) {
  return katex.renderToString(value, { displayMode, throwOnError: false });
}

function MathBlock({ value }: { value: string }) {
  return (
    <span
      className="katex-display"
      dangerouslySetInnerHTML={{ __html: renderMath(value, true) }}
    />
  );
}

function InlineMath({ value }: { value: string }) {
  return (
    <span dangerouslySetInnerHTML={{ __html: renderMath(value, false) }} />
  );
}

/** Flatten react-markdown's children tree into plain text (for copying). */
function nodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (node && typeof node === "object" && "props" in (node as any)) {
    return nodeText((node as any).props?.children);
  }
  return "";
}

/** Copy button on every fenced code block. */
function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const text = nodeText(children).replace(/\n$/, "");
  return (
    <div className="md-codeblock">
      <button
        className="md-code-copy"
        aria-label="copy code"
        title="copy code"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
          } catch {
            // Clipboard API unavailable (insecure context) — legacy fallback.
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
          }
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <PiCheck size={13} /> : <PiCopy size={13} />}
        {copied ? "copied" : "copy"}
      </button>
      <pre>{children}</pre>
    </div>
  );
}

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkDirective, remarkCallout, remarkVideo, remarkMathCustom]}
      components={{
        callout: Callout,
        videoEmbed: VideoEmbed,
        mathblock: MathBlock,
        inlinemath: InlineMath,
        pre: CodeBlock,
      } as unknown as React.ComponentProps<typeof ReactMarkdown>["components"]}
    >
      {children}
    </ReactMarkdown>
  );
}
