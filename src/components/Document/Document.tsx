import type { Child } from "hono/jsx";
import NoFlashThemeScript from "@/components/NoFlashThemeScript";
import { getClientScriptSrc, getStylesheetHref } from "@/lib/assets";
import {
  AUTHOR_NAME,
  LOCALE,
  type ResolvedMeta,
  SITE_NAME,
  SITE_URL,
} from "@/lib/meta";

type Props = {
  meta: ResolvedMeta;
  /**
   * 클라이언트에서 페이지 종류를 구분해야 할 때 쓰는 표식(예: 404 이벤트).
   * `<body>` 속성이 아니라 `<head>` 의 meta 로 넣는다 — hx-boost 는 body 요소 자체가
   * 아니라 그 내용만 교체하므로 body 속성은 이동 후 갱신되지 않는다.
   * head 는 head-support 가 머지하므로 meta 라야 boosted 이동에서도 정확하다.
   */
  pageId?: string;
  children: Child;
};

/**
 * 모든 페이지의 HTML 셸.
 *
 * `hx-boost` 가 `<body>` 를 통째로 교체하며 이동하고, `head-support` 확장이
 * `<head>` 를 머지한다 — 이게 없으면 이동 후에도 canonical/OG 가 첫 페이지 것으로 남는다.
 * `preload` 확장은 내부 링크의 `preload` 속성(`src/lib/htmx.ts`)을 읽는다.
 */
export const Document = ({ meta, pageId, children }: Props) => {
  const naverVerification = process.env.NAVER_SITE_VERIFICATION;

  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{meta.documentTitle}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={meta.canonical} />
        {meta.noindex ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : null}
        {pageId ? <meta name="x-page-id" content={pageId} /> : null}

        <meta name="application-name" content={SITE_NAME} />
        <meta name="author" content={AUTHOR_NAME} />
        <meta name="creator" content={AUTHOR_NAME} />
        <meta name="publisher" content={AUTHOR_NAME} />

        <meta property="og:type" content={meta.ogType} />
        <meta property="og:locale" content={LOCALE} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:url" content={meta.canonical} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:image" content={meta.ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={meta.title} />
        {meta.publishedTime ? (
          <meta
            property="article:published_time"
            content={meta.publishedTime}
          />
        ) : null}
        {meta.ogType === "article"
          ? meta.authors.map((name) => (
              <meta key={name} property="article:author" content={name} />
            ))
          : null}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.ogImage} />

        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link
          rel="icon"
          href="/favicon-16.png"
          type="image/png"
          sizes="16x16"
        />
        <link
          rel="icon"
          href="/favicon-32.png"
          type="image/png"
          sizes="32x32"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${SITE_NAME} RSS`}
          href={`${SITE_URL}/posts/feed.xml`}
        />
        {naverVerification ? (
          <meta name="naver-site-verification" content={naverVerification} />
        ) : null}

        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/nunito-latin-400-normal.woff2"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={getStylesheetHref()} />

        <NoFlashThemeScript />
        <script src="/vendor/htmx.min.js" defer />
        <script src="/vendor/preload.min.js" defer />
        <script src="/vendor/head-support.min.js" defer />
        <script src={getClientScriptSrc()} defer />
      </head>
      <body hx-boost="true" hx-ext="preload,head-support">
        {children}
      </body>
    </html>
  );
};

export default Document;
