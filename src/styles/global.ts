import { css } from '@/lib/css';

/**
 * 전역 스타일. `:-hono-global` 로 감싸면 hono/css 가 클래스 스코프 없이 그대로 방출한다.
 *
 * 이 템플릿 안에서는 줄바꿈 위치가 동작을 좌우한다 — 직전 문자가 `{ } ; : ,` 가 아닌
 * 줄바꿈이 하나라도 남으면 전역 규칙이 통째로 죽는다(CLAUDE.md "hono/css" 절).
 * 여러 줄 주석도 제거되지 않으니 설명은 여기 TS 주석에 둔다.
 *
 * 폰트는 next/font 대신 셀프호스팅한다. latin 서브셋만 쓰며 한글은 시스템 폰트로 떨어진다.
 */
export const globalCss = css`:-hono-global {
  @font-face {
    font-family: Nunito;
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url("/fonts/nunito-latin-400-normal.woff2") format("woff2");
  }

  @font-face {
    font-family: Nunito;
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url("/fonts/nunito-latin-700-normal.woff2") format("woff2");
  }

  :root {
    --background-color: #21262e;
    --primary-color: #21cfff;
    --text-color: #f7fff7;
    --text-secondary-color: #b0b6b6;
    --code-title-color: #f7fff7;
    --code-highlight-color: rgba(0, 0, 0, 0.3);
    --font-family-base:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
      Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    --font-family-code: Menlo, Monaco, "Courier New", monospace;
    --transition-duration: 250ms;
    --page-margin: 16px;
    --page-max-width: 700px;
  }

  html[data-theme="light"] {
    --background-color: #fff;
    --primary-color: #008aff;
    --text-color: #333;
    --text-secondary-color: #838383;
    --code-highlight-color: rgba(0, 0, 0, 0.05);
  }

  @media (prefers-color-scheme: light) {
    :root:not([data-theme]) {
      --background-color: #fff;
      --primary-color: #008aff;
      --text-color: #333;
      --text-secondary-color: #838383;
      --code-highlight-color: rgba(0, 0, 0, 0.05);
    }
  }

  html,
  body {
    position: relative;
    margin: 0;
    padding: 0;
  }

  body {
    -webkit-text-size-adjust: none;
    background: var(--background-color);
    font-family: Nunito, Monaco, monospace, serif;
    font-size: 0.8em;
    color: var(--text-color);
    transition-property: color, background;
    transition-duration: var(--transition-duration);
  }

  @media print {
    html,
    body {
      background: #fff !important;
      color: #000 !important;
    }
  }
}`;
