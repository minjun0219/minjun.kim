import { getAllPosts } from '@/lib/blog';
import { getResume } from '@/lib/resume';
import { SITE_URL } from '@/lib/siteConfig';

type Entry = {
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
};

/**
 * `lastmod` 는 빌드 시각이 아니라 내용이 실제로 바뀐 날이어야 한다. 매 빌드마다 바뀌면
 * 검색엔진이 값을 신뢰하지 않고 무시한다. 홈·목록은 가장 최근 글, 이력서는 `updatedAt`.
 */
export function renderSitemap(): string {
  const posts = getAllPosts();
  const latestPost = new Date(Math.max(...posts.map((post) => new Date(post.date).getTime())));
  const { updatedAt } = getResume();
  const resumeUpdatedAt = updatedAt ? new Date(updatedAt) : latestPost;

  const entries: Entry[] = [
    {
      url: `${SITE_URL}/`,
      lastModified: latestPost,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/posts`,
      lastModified: latestPost,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/resume`,
      lastModified: resumeUpdatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/posts/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'yearly',
      priority: 0.7,
    })),
  ];

  const urls = entries
    .map((entry) =>
      [
        '<url>',
        `<loc>${entry.url}</loc>`,
        `<lastmod>${entry.lastModified.toISOString()}</lastmod>`,
        `<changefreq>${entry.changeFrequency}</changefreq>`,
        `<priority>${entry.priority}</priority>`,
        '</url>',
      ].join(''),
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}
