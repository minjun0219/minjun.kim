import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const src = fileURLToPath(new URL("./src", import.meta.url));

/**
 * SSR 전용 빌드. 결과 번들(`dist-ssr/app.js`)을 `scripts/ssg.mjs` 가 불러
 * Hono `toSSG` 로 정적 HTML 을 만든다.
 *
 * `@hono/vite-ssg` 를 쓰지 않는 이유: 클라이언트 번들·vendor 복사·OG 이미지는
 * 어차피 직접 돌려야 해서 플러그인을 얹어도 접착제가 줄지 않는다. 스타일은
 * hono/css 가 HTML 에 인라인하므로 이 빌드는 CSS 자산을 방출하지 않는다.
 */
export default defineConfig({
  resolve: {
    alias: { "@": src },
  },
  build: {
    ssr: true,
    outDir: "dist-ssr",
    emptyOutDir: true,
    copyPublicDir: false,
    rollupOptions: {
      input: { app: "src/app.tsx", og: "src/build/og.ts" },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
