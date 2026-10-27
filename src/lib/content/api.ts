import fs from 'node:fs';
import { join } from 'node:path';

import matter from 'gray-matter';
import type { Lang } from '@/lib/i18n';

/**
 * `_content/*.md` — 글이 아닌 단일 문서 페이지(about, resume, partyline). 파일명이 곧 경로다.
 * 영어판은 `_content/en/<name>.md` 다(지금은 about 만 있다).
 */
export type DocName = 'about' | 'resume' | 'partyline';

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

export function getDoc(name: DocName, lang: Lang = 'ko'): Doc {
  const directory = lang === 'ko' ? '_content' : join('_content', lang);
  const fileContents = fs.readFileSync(join(process.cwd(), directory, `${name}.md`), 'utf8');
  const { data, content } = matter(fileContents);
  return {
    title: (data.title as string) ?? name,
    updatedAt: formatUpdatedAt(data.updatedAt),
    content,
  };
}
