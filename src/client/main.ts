import * as Sentry from "@sentry/browser";
import posthog from "posthog-js";
import { THEME_CYCLE, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST =
  import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com";

/* ---------------------------------------------------------------- 테마 토글 */

function switchTheme() {
  const html = document.documentElement;
  const current = (html.getAttribute("data-theme") as Theme | null) ?? "system";
  const index = THEME_CYCLE.indexOf(current);
  const next = THEME_CYCLE[(index + 1) % THEME_CYCLE.length];

  if (next === "system") {
    html.removeAttribute("data-theme");
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch {
      // 저장 실패(시크릿 모드 등)는 무시한다 — 문서 속성은 이미 갱신됐다.
    }
    return;
  }

  html.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // 위와 동일
  }
}

// hx-boost 가 <body> 를 통째로 갈아끼우므로 버튼에 직접 건 리스너는 이동 후 사라진다.
// document 위임으로 걸어야 네비게이션 뒤에도 계속 동작한다.
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  if (target?.closest("[data-theme-toggle]")) {
    switchTheme();
  }
});

/* ------------------------------------------------------------------- htmx */

// htmx 는 기본적으로 2xx 가 아닌 응답을 스왑하지 않는다. 그대로 두면 내부 링크가
// 깨졌을 때 클릭해도 아무 일이 일어나지 않으므로, 404 는 정상 렌더링하도록 허용한다.
document.addEventListener("htmx:beforeSwap", (event) => {
  const detail = (event as CustomEvent).detail;
  if (detail?.xhr?.status === 404) {
    detail.shouldSwap = true;
    detail.isError = false;
  }
});

/* -------------------------------------------------------------- 관측 도구 */

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: "2025-05-24",
    // hx-boost 는 pushState 이동이라 자동 pageview 가 잡히지 않는다. 아래에서 직접 쏜다.
    capture_pageview: false,
    capture_pageleave: true,
    capture_exceptions: true,
  });

  const capturePageview = () => {
    posthog.capture("$pageview", { $current_url: window.location.href });
    // 404 는 문구 변경에 영향받지 않도록 별도 이벤트로 남긴다.
    // 표식은 head 의 meta 다 — body 속성은 hx-boost 이동에서 갱신되지 않는다.
    const pageId = document
      .querySelector('meta[name="x-page-id"]')
      ?.getAttribute("content");
    if (pageId === "not-found") {
      posthog.capture("not_found");
    }
  };

  capturePageview();
  document.addEventListener("htmx:pushedIntoHistory", capturePageview);
}
