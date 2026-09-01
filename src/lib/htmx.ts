/** 같은 사이트 내부 경로인지. 프로토콜이 붙어 있으면 외부로 본다. */
export function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}
