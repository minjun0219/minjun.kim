import type { Element, Root as HastRoot, RootContent } from "hast";
import type { Root as MdastRoot } from "mdast";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { createHighlighter, type Highlighter } from "shiki";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import {
  GITHUB_ICON_PATH,
  GITHUB_ICON_VIEWBOX,
} from "@/components/icons/githubIconPath";

/** VS Code 기본 다크. 이전 prism-react-renderer `themes.vsDark` 에 가장 가깝다. */
const SHIKI_THEME = "dark-plus";

/** 본문에서 실제로 쓰이는 언어만 번들한다. 그 외는 plaintext 로 떨어뜨린다. */
const SHIKI_LANGS = ["typescript", "css", "bash"] as const;

const FALLBACK_LANG = "text";

let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: [SHIKI_THEME],
    langs: [...SHIKI_LANGS],
  });
  return highlighterPromise;
}

/**
 * 마크다운 → HTML 변환 시 붙일 CSS Modules 클래스명.
 * 파이프라인이 raw HTML 을 만들기 때문에 해시된 실제 클래스명을 밖에서 주입받아야 한다.
 */
export type MarkdownClassNames = {
  /** CodeBlock.module.css `root` — `<pre>` */
  codeRoot: string;
  /** CodeBlock.module.css `container` — 언어 뱃지를 그리는 래퍼 */
  codeContainer: string;
  /** CodeBlock.module.css `code` — 실제 코드 영역 */
  codeBody: string;
  /** PostContent.module.css `figure` — 이미지 래퍼 */
  figure: string;
  /** PostContent.module.css `iconLink` */
  iconLink: string;
  /** PostContent.module.css `icon` */
  icon: string;
};

function isElement(node: RootContent | undefined, tagName: string) {
  return node?.type === "element" && node.tagName === tagName;
}

function classList(node: Element): string[] {
  const value: unknown = node.properties?.className;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return value.split(/\s+/);
  return [];
}

/** 코드 펜스의 meta(``` ts /path/to/file.tsx``)를 hast 까지 실어 나른다. */
function remarkForwardCodeMeta() {
  return (tree: MdastRoot) => {
    visit(tree, "code", (node) => {
      if (!node.meta) return;
      node.data ??= {};
      node.data.hProperties = {
        ...node.data.hProperties,
        "data-meta": node.meta,
      };
    });
  };
}

/**
 * shiki 로 하이라이팅한 뒤 CodeBlock.module.css 가 기대하는 DOM 으로 재조립한다.
 *
 * ```
 * <pre class={codeRoot} title={meta}>
 *   <div class={codeContainer} data-language={lang} style={shiki 배경/전경}>
 *     <div class={codeBody}><code>…</code></div>
 *   </div>
 * </pre>
 * ```
 *
 * `title` / `data-language` 는 각각 `.root[title]::before` 와
 * `.container[data-language]::after` 가 읽어 코드 제목과 언어 뱃지를 그린다.
 */
function rehypeCodeBlock(classNames: MarkdownClassNames) {
  return async (tree: HastRoot) => {
    const highlighter = await getHighlighter();
    const targets: Array<{ pre: Element; code: Element }> = [];

    visit(tree, "element", (node) => {
      if (node.tagName !== "pre") return;
      const code = node.children.find((child) => isElement(child, "code")) as
        | Element
        | undefined;
      if (code) targets.push({ pre: node, code });
    });

    for (const { pre, code } of targets) {
      const languageClass = classList(code).find((name) =>
        name.startsWith("language-"),
      );
      const requested = languageClass?.slice("language-".length) ?? "";
      const lang = (SHIKI_LANGS as readonly string[]).includes(requested)
        ? requested
        : FALLBACK_LANG;

      const source = toPlainText(code).replace(/\n$/, "");
      const highlighted = highlighter.codeToHast(source, {
        lang,
        theme: SHIKI_THEME,
      });
      const shikiPre = highlighted.children.find((child) =>
        isElement(child, "pre"),
      ) as Element | undefined;
      const shikiCode = shikiPre?.children.find((child) =>
        isElement(child, "code"),
      ) as Element | undefined;
      if (!shikiPre || !shikiCode) continue;

      const meta = code.properties?.["data-meta"];

      pre.properties = {
        className: [classNames.codeRoot],
        ...(typeof meta === "string" && meta ? { title: meta } : {}),
      };
      pre.children = [
        {
          type: "element",
          tagName: "div",
          properties: {
            className: [classNames.codeContainer],
            "data-language": requested || FALLBACK_LANG,
            style: shikiPre.properties?.style,
          },
          children: [
            {
              type: "element",
              tagName: "div",
              properties: { className: [classNames.codeBody] },
              children: [shikiCode],
            },
          ],
        },
      ];
    }
  };
}

function toPlainText(node: Element): string {
  let out = "";
  visit(node, "text", (text) => {
    out += text.value;
  });
  return out;
}

/** 이미지를 `<span class={figure}>` 로 감싼다(이전 PostContent 의 img 렌더러와 동일). */
function rehypeWrapImages(classNames: MarkdownClassNames) {
  return (tree: HastRoot) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "img" || !parent || index === undefined) return;
      if (isElement(parent as RootContent, "span")) return;
      parent.children[index] = {
        type: "element",
        tagName: "span",
        properties: { className: [classNames.figure] },
        children: [node],
      };
    });
  };
}

/**
 * 텍스트가 "github" 인 github.com 링크를 아이콘 링크로 바꾼다
 * (이전 PostContent 의 a 렌더러와 동일한 규칙).
 */
function rehypeGithubIconLink(classNames: MarkdownClassNames) {
  return (tree: HastRoot) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string" || !/^https:\/\/github\.com\//.test(href)) {
        return;
      }
      if (toPlainText(node).trim().toLowerCase() !== "github") return;

      node.properties = {
        ...node.properties,
        className: [...classList(node), classNames.iconLink],
        "aria-label": "GitHub repository",
      };
      node.children = [
        {
          type: "element",
          tagName: "svg",
          properties: {
            className: [classNames.icon],
            viewBox: GITHUB_ICON_VIEWBOX,
            "aria-label": "github",
          },
          children: [
            {
              type: "element",
              tagName: "path",
              properties: {
                d: GITHUB_ICON_PATH,
                fill: "currentColor",
                fillRule: "nonzero",
              },
              children: [],
            },
          ],
        },
      ];
    });
  };
}

/**
 * 글 본문 마크다운을 HTML 로 변환한다. 하이라이팅이 빌드타임에 끝나므로
 * 클라이언트로 나가는 하이라이터 코드가 없다.
 *
 * raw HTML 은 의도적으로 처리하지 않는다 — 이전 react-markdown 구성도
 * rehype-raw 없이 동작했고, `_posts` / `_content` 에 본문 레벨 raw HTML 이 없다.
 */
export async function renderPostHtml(
  markdown: string,
  classNames: MarkdownClassNames,
): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkForwardCodeMeta)
    .use(remarkRehype)
    .use(rehypeCodeBlock, classNames)
    .use(rehypeWrapImages, classNames)
    .use(rehypeGithubIconLink, classNames)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}
