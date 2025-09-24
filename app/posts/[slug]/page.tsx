import BlogPost from "@/containers/Post";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: {
    slug: string;
  };
};

export default function ArticlePage({ params }: Props) {
  const post = getPostBySlug(params.slug);

  return <BlogPost {...post} />;
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const title = `${post.title} | minjun.kim`;

  return {
    title,
    openGraph: {
      title,
    },
  };
}

export function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
