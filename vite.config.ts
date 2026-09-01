import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const src = fileURLToPath(new URL("./src", import.meta.url));

/**
 * SSR 전용 빌드. 결과 번들(`dist-ssr/app.js`)을 `build/ssg.mjs` 가 불러
 * Hono `toSSG` 로 정적 HTML 을 만든다.
 *
 * `@hono/vite-ssg` 를 쓰지 않는 이유: 해당 플러그인의 SSR 모듈 평가 경로가
 * `vite:css` 와 충돌해 CSS Modules 를 임포트하는 순간 빌드가 깨진다(Vite 7/8 공통).
 * 일반 SSR 빌드는 CSS Modules 를 정상 처리하므로 두 단계로 분리했다.
 */
export default defineConfig({
  resolve: {
    alias: { "@": src },
  },
  build: {
    ssr: true,
    outDir: "dist-ssr",
    emptyOutDir: true,
    ssrEmitAssets: true,
    manifest: true,
    copyPublicDir: false,
    rollupOptions: {
      input: { app: "src/app.tsx", og: "src/build/og.ts" },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
