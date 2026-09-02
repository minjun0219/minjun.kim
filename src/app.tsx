import { Hono } from "hono";
import type { Child } from "hono/jsx";
import { ssgParams } from "hono/ssg";
import Document from "@/components/Document";
import Layout from "@/components/Layout";
import Home from "@/containers/Home";
import NotFound from "@/containers/NotFound";
import Post from "@/containers/Post";
import Posts from "@/containers/Posts";
import Resume from "@/containers/Resume";
import { getAllPosts, getExcerpt, getPostBySlug } from "@/lib/blog";
import { renderPostHtml } from "@/lib/blog/markdown";
import type { BuildAssets } from "@/lib/build";
import { type PageMeta, resolveMeta } from "@/lib/meta";
import { getResume } from "@/lib/resume";
import { renderFeed } from "@/lib/seo/feed";
import { renderRobots } from "@/lib/seo/robots";
import { renderSitemap } from "@/lib/seo/sitemap";

/**
 * 라우트 정의. `scripts/ssg.mjs` 가 빌드 산출물 경로를 넣어 만든 뒤 `toSSG` 로
 * 전 페이지를 뽑는다 — 런타임 서버는 없다(Cloudflare Workers assets-only).
 */
export function createApp(build: BuildAssets) {
  const app = new Hono();

  function page(meta: PageMeta, body: Child, pageId?: string) {
    return (
      <Document meta={resolveMeta(meta)} pageId={pageId} build={build}>
        {body}
      </Document>
    );
  }

  app.get("/", (c) => c.html(page({ path: "/" }, <Home />)));

  app.get("/posts", (c) =>
    c.html(
      page(
        { title: "Posts", path: "/posts" },
        <Layout>
          <Posts />
        </Layout>,
      ),
    ),
  );

  app.get("/resume", async (c) => {
    const { content, updatedAt } = getResume();
    const html = await renderPostHtml(content, build);

    return c.html(
      page(
        { title: "이력서", description: "김민준 이력서", path: "/resume" },
        <Layout>
          <Resume html={html} updatedAt={updatedAt} />
        </Layout>,
      ),
    );
  });

  // `/posts/:slug` 보다 먼저 등록해야 피드가 slug 로 잡히지 않는다.
  app.get("/posts/feed.xml", async (c) => {
    return c.body(await renderFeed(build), 200, {
      "Content-Type": "application/rss+xml; charset=utf-8",
    });
  });

  app.get(
    "/posts/:slug",
    ssgParams(() => getAllPosts().map((post) => ({ slug: post.slug }))),
    async (c) => {
      const slug = c.req.param("slug");
      const post = getPostBySlug(slug);
      const [html, description] = await Promise.all([
        renderPostHtml(post.content, build),
        getExcerpt(post.content),
      ]);

      return c.html(
        page(
          {
            title: post.title,
            description,
            path: `/posts/${slug}`,
            ogType: "article",
            ogImage: `/og/${slug}.png`,
            publishedTime: post.date,
            authors: post.author?.name ? [post.author.name] : undefined,
          },
          <Layout>
            <Post
              title={post.title}
              date={post.date}
              html={html}
              mediumUrl={post.mediumUrl}
            />
          </Layout>,
        ),
      );
    },
  );

  // Workers 의 `not_found_handling: "404-page"` 가 이 파일을 찾아 404 로 내려준다.
  app.get("/404", (c) =>
    c.html(
      page(
        {
          title: "페이지를 찾을 수 없습니다 (404)",
          path: "/404",
          noindex: true,
        },
        <Layout>
          <NotFound />
        </Layout>,
        "not-found",
      ),
    ),
  );

  app.get("/sitemap.xml", (c) =>
    c.body(renderSitemap(), 200, { "Content-Type": "application/xml" }),
  );

  app.get("/robots.txt", (c) =>
    c.body(renderRobots(), 200, {
      "Content-Type": "text/plain; charset=utf-8",
    }),
  );

  return app;
}
