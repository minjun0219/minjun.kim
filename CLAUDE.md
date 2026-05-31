# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`minjun.kim` is a personal blog/portfolio site (Korean, `ko_KR`) built with Next.js 16 (App Router) and React 18. Content is authored as Markdown and statically generated — there is no runtime CMS or database despite the legacy `WORDPRESS_API_URL` env var.

## Commands

The package manager is **pnpm** (see `packageManager` in `package.json`); Node version is pinned in `.nvmrc` (24).

- `pnpm dev` — start the dev server
- `pnpm build` — production build (uploads Sentry sourcemaps when `SENTRY_*` env vars are set)
- `pnpm check` — Biome lint + format check (run this before committing)
- `pnpm check:fix` — auto-fix lint + format + organize imports
- `pnpm lint` / `pnpm lint:fix` — lint only
- `pnpm format` — format only

Linting/formatting is **Biome** (`biome.json`), not ESLint/Prettier. Note Biome excludes Markdown (`*.md`) and `pnpm-lock.yaml`. There is no test runner configured in this repo.

## Architecture

**Content as files.** All content lives in Markdown with YAML frontmatter, parsed via `gray-matter`:
- Blog posts: `_posts/*.md` → served at `/posts/[slug]`
- Resume: `_content/resume.md` → served at `/resume`

Data access is centralized in `src/lib/blog/api.ts` (uses `fast-glob` to discover post slugs) and `src/lib/resume/api.ts`. These read the filesystem at build time. Post pages set `dynamicParams = false` and use `generateStaticParams`, so **every post must exist as a file at build time** — there is no dynamic/incremental fetching.

**Routing/layout** is the Next.js App Router under `app/`. Site-wide metadata (OpenGraph, Twitter, RSS alternate, icons) is defined in `app/layout.tsx`. SEO/feed routes are generated programmatically: `app/sitemap.ts`, `app/robots.ts`, `app/posts/feed.xml/route.ts`, and per-post OG images at `app/posts/[slug]/opengraph-image.tsx`.

**UI structure** (path alias `@/*` → `src/*`):
- `src/components/*` — presentational components, each in its own folder with a co-located CSS Module (`*.module.css`) and an `index.ts` re-export
- `src/containers/*` — composed page sections (Header, Intro, Post, Posts)
- `src/lib/*` — pure helpers and data access (`siteConfig.ts`, `theme.ts`, blog/resume APIs, URL helpers)

**Site constants** (URL, name, description, author, locale, default OG image) are all in `src/lib/siteConfig.ts` — change them there, not inline.

**Theming.** Three-state cycle (`system`/`light`/`dark`) defined in `src/lib/theme.ts`. At runtime the `Header` (`src/containers/Header`) toggles the theme by cycling the value, writing it to `localStorage`, and setting the `data-theme` attribute on `<html>` (system = attribute removed). Note: a `NoFlashThemeScript` component (an inline, pre-paint `localStorage` reader) and a cookie-based `getPreferredTheme` Server Action (`app/actions.ts`) also exist but are **not currently wired into `app/layout.tsx`** — check before relying on them.

**Observability.** Sentry + PostHog are wired through Next.js instrumentation: `instrumentation-client.ts` (browser init), `instrumentation.ts` (`register` + `onRequestError`, server/edge), and `sentry.{server,edge}.config.ts`. `next.config.mjs` wraps the config with `withSentryConfig`. Configuration is driven by `NEXT_PUBLIC_*` env vars — see `.env.local.example`. Deploys target Vercel (`vercel.json`, `@vercel/analytics`, `@vercel/speed-insights`).

## Conventions

From `.github/copilot-instructions.md`:
- Respond in **Korean** when performing a code review.
- Follow the internal security checklist on review.
- Favor readability; avoid nested ternary operators.
