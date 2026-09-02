/**
 * 마크다운 파이프라인이 raw HTML 에 박는 고정 클래스명.
 *
 * hono/css 는 hono/jsx 가 렌더하는 값에만 스타일을 등록하므로 raw HTML 에는
 * 해시 클래스를 쓸 수 없다. 대신 여기 상수를 rehype(`markdown.ts`)와
 * PostContent 의 중첩 자손 규칙이 함께 참조해 이름이 어긋나지 않게 한다.
 */
export const MD_CLASS = {
  /** `<pre>` — 코드 블록 루트. `title` 속성이 있으면 `::before` 로 제목을 그린다 */
  code: "md-code",
  /** 언어 뱃지(`data-language` → `::after`)를 그리는 래퍼 */
  codeContainer: "md-code-container",
  /** 실제 코드 영역(가로 스크롤) */
  codeBody: "md-code-body",
  /** 이미지 래퍼 */
  figure: "md-figure",
  /** 텍스트가 "github" 인 github.com 링크 */
  iconLink: "md-icon-link",
  /** 위 링크 안의 아이콘 svg */
  icon: "md-icon",
} as const;
