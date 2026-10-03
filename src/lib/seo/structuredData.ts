import { absoluteUrl } from '@/lib/meta';
import {
  AUTHOR_EMAIL,
  AUTHOR_JOB_TITLE,
  AUTHOR_NAME,
  AUTHOR_NAME_KO,
  AUTHOR_PROFILES,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '@/lib/siteConfig';

/**
 * schema.org JSON-LD. 페이지마다 사이트(`WebSite`)와 저자(`Person`) 노드를 깔고
 * 그 위에 페이지 노드를 `@id` 로 엮어 하나의 `@graph` 로 낸다 — 검색엔진이 글·이력서·
 * 사이트를 같은 사람의 것으로 묶어 볼 수 있게 한다.
 */
export type JsonLdNode = Record<string, unknown>;

const WEBSITE_ID = `${SITE_URL}/#website`;
const PERSON_ID = `${SITE_URL}/#person`;

const ref = (id: string) => ({ '@id': id });

const website: JsonLdNode = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: 'ko-KR',
  publisher: ref(PERSON_ID),
};

const person: JsonLdNode = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: AUTHOR_NAME_KO,
  alternateName: AUTHOR_NAME,
  url: `${SITE_URL}/`,
  email: `mailto:${AUTHOR_EMAIL}`,
  jobTitle: AUTHOR_JOB_TITLE,
  sameAs: AUTHOR_PROFILES.map((profile) => profile.url),
};

type Crumb = { name: string; path: string };

function breadcrumbs(crumbs: Crumb[]): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function homeJsonLd(): JsonLdNode[] {
  return [
    {
      '@type': 'ProfilePage',
      '@id': `${SITE_URL}/#webpage`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      isPartOf: ref(WEBSITE_ID),
      mainEntity: ref(PERSON_ID),
    },
  ];
}

export function resumeJsonLd({ updatedAt }: { updatedAt?: string }): JsonLdNode[] {
  const url = absoluteUrl('/resume');
  return [
    {
      '@type': 'ProfilePage',
      '@id': `${url}#webpage`,
      url,
      name: `${AUTHOR_NAME_KO} 이력서`,
      isPartOf: ref(WEBSITE_ID),
      mainEntity: ref(PERSON_ID),
      dateModified: updatedAt,
    },
    breadcrumbs([
      { name: SITE_NAME, path: '/' },
      { name: '이력서', path: '/resume' },
    ]),
  ];
}

export function aboutJsonLd({ updatedAt }: { updatedAt?: string }): JsonLdNode[] {
  const url = absoluteUrl('/about');
  return [
    {
      '@type': 'ProfilePage',
      '@id': `${url}#webpage`,
      url,
      name: `${AUTHOR_NAME_KO} 소개`,
      isPartOf: ref(WEBSITE_ID),
      mainEntity: ref(PERSON_ID),
      dateModified: updatedAt,
    },
    breadcrumbs([
      { name: SITE_NAME, path: '/' },
      { name: 'About', path: '/about' },
    ]),
  ];
}

export function postsJsonLd(
  posts: Array<{ title: string; url: string; date: string }>,
): JsonLdNode[] {
  const url = absoluteUrl('/posts');
  return [
    {
      '@type': 'Blog',
      '@id': `${url}#blog`,
      url,
      name: `${SITE_NAME} Posts`,
      inLanguage: 'ko-KR',
      isPartOf: ref(WEBSITE_ID),
      author: ref(PERSON_ID),
      blogPost: posts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        url: absoluteUrl(post.url),
        datePublished: post.date,
      })),
    },
    breadcrumbs([
      { name: SITE_NAME, path: '/' },
      { name: 'Posts', path: '/posts' },
    ]),
  ];
}

export function postJsonLd(post: {
  title: string;
  description: string;
  path: string;
  date: string;
  image: string;
}): JsonLdNode[] {
  const url = absoluteUrl(post.path);
  return [
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      url,
      mainEntityOfPage: url,
      headline: post.title,
      description: post.description,
      image: absoluteUrl(post.image),
      datePublished: post.date,
      inLanguage: 'ko-KR',
      author: ref(PERSON_ID),
      publisher: ref(PERSON_ID),
      isPartOf: ref(`${SITE_URL}/posts#blog`),
    },
    breadcrumbs([
      { name: SITE_NAME, path: '/' },
      { name: 'Posts', path: '/posts' },
      { name: post.title, path: post.path },
    ]),
  ];
}

/**
 * `<script type="application/ld+json">` 에 그대로 넣을 문자열.
 * `<` 를 이스케이프해 본문 문자열에 `</script>` 가 섞여도 태그가 닫히지 않게 한다.
 */
export function serializeJsonLd(nodes: JsonLdNode[]): string {
  const graph = { '@context': 'https://schema.org', '@graph': [website, person, ...nodes] };
  return JSON.stringify(graph).replace(/</g, '\\u003c');
}
