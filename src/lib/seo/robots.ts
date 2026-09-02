import { SITE_URL } from '@/lib/siteConfig';

export function renderRobots(): string {
  return [
    'User-Agent: *',
    'Allow: /',
    '',
    `Host: ${SITE_URL}`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');
}
