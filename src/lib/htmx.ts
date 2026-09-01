/**
 * htmx `preload` 확장이 읽는 속성. 내부 링크에만 붙인다 —
 * 외부 도메인은 선요청해봐야 캐시 이득이 없고 불필요한 트래픽만 만든다.
 */
export const PRELOAD_ATTR = { preload: "mouseover" } as const;

/** 같은 사이트 내부 경로인지. 프로토콜이 붙어 있으면 외부로 본다. */
export function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}
