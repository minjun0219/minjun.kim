import * as Sentry from "@sentry/nextjs";
import type { PostHog } from "posthog-node";

let posthogServer: PostHog | undefined;

export const onRequestError: typeof Sentry.captureRequestError = async (
  err,
  request,
  context,
) => {
  if (posthogServer && err instanceof Error) {
    try {
      posthogServer.captureException(err);
      await posthogServer.flush();
    } catch (posthogError) {
      console.error("PostHog captureException failed:", posthogError);
    }
  }
  return Sentry.captureRequestError(err, request, context);
};

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      const { PostHog } = await import("posthog-node");
      posthogServer = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      });
    }
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
