// slim 번들: 코어만. 확장은 켜진 것만 런타임 지연 로드.
import posthog from "posthog-js/dist/module.slim";
import { THEME_CYCLE, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

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

/* -------------------------------------------------------------- 관측 도구 */


if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: "2025-05-24",
    // hx-boost 는 pushState 이동이라 자동 pageview 가 잡히지 않는다. 아래에서 직접 쏜다.
    capture_pageview: false,
    capture_pageleave: true,
    capture_exceptions: true,
    autocapture: false,
    disable_session_recording: true,
    disable_surveys: true,
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
  document.addEventListener("htmx:after:history:push", capturePageview);
}
