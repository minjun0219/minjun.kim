import fsPromises, { cp, mkdir, readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { toSSG } from "hono/ssg";

const OUT_DIR = "dist";
const SSR_DIR = "dist-ssr";
const CLIENT_DIR = "dist-client";

/** htmx 본체와 확장은 CDN 대신 직접 번들해 서빙한다. */
const VENDOR_FILES = [
  ["htmx.org/dist/htmx.min.js", "htmx.min.js"],
  ["htmx-ext-preload/dist/preload.min.js", "preload.min.js"],
  ["htmx-ext-head-support/dist/head-support.min.js", "head-support.min.js"],
];

async function findEmittedCss() {
  const dir = join(SSR_DIR, "assets");
  const files = (await readdir(dir)).filter((name) => name.endsWith(".css"));
  if (files.length !== 1) {
    throw new Error(
      `CSS 자산이 정확히 1개일 것으로 기대했지만 ${files.length}개다: ${files.join(", ")}`,
    );
  }
  return files[0];
}

async function findClientEntry() {
  const manifest = JSON.parse(
    await readFile(join(CLIENT_DIR, ".vite", "manifest.json"), "utf8"),
  );
  const entry = Object.values(manifest).find((chunk) => chunk.isEntry);
  if (!entry) throw new Error("클라이언트 매니페스트에서 엔트리를 찾지 못했다");
  return entry.file;
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(join(OUT_DIR, "assets"), { recursive: true });
  await mkdir(join(OUT_DIR, "vendor"), { recursive: true });

  // 정적 자산: public/ → dist/
  await cp("public", OUT_DIR, { recursive: true });

  const cssFile = await findEmittedCss();
  await cp(join(SSR_DIR, "assets", cssFile), join(OUT_DIR, "assets", cssFile));

  const clientEntry = await findClientEntry();
  await cp(join(CLIENT_DIR, "assets"), join(OUT_DIR, "assets"), {
    recursive: true,
  });

  for (const [from, to] of VENDOR_FILES) {
    await cp(join("node_modules", from), join(OUT_DIR, "vendor", to));
  }

  const { default: app, setAssetPaths } = await import(`../${SSR_DIR}/app.js`);
  setAssetPaths({
    stylesheetHref: `/assets/${cssFile}`,
    clientScriptSrc: `/${clientEntry}`,
  });

  const result = await toSSG(app, fsPromises, {
    dir: OUT_DIR,
    // 기본 맵을 통째로 대체하므로 text/html 도 직접 넣어야 한다(빠뜨리면 .htm 으로 떨어진다).
    extensionMap: {
      "text/html": "html",
      "application/rss+xml": "xml",
      "application/xml": "xml",
      "text/plain": "txt",
    },
  });

  if (!result.success) {
    console.error(result.error);
    process.exit(1);
  }
  console.log(`정적 페이지 ${result.files.length}개 생성`);

  const { generateOgImages } = await import(`../${SSR_DIR}/og.js`);
  const images = await generateOgImages(OUT_DIR);
  console.log(`OG 이미지 ${images.length}개 생성`);
}

await main();
