import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const src = fileURLToPath(new URL("./src", import.meta.url));

/** 브라우저로 나가는 유일한 자체 번들(테마 토글 + htmx 훅 + 관측 도구). */
export default defineConfig({
  resolve: {
    alias: { "@": src },
  },
  build: {
    outDir: "dist-client",
    emptyOutDir: true,
    manifest: true,
    copyPublicDir: false,
    rollupOptions: {
      input: "src/client/main.ts",
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
