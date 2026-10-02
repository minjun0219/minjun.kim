import { EXTERNAL_POSTS, getAllPosts, getExcerpt, getPostBySlug } from '@/lib/blog';
import type { Post } from '@/lib/blog/types';
import type { ImageManifest } from '@/lib/images';
import { getResume } from '@/lib/resume';
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

/*
 * LLM 이 읽기 좋은 사본들. https://llmstxt.org 규약을 따른다.
 *
 * - `/llms.txt`       — 사이트 개요와 각 문서의 Markdown 사본 링크
 * - `/llms-full.txt`  — 이력서와 모든 글의 Markdown 을 한 파일로 이어 붙인 것
 * - `<page>.md`       — 페이지와 같은 URL 에 `.md` 를 붙인 Markdown 사본
 *
 * 사본은 HTML 페이지와 내용이 겹치므로 `_headers` 에서 `X-Robots-Tag: noindex` 를 준다.
 */

/**
 * 본문의 `./images/<name>` 을 절대 URL 로 바꾼다. 상대 경로를 그대로 내보내면 리더가
 * 문서 URL 기준으로 잘못 해석한다. 페이지와 같은 webp 를 가리키도록 매니페스트를 탄다.
 */
export function resolveImagePaths(markdown: string, images: ImageManifest): string {
  return markdown.replace(/\]\(\.\/images\/([^)]+)\)/g, (_match, name) => {
    const asset = images[name];
    if (!asset) {
      throw new Error(`이미지 매니페스트에 없음: ${name}`);
    }
    return `](${SITE_URL}${asset.url})`;
  });
}

function byDateDesc(a: Post, b: Post): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

export function postMarkdownPath(slug: string): string {
  return `/posts/${slug}.md`;
}

export const RESUME_MARKDOWN_PATH = '/resume.md';

function renderPostDocument(post: Post, images: ImageManifest): string {
  const lines = [
    `# ${post.title}`,
    '',
    `- 작성일: ${post.date}`,
    `- 원문: ${SITE_URL}/posts/${post.slug}`,
  ];
  if (post.mediumUrl) {
    lines.push(`- Medium: ${post.mediumUrl}`);
  }
  return [...lines, '', resolveImagePaths(post.content, images).trim(), ''].join('\n');
}

export function renderPostMarkdown(slug: string, images: ImageManifest): string {
  return renderPostDocument(getPostBySlug(slug), images);
}

/** 이력서 본문은 이미 `# 김민준` 으로 시작하므로 출처만 덧붙인다. */
export function renderResumeMarkdown(): string {
  const { content, updatedAt } = getResume();
  const meta = [`> 원문: ${SITE_URL}/resume`];
  if (updatedAt) {
    meta.push(`> 마지막 업데이트: ${updatedAt}`);
  }
  return [content.trim(), '', ...meta, ''].join('\n');
}

export async function renderLlmsTxt(): Promise<string> {
  const posts = [...getAllPosts()].sort(byDateDesc);
  const postLines = await Promise.all(
    posts.map(async (post) => {
      const summary = await getExcerpt(post.content, 120);
      return `- [${post.title}](${SITE_URL}${postMarkdownPath(post.slug)}): ${post.date} — ${summary}`;
    }),
  );

  return [
    `# ${SITE_NAME}`,
    '',
    `> ${AUTHOR_NAME_KO}(${AUTHOR_NAME})의 개인 사이트. ${SITE_DESCRIPTION}`,
    '',
    `${AUTHOR_NAME_KO}은 ${AUTHOR_JOB_TITLE} 로 일하고 있다. 경력과 사이드 프로젝트는 이력서에,`,
    '글은 Posts 에 있다. 아래 링크는 모두 각 페이지의 Markdown 사본이며, 전체를 한 번에 읽으려면',
    `${SITE_URL}/llms-full.txt 를 쓴다. 사이트 본문은 한국어다.`,
    '',
    '## 소개',
    '',
    `- [이력서](${SITE_URL}${RESUME_MARKDOWN_PATH}): 경력, 사이드 프로젝트, 스킬, 연락처`,
    ...AUTHOR_PROFILES.map(({ name, url }) => `- [${name}](${url}): 외부 프로필`),
    `- [Email](mailto:${AUTHOR_EMAIL}): 연락처`,
    '',
    '## Posts',
    '',
    ...postLines,
    '',
    '## Optional',
    '',
    ...EXTERNAL_POSTS.map((post) => `- [${post.title}](${post.url}): ${post.date}, ${post.source}`),
    `- [RSS](${SITE_URL}/posts/feed.xml): 글 피드`,
    '',
  ].join('\n');
}

export function renderLlmsFullTxt(images: ImageManifest): string {
  const posts = [...getAllPosts()].sort(byDateDesc);
  return [renderResumeMarkdown(), ...posts.map((post) => renderPostDocument(post, images))].join(
    '\n---\n\n',
  );
}
