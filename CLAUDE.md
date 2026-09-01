# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`minjun.kim` is a personal blog/portfolio site (Korean, `ko_KR`). Content is authored as Markdown and
rendered to static HTML at build time by a Hono app; htmx handles client-side navigation. There is no
runtime server — the site deploys to Cloudflare Workers as static assets only.

## Commands

The package manager is **pnpm**; Node version is pinned in `.nvmrc` (24).

- `pnpm build` — 정적 사이트 생성 (SSR 번들 → 클라이언트 번들 → `dist/`)
- `pnpm preview` — `wrangler dev` 로 `dist/` 서빙
- `pnpm dev` — `build` + `preview`
- `pnpm check` — Biome lint + format 검사 (커밋 전 실행)
- `pnpm check:fix` — 자동 수정
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm deploy` — `wrangler deploy`

Linting/formatting is **Biome** (`biome.json`), not ESLint/Prettier. There is no test runner; the
regression safety net is comparing build output against a known-good build.

## Build pipeline

`pnpm build` runs three steps, in order:

1. `vite build` — SSR 번들. 엔트리는 `src/app.tsx`(Hono 앱)와 `src/build/og.ts`(OG 이미지 생성).
   CSS Modules 가 여기서 해석되어 `dist-ssr/assets/*.css` 한 벌로 방출된다.
2. `vite build -c vite.client.config.ts` — 브라우저로 나가는 유일한 자체 번들
   (`src/client/main.ts`: 테마 토글, htmx 훅, PostHog/Sentry).
3. `node scripts/ssg.mjs` — SSR 번들을 불러 Hono `toSSG` 로 정적 HTML 생성, 자산 복사,
   OG 이미지 생성. 결과가 `dist/`.

**`@hono/vite-ssg` 는 쓰지 않는다.** 해당 플러그인의 SSR 모듈 평가 경로가 `vite:css` 와 충돌해
CSS Modules 를 임포트하면 빌드가 깨진다(Vite 7/8 공통). 그래서 SSR 빌드와 `toSSG` 실행을
분리했다.

## Architecture

**Content as files.** 모든 콘텐츠는 YAML frontmatter 가 붙은 Markdown 이고 `gray-matter` 로 읽는다:
- 글: `_posts/*.md` → `/posts/[slug]`
- 이력서: `_content/resume.md` → `/resume`

데이터 접근은 `src/lib/blog/api.ts`(`fast-glob`)와 `src/lib/resume/api.ts` 에 모여 있다. 빌드타임에만
실행되므로 `node:fs` 를 그대로 쓴다 — 런타임 Worker 코드가 아니다.

**라우팅**은 `src/app.tsx` 의 Hono 앱 하나에 모여 있다. `/posts/:slug` 는 `ssgParams` 로 파라미터를
공급한다. 피드/사이트맵/robots 도 여기 라우트로 붙어 있고 생성 로직은 `src/lib/seo/*`.

**URL 형태**: trailing slash 를 쓰지 않는다(`/posts`, `/posts/<slug>`). `toSSG` 가 평평한 `.html`
파일을 내고, `wrangler.jsonc` 의 `html_handling: "drop-trailing-slash"` 가 이를 고정한다.
바꾸면 canonical·sitemap·기존 유입 링크가 전부 어긋난다.

**UI 구조** (path alias `@/*` → `src/*`):
- `src/components/*` — 프레젠테이션 컴포넌트. 대부분 CSS Module 을 같이 둔다
- `src/containers/*` — 페이지 단위 조합 (Header, Home, Post, Posts, Resume, NotFound)
- `src/lib/*` — 순수 헬퍼와 데이터 접근

**Markdown 파이프라인** (`src/lib/blog/markdown.ts`): unified 로
`remark-parse → remark-gfm → remark-rehype → (커스텀 rehype) → rehype-stringify`.
코드 하이라이팅은 **빌드타임 shiki**(`dark-plus`)라 클라이언트로 하이라이터가 나가지 않는다.
커스텀 rehype 변환 셋: 코드 블록 재조립(제목/언어 뱃지), 이미지 `figure` 래핑, GitHub 아이콘 링크.
raw HTML 은 의도적으로 렌더하지 않는다(이전 구성과 동일).

파이프라인이 raw HTML 을 만들기 때문에 **CSS Modules 클래스명을 밖에서 주입받는다** —
`PostContent` 가 `renderContentHtml()` 로 감싸 자기 CSS Module 클래스명을 넘긴다.

RSS 본문만은 별도로 `markdownToHtml`(remark-html, sanitize)을 계속 쓴다. 피드 출력이
바뀌면 구독자에게 영향이 가서 기존 동작을 그대로 유지했다.

**Site constants** 는 전부 `src/lib/siteConfig.ts` 에 있다. 페이지 메타는 `src/lib/meta.ts` 의
`resolveMeta()` 가 기본값을 채우고 `src/components/Document` 가 `<head>` 를 그린다.

**Theming.** `system`/`light`/`dark` 3단 순환 (`src/lib/theme.ts`). `NoFlashThemeScript` 가
pre-paint 로 `localStorage` 를 읽어 `<html data-theme>` 을 세팅하고, 토글은
`src/client/main.ts` 가 **document 이벤트 위임**으로 처리한다.

## htmx

`<body hx-boost="true" hx-ext="preload,head-support">` 로 전역 적용. htmx 본체와 확장은 CDN 이 아니라
`node_modules` 에서 `dist/vendor/` 로 복사해 서빙한다(`scripts/ssg.mjs`).

주의할 점 세 가지:

- **`hx-boost` 는 `<body>` 요소가 아니라 그 내용만 교체한다.** 그래서 body 속성은 이동 후 갱신되지
  않고, 요소에 직접 건 이벤트 리스너는 사라진다. 페이지 표식은 `<head>` 의 meta(`x-page-id`)로 넣고,
  이벤트는 `document` 위임으로 건다.
- **`head-support` 확장이 있어야** 이동 후 canonical/OG/description 이 갱신된다. 없으면 첫 페이지
  것으로 남는다.
- **htmx 는 기본적으로 non-2xx 응답을 스왑하지 않는다.** 깨진 내부 링크가 무반응이 되는 걸 막으려고
  `src/client/main.ts` 에서 `htmx:beforeSwap` 으로 404 스왑을 허용한다.

내부 링크에만 `preload="mouseover"` 를 붙인다 — `src/lib/htmx.ts` 의 `PRELOAD_ATTR` /
`isInternalHref()` 를 쓴다. 외부 도메인은 선요청해도 이득이 없다.

## Cloudflare Workers

`wrangler.jsonc` 는 **assets-only** 배포다(`main` 없음). 정적 자산 요청은 Worker 호출로 과금되지 않는다.

- `public/_headers` — **Cloudflare 기본 `Cache-Control` 은 `public, max-age=0, must-revalidate` 인데
  이러면 htmx preload 가 응답을 캐시에 남기지 못해 무력화된다.** HTML 에 짧은 `max-age` 를 주는 게
  필수다. 또한 **여러 규칙이 같은 경로에 매치되면 헤더가 덮어써지지 않고 콤마로 이어붙으므로**
  규칙끼리 경로가 겹치면 안 된다 (`/*` 캐치올 금지).
- `public/_redirects` — 옛 퍼머링크 301. Cloudflare 는 정규식 제약(`:id(40|706)`)과 선택적
  세그먼트(`:prefix(wp|blog)?`)를 지원하지 않아 경로를 명시적으로 펼쳐 두었다.
- `compatibility_date` 는 설치된 `workerd` 버전보다 미래일 수 없다. 미래 날짜면 `wrangler dev` 가
  뜨지 않는다.

## OG 이미지

`src/build/og.ts` 가 `satori` + `@resvg/resvg-js` 로 글마다 `dist/og/<slug>.png` 를 만든다.
빌드타임 전용이라 네이티브 바이너리를 써도 된다.

**satori 는 폰트 버퍼를 명시적으로 요구하고 woff2 를 읽지 못한다.** 글 제목이 한글인데 Nunito 에는
한글 글리프가 없어서, OTF 인 Pretendard 를 빌드 의존성으로 두고 넘긴다. 브라우저로는 나가지 않는다.

## Conventions

- 코드 리뷰는 **한국어**로.
- 가독성 우선, 중첩 삼항 연산자 지양.
