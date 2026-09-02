import type { FontSrcs } from '@/lib/build';
import { css } from '@/lib/css';

/**
 * 전역 스타일. `:-hono-global` 로 감싸면 hono/css 가 클래스 스코프 없이 그대로 방출한다.
 *
 * 이 템플릿 안에서는 줄바꿈 위치가 동작을 좌우한다 — 직전 문자가 `{ } ; : ,` 가 아닌
 * 줄바꿈이 하나라도 남으면 전역 규칙이 통째로 죽는다(CLAUDE.md "hono/css" 절).
 * 여러 줄 주석도 제거되지 않으니 설명은 여기 TS 주석에 둔다.
 *
 * 폰트는 next/font 대신 @fontsource/nunito 를 셀프호스팅한다(경로는 빌드가 `fontSrcs` 로 준다).
 * latin 서브셋만 쓰며 한글은 시스템 폰트로 떨어진다.
 *
 * "Nunito Fallback" 은 next/font 의 `adjustFontFallback` 을 재현한 것이다. Nunito 가 오기 전
 * Arial 을 Nunito 의 폭·행간에 맞춰 보여 줘서 swap 순간의 글꼴 변화와 레이아웃 이동을 줄인다.
 * 수치는 @capsizecss/metrics 의 Nunito(unitsPerEm 1000, ascent 1011, descent -353, lineGap 0,
 * xWidthAvg 452) 와 Arial(2048, 1854, -434, 67, 913) 에서 next/font 와 같은 식으로 계산했다:
 * size-adjust = (452/1000)/(913/2048), ascent/descent/line-gap-override = 값/(1000*size-adjust).
 *
 * 템플릿 안의 `${}` 는 폰트 URL 평문 문자열뿐이다 — css 값·개행이 들어가는 보간은 금지.
 */
export const createGlobalCss = (fonts: FontSrcs) => css`:-hono-global {
  @font-face {
    font-family: Nunito;
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url("${fonts.nunitoRegular}") format("woff2");
  }

  @font-face {
    font-family: Nunito;
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url("${fonts.nunitoBold}") format("woff2");
  }

  @font-face {
    font-family: "Nunito Fallback";
    src: local("Arial");
    size-adjust: 101.39%;
    ascent-override: 99.71%;
    descent-override: 34.82%;
    line-gap-override: 0%;
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
    font-family: Nunito, "Nunito Fallback", sans-serif;
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
