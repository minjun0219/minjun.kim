import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import strip from "strip-markdown";

export async function markdownToHtml(markdown: string): Promise<string> {
  const file = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: true })
    .process(markdown);
  return String(file);
}

export async function getExcerpt(
  markdown: string,
  length = 200,
): Promise<string> {
  const file = await remark().use(strip).process(markdown);
  const text = String(file).replace(/\s+/g, " ").trim();
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "…";
}
