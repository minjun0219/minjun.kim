import type { ImageManifest } from '@/lib/images';

/**
 * 빌드가 정적 생성 직전에 앱에 넘기는 산출물 정보.
 *
 * Vite 가 클라이언트 번들 파일명에 해시를 붙이고 vendor 파일에는 htmx 버전을 박으므로
 * 실제 경로는 `scripts/ssg.mjs` 만 안다. 전역 가변 상태 대신 `createApp(build)` 인자로
 * 흘려보내 렌더가 빌드 순서에 의존하지 않게 한다.
 */
/** 셀프호스팅 폰트 경로. 경로에 버전이나 내용 해시가 박힌다 (`/fonts/*` 는 immutable) */
export type FontSrcs = {
  nunitoRegular: string;
  nunitoBold: string;
  /** 로고 한글 서브셋(나눔스퀘어라운드). `scripts/logo-font.py` 가 만든다 */
  logoHangul: string;
  /**
   * Pretendard 가변 dynamic subset 의 @font-face 스타일시트(`/fonts/pretendard-<version>/…css`).
   * 이 사이트가 `<link rel="stylesheet">` 로 거는 유일한 파일이다
   */
  pretendardStylesheet: string;
};

export type BuildAssets = {
  /** `_posts/images/*` 변환 결과. `src/build/images.ts` 가 만든다 */
  images: ImageManifest;
  /** `src/client/main.ts` 번들 (`/assets/main-<hash>.js`) */
  clientScriptSrc: string;
  /** htmx 본체와 확장. 로드 순서가 의미 있어 배열 순서를 그대로 지킨다. */
  vendorScriptSrcs: string[];
  fontSrcs: FontSrcs;
};
