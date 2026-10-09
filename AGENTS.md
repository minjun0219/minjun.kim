# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, GitHub Copilot, etc.) when working
with code in this repository.

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

`deploy`/`preview` 는 빌드를 하지 않는다 — `dist/` 에 있는 것을 그대로 올리고 서빙한다.

Linting/formatting is **Biome** (`biome.json`), not ESLint/Prettier. There is no test runner; the
regression safety net is comparing build output against a known-good build (and the post-build
assertions in `scripts/ssg.mjs`).
Biome 는 마크다운을 아예 무시하므로(`!**/*.md`) `_posts`·`_content` 편집은 `pnpm check` 에 걸리지
않는다 — 콘텐츠 변경의 게이트는 `pnpm build` 뿐이다.

**환경변수는 `.env.local`**(gitignore, 예시는 `.env.local.example`). 두 채널로 갈린다:
`HOMEPAGE`·`NAVER_SITE_VERIFICATION`·`GA_MEASUREMENT_ID` 는 `scripts/ssg.mjs` 가
`process.loadEnvFile()` 로 올려
**렌더 프로세스의 `process.env`** 로 읽고(이미 있는 CI 값은 덮어쓰지 않는다), `VITE_POSTHOG_KEY`·
`VITE_POSTHOG_HOST` 는 **Vite 가 `import.meta.env`** 로 클라이언트 번들에 박는다. `VITE_` 접두사가
없으면 브라우저로 나가지 않는다. `HOMEPAGE` 가 비면 에러 없이 기본값으로 떨어져
sitemap·canonical·RSS·OG 의 절대 URL 이 통째로 어긋난다.

## Build pipeline

`pnpm build` runs three steps, in order:

1. `vite build` — SSR 번들. 엔트리는 `src/app.tsx`(Hono 앱 팩토리), `src/build/og.ts`(OG 이미지),
   `src/build/images.ts`(글 이미지 변환). `dist-ssr/` 로 나간다.
2. `vite build -c vite.client.config.ts` — 브라우저로 나가는 유일한 자체 번들
   (`src/client/main.ts`: 테마 토글, htmx 훅, PostHog). `dist-client/` 로 나간다.
3. `node scripts/ssg.mjs` — `dist/` 를 비우고 `public/` 복사 → 글 이미지 webp 변환 → 클라이언트
   자산·htmx vendor·폰트(Nunito·Pretendard·로고 한글 서브셋) 복사 → **`createApp(build)`** → Hono `toSSG` →
   인라인 스타일 단언 → OG 이미지.

**앱은 팩토리다.** `src/app.tsx` 의 `createApp(build: BuildAssets)` 가 빌드 산출물 경로(클라이언트
스크립트, vendor 스크립트, 폰트, 이미지 매니페스트)를 인자로 받는다(`src/lib/build.ts`). 전역 가변 상태로
자산 경로를 주입하지 않는다 — 렌더에 필요한 빌드 정보는 전부 `BuildAssets` 를 통해 흐른다.

**`@hono/vite-ssg` 는 쓰지 않는다.** 클라이언트 번들·vendor 복사·이미지·OG 는 어차피 직접 해야
해서 플러그인을 넣어도 접착제가 줄지 않는다. `toSSG` 를 `scripts/ssg.mjs` 에서 직접 호출한다.

**PostHog 호스트에는 폴백이 없다.** `VITE_POSTHOG_HOST` 는 PostHog **조직 공용** managed reverse proxy
`https://z.minjun.kim` 이고 개인 프로젝트는 전부 이걸 쓴다 — managed proxy 는 프로젝트가 아니라 조직
단위 설정이라 **어느 프로젝트로 적재될지는 호스트가 아니라 `VITE_POSTHOG_KEY` 가 정한다**.
키는 있는데 호스트가 비면 `vite.client.config.ts` 가 빌드를 죽인다 — posthog-js 자체 기본값
`us.i.posthog.com` 으로 조용히 프록시를 우회하는 걸 막는 가드다(코드에 폴백을 두지 않는 이유).
키가 아예 없으면 관측 도구만 꺼진 채 빌드된다.

**PostHog 는 slim 번들이라 코어만 있다.** 수집하는 건 `$pageview`(hx-boost 이동마다 직접)·`$pageleave`·
`not_found`(404 페이지) 셋뿐이다. 예외·Web Vitals·자동 수집·녹화 같은 확장은 번들에 없으므로 init 옵션이나
PostHog 프로젝트 설정으로 켜도 **에러 없이 아무것도 수집되지 않는다**. 넣으려면 `__extensionClasses` 로
넘겨야 하는데, `posthog-js/dist/extension-bundles` 는 트리 셰이킹이 안 돼 확장 하나만 가져와도 클라이언트
번들이 gzip 37KB 에서 70KB 로 거의 두 배가 된다. 크롤러는 코드에서 거르지 않고 PostHog 프로젝트의
"내부·테스트 사용자 제외" 필터(UA 봇, 상하이 시간대에 중국 밖 IP, 800×600 헤드리스 화면 등)로 뺀다.

**GA4 는 클라이언트 번들이 아니라 `<head>` 의 gtag.js 다.** `GA_MEASUREMENT_ID`(렌더 채널)가 있으면
`components/GoogleAnalytics` 가 Google 설치 코드를 그대로 낸다 — 없으면 꺼지고, `G-…` 형식이 아니면
빌드가 죽는다. hx-boost 이동의 page_view 는 코드에서 쏘지 않고 GA4 향상된 측정의 "브라우저 기록 이벤트
기반 페이지 변경"(기본 켜짐)에 맡긴다. hx-head 가 응답 head 를 `pushState` **전에** 머지하므로 그
시점의 `document.title` 은 이미 새 페이지 것이다. 이 경로는 `send_page_view: false` 로 꺼지지 않아
수동 page_view 를 더하면 두 번 집계된다 — 직접 쏘려면 GA 관리 화면에서 그 옵션부터 끈다. 뒤로/앞으로
가기는 htmx 가 URL 을 먼저 바꾸고 본문을 다시 받으므로 `popstate` 시점의 제목은 아직 이전 페이지 것이다.

## Architecture

**Content as files.** 본문이 있는 콘텐츠는 YAML frontmatter 가 붙은 Markdown 이고 `gray-matter` 로 읽는다:
- 글: `_posts/*.md` → `/posts/[slug]` (파일명이 slug)
- 단일 문서: `_content/<name>.md` → `/<name>` (`about`, `projects`, `resume`). `getDoc(name)` 이 읽고
  `containers/MarkdownPage` 가 렌더한다 — 둘의 차이는 마크다운 본문뿐이다.
- 노트: `_content/notes/<topic>/<slug>.md` → `/notes/<topic>/<slug>`, 목록은 `/notes`(주제별 묶음).
  공개 학습 노트(Rust·Go·TS·Node 등)이고 **사람이 골라 넣는다** — 다른 곳에서 자동으로 복사해 오는 경로는
  두지 않는다. 사이트 안에서 링크하지 않지만 sitemap 에는 들어간다(노트가 0개면 `/notes` 는 noindex).
  frontmatter 는 `title`·`updatedAt`(`YYYY-MM-DD`) 필수이고 `src/lib/notes/api.ts` 가 검증한다 — 글과 달리
  빠지면 빌드가 실패한다. `topic`·`slug` 는 URL 이 되므로 소문자·숫자·하이픈만. 이미지는 글과 같은
  `_posts/images/` 에 두고 `./images/<name>` 으로 참조한다. 새 글을 올리기 전 개인 식별자 점검을 거친다.

글 frontmatter 는 `title`·`date`(`YYYY-MM-DD`)·`author{name,email}` 이 필수고 `mediumUrl` 이 선택이다
(`src/lib/blog/types.ts`). `getPostBySlug` 가 `as Post` 로 무검증 캐스팅하므로 **빠뜨려도 빌드는 통과하고**
`date` 가 없으면 `Invalid Date` 가 정렬·sitemap·OG 로 조용히 흘러간다.

**다른 곳에 실린 글은 파일이 아니다.** `/posts` 목록은 `src/lib/blog/externalPosts.ts` 의 하드코딩 배열
`EXTERNAL_POSTS`(제목·날짜·URL·출처)를 내부 글과 날짜 내림차순으로 합친다(`getPostListing`). 외부 글
추가는 `_posts` 에 파일을 만드는 게 아니라 이 배열을 고치는 일이다.

데이터 접근은 `src/lib/blog/api.ts`(`fast-glob`), `src/lib/content/api.ts`, `src/lib/notes/api.ts` 에 모여 있다. 빌드타임에만
실행되므로 `node:fs` 를 그대로 쓴다 — 런타임 Worker 코드가 아니다.

**라우팅**은 `src/app.tsx` 의 Hono 앱 하나에 모여 있다. `/posts/:slug` 는 `ssgParams` 로 파라미터를
공급한다. 피드/사이트맵/robots 도 여기 라우트로 붙어 있고 생성 로직은 `src/lib/seo/*`.

**`/resume` 는 사이트 안에서 링크하지 않는다.** 취업 지원 시 URL 을 직접 건네는 용도라
네비게이션(`SocialLink`)에는 `/about` 만 둔다. 다만 sitemap 에는 남겨 색인은 유지한다 — 진입점을
없앤 것이지 숨긴 게 아니다. `/projects` 도 지금은 같은 취급이다(링크 없음, sitemap 에는 포함).

**`/mdwire`·`/ogpeek` 은 이 사이트 페이지가 아니다** — 다른 Worker 가 서빙하는 프로젝트 사이트다. 규칙은
아래 「프로젝트 사이트」 절.

**SEO·LLM 사본** (`src/lib/seo/*`):
- `structuredData.ts` — 페이지마다 `WebSite`+`Person` 노드에 페이지 노드(`BlogPosting`/`Blog`/
  `ProfilePage`/`BreadcrumbList`)를 `@id` 로 엮은 JSON-LD `@graph` 하나. `PageMeta.jsonLd` 로 넘기면
  `Document` 가 `<script type="application/ld+json">` 로 낸다(noindex 페이지는 생략).
- `llms.ts` — https://llmstxt.org 규약의 `/llms.txt`, `/llms-full.txt`, 그리고 페이지 URL 에 `.md` 를
  붙인 Markdown 사본(`/posts/<slug>.md`, `/resume.md`). HTML 은 `<link rel="alternate"
  type="text/markdown">` 로 사본을 가리키고, 사본은 `_headers` 에서 `X-Robots-Tag: noindex` 다.
  글 사본은 `/posts/:slug` 라우트가 `.md` 로 끝나는 파라미터를 분기해 낸다 — `/posts/:file{.+\.md}`
  같은 정규식 라우트는 `toSSG` 가 파라미터 수집 요청을 다른 라우트로 흘려 **에러 없이 아무 파일도
  만들지 않는다.**
- `sitemap.ts` 의 `lastmod` 는 빌드 시각이 아니라 글 날짜·단일 문서(`about`·`resume`) `updatedAt` 이다.

**WebMCP** (`src/client/webmcp.ts`): 브라우저 에이전트용 도구(`list_posts`, `get_post`, `get_resume`,
`open_page`, `set_theme`)를 `document.modelContext`(초안) 또는 `navigator.modelContext`(초기 구현)에
등록한다. hx-boost 는 문서를 바꾸지 않으므로 한 번만 등록하고, 데이터는 피드와 `.md` 사본을 읽는다.

**URL 형태**: trailing slash 를 쓰지 않는다(`/posts`, `/posts/<slug>`). `toSSG` 가 평평한 `.html`
파일을 내고, `wrangler.jsonc` 의 `html_handling: "drop-trailing-slash"` 가 이를 고정한다.
바꾸면 canonical·sitemap·기존 유입 링크가 전부 어긋난다.

**UI 구조** (path alias `@/*` → `src/*`):
- `src/components/*` — 프레젠테이션 컴포넌트. 스타일은 같은 파일 안의 `hono/css` 블록
- `src/containers/*` — 페이지 단위 조합 (Header, Home, Post, Posts, MarkdownPage, NotFound)
- `src/lib/*` — 순수 헬퍼와 데이터 접근

**Site constants** 는 전부 `src/lib/siteConfig.ts` 에 있다. 페이지 메타는 `src/lib/meta.ts` 의
`resolveMeta()` 가 기본값을 채우고 `src/components/Document` 가 `<head>` 를 그린다.

**Theming.** `system`/`light`/`dark` 3단 순환 (`src/lib/theme.ts`). `NoFlashThemeScript` 가
pre-paint 로 `localStorage` 를 읽어 `<html data-theme>` 을 세팅하고, 토글은
`src/client/main.ts` 가 **document 이벤트 위임**으로 처리한다.

## 스타일 — hono/css

CSS 파일이 없다(예외는 본문 폰트 Pretendard 의 @font-face 스타일시트 하나 — 아래 「폰트」). 모든 스타일은
`hono/css`(`src/lib/css.ts` 로 재수출) 로 TSX 안에 두고, 렌더 시
`<head>` 의 `<style id="hono-css">` 한 개에 인라인된다. 전역 규칙은 `src/styles/global.ts` 의
`:-hono-global { … }` 블록이고 `Document` 가 `<Style>{globalCss}</Style>` 로 싣는다.

컴포넌트 패턴:

```tsx
import { type ClassName, css, cx } from "@/lib/css";
const styles = { root: css`…`, title: css`…` };
const Wrapper = ({ children, className }: { children: Child; className?: ClassName }) => (
  <div className={cx(styles.root, className)}>{children}</div>
);
```

한 파일의 스타일은 `styles` 객체 하나에 모은다. 다른 항목이 `cx` 로 참조하는 기반 스타일만
객체 밖 별도 `const` 로 둔다(`Header` 의 `interactive`).

hono 4.13 소스·실행으로 확인한 규칙 — 어기면 대부분 **에러 없이 조용히** 깨진다:

- `css\`…\`` 는 `Promise<string>`. 클래스명은 minify 된 텍스트의 결정적 해시 `css-<u32>`.
  `className?:` prop 타입은 항상 `ClassName`(`string | Promise<string>`).
- **CSS 파서가 없다.** `&` 중첩은 그대로 방출되어 **브라우저 네이티브 CSS Nesting** 에 의존한다
  (Chrome 120+/Safari 17.2+/Firefox 117+). 중첩 셀렉터는 식별자로 시작하면 안 된다 —
  `html[data-theme="light"] &` 대신 **`:root[data-theme="light"] &`** 를 쓴다.
- **`:-hono-global` 블록 안에 개행이 하나라도 남으면 전역 규칙이 통째로 죽고 컴포넌트 규칙이
  `<script>` 폴백으로 떨어진다.** minify 는 `{ } ; : ,` 주변 공백만 지우므로: 여러 줄 `/* */`
  주석 금지(설명은 TS 주석으로 밖에), 공백 구분 다중 토큰 값·결합자·`@media … and` 를 줄바꿈하지
  않기, `url("…")` 은 항상 따옴표, `\` 금지, `${` 는 평문 문자열(폰트 URL)만. 콤마·콜론 뒤 줄바꿈은 안전.
- **`<Style>` 의 child 는 정확히 하나.** 둘이면 `<style>undefined</style>` 가 나온다.
- `cx(a, b)` 는 css 값들의 **선언을 병합한 새 해시 클래스 하나**를 만든다(뒤가 이김). 그래서
  부모→자식 `class` 전달에 `!important` 가 필요 없지만, **부모가 `${childRoot} …` 로 자식 루트를
  겨냥할 수는 없다**(자식이 `cx` 하면 그 클래스는 존재하지 않는다). 평문 문자열은 외부 클래스로
  뒤에 붙고 falsy 는 버려진다 — `cx(title, compact && titleCompact)` 패턴.
- 스타일 등록은 hono/jsx 가 그 값을 렌더할 때만 일어난다. **마크다운 raw HTML 에 해시 클래스명을
  복사해도 등록되지 않는다** — 아래 `MD_CLASS` 방식으로 푼다.
- 이 규칙들은 `scripts/ssg.mjs` 의 `assertInlineStyles()` 가 빌드에서 단언한다(HTML 마다 `<style
  id="hono-css">` 정확히 1개, 개행 없음, `:-hono-global`/`#hono-css')`/`undefined</style>` 0건,
  `<link rel="stylesheet">` 는 Pretendard 스타일시트만). 실패하면 빌드가 죽는다 — 우회하지 말고
  원인을 고친다.

트레이드오프로 CSS 도구체인이 없다: Biome 는 템플릿 문자열 안의 CSS 를 보지 않고, `@media` 안의
`var()` 같은 무효 CSS 도 빌드가 잡지 못한다. 브라우저에서 확인해야 한다.

## Markdown 파이프라인

`src/lib/blog/markdown.ts`: unified 로
`remark-parse → remark-gfm → remark-rehype → (커스텀 rehype) → rehype-stringify`.
코드 하이라이팅은 **빌드타임 shiki**(`dark-plus`)라 클라이언트로 하이라이터가 나가지 않는다.
커스텀 rehype 변환: 코드 블록 재조립(제목/언어 뱃지), 이미지 해석(`rehypeImages`), 이미지 `figure`
래핑, GitHub 아이콘 링크. raw HTML 은 의도적으로 렌더하지 않는다.

파이프라인이 raw HTML 을 만들기 때문에 hono/css 해시 클래스를 쓸 수 없다. 대신
`src/lib/blog/markdownClassNames.ts` 의 **고정 클래스 상수 `MD_CLASS`** 를 rehype 가 박고,
`PostContent` 의 루트 `css` 블록이 `& .${MD_CLASS.code}[title]::before { … }` 식 **중첩 자손 규칙**으로
겨냥한다. rehype 와 스타일이 같은 상수를 쓰므로 이름이 어긋나지 않는다.

**포스트 이미지는 `_posts/images/` 에 두고 마크다운에서 `./images/<name>` 로 참조한다.**
`src/build/images.ts` 가 빌드 사전 패스로 sharp 로 webp 변환해 `dist/images/<name>-<hash8>.webp`(원본
크기)와 `<name>-<hash8>-w<width>.webp`(원본보다 작은 사다리 너비만, 업스케일 없음)로 쓰고
매니페스트(`src/lib/images.ts` 의 `ImageManifest`)를 돌려준다. `rehypeImages` 가 이를 `src`/`srcset`/
`sizes`/`width`/`height`(CLS 방지)로 바꾸며, 매니페스트에 없는 참조는 빌드 실패다. `sizes` 의 기준 폭
`FIGURE_MAX_WIDTH`(732 = `--page-max-width` + `--page-margin`×2)는 전역 CSS 와 손으로 맞춘다.
옛 절대 경로(`/images/posts/…`)는 의도적으로 살리지 않았다(404).

**글 이미지는 lazy 가 아니라 preload 다.** `renderPostHtml` 이 본문이 참조한 자산을 돌려주고
`Document` 가 `<link rel="preload" as="image" imagesrcset imagesizes>` 로 head 에 낸다(이전 Next.js
사이트와 같은 동작). 클라이언트 선요청(`src/client/main.ts` `prefetchImages`)이 받아 둔 HTML 의 이
링크를 읽어 off-DOM `<img>` 로 이미지까지 미리 받아 두므로, 클릭 시점엔 이미지가 이미 캐시에 있다.
`<img>` 와 preload 의 `srcset`/`sizes` 문자열은 같아야 브라우저가 같은 후보를 고른다.

RSS 본문만은 별도로 `markdownToHtml`(remark-rehype + rehype-sanitize)을 쓴다. 피드 출력이 바뀌면 구독자에게
영향이 가서 이전 사이트와 같게 유지한다 — 이미지만 `resolveImagePaths()` 가 페이지와 같은 webp 의
절대 URL 로 바꿔 내보낸다(리더는 상대 경로를 잘못 해석한다).

## htmx

htmx **4**. `<body hx-boost:inherited="true">` 로 전역 적용하고, 본체와 확장은 CDN 이 아니라
`node_modules` 에서 `dist/vendor/` 로 복사해 서빙한다(`scripts/ssg.mjs`, 파일명에 버전 스탬프).
확장은 htmx 4 부터 본체 패키지(`htmx.org/dist/ext/`)에 동봉돼 별도 npm 패키지가 없다.

htmx 4 에서 특히 주의할 점:

- **속성 상속이 암시적이지 않다.** `hx-boost` 를 자손 링크에 물리려면 `:inherited` 가 필요하다.
  빠뜨리면 **에러 없이 조용히 전체 새로고침으로 떨어진다** — 공식 upgrade-check 도 잡아주지
  않으니 직접 확인해야 한다.
- **`hx-ext` 는 없어졌다.** 확장 스크립트를 로드하는 것만으로 붙는다.
- **boost 된 앵커는 자동으로 선요청된다.** 링크마다 preload 속성을 붙이지 않는다. 기본 트리거가
  `mousedown`+`touchstart` 인데, 이 사이트는 Next.js `<Link>` 의 hover prefetch 를 대체하는 게
  목적이라 `<meta name="htmx-config">` 로 `preload.boostEvent` 를 `mouseover` 로 되돌렸다.
  외부 도메인 링크는 boost 대상이 아니라 자동으로 선요청에서 빠진다. 선요청 재사용 기한
  `preload.boostTimeout` 은 HTML `Cache-Control: max-age=60` 과 맞춰 `60s` 다.
- **뷰포트 선요청은 hx-preload 에 없다.** Next.js `<Link>` 의 뷰포트 prefetch 는 `src/client/main.ts`
  의 `initViewportPrefetch()` 가 IntersectionObserver + `fetch(…, { priority: "low" })` 로 HTTP 캐시를
  데워 대신한다(200ms 체류해야 요청, URL 당 1회, `saveData`/2g 면 끔, `htmx:after:swap` 마다 재관찰).
  받아 둔 HTML 의 이미지 preload 링크도 따라 받는다. htmx 의 실제 요청이 같은 캐시를 타므로 응답에
  `Vary` 가 없어야 한다.
- **non-2xx 도 기본 스왑된다**(`noSwap: [204, 304]`). htmx 2 에서 필요했던 404 스왑 우회 코드가
  htmx 4 에는 필요 없다.

`hx-boost` 는 `<body>` 요소가 아니라 그 **내용만** 교체한다. 그래서 body 속성은 이동 후 갱신되지
않고, 요소에 직접 건 이벤트 리스너는 사라진다. 페이지 표식은 `<head>` 의 meta(`x-page-id`)로 넣고,
이벤트는 `document` 위임으로 건다.

**`hx-head` 확장이 있어야** 이동 후 canonical/OG/description 이 갱신된다. hx-head 는 head 자식을
`outerHTML` 로 대조해 새것 추가 → 옛것 제거 순으로 머지하므로 페이지마다 다른
`<style id="hono-css">` 도 FOUC 없이 교체된다. 반대로 **같은 내용의 `<script>` 가 다시 추가되면
재실행되므로** `NoFlashThemeScript` 는 `hx-preserve="true"` 로 보존하고, `src/client/main.ts` 는
`window.__siteClientInit` 가드로 멱등하게 둔다(배포 사이 해시가 바뀌면 재실행된다).

htmx 4 는 공식 업그레이드 가이드와 체커를 패키지에 동봉한다:
`node_modules/htmx.org/dist/skills/htmx-upgrade-from-htmx2.md`,
`npx htmx.org@4 upgrade-check <경로> --ext=.tsx`.

## Cloudflare Workers

`wrangler.jsonc` 는 **assets-only** 배포다(`main` 없음). 정적 자산 요청은 Worker 호출로 과금되지 않는다.
`minjun.kim` 은 `routes` 의 **custom domain** 으로 Worker 에 붙어 있다(DNS·인증서는 Cloudflare 가 관리).
`www` 는 originless A 레코드(`192.0.2.0`, proxied) + Redirect Rule 로 apex 에 301 — 커스텀 도메인은
호스트가 정확히 일치해야 해서 `www` 를 Worker 가 직접 받지 않는다.

- `public/_headers` — **Cloudflare 기본 `Cache-Control` 은 `public, max-age=0, must-revalidate` 인데
  이러면 htmx preload 가 응답을 캐시에 남기지 못해 무력화된다.** HTML 에 짧은 `max-age` 를 주는 게
  필수다. 또한 **여러 규칙이 같은 경로에 매치되면 헤더가 덮어써지지 않고 콤마로 이어붙으므로**
  규칙끼리 경로가 겹치면 안 된다 (`/*` 캐치올 금지).
- **`/assets/*`, `/vendor/*`, `/fonts/*`, `/images/*` 는 `immutable` 캐시다.** immutable 은 URL 이 내용에
  고정될 때만 안전하다 — 클라이언트 번들은 Vite 해시, vendor 와 폰트는 패키지 버전 스탬프, 이미지는
  내용 해시가 그걸 보장한다. 해시 없는 경로를 immutable 로 걸면 브라우저가 옛 파일을 1년간 붙든다(htmx 코어에서
  실제로 겪은 사고).
- `public/_redirects` — 옛 퍼머링크 301. Cloudflare 는 정규식 제약(`:id(40|706)`)과 선택적
  세그먼트(`:prefix(wp|blog)?`)를 지원하지 않아 경로를 명시적으로 펼쳐 두었다.
  **도메인 레벨 리다이렉트는 지원하지 않는다** — `www → apex` 는 Cloudflare Redirect Rule 이 필요하다.
- `compatibility_date` 는 설치된 `workerd` 버전보다 미래일 수 없다. 미래 날짜면 `wrangler dev` 가
  뜨지 않는다.

## 프로젝트 사이트 (`minjun.kim/<이름>/`)

직접 만든 앱(mdwire, ogpeek, …)은 이 도메인 아래 `/<이름>/` 에 산다. **세부 규칙의 정본은 이 절이다** — 앱
repo 는 경로·라우팅·같은 origin 에 관한 판단을 이 repo 에 묻는다.

**자리와 주소**
- 앱 자리는 최상위 `/<이름>/`. 지금 예약된 이름은 `mdwire`·`ogpeek`(`siteConfig.ts` 의 `APP_PATHS`) — 이 사이트에
  같은 이름으로 페이지를 만들지 않는다(배포돼도 보이지 않는다). 앱이 늘면 `APP_PATHS` 에 먼저 추가한다.
- 앱 루트의 정식 주소는 **끝 슬래시**(`/mdwire/`, `/ogpeek/`). 그 아래 경로는 앱 프레임워크의 기본 형태를 따른다
  — 이 사이트의 "trailing slash 없음" 규칙은 이 사이트 페이지에만 적용된다.
- 슬래시 없는 앱 루트(`/<이름>`)는 정식 주소로 영구 이동이 원칙이다. 플랫폼 기본 동작이 307 이면(Workers
  assets 의 auto-trailing-slash 등) 그대로 받아들인다.

**라우팅**
- 앱은 자기 Worker 로 서빙하고 `minjun.kim` 존에 route 를 **둘** 건다: `minjun.kim/<이름>` 과
  `minjun.kim/<이름>/*`. `minjun.kim/<이름>*` 하나로 걸면 `/<이름>-x` 같은 남의 경로까지 잡는다.
- 이 사이트는 Custom Domain(= origin)이라 같은 호스트의 route 가 항상 먼저 실행된다
  ([문서](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/#interaction-with-routes)).
  앱을 붙이거나 뗄 때 이 사이트의 `wrangler.jsonc` 는 손댈 것이 없다. 앱이 붙기 전 그 경로는 이 사이트의 404 다.
- 이 사이트에서 앱으로 가는 링크는 **hx-boost 하지 않는다** — boost 되면 다른 앱의 HTML 이 이 사이트 body 에
  스왑된다. 마크다운 링크는 `rehypeAppLinks` 가 `hx-boost="false"` 를 달고, 뷰포트 선요청도 그 링크를 건너뛴다.
- 옛 호스트는 이전 직후 병행 서빙하고, 언제 합칠지는 사용자가 PostHog `$host` 트래픽을 보고 정한다. 지금 상태:
  - mdwire: `mdwire.minjun.dev` 는 2026-10-04 에 합쳤다. `minjun.dev` 존의 Redirect Rule 둘이 301 로 보낸다
    (`mdwire-site-old-host-prefixed`: `/mdwire/…` → `https://minjun.kim` + 경로, `mdwire-site-old-host`: 그 외 →
    `https://minjun.kim/mdwire` + 경로, 쿼리 보존). 병행 서빙에 쓰던 URL Rewrite `mdwire-site-subpath` 는 되돌릴 때
    쓰려고 꺼 둔 채 남겨 두었다.
  - ogpeek: `ogpeek.minjun.dev` 는 ogpeek Worker 가 경로를 재작성해 병행 서빙한다. `ogpeek.dev` 도 200 으로
    응답한다(2026-10-04 확인, 서빙 방식은 ogpeek repo 가 안다).

**발견성**
- `/projects` 허브가 앱을 소개하고 링크한다. 사이트 안에서는 허브를 링크하지 않고 sitemap 에만 둔다.
- 크롤러는 호스트 루트의 robots.txt 만 읽으므로 앱은 자기 robots.txt 로 sitemap 을 알릴 수 없다. 앱 sitemap 은
  `APP_SITEMAPS` 에 추가해 이 사이트 robots.txt 의 `Sitemap:` 줄로 낸다.

**같은 origin 이라서**
- 쿠키·localStorage·서비스 워커가 이 사이트와 공유된다. 그래서 **로그인이나 사용자 데이터가 있는 앱은 이
  도메인에 들이지 않는다**(자기 도메인에 둔다).
- 앱이 localStorage 를 쓰면 키에 앱 이름 접두사를 붙인다(`ogpeek:…`). 이 사이트는 `theme` 를 쓴다.
- PostHog 는 같은 프로젝트(키)를 쓰고, 같은 쿠키를 공유해 방문자 식별이 이어진다. 사이트 구분은 `$pathname`.

## 폰트

Nunito 는 `@fontsource/nunito` 의 latin 400/700 woff2 를 빌드가 `dist/fonts/<name>-<version>.woff2` 로
복사해 셀프호스팅한다(`scripts/ssg.mjs` `copyFonts()`, 경로는 `BuildAssets.fontSrcs`). `@font-face` 는
`src/styles/global.ts` 의 `createGlobalCss(fonts)` 에 있고, **`"Nunito Fallback"`(Arial 에 `size-adjust`/
`ascent-override` 등 Nunito 지표를 씌운 것)** 이 next/font 의 `adjustFontFallback` 을 대신한다 — 이게
없으면 `font-display: swap` 순간에 글꼴 폭이 달라져 흔들린다. 지표 계산식은 그 파일 주석에.

**본문 한글은 Pretendard 다.** npm `pretendard` 의 공식 variable dynamic subset(CSS 1개 + 글자 묶음 woff2
92개)을 빌드가 `dist/fonts/pretendard-<version>/` 으로 폴더째 복사하고(CSS 가 묶음을 상대 경로로 가리킨다),
`Document` 가 그 CSS 를 `<link rel="stylesheet">` 로 건다(`BuildAssets.fontSrcs.pretendardStylesheet`). 이
사이트가 거는 유일한 스타일시트라 `assertInlineStyles` 는 이것만 허용한다. 브라우저는 페이지에 쓰인 글자가
든 묶음만 받는다(글 1편 첫 방문 약 230-350KB, 굵기 45-920 을 한 벌로). 인라인하지 않은 이유는 @font-face
규칙만 55KB 라 HTML 마다 그만큼 붙어서다 — 별도 파일은 `/fonts/*` immutable 캐시를 탄다. 본문
(`--font-family-base`)은 영문까지 Pretendard 이고, 나머지 UI 는 영문 Nunito·한글 Pretendard 다(로고 영문은
Nunito). OG 이미지도 같은 패키지의 OTF 를 쓴다.

**로고는 한글날(매년 10월 9일, 한국 시간)에만 한글(`김.민준`)이다.** 빌드 날짜로 정하면 매년 그날 배포해야
하므로 HTML 에 두 로고를 다 싣고, `components/HangulDayScript` 가 pre-paint 로 방문 시각을 보고 `<html
data-hangul-day>` 를 붙인다(JS 가 꺼져 있으면 영문 로고). 한글 로고는 나눔스퀘어라운드 서브셋으로 그린다 —
로고 글자만 남긴 woff2(4KB 미만)를 `scripts/logo-font.py`(fonttools)로 만들어
`src/assets/fonts/logo-hangul.woff2` 에 커밋하고, 빌드가 내용 해시를 붙여 복사한다
(`BuildAssets.fontSrcs.logoHangul`). preload 는 그 스크립트가 한글날에만 넣는다. 빌드에서 만들지 않는
이유는 원본 TTF 를 받을 공식 npm 패키지를 찾지 못했고, 아래 이름 변경에 fonttools 가 필요해서다.
**로고 글자를 바꾸면 폰트를 다시 만들어 커밋한다** — 안 하면 빠진 글자만 에러 없이 시스템 한글 폰트로
떨어진다. 서브셋은 OFL 상 수정본이라 원래 글꼴 이름(Reserved Font Name)을 쓰지 않도록 패밀리 이름을
`Minjun Logo` 로 바꿨다.

## OG 이미지

`src/build/og.ts` 가 `satori` + `@resvg/resvg-js` 로 글마다 `dist/og/<slug>.png` 를 만든다.
빌드타임 전용이라 네이티브 바이너리를 써도 된다.

**satori 는 폰트 버퍼를 명시적으로 요구하고 woff2 를 읽지 못한다.** 글 제목이 한글인데 Nunito 에는
한글 글리프가 없어서, OTF 인 Pretendard 를 빌드 의존성으로 두고 넘긴다. 브라우저로는 나가지 않는다.

## Conventions

- 코드 리뷰는 **한국어**로.
- 가독성 우선, 중첩 삼항 연산자 지양.
- 위 두 줄은 `.github/copilot-instructions.md` 에도 있다(Copilot 리뷰용) — 바꾸면 같이 맞춘다.
