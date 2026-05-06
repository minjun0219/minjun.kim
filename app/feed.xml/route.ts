import { getAllPosts, getExcerpt, markdownToHtml } from "@/lib/blog";
import {
  AUTHOR_EMAIL,
  AUTHOR_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/siteConfig";

export const dynamic = "force-static";

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

export async function GET() {
  const posts = [...getAllPosts()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const items = await Promise.all(
    posts.map(async (post) => {
      const url = `${SITE_URL}/posts/${post.slug}`;
      const [description, contentHtml] = await Promise.all([
        getExcerpt(post.content),
        markdownToHtml(post.content),
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

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "<channel>",
    `<title>${escapeXml(SITE_NAME)}</title>`,
    `<link>${escapeXml(SITE_URL)}</link>`,
    `<atom:link href="${escapeXml(`${SITE_URL}/feed.xml`)}" rel="self" type="application/rss+xml" />`,
    `<description>${escapeXml(SITE_DESCRIPTION)}</description>`,
    "<language>ko</language>",
    `<lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    items.join(""),
    "</channel>",
    "</rss>",
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
