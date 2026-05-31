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
      {
        source: "/:wp(wp)?/archives/31",
        destination: "/posts/frontend-development-and-web-publishing",
        permanent: true,
      },
      {
        source: "/:wp(wp)?/archives/706",
        destination: "/posts/voiceover-on-mac-os-x-lion",
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
