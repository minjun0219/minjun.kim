import fs from "node:fs";
import { join } from "node:path";

import matter from "gray-matter";

const resumePath = join(process.cwd(), "_content", "resume.md");

export type Resume = {
  title: string;
  updatedAt?: string;
  content: string;
};

function formatUpdatedAt(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value);
}

export function getResume(): Resume {
  const fileContents = fs.readFileSync(resumePath, "utf8");
  const { data, content } = matter(fileContents);
  return {
    title: (data.title as string) ?? "이력서",
    updatedAt: formatUpdatedAt(data.updatedAt),
    content,
  };
}
