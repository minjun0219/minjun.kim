import type { Element, Root as HastRoot, RootContent } from 'hast';
import type { Root as MdastRoot } from 'mdast';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { createHighlighter, type Highlighter } from 'shiki';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { GITHUB_ICON_PATH, GITHUB_ICON_VIEWBOX } from '@/components/icons/githubIconPath';
import type { ImageAsset, ImageManifest } from '@/lib/images';
import { MD_CLASS } from './markdownClassNames';

/** VS Code 기본 다크. 이전 prism-react-renderer `themes.vsDark` 에 가장 가깝다. */
const SHIKI_THEME = 'dark-plus';

/** 본문에서 실제로 쓰이는 언어만 번들한다. 그 외는 plaintext 로 떨어뜨린다. */
const SHIKI_LANGS = ['typescript', 'css', 'bash'] as const;

const FALLBACK_LANG = 'text';

let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: [SHIKI_THEME],
    langs: [...SHIKI_LANGS],
  });
  return highlighterPromise;
}

function isElement(node: RootContent | undefined, tagName: string) {
  return node?.type === 'element' && node.tagName === tagName;
}

function classList(node: Element): string[] {
  const value: unknown = node.properties?.className;
  if (Array.isArray(value)) {
    return value.map(String);
  }
  if (typeof value === 'string') {
    return value.split(/\s+/);
  }
  return [];
}

/** 코드 펜스의 meta(``` ts /path/to/file.tsx``)를 hast 까지 실어 나른다. */
function remarkForwardCodeMeta() {
  return (tree: MdastRoot) => {
    visit(tree, 'code', (node) => {
      if (!node.meta) {
        return;
      }
      node.data ??= {};
      node.data.hProperties = {
        ...node.data.hProperties,
        'data-meta': node.meta,
      };
    });
  };
}

/**
 * shiki 로 하이라이팅한 뒤 PostContent 의 스타일이 기대하는 DOM 으로 재조립한다.
 *
 * ```
 * <pre class="md-code" title={meta}>
 *   <div class="md-code-container" data-language={lang} style={shiki 배경/전경}>
 *     <div class="md-code-body"><code>…</code></div>
 *   </div>
 * </pre>
 * ```
 *
 * `title` / `data-language` 는 각각 `.md-code[title]::before` 와
 * `.md-code-container[data-language]::after` 가 읽어 코드 제목과 언어 뱃지를 그린다.
 */
function rehypeCodeBlock() {
  return async (tree: HastRoot) => {
    const highlighter = await getHighlighter();
    const targets: Array<{ pre: Element; code: Element }> = [];

    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre') {
        return;
      }
      const code = node.children.find((child) => isElement(child, 'code')) as Element | undefined;
      if (code) {
        targets.push({ pre: node, code });
      }
    });

    for (const { pre, code } of targets) {
      const languageClass = classList(code).find((name) => name.startsWith('language-'));
      const requested = languageClass?.slice('language-'.length) ?? '';
      const lang = (SHIKI_LANGS as readonly string[]).includes(requested)
        ? requested
        : FALLBACK_LANG;

      const source = toPlainText(code).replace(/\n$/, '');
      const highlighted = highlighter.codeToHast(source, {
        lang,
        theme: SHIKI_THEME,
      });
      const shikiPre = highlighted.children.find((child) => isElement(child, 'pre')) as
        | Element
        | undefined;
      const shikiCode = shikiPre?.children.find((child) => isElement(child, 'code')) as
        | Element
        | undefined;
      if (!shikiPre || !shikiCode) {
        continue;
      }

      const meta = code.properties?.['data-meta'];

      pre.properties = {
        className: [MD_CLASS.code],
        ...(typeof meta === 'string' && meta ? { title: meta } : {}),
      };
      pre.children = [
        {
          type: 'element',
          tagName: 'div',
          properties: {
            className: [MD_CLASS.codeContainer],
            'data-language': requested || FALLBACK_LANG,
            style: shikiPre.properties?.style,
          },
          children: [
            {
              type: 'element',
              tagName: 'div',
              properties: { className: [MD_CLASS.codeBody] },
              children: [shikiCode],
            },
          ],
        },
      ];
    }
  };
}

function toPlainText(node: Element): string {
  let out = '';
  visit(node, 'text', (text) => {
    out += text.value;
  });
  return out;
}

/** 마크다운의 `./images/<name>` 참조. `_posts/images/` 기준 상대 경로만 인식한다. */
const LOCAL_IMAGE_RE = /^\.\/images\/([^/]+)$/;

/**
 * 본문 이미지의 최대 표시 폭(px). `PostContent` 의 figure 가 `--page-max-width`(700) 양쪽으로
 * `--page-margin`(16) 만큼 삐져나오므로 700 + 16 × 2. 전역 CSS 값을 바꾸면 여기도 맞춘다.
 */
const FIGURE_MAX_WIDTH = 732;

/**
 * `<img srcset>` / `<link rel="preload" imagesrcset>` 에 같은 문자열을 써야 브라우저가
 * 같은 후보를 고른다. 축소본이 없으면(원본이 가장 작은 후보보다 작음) `undefined`.
 */
export function imageSrcset(asset: ImageAsset): string | undefined {
  if (asset.variants.length < 2) {
    return undefined;
  }
  return asset.variants.map((variant) => `${variant.url} ${variant.width}w`).join(', ');
}

/** 표시 폭은 `min(뷰포트, figure 최대 폭, 원본 폭)` — `max-width: 100%` 라 원본보다 커지지 않는다. */
export function imageSizes(asset: ImageAsset): string {
  const maxWidth = Math.min(FIGURE_MAX_WIDTH, asset.width);
  return `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`;
}

/**
 * `./images/<name>` 을 빌드가 변환한 webp 로 바꾸고 width/height(CLS 방지)와
 * `srcset`/`sizes` 를 붙인다. 매니페스트에 없는 참조는 빌드를 멈춘다 — 깨진 이미지가
 * 조용히 배포되지 않게. 참조한 자산은 `used` 에 문서 순서로 쌓인다(head preload 용).
 *
 * `loading="lazy"` 는 일부러 안 건다 — 글마다 이미지가 한두 장이라 전부 preload 하는데,
 * lazy 는 preload scanner 를 타지 않아 레이아웃 뒤에야 요청이 시작된다.
 */
function rehypeImages(images: ImageManifest, used: ImageAsset[]) {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') {
        return;
      }
      const src = node.properties?.src;
      const name = typeof src === 'string' ? LOCAL_IMAGE_RE.exec(src)?.[1] : '';
      if (!name) {
        return;
      }

      const asset = images[name];
      if (!asset) {
        throw new Error(`이미지 매니페스트에 없음: ${src}`);
      }
      if (!used.includes(asset)) {
        used.push(asset);
      }
      const srcset = imageSrcset(asset);
      node.properties = {
        ...node.properties,
        src: asset.url,
        srcSet: srcset,
        sizes: srcset ? imageSizes(asset) : undefined,
        width: asset.width,
        height: asset.height,
        decoding: 'async',
      };
    });
  };
}

/** 이미지를 `<span class="md-figure">` 로 감싼다(이전 PostContent 의 img 렌더러와 동일). */
function rehypeWrapImages() {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'img' || !parent || index === undefined) {
        return;
      }
      if (isElement(parent as RootContent, 'span')) {
        return;
      }
      parent.children[index] = {
        type: 'element',
        tagName: 'span',
        properties: { className: [MD_CLASS.figure] },
        children: [node],
      };
    });
  };
}

/**
 * 텍스트가 "github" 인 github.com 링크를 아이콘 링크로 바꾼다
 * (이전 PostContent 의 a 렌더러와 동일한 규칙).
 */
function rehypeGithubIconLink() {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') {
        return;
      }
      const href = node.properties?.href;
      if (typeof href !== 'string' || !/^https:\/\/github\.com\//.test(href)) {
        return;
      }
      if (toPlainText(node).trim().toLowerCase() !== 'github') {
        return;
      }

      node.properties = {
        ...node.properties,
        className: [...classList(node), MD_CLASS.iconLink],
        'aria-label': 'GitHub repository',
      };
      node.children = [
        {
          type: 'element',
          tagName: 'svg',
          properties: {
            className: [MD_CLASS.icon],
            viewBox: GITHUB_ICON_VIEWBOX,
            'aria-label': 'github',
          },
          children: [
            {
              type: 'element',
              tagName: 'path',
              properties: {
                d: GITHUB_ICON_PATH,
                fill: 'currentColor',
                fillRule: 'nonzero',
              },
              children: [],
            },
          ],
        },
      ];
    });
  };
}

export type RenderedPost = {
  html: string;
  /** 본문이 참조한 글 이미지(문서 순서). `Document` 가 head 에서 preload 한다 */
  images: ImageAsset[];
};

/**
 * 글 본문 마크다운을 HTML 로 변환한다. 하이라이팅이 빌드타임에 끝나므로
 * 클라이언트로 나가는 하이라이터 코드가 없다.
 *
 * raw HTML 은 의도적으로 처리하지 않는다 — 이전 react-markdown 구성도
 * rehype-raw 없이 동작했고, `_posts` / `_content` 에 본문 레벨 raw HTML 이 없다.
 */
export async function renderPostHtml(
  markdown: string,
  { images }: { images: ImageManifest },
): Promise<RenderedPost> {
  const usedImages: ImageAsset[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkForwardCodeMeta)
    .use(remarkRehype)
    .use(rehypeCodeBlock)
    .use(rehypeImages, images, usedImages)
    .use(rehypeWrapImages)
    .use(rehypeGithubIconLink)
    .use(rehypeStringify)
    .process(markdown);

  return { html: String(file), images: usedImages };
}
