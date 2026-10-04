import fs from 'node:fs';
import { join } from 'node:path';

import matter from 'gray-matter';

/** `_content/*.md` — 글이 아닌 단일 문서 페이지(about, resume, projects). 파일명이 곧 경로다. */
export type DocName = 'about' | 'projects' | 'resume';

export type Doc = {
  title: string;
  updatedAt?: string;
  content: string;
};

function formatUpdatedAt(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value);
}

export function getDoc(name: DocName): Doc {
  const fileContents = fs.readFileSync(join(process.cwd(), '_content', `${name}.md`), 'utf8');
  const { data, content } = matter(fileContents);
  return {
    title: (data.title as string) ?? name,
    updatedAt: formatUpdatedAt(data.updatedAt),
    content,
  };
}
