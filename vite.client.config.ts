import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

const src = fileURLToPath(new URL('./src', import.meta.url));

/**
 * PostHog 은 통째로 꺼 둘 수 있다 — 키가 없으면 `initAnalytics` 가 그냥 빠진다.
 * 막아야 하는 건 **켜 두고 호스트만 빠뜨리는** 조합이다. posthog-js 의 자체 기본
 * `api_host` 가 `https://us.i.posthog.com` 이라, 그대로 두면 에러 없이 조직 공용
 * 프록시를 우회한 채 배포된다(광고 차단기에 그대로 노출된다).
 */
function assertPostHogEnv(env: Record<string, string>) {
  if (env.VITE_POSTHOG_KEY && !env.VITE_POSTHOG_HOST) {
    throw new Error(
      'VITE_POSTHOG_KEY 는 있는데 VITE_POSTHOG_HOST 가 비어 있다. ' +
        '.env.local 에 조직 공용 프록시(https://z.minjun.kim)를 적어라 — ' +
        '비워 두면 posthog-js 기본값으로 직접 전송되어 프록시를 우회한다.',
    );
  }
}

/** 브라우저로 나가는 유일한 자체 번들(테마 토글 + htmx 훅 + 관측 도구). */
export default defineConfig(({ mode }) => {
  assertPostHogEnv(loadEnv(mode, process.cwd(), 'VITE_'));

  return {
    resolve: {
      alias: { '@': src },
    },
    build: {
      outDir: 'dist-client',
      emptyOutDir: true,
      manifest: true,
      copyPublicDir: false,
      rollupOptions: {
        input: 'src/client/main.ts',
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
  };
});
