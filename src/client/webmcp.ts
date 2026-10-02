import { THEME_CYCLE, type Theme } from '@/lib/theme';

/*
 * WebMCP — 브라우저 안의 AI 에이전트가 호출할 수 있는 도구를 페이지가 직접 등록한다.
 * https://webmachinelearning.github.io/webmcp/ (W3C Web Machine Learning CG 초안)
 *
 * 초안은 `document.modelContext` 로 옮겨 갔지만, 먼저 구현한 브라우저는
 * `navigator.modelContext` 로 노출한다. 둘 다 없으면 아무것도 하지 않는다.
 *
 * hx-boost 는 문서를 갈아 끼우지 않고 body 만 바꾸므로 도구는 처음 한 번만 등록하면
 * 이동 뒤에도 그대로 남는다. 그래서 페이지별 도구가 아니라 사이트 전역 도구만 둔다.
 * 데이터는 빌드가 만든 정적 파일(피드, `<page>.md`)을 그대로 읽는다.
 */

type ToolAnnotations = { readOnlyHint?: boolean };

type ModelContextTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: object;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
  annotations?: ToolAnnotations;
};

type ModelContext = {
  registerTool: (tool: ModelContextTool) => Promise<void> | undefined;
};

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
  interface Navigator {
    modelContext?: ModelContext;
  }
}

const SLUG_PATTERN = /^[a-z0-9-]+$/;

async function fetchText(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`${path} 응답 ${response.status}`);
  }
  return response.text();
}

async function listPosts() {
  const xml = new DOMParser().parseFromString(
    await fetchText('/posts/feed.xml'),
    'application/xml',
  );
  return Array.from(xml.querySelectorAll('item'), (item) => {
    const url = item.querySelector('link')?.textContent ?? '';
    const slug = new URL(url).pathname.split('/').pop() ?? '';
    return {
      slug,
      title: item.querySelector('title')?.textContent ?? '',
      date: new Date(item.querySelector('pubDate')?.textContent ?? '').toISOString().slice(0, 10),
      summary: item.querySelector('description')?.textContent ?? '',
      url,
    };
  });
}

function sitePath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    throw new Error('path 는 "/" 로 시작하는 사이트 내부 경로여야 합니다');
  }
  return value;
}

function createTools(setTheme: (theme: Theme) => void): ModelContextTool[] {
  return [
    {
      name: 'list_posts',
      title: '글 목록',
      description:
        'minjun.kim 블로그의 글 목록을 최신순으로 돌려준다. 각 항목은 slug, 제목, 작성일, 요약, URL 을 담는다.',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => ({ posts: await listPosts() }),
    },
    {
      name: 'get_post',
      title: '글 읽기',
      description:
        'slug 로 블로그 글 하나의 전문을 Markdown 으로 돌려준다. slug 는 list_posts 결과에서 얻는다.',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: '글 slug (예: next-js-wp-graphql-static-blog)' },
        },
        required: ['slug'],
      },
      annotations: { readOnlyHint: true },
      execute: async ({ slug }) => {
        if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) {
          throw new Error('slug 는 영소문자, 숫자, - 로만 이뤄져야 합니다');
        }
        return { slug, markdown: await fetchText(`/posts/${slug}.md`) };
      },
    },
    {
      name: 'get_resume',
      title: '이력서 읽기',
      description:
        '사이트 주인 김민준(프론트엔드 엔지니어)의 이력서를 Markdown 으로 돌려준다. 경력, 사이드 프로젝트, 스킬, 연락처를 담는다.',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => ({ markdown: await fetchText('/resume.md') }),
    },
    {
      name: 'open_page',
      title: '페이지 열기',
      description:
        '이 사이트의 다른 페이지로 이동한다. 예: "/", "/posts", "/resume", "/posts/<slug>".',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: '"/" 로 시작하는 사이트 내부 경로' },
        },
        required: ['path'],
      },
      execute: async ({ path }) => {
        const target = sitePath(path);
        window.location.assign(target);
        return { navigatedTo: target };
      },
    },
    {
      name: 'set_theme',
      title: '테마 바꾸기',
      description: '사이트 색 테마를 바꾼다. system 은 OS 설정을 따른다.',
      inputSchema: {
        type: 'object',
        properties: {
          theme: { type: 'string', enum: [...THEME_CYCLE] },
        },
        required: ['theme'],
      },
      execute: async ({ theme }) => {
        if (!THEME_CYCLE.includes(theme as Theme)) {
          throw new Error(`theme 는 ${THEME_CYCLE.join(', ')} 중 하나여야 합니다`);
        }
        setTheme(theme as Theme);
        return { theme };
      },
    },
  ];
}

export function initWebMcp(setTheme: (theme: Theme) => void) {
  const modelContext = document.modelContext ?? navigator.modelContext;
  if (!modelContext) {
    return;
  }
  for (const tool of createTools(setTheme)) {
    try {
      // 초안은 Promise 를 돌려주지만 초기 구현은 동기로 던진다 — 둘 다 받는다.
      Promise.resolve(modelContext.registerTool(tool)).catch((error) => {
        console.warn(`WebMCP 도구 등록 실패: ${tool.name}`, error);
      });
    } catch (error) {
      console.warn(`WebMCP 도구 등록 실패: ${tool.name}`, error);
    }
  }
}
