import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: "/blog/2020/05/24/next-js-wp-graphql-static-blog",
        destination: "/posts/next-js-wp-graphql-static-blog",
        permanent: true,
      },
      // 옛 underfront.com WordPress 아카이브 퍼머링크 → 복원된 글
      // /archives/:id, /wp/archives/:id, /blog/archives/:id 를 모두 매칭
      {
        source: "/:prefix(wp|blog)?/archives/31",
        destination: "/posts/frontend-development-and-web-publishing",
        permanent: true,
      },
      {
        source: "/:prefix(wp|blog)?/archives/:id(40|706)",
        destination: "/posts/voiceover-on-mac-os-x-lion",
        permanent: true,
      },
      {
        source: "/:prefix(wp|blog)?/archives/302",
        destination: "/posts/1px-on-retina-display",
        permanent: true,
      },
      {
        source: "/:prefix(wp|blog)?/archives/330",
        destination: "/posts/flava-clipper-postmortem",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
