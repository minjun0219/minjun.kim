/**
 * hono/css 재수출. 규칙은 CLAUDE.md 의 "hono/css" 절 참고 —
 * 파서 없는 문자열 해시라 `&` 중첩은 브라우저 네이티브 CSS Nesting 에 기댄다.
 */
export { css, cx, Style } from "hono/css";

/** `css\`…\`` 의 결과와 평문 클래스 둘 다 받는 `className` prop 타입. */
export type ClassName = string | Promise<string>;
