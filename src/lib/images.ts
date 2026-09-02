/**
 * `_posts/images/*` 를 빌드가 webp 로 변환한 결과. 파일명(확장자 포함) → 방출된 자산.
 *
 * 마크다운의 `./images/<name>` 참조를 페이지(`markdown.ts`)와 RSS(`feed.ts`)가
 * 같은 URL 로 바꾸는 데 쓴다. 생성은 `src/build/images.ts`, 전달은 `BuildAssets`.
 */
export type ImageManifest = Record<string, ImageAsset>;

export type ImageAsset = {
  /** 루트 기준 URL. 내용 해시가 붙어 `immutable` 캐시가 안전하다 */
  url: string;
  width: number;
  height: number;
};
