import type { Metadata } from "next";
import BlogPost from "@/containers/Post";
import { getAllPosts, getExcerpt, getPostBySlug } from "@/lib/blog";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return <BlogPost {...post} />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const description = await getExcerpt(post.content);
  const url = `/posts/${slug}`;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      publishedTime: post.date,
      authors: [post.author?.name].filter(
        (name): name is string => typeof name === "string",
      ),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
