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
regression safety net is comparing build output against a known-good build (and the post-build
assertions in `scripts/ssg.mjs`).

## Build pipeline

`pnpm build` runs three steps, in order:

1. `vite build` — SSR 번들. 엔트리는 `src/app.tsx`(Hono 앱 팩토리), `src/build/og.ts`(OG 이미지),
   `src/build/images.ts`(글 이미지 변환). `dist-ssr/` 로 나간다.
2. `vite build -c vite.client.config.ts` — 브라우저로 나가는 유일한 자체 번들
   (`src/client/main.ts`: 테마 토글, htmx 훅, PostHog). `dist-client/` 로 나간다.
3. `node scripts/ssg.mjs` — `dist/` 를 비우고 `public/` 복사 → 글 이미지 webp 변환 → 클라이언트
   자산·htmx vendor·Nunito 폰트(`@fontsource/nunito`) 복사 → **`createApp(build)`** → Hono `toSSG` →
   인라인 스타일 단언 → OG 이미지.

**앱은 팩토리다.** `src/app.tsx` 의 `createApp(build: BuildAssets)` 가 빌드 산출물 경로(클라이언트
스크립트, vendor 스크립트, 폰트, 이미지 매니페스트)를 인자로 받는다(`src/lib/build.ts`). 전역 가변 상태로
자산 경로를 주입하지 않는다 — 렌더에 필요한 빌드 정보는 전부 `BuildAssets` 를 통해 흐른다.

**`@hono/vite-ssg` 는 쓰지 않는다.** 클라이언트 번들·vendor 복사·이미지·OG 는 어차피 직접 해야
해서 플러그인을 넣어도 접착제가 줄지 않는다. `toSSG` 를 `scripts/ssg.mjs` 에서 직접 호출한다.

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
- `src/components/*` — 프레젠테이션 컴포넌트. 스타일은 같은 파일 안의 `hono/css` 블록
- `src/containers/*` — 페이지 단위 조합 (Header, Home, Post, Posts, Resume, NotFound)
- `src/lib/*` — 순수 헬퍼와 데이터 접근

**Site constants** 는 전부 `src/lib/siteConfig.ts` 에 있다. 페이지 메타는 `src/lib/meta.ts` 의
`resolveMeta()` 가 기본값을 채우고 `src/components/Document` 가 `<head>` 를 그린다.

**Theming.** `system`/`light`/`dark` 3단 순환 (`src/lib/theme.ts`). `NoFlashThemeScript` 가
pre-paint 로 `localStorage` 를 읽어 `<html data-theme>` 을 세팅하고, 토글은
`src/client/main.ts` 가 **document 이벤트 위임**으로 처리한다.

## 스타일 — hono/css

CSS 파일이 없다. 모든 스타일은 `hono/css`(`src/lib/css.ts` 로 재수출) 로 TSX 안에 두고, 렌더 시
`<head>` 의 `<style id="hono-css">` 한 개에 인라인된다. 전역 규칙은 `src/styles/global.ts` 의
`:-hono-global { … }` 블록이고 `Document` 가 `<Style>{globalCss}</Style>` 로 싣는다.

컴포넌트 패턴:

```tsx
import { type ClassName, css, cx } from "@/lib/css";
const root = css`…`;
const Wrapper = ({ children, className }: { children: Child; className?: ClassName }) => (
  <div className={cx(root, className)}>{children}</div>
);
```

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
  id="hono-css">` 정확히 1개, 개행 없음, `:-hono-global`/`#hono-css')`/`<link rel="stylesheet"`/
  `undefined</style>` 0건). 실패하면 빌드가 죽는다 — 우회하지 말고 원인을 고친다.

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
`src/build/images.ts` 가 빌드 사전 패스로 sharp 로 webp 변환해 `dist/images/<name>-<hash8>.webp` 로
쓰고 매니페스트(`src/lib/images.ts` 의 `ImageManifest`)를 돌려준다. `rehypeImages` 가 이를 `src`/
`width`/`height`(CLS 방지)/`loading="lazy"` 로 바꾸며, 매니페스트에 없는 참조는 빌드 실패다.
옛 절대 경로(`/images/posts/…`)는 의도적으로 살리지 않았다(404).

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
  htmx 의 실제 요청이 같은 캐시를 타므로 응답에 `Vary` 가 없어야 한다.
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

## 폰트

Nunito 는 `@fontsource/nunito` 의 latin 400/700 woff2 를 빌드가 `dist/fonts/<name>-<version>.woff2` 로
복사해 셀프호스팅한다(`scripts/ssg.mjs` `copyFonts()`, 경로는 `BuildAssets.fontSrcs`). `@font-face` 는
`src/styles/global.ts` 의 `createGlobalCss(fonts)` 에 있고, **`"Nunito Fallback"`(Arial 에 `size-adjust`/
`ascent-override` 등 Nunito 지표를 씌운 것)** 이 next/font 의 `adjustFontFallback` 을 대신한다 — 이게
없으면 `font-display: swap` 순간에 글꼴 폭이 달라져 흔들린다. 지표 계산식은 그 파일 주석에.

## OG 이미지

`src/build/og.ts` 가 `satori` + `@resvg/resvg-js` 로 글마다 `dist/og/<slug>.png` 를 만든다.
빌드타임 전용이라 네이티브 바이너리를 써도 된다.

**satori 는 폰트 버퍼를 명시적으로 요구하고 woff2 를 읽지 못한다.** 글 제목이 한글인데 Nunito 에는
한글 글리프가 없어서, OTF 인 Pretendard 를 빌드 의존성으로 두고 넘긴다. 브라우저로는 나가지 않는다.

## Conventions

- 코드 리뷰는 **한국어**로.
- 가독성 우선, 중첩 삼항 연산자 지양.
