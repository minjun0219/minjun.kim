import fs from 'node:fs';
import { join } from 'node:path';

import fg from 'fast-glob';
import matter from 'gray-matter';

import { EXTERNAL_POSTS } from './externalPosts';

import type { Post } from './types';

const postsDirectory = join(process.cwd(), '_posts');

export function getPostSlugs() {
  return fg.sync('**/*.md', {
    cwd: postsDirectory,
    onlyFiles: true,
    ignore: ['README.md'],
  });
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  return { ...data, slug: realSlug, content } as Post;
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs.map((slug) => getPostBySlug(slug));
  return posts;
}

export type PostListItem = {
  title: string;
  date: string;
  url: string;
  source?: string;
  mediumUrl?: string;
};

/**
 * `/posts` 목록에 쓸 항목. `_posts` 의 글과 외부에 실린 글을 날짜 내림차순으로 합친다.
 * 날짜가 같으면 slug 오름차순으로 고정해 빌드마다 순서가 흔들리지 않게 한다.
 */
export function getPostListing(): PostListItem[] {
  const internal: Array<PostListItem & { slug: string }> = getAllPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    url: `/posts/${post.slug}`,
    mediumUrl: post.mediumUrl,
  }));

  const external: Array<PostListItem & { slug: string }> = EXTERNAL_POSTS.map((post) => ({
    ...post,
    slug: '',
  }));

  return [...internal, ...external].sort((a, b) => {
    const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
    return diff !== 0 ? diff : a.slug.localeCompare(b.slug);
  });
}
