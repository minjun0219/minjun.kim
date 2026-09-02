import fsPromises, { cp, mkdir, readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { toSSG } from "hono/ssg";

const OUT_DIR = "dist";
const SSR_DIR = "dist-ssr";
const CLIENT_DIR = "dist-client";

/**
 * htmx 본체와 확장은 CDN 대신 직접 번들해 서빙한다.
 * htmx 4 부터 확장이 본체 패키지에 동봉돼 별도 npm 패키지가 필요 없다.
 *
 * 파일명에 버전을 박는 이유: `_headers` 가 `/vendor/*` 를 `immutable` 로 캐시한다.
 * 이름이 버전과 무관하면 htmx 를 올려도 브라우저가 옛 버전을 1년간 붙들고,
 * 새 확장이 옛 코어 위에 얹혀 깨진다. immutable 은 URL 이 내용에 고정될 때만 안전하다.
 */
const VENDOR_SOURCES = [
  "htmx.org/dist/htmx.min.js",
  "htmx.org/dist/ext/hx-preload.min.js",
  "htmx.org/dist/ext/hx-head.min.js",
];

/**
 * hono/css 가 조용히 실패하는 모드를 빌드에서 잡는다.
 *
 * `<Style>` 누락·전역 블록 안의 개행·스트리밍 청크 같은 상황에서 hono/css 는 에러 대신
 * `<script>document.querySelector('#hono-css')…</script>` 폴백을 내거나 전역 규칙을
 * 통째로 버린다. 브라우저에선 스타일이 "대체로" 먹어 보이니 여기서 문자열로 단언한다.
 */
async function assertInlineStyles(dir) {
  const problems = [];
  for (const file of await listHtmlFiles(dir)) {
    const html = await readFile(file, "utf8");
    const styles = html.match(/<style id="hono-css">[\s\S]*?<\/style>/g) ?? [];
    if (styles.length !== 1) {
      problems.push(`${file}: <style id="hono-css"> 가 ${styles.length}개`);
      continue;
    }
    if (styles[0].includes("\n")) {
      problems.push(`${file}: 인라인 스타일에 개행 — 전역 블록이 깨졌다`);
    }
    for (const bad of [
      ":-hono-global",
      "#hono-css')",
      '<link rel="stylesheet"',
      "undefined</style>",
    ]) {
      if (html.includes(bad)) problems.push(`${file}: "${bad}" 발견`);
    }
  }
  if (problems.length > 0) {
    throw new Error(`인라인 스타일 단언 실패:\n${problems.join("\n")}`);
  }
}

async function listHtmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listHtmlFiles(path)));
    else if (entry.name.endsWith(".html")) out.push(path);
  }
  return out;
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

  const clientEntry = await findClientEntry();
  await cp(join(CLIENT_DIR, "assets"), join(OUT_DIR, "assets"), {
    recursive: true,
  });

  const htmxVersion = JSON.parse(
    await readFile("node_modules/htmx.org/package.json", "utf8"),
  ).version;
  const vendorScriptSrcs = [];
  for (const from of VENDOR_SOURCES) {
    const base = from
      .split("/")
      .pop()
      .replace(/\.min\.js$/, "");
    const to = `${base}-${htmxVersion}.min.js`;
    await cp(join("node_modules", from), join(OUT_DIR, "vendor", to));
    vendorScriptSrcs.push(`/vendor/${to}`);
  }

  const { createApp } = await import(`../${SSR_DIR}/app.js`);
  const app = createApp({
    clientScriptSrc: `/${clientEntry}`,
    vendorScriptSrcs,
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
  await assertInlineStyles(OUT_DIR);

  const { generateOgImages } = await import(`../${SSR_DIR}/og.js`);
  const images = await generateOgImages(OUT_DIR);
  console.log(`OG 이미지 ${images.length}개 생성`);
}

await main();
