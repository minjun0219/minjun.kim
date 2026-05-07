"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    // biome-ignore lint/a11y/useHtmlLang: lang은 app/layout.tsx의 루트 html 요소에서 지정됨
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
