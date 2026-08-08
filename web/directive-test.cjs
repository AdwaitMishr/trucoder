// Render both directive syntaxes through the same pipeline the app uses.
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ReactMarkdown = require("react-markdown").default;
const remarkGfm = require("remark-gfm").default;
const remarkDirective = require("remark-directive").default;
const { visit } = require("unist-util-visit");

function remarkVideo() {
  return (tree) => {
    visit(tree, (node) => {
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

function VideoEmbed({ url, title, credit }) {
  return React.createElement("div", { className: "video-embed" },
    React.createElement("div", { className: "video-frame" },
      React.createElement("iframe", { src: "https://www.youtube-nocookie.com/embed/TEST" })),
    React.createElement("div", { className: "video-caption" }, title, " | ", credit));
}

const md = `BEFORE

:::video{url="https://www.youtube.com/watch?v=CWzpomtLqqs" title="Lec-10: Decision Tree ID3 Algorithm with Example & Calculations" credit="Gate Smashers"}
:::

:::video{url="https://www.youtube.com/watch?v=GBMMtXRiQX0" title="Lec-8: Naive Bayes Classification Full Explanation with examples | Supervised Learning" credit="Gate Smashers"}
:::

:::video{url="https://www.youtube.com/watch?v=WOYylyjkq_g" title="Lec-14: BAYES' Theorem | Probability and Statistics" credit="Gate Smashers"}
:::

AFTER`;

const html = renderToStaticMarkup(
  React.createElement(ReactMarkdown, {
    remarkPlugins: [remarkGfm, remarkDirective, remarkVideo],
    components: { videoEmbed: VideoEmbed },
  }, md)
);
console.log(html);
