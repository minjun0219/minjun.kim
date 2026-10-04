import fs from 'node:fs';
import { join } from 'node:path';

import fg from 'fast-glob';
import matter from 'gray-matter';

const notesDirectory = join(process.cwd(), '_content', 'notes');

/** URL 에 그대로 쓰이므로 소문자·숫자·하이픈만 허용한다. */
const SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** `_content/notes/<topic>/<slug>.md` → `/notes/<topic>/<slug>` */
export type Note = {
  topic: string;
  slug: string;
  title: string;
  /** `YYYY-MM-DD` — 목록 정렬·표시·sitemap `lastmod` */
  updatedAt: string;
  content: string;
};

function toDateString(value: unknown): string | undefined {
  // gray-matter 는 따옴표 없는 날짜를 Date 로 읽는다
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return typeof value === 'string' && DATE.test(value) ? value : undefined;
}

/**
 * 글(`getPostBySlug`)과 달리 frontmatter 를 검증한다 — 빠진 값이 정렬·sitemap 으로 조용히
 * 흘러가지 않고 빌드가 실패하게 한다.
 */
function readNote(file: string): Note {
  const [topic, name] = file.split('/');
  const slug = name.replace(/\.md$/, '');
  if (!SEGMENT.test(topic) || !SEGMENT.test(slug)) {
    throw new Error(`노트 경로는 소문자·숫자·하이픈만 쓴다: _content/notes/${file}`);
  }

  const { data, content } = matter(fs.readFileSync(join(notesDirectory, file), 'utf8'));
  const updatedAt = toDateString(data.updatedAt);
  if (typeof data.title !== 'string' || !data.title || !updatedAt) {
    throw new Error(
      `노트 frontmatter 에 title 과 updatedAt(YYYY-MM-DD)이 필요하다: _content/notes/${file}`,
    );
  }

  return { topic, slug, title: data.title, updatedAt, content };
}

/** 주제 오름차순, 같은 주제 안에서는 최근 수정 순. */
export function getAllNotes(): Note[] {
  const files = fg.sync('*/*.md', { cwd: notesDirectory, onlyFiles: true });
  return files
    .map(readNote)
    .sort(
      (a, b) =>
        a.topic.localeCompare(b.topic) ||
        b.updatedAt.localeCompare(a.updatedAt) ||
        a.slug.localeCompare(b.slug),
    );
}

export function getNote(topic: string, slug: string): Note {
  return readNote(`${topic}/${slug}.md`);
}

export function notePath(note: Pick<Note, 'topic' | 'slug'>): string {
  return `/notes/${note.topic}/${note.slug}`;
}
