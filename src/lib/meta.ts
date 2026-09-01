import {
  AUTHOR_NAME,
  DEFAULT_OG_IMAGE,
  LOCALE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "./siteConfig";

export type PageMeta = {
  /** 페이지 제목. 없으면 사이트명만 쓴다(홈). */
  title?: string;
  description?: string;
  /** canonical 계산에 쓰는 사이트 내부 경로 */
  path: string;
  ogType?: "website" | "article";
  /** 루트 기준 경로. 없으면 사이트 기본 OG 이미지 */
  ogImage?: string;
  noindex?: boolean;
  publishedTime?: string;
  authors?: string[];
};

export type ResolvedMeta = {
  /** `<title>` 에 들어갈 최종 문자열 */
  documentTitle: string;
  /** OG/Twitter 에 들어갈 제목 — 사이트명 접미사가 없는 원제목 */
  title: string;
  description: string;
  canonical: string;
  ogType: "website" | "article";
  ogImage: string;
  noindex: boolean;
  publishedTime?: string;
  authors: string[];
};

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

/**
 * Next.js Metadata API 가 하던 기본값 채우기를 대신한다.
 * 제목 템플릿(`%s | minjun.kim`)과 사이트 기본 설명/이미지가 여기서 적용된다.
 */
export function resolveMeta(meta: PageMeta): ResolvedMeta {
  const title = meta.title ?? SITE_NAME;
  return {
    documentTitle: meta.title ? `${meta.title} | ${SITE_NAME}` : SITE_NAME,
    title,
    description: meta.description ?? SITE_DESCRIPTION,
    canonical: absoluteUrl(meta.path),
    ogType: meta.ogType ?? "website",
    ogImage: absoluteUrl(meta.ogImage ?? DEFAULT_OG_IMAGE),
    noindex: meta.noindex ?? false,
    publishedTime: meta.publishedTime,
    authors: meta.authors ?? [AUTHOR_NAME],
  };
}

export { AUTHOR_NAME, LOCALE, SITE_NAME, SITE_URL };
