import { getAllPosts, getExcerpt, markdownToHtml } from "@/lib/blog";
import type { ImageManifest } from "@/lib/images";
import {
  AUTHOR_EMAIL,
  AUTHOR_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/siteConfig";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(value: string): string {
  return `<![CDATA[${value.replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;
}

function toRfc822(date: string | Date): string {
  return new Date(date).toUTCString();
}

/**
 * 본문의 `./images/<name>` 을 절대 URL 로 바꾼다. 상대 경로를 그대로 내보내면 리더가
 * 글 URL 기준으로 잘못 해석한다. 페이지와 같은 webp 를 가리키도록 매니페스트를 탄다.
 */
function resolveImagePaths(markdown: string, images: ImageManifest): string {
  return markdown.replace(/\]\(\.\/images\/([^)]+)\)/g, (_match, name) => {
    const asset = images[name];
    if (!asset) throw new Error(`피드 이미지 매니페스트에 없음: ${name}`);
    return `](${SITE_URL}${asset.url})`;
  });
}

export async function renderFeed({
  images,
}: {
  images: ImageManifest;
}): Promise<string> {
  const posts = [...getAllPosts()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const items = await Promise.all(
    posts.map(async (post) => {
      const url = `${SITE_URL}/posts/${post.slug}`;
      const [description, contentHtml] = await Promise.all([
        getExcerpt(post.content),
        markdownToHtml(resolveImagePaths(post.content, images)),
      ]);
      const authorEmail = post.author?.email ?? AUTHOR_EMAIL;
      const authorName = post.author?.name ?? AUTHOR_NAME;

      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `<pubDate>${toRfc822(post.date)}</pubDate>`,
        `<author>${escapeXml(`${authorEmail} (${authorName})`)}</author>`,
        `<description>${cdata(description)}</description>`,
        `<content:encoded>${cdata(contentHtml)}</content:encoded>`,
        "</item>",
      ].join("");
    }),
  );

  const lastBuildDate =
    posts.length > 0 ? toRfc822(posts[0].date) : new Date().toUTCString();

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "<channel>",
    `<title>${escapeXml(SITE_NAME)}</title>`,
    `<link>${escapeXml(SITE_URL)}</link>`,
    `<atom:link href="${escapeXml(`${SITE_URL}/posts/feed.xml`)}" rel="self" type="application/rss+xml" />`,
    `<description>${escapeXml(SITE_DESCRIPTION)}</description>`,
    "<language>ko</language>",
    `<lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    items.join(""),
    "</channel>",
    "</rss>",
  ].join("");
}
