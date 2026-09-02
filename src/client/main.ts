// slim 번들: 코어만. 확장은 켜진 것만 런타임 지연 로드.
import posthog from 'posthog-js/dist/module.slim';
import { THEME_CYCLE, THEME_STORAGE_KEY, type Theme } from '@/lib/theme';

declare global {
  interface Window {
    __siteClientInit?: true;
  }
}

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com';

/* ---------------------------------------------------------------- 테마 토글 */

function switchTheme() {
  const html = document.documentElement;
  const current = (html.getAttribute('data-theme') as Theme | null) ?? 'system';
  const index = THEME_CYCLE.indexOf(current);
  const next = THEME_CYCLE[(index + 1) % THEME_CYCLE.length];

  if (next === 'system') {
    html.removeAttribute('data-theme');
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      // 저장 실패(시크릿 모드 등)는 무시한다 — 문서 속성은 이미 갱신됐다.
    }
    return;
  }

  html.setAttribute('data-theme', next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // 위와 동일
  }
}

/* -------------------------------------------------------------- 관측 도구 */

function initAnalytics() {
  if (!POSTHOG_KEY) {
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: '2025-05-24',
    // hx-boost 는 pushState 이동이라 자동 pageview 가 잡히지 않는다. 아래에서 직접 쏜다.
    capture_pageview: false,
    capture_pageleave: true,
    capture_exceptions: true,
    autocapture: false,
    disable_session_recording: true,
    disable_surveys: true,
  });

  const capturePageview = () => {
    posthog.capture('$pageview', { $current_url: window.location.href });
    // 404 는 문구 변경에 영향받지 않도록 별도 이벤트로 남긴다.
    // 표식은 head 의 meta 다 — body 속성은 hx-boost 이동에서 갱신되지 않는다.
    const pageId = document.querySelector('meta[name="x-page-id"]')?.getAttribute('content');
    if (pageId === 'not-found') {
      posthog.capture('not_found');
    }
  };

  capturePageview();
  document.addEventListener('htmx:after:history:push', capturePageview);
}

/* ------------------------------------------------------------ 뷰포트 선요청 */

// hx-preload 는 hover/touch 만 다룬다. Next.js <Link> 처럼 뷰포트에 들어온 내부 링크도
// 미리 받아 HTTP 캐시(HTML max-age=60)를 데워 둔다 — htmx 의 실제 요청이 같은 캐시를 탄다.
// 잠깐 스쳐 가는 링크는 받지 않고(체류 시간 조건), 같은 URL 은 한 번만 받는다.
const VIEWPORT_PREFETCH_DWELL_MS = 200;
const prefetchedUrls = new Set<string>();

type NetworkInformationLike = { saveData?: boolean; effectiveType?: string };

function isPrefetchableLink(anchor: HTMLAnchorElement): boolean {
  if (anchor.origin !== location.origin) {
    return false;
  }
  if (anchor.target || anchor.hasAttribute('download')) {
    return false;
  }
  // 현재 페이지, 해시 이동, 피드 같은 파일 링크는 제외
  if (anchor.pathname === location.pathname || /\.[a-z0-9]+$/i.test(anchor.pathname)) {
    return false;
  }
  return !prefetchedUrls.has(anchor.pathname);
}

async function prefetchPage(pathname: string) {
  prefetchedUrls.add(pathname);
  try {
    // 응답 본문을 끝까지 읽어야 브라우저가 캐시에 확실히 남긴다.
    const response = await fetch(pathname, { priority: 'low' });
    prefetchImages(await response.text());
  } catch {
    // 선요청 실패는 무시한다 — 클릭 시 정상 요청으로 간다.
    prefetchedUrls.delete(pathname);
  }
}

// 받아 둔 HTML 의 `<link rel="preload" as="image">` 를 읽어 글 이미지도 미리 받는다.
// 옛 Next.js 사이트는 RSC 프리페치에 이 힌트가 실려 와 클릭 전에 이미지까지 캐시에 있었다.
// DOMParser 문서는 리소스를 스스로 로드하지 않으므로 off-DOM `<img>` 로 요청을 낸다 —
// 브라우저가 srcset/sizes 후보를 실제 렌더와 똑같이 고르고, `/images/*` 는 immutable 이라
// 캐시가 그대로 재사용된다.
function prefetchImages(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  for (const link of doc.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')) {
    const href = link.getAttribute('href');
    if (!href || prefetchedUrls.has(href)) {
      continue;
    }
    prefetchedUrls.add(href);
    const image = new Image();
    image.fetchPriority = 'low';
    image.sizes = link.getAttribute('imagesizes') ?? '';
    image.srcset = link.getAttribute('imagesrcset') ?? '';
    image.src = href;
  }
}

function initViewportPrefetch() {
  if (!('IntersectionObserver' in window)) {
    return;
  }
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  if (connection?.saveData || connection?.effectiveType?.endsWith('2g')) {
    return;
  }

  const dwellTimers = new Map<Element, number>();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const anchor = entry.target as HTMLAnchorElement;
      const pending = dwellTimers.get(anchor);
      if (pending) {
        clearTimeout(pending);
        dwellTimers.delete(anchor);
      }
      if (!entry.isIntersecting) {
        continue;
      }
      const timer = window.setTimeout(() => {
        dwellTimers.delete(anchor);
        observer.unobserve(anchor);
        if (isPrefetchableLink(anchor)) {
          prefetchPage(anchor.pathname);
        }
      }, VIEWPORT_PREFETCH_DWELL_MS);
      dwellTimers.set(anchor, timer);
    }
  });

  const observeLinks = () => {
    // 스왑으로 떨어져 나간 옛 앵커는 관찰을 끊고(체류 타이머 포함) 새 본문의 링크를 다시 건다.
    observer.disconnect();
    for (const timer of dwellTimers.values()) {
      clearTimeout(timer);
    }
    dwellTimers.clear();
    for (const anchor of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      if (isPrefetchableLink(anchor)) {
        observer.observe(anchor);
      }
    }
  };

  observeLinks();
  document.addEventListener('htmx:after:swap', observeLinks);
}

function init() {
  // hx-boost 가 <body> 를 통째로 갈아끼우므로 버튼에 직접 건 리스너는 이동 후 사라진다.
  // document 위임으로 걸어야 네비게이션 뒤에도 계속 동작한다.
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-theme-toggle]')) {
      switchTheme();
    }
  });

  initAnalytics();
  initViewportPrefetch();
}

// 배포 직후 HTML 캐시와 새 자산 URL 이 섞이면, hx-head 가 head 를 머지하면서
// 해시가 바뀐 이 번들을 새로 실행할 수 있다. 그러면 리스너가 중복 등록돼
// 테마 토글이 클릭당 두 단계씩 넘어간다. 한 번만 돌게 막는다.
if (!window.__siteClientInit) {
  window.__siteClientInit = true;
  init();
}
