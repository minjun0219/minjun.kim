import { ImageResponse } from "next/og";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { SITE_NAME } from "@/lib/siteConfig";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export const alt = SITE_NAME;

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function OpengraphImage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const formattedDate = new Date(post.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 32,
            opacity: 0.85,
            letterSpacing: "0.02em",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          {post.title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            opacity: 0.7,
          }}
        >
          {formattedDate}
        </div>
      </div>
    ),
    { ...size },
  );
}
