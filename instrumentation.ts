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
      // posthog-node@4.18 의 captureException 은 내부적으로 비동기 스택 파싱 후
      // 큐에 적재하지만 외부에는 void 로 노출돼 await 할 방법이 없다.
      // flush 전에 한 틱 양보해 이벤트가 큐에 들어가도록 한다.
      await new Promise((resolve) => setImmediate(resolve));
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
