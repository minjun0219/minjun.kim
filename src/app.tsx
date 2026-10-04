import { Hono } from 'hono';
import type { Child } from 'hono/jsx';
import { ssgParams } from 'hono/ssg';
import Document, { type Props as DocumentProps } from '@/components/Document';
import Layout from '@/components/Layout';
import Home from '@/containers/Home';
import MarkdownPage from '@/containers/MarkdownPage';
import Notes from '@/containers/Notes';
import NotFound from '@/containers/NotFound';
import Post from '@/containers/Post';
import Posts from '@/containers/Posts';
import { getAllPosts, getExcerpt, getPostBySlug, getPostListing } from '@/lib/blog';
import { renderPostHtml } from '@/lib/blog/markdown';
import type { BuildAssets } from '@/lib/build';
import { getDoc } from '@/lib/content';
import { type PageMeta, resolveMeta } from '@/lib/meta';
import { getAllNotes, getNote, notePath } from '@/lib/notes';
import { renderFeed } from '@/lib/seo/feed';
import {
  postMarkdownPath,
  RESUME_MARKDOWN_PATH,
  renderLlmsFullTxt,
  renderLlmsTxt,
  renderPostMarkdown,
  renderResumeMarkdown,
} from '@/lib/seo/llms';
import { renderRobots } from '@/lib/seo/robots';
import { renderSitemap } from '@/lib/seo/sitemap';
import {
  aboutJsonLd,
  homeJsonLd,
  noteJsonLd,
  notesJsonLd,
  postJsonLd,
  postsJsonLd,
  projectsJsonLd,
  resumeJsonLd,
} from '@/lib/seo/structuredData';

const TEXT_PLAIN = { 'Content-Type': 'text/plain; charset=utf-8' };
const TEXT_MARKDOWN = { 'Content-Type': 'text/markdown; charset=utf-8' };

/**
 * 라우트 정의. `scripts/ssg.mjs` 가 빌드 산출물 경로를 넣어 만든 뒤 `toSSG` 로
 * 전 페이지를 뽑는다 — 런타임 서버는 없다(Cloudflare Workers assets-only).
 */
export function createApp(build: BuildAssets) {
  const app = new Hono();

  type PageOptions = Pick<DocumentProps, 'pageId' | 'preloadImages'>;

  function page(meta: PageMeta, body: Child, options: PageOptions = {}) {
    return (
      <Document meta={resolveMeta(meta)} build={build} {...options}>
        {body}
      </Document>
    );
  }

  app.get('/', (c) => c.html(page({ path: '/', jsonLd: homeJsonLd() }, <Home />)));

  app.get('/posts', (c) =>
    c.html(
      page(
        {
          title: 'Posts',
          description:
            '김민준의 개발 블로그 글 목록 — 웹, 프론트엔드, 그리고 만든 것들에 대한 기록.',
          path: '/posts',
          // 외부 매체에 실린 글은 이 블로그의 BlogPosting 이 아니므로 뺀다
          jsonLd: postsJsonLd(getPostListing().filter((post) => !post.source)),
        },
        <Layout>
          <Posts />
        </Layout>,
      ),
    ),
  );

  app.get('/about', async (c) => {
    const { content, updatedAt } = getDoc('about');
    const { html } = await renderPostHtml(content, build);

    return c.html(
      page(
        {
          title: 'About',
          description: '프론트엔드 엔지니어 김민준이 만들고 있는 것과 연락처를 담았습니다.',
          path: '/about',
          jsonLd: aboutJsonLd({ updatedAt }),
        },
        <Layout>
          <MarkdownPage html={html} updatedAt={updatedAt} />
        </Layout>,
      ),
    );
  });

  // 사이트 내 진입점은 아직 없다. 색인은 유지한다. 링크한 앱은 다른 Worker 가 서빙한다(`APP_PATHS`).
  app.get('/projects', async (c) => {
    const { content, updatedAt } = getDoc('projects');
    const { html } = await renderPostHtml(content, build);

    return c.html(
      page(
        {
          title: 'Projects',
          description: '김민준이 만들어 운영하는 도구들 — mdwire, ogpeek.',
          path: '/projects',
          jsonLd: projectsJsonLd({ updatedAt }),
        },
        <Layout>
          <MarkdownPage html={html} updatedAt={updatedAt} />
        </Layout>,
      ),
    );
  });

  // 공개 학습 노트. 사이트 내 진입점은 아직 없다 — 주소를 아는 사람만, 색인은 유지한다.
  app.get('/notes', (c) => {
    const notes = getAllNotes();

    return c.html(
      page(
        {
          title: 'Notes',
          description: '김민준의 학습 노트 — 공부하며 정리한 것들.',
          path: '/notes',
          // 노트가 하나도 없을 때 빈 목록이 색인되지 않게 한다
          noindex: notes.length === 0,
          jsonLd: notesJsonLd(
            notes.map((note) => ({
              title: note.title,
              url: notePath(note),
              updatedAt: note.updatedAt,
            })),
          ),
        },
        <Layout>
          <Notes />
        </Layout>,
      ),
    );
  });

  app.get(
    '/notes/:topic/:slug',
    ssgParams(() => getAllNotes().map(({ topic, slug }) => ({ topic, slug }))),
    async (c) => {
      const note = getNote(c.req.param('topic'), c.req.param('slug'));
      const path = notePath(note);
      const [{ html, images }, description] = await Promise.all([
        renderPostHtml(note.content, build),
        getExcerpt(note.content),
      ]);

      return c.html(
        page(
          {
            title: note.title,
            description,
            path,
            ogType: 'article',
            jsonLd: noteJsonLd({ title: note.title, description, path, updatedAt: note.updatedAt }),
          },
          <Layout>
            <Post title={note.title} date={note.updatedAt} html={html} />
          </Layout>,
          { preloadImages: images },
        ),
      );
    },
  );

  // 사이트 내 진입점은 없다(취업 지원 시 URL 을 직접 건넨다). 색인은 유지한다.
  app.get('/resume', async (c) => {
    const { content, updatedAt } = getDoc('resume');
    const { html } = await renderPostHtml(content, build);

    return c.html(
      page(
        {
          title: '이력서',
          description:
            '프론트엔드 엔지니어 김민준의 이력서입니다. 경력, 사이드 프로젝트, 스킬, 연락처를 담았습니다.',
          path: '/resume',
          markdownPath: RESUME_MARKDOWN_PATH,
          jsonLd: resumeJsonLd({ updatedAt }),
        },
        <Layout>
          <MarkdownPage html={html} updatedAt={updatedAt} />
        </Layout>,
      ),
    );
  });

  app.get(RESUME_MARKDOWN_PATH, (c) => c.body(renderResumeMarkdown(), 200, TEXT_MARKDOWN));

  // `/posts/:slug` 보다 먼저 등록해야 피드가 slug 로 잡히지 않는다.
  app.get('/posts/feed.xml', async (c) => {
    return c.body(await renderFeed(build), 200, {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    });
  });

  // 글 페이지와 그 Markdown 사본(`/posts/<slug>.md`)을 한 라우트에서 낸다. 사본을
  // `/posts/:file{.+\\.md}` 로 따로 두면 toSSG 가 파라미터 수집 요청을 이 라우트로 흘려
  // 아무 파일도 만들지 않는다(에러 없이).
  app.get(
    '/posts/:slug',
    ssgParams(() =>
      getAllPosts().flatMap((post) => [{ slug: post.slug }, { slug: `${post.slug}.md` }]),
    ),
    async (c) => {
      const param = c.req.param('slug');
      if (param.endsWith('.md')) {
        const markdown = renderPostMarkdown(param.slice(0, -'.md'.length), build.images);
        return c.body(markdown, 200, TEXT_MARKDOWN);
      }

      const slug = param;
      const post = getPostBySlug(slug);
      const [{ html, images }, description] = await Promise.all([
        renderPostHtml(post.content, build),
        getExcerpt(post.content),
      ]);

      return c.html(
        page(
          {
            title: post.title,
            description,
            path: `/posts/${slug}`,
            ogType: 'article',
            ogImage: `/og/${slug}.png`,
            publishedTime: post.date,
            authors: post.author?.name ? [post.author.name] : undefined,
            markdownPath: postMarkdownPath(slug),
            jsonLd: postJsonLd({
              title: post.title,
              description,
              path: `/posts/${slug}`,
              date: post.date,
              image: `/og/${slug}.png`,
            }),
          },
          <Layout>
            <Post title={post.title} date={post.date} html={html} mediumUrl={post.mediumUrl} />
          </Layout>,
          { preloadImages: images },
        ),
      );
    },
  );

  // Workers 의 `not_found_handling: "404-page"` 가 이 파일을 찾아 404 로 내려준다.
  app.get('/404', (c) =>
    c.html(
      page(
        {
          title: '페이지를 찾을 수 없습니다 (404)',
          path: '/404',
          noindex: true,
        },
        <Layout>
          <NotFound />
        </Layout>,
        { pageId: 'not-found' },
      ),
    ),
  );

  app.get('/sitemap.xml', (c) =>
    c.body(renderSitemap(), 200, { 'Content-Type': 'application/xml' }),
  );

  app.get('/robots.txt', (c) => c.body(renderRobots(), 200, TEXT_PLAIN));

  app.get('/llms.txt', async (c) => c.body(await renderLlmsTxt(), 200, TEXT_PLAIN));

  app.get('/llms-full.txt', (c) => c.body(renderLlmsFullTxt(build.images), 200, TEXT_PLAIN));

  return app;
}
