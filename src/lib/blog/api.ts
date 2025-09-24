import fs from "node:fs";
import { join } from "node:path";

import fg from "fast-glob";
import matter from "gray-matter";

import type { Post } from "./types";

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
  return fg.sync("**/*.md", {
    cwd: postsDirectory,
    onlyFiles: true,
    ignore: ["README.md"],
  });
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  return { ...data, slug: realSlug, content } as Post;
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs.map((slug) => getPostBySlug(slug));
  return posts;
}
