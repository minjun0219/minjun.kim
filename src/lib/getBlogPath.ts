import { dateFormat } from "@/lib/utils/date";

export type GetBlogPathArgs = {
  date: string;
  slug: string;
};

export const defaultBlogPath = "/blog/[yyyy]/[mm]/[dd]/[slug]";

export function getBlogPath({ date, slug }: GetBlogPathArgs) {
  const created = dateFormat(date);
  return {
    href: defaultBlogPath,
    as: `/blog/${created}/${slug}`,
  };
}

export default getBlogPath;
