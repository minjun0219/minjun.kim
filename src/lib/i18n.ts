/**
 * 영어판은 해외에서 처음 들어오는 사람(리크루터·개발자)을 위한 입구라 홈과 about 만 둔다.
 * 한국어가 기본이고 기존 경로를 그대로 쓰며, 영어는 `/en` 접두사 아래 같은 이름으로 둔다.
 *
 * hx-boost 는 body 내용만 바꾸고 hx-head 는 head 자식만 머지하므로 `<html lang>` 은 이동 후에도
 * 첫 페이지 값으로 남는다. 그래서 **언어가 바뀌는 링크는 `hx-boost="false"`** 로 전체 로드한다 —
 * 마크다운 본문은 `rehypeLanguageLinks` 가 `pathLang` 으로 판정해 달고, 컴포넌트는 직접 단다.
 */
export type Lang = 'ko' | 'en';

/** 번역이 있는 페이지의 언어별 경로 */
export type Translations = Record<Lang, string>;

export const HOME_PATHS: Translations = { ko: '/', en: '/en' };

export const ABOUT_PATHS: Translations = { ko: '/about', en: '/en/about' };

/** `og:locale` */
export const OG_LOCALES: Record<Lang, string> = { ko: 'ko_KR', en: 'en_US' };

/** JSON-LD `inLanguage` */
export const LANGUAGE_TAGS: Record<Lang, string> = { ko: 'ko-KR', en: 'en-US' };

/** 사이트 내부 경로의 언어 — `/en` 아래면 영어, 나머지는 한국어 */
export function pathLang(pathname: string): Lang {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'ko';
}
