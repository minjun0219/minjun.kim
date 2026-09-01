import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/siteConfig";

type Entry = {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
};

export function renderSitemap(): string {
  const now = new Date();

  const entries: Entry[] = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/posts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/resume`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...getAllPosts().map((post) => ({
      url: `${SITE_URL}/posts/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "yearly",
      priority: 0.7,
    })),
  ];

  const urls = entries
    .map((entry) =>
      [
        "<url>",
        `<loc>${entry.url}</loc>`,
        `<lastmod>${entry.lastModified.toISOString()}</lastmod>`,
        `<changefreq>${entry.changeFrequency}</changefreq>`,
        `<priority>${entry.priority}</priority>`,
        "</url>",
      ].join(""),
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}
