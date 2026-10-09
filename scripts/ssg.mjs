import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import fsPromises, { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { toSSG } from 'hono/ssg';

const OUT_DIR = 'dist';
const SSR_DIR = 'dist-ssr';
const CLIENT_DIR = 'dist-client';

/**
 * htmx 본체와 확장은 CDN 대신 직접 번들해 서빙한다.
 * htmx 4 부터 확장이 본체 패키지에 동봉돼 별도 npm 패키지가 필요 없다.
 *
 * 파일명에 버전을 박는 이유: `_headers` 가 `/vendor/*` 를 `immutable` 로 캐시한다.
 * 이름이 버전과 무관하면 htmx 를 올려도 브라우저가 옛 버전을 1년간 붙들고,
 * 새 확장이 옛 코어 위에 얹혀 깨진다. immutable 은 URL 이 내용에 고정될 때만 안전하다.
 */
const VENDOR_SOURCES = [
  'htmx.org/dist/htmx.min.js',
  'htmx.org/dist/ext/hx-preload.min.js',
  'htmx.org/dist/ext/hx-head.min.js',
];

/**
 * hono/css 가 조용히 실패하는 모드를 빌드에서 잡는다.
 *
 * `<Style>` 누락·전역 블록 안의 개행·스트리밍 청크 같은 상황에서 hono/css 는 에러 대신
 * `<script>document.querySelector('#hono-css')…</script>` 폴백을 내거나 전역 규칙을
 * 통째로 버린다. 브라우저에선 스타일이 "대체로" 먹어 보이니 여기서 문자열로 단언한다.
 *
 * 이 사이트 스타일은 전부 hono/css 인라인이라 `<link rel="stylesheet">` 는 `allowedStylesheets`
 * (Pretendard @font-face 스타일시트)만 허용한다.
 */
async function assertInlineStyles(dir, allowedStylesheets) {
  const problems = [];
  for (const file of await listHtmlFiles(dir)) {
    const html = await readFile(file, 'utf8');
    const styles = html.match(/<style id="hono-css">[\s\S]*?<\/style>/g) ?? [];
    if (styles.length !== 1) {
      problems.push(`${file}: <style id="hono-css"> 가 ${styles.length}개`);
      continue;
    }
    if (styles[0].includes('\n')) {
      problems.push(`${file}: 인라인 스타일에 개행 — 전역 블록이 깨졌다`);
    }
    for (const bad of [':-hono-global', "#hono-css')", 'undefined</style>']) {
      if (html.includes(bad)) {
        problems.push(`${file}: "${bad}" 발견`);
      }
    }
    for (const [link] of html.matchAll(/<link rel="stylesheet"[^>]*>/g)) {
      const href = link.match(/href="([^"]*)"/)?.[1];
      if (!allowedStylesheets.includes(href)) {
        problems.push(`${file}: 허용 목록 밖의 스타일시트 ${href}`);
      }
    }
  }
  if (problems.length > 0) {
    throw new Error(`인라인 스타일 단언 실패:\n${problems.join('\n')}`);
  }
}

async function listHtmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listHtmlFiles(path)));
    } else if (entry.name.endsWith('.html')) {
      out.push(path);
    }
  }
  return out;
}

async function findClientEntry() {
  const manifest = JSON.parse(await readFile(join(CLIENT_DIR, '.vite', 'manifest.json'), 'utf8'));
  const entry = Object.values(manifest).find((chunk) => chunk.isEntry);
  if (!entry) {
    throw new Error('클라이언트 매니페스트에서 엔트리를 찾지 못했다');
  }
  return entry.file;
}

/**
 * Nunito woff2 를 @fontsource/nunito 에서, Pretendard 가변 dynamic subset 을 pretendard 에서, 로고 한글
 * 서브셋을 `src/assets/fonts/` 에서 dist/fonts/ 로 복사한다. vendor 와 같은 이유로 경로에 버전을
 * 박는다 — `/fonts/*` 가 immutable 이라 이름이 고정이면 폰트를 갱신해도 브라우저가 옛 파일을 1년간
 * 붙든다. 로고 서브셋은 패키지 버전이 없으니(`scripts/logo-font.py` 가 만들어 커밋한다) 글 이미지처럼
 * 내용 해시를 박는다.
 */
async function copyFonts() {
  const pkg = 'node_modules/@fontsource/nunito';
  const version = JSON.parse(await readFile(join(pkg, 'package.json'), 'utf8')).version;
  await mkdir(join(OUT_DIR, 'fonts'), { recursive: true });
  const copy = async (weight) => {
    const to = `nunito-latin-${weight}-normal-${version}.woff2`;
    await cp(join(pkg, 'files', `nunito-latin-${weight}-normal.woff2`), join(OUT_DIR, 'fonts', to));
    return `/fonts/${to}`;
  };

  // CSS 가 글자 묶음을 `./woff2-dynamic-subset/…` 상대 경로로 가리키므로 폴더 구조째 옮긴다
  const pretendard = 'node_modules/pretendard';
  const pretendardVersion = JSON.parse(
    await readFile(join(pretendard, 'package.json'), 'utf8'),
  ).version;
  const pretendardFrom = join(pretendard, 'dist/web/variable');
  const pretendardTo = join(OUT_DIR, 'fonts', `pretendard-${pretendardVersion}`);
  const pretendardCss = 'pretendardvariable-dynamic-subset.css';
  const pretendardSubsets = 'woff2-dynamic-subset';
  await cp(join(pretendardFrom, pretendardSubsets), join(pretendardTo, pretendardSubsets), {
    recursive: true,
  });
  await cp(join(pretendardFrom, pretendardCss), join(pretendardTo, pretendardCss));

  const logo = await readFile('src/assets/fonts/logo-hangul.woff2');
  const logoTo = `logo-hangul-${createHash('sha256').update(logo).digest('hex').slice(0, 8)}.woff2`;
  await writeFile(join(OUT_DIR, 'fonts', logoTo), logo);

  return {
    nunitoRegular: await copy(400),
    nunitoBold: await copy(700),
    logoHangul: `/fonts/${logoTo}`,
    pretendardStylesheet: `/fonts/pretendard-${pretendardVersion}/${pretendardCss}`,
  };
}

async function main() {
  // Vite 는 .env 를 import.meta.env 에만 싣는다. 이 프로세스가 렌더하는 Document 는
  // process.env(NAVER_SITE_VERIFICATION, GA_MEASUREMENT_ID, HOMEPAGE)를 읽으므로
  // 로컬 파일을 직접 올린다.
  // 이미 있는 값(CI 환경변수)은 덮어쓰지 않는다.
  if (existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  }
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(join(OUT_DIR, 'assets'), { recursive: true });
  await mkdir(join(OUT_DIR, 'vendor'), { recursive: true });

  // 정적 자산: public/ → dist/
  await cp('public', OUT_DIR, { recursive: true });

  const { buildImageManifest } = await import(`../${SSR_DIR}/images.js`);
  const images = await buildImageManifest(OUT_DIR);
  console.log(`글 이미지 ${Object.keys(images).length}개 변환`);

  const clientEntry = await findClientEntry();
  await cp(join(CLIENT_DIR, 'assets'), join(OUT_DIR, 'assets'), {
    recursive: true,
  });

  const htmxVersion = JSON.parse(
    await readFile('node_modules/htmx.org/package.json', 'utf8'),
  ).version;
  const vendorScriptSrcs = [];
  for (const from of VENDOR_SOURCES) {
    const base = from
      .split('/')
      .pop()
      .replace(/\.min\.js$/, '');
    const to = `${base}-${htmxVersion}.min.js`;
    await cp(join('node_modules', from), join(OUT_DIR, 'vendor', to));
    vendorScriptSrcs.push(`/vendor/${to}`);
  }

  const fontSrcs = await copyFonts();

  const { createApp } = await import(`../${SSR_DIR}/app.js`);
  const app = createApp({
    images,
    clientScriptSrc: `/${clientEntry}`,
    vendorScriptSrcs,
    fontSrcs,
  });

  const result = await toSSG(app, fsPromises, {
    dir: OUT_DIR,
    // 기본 맵을 통째로 대체하므로 text/html 도 직접 넣어야 한다(빠뜨리면 .htm 으로 떨어진다).
    extensionMap: {
      'text/html': 'html',
      'application/rss+xml': 'xml',
      'application/xml': 'xml',
      'text/plain': 'txt',
      'text/markdown': 'md',
    },
  });

  if (!result.success) {
    console.error(result.error);
    process.exit(1);
  }
  console.log(`정적 페이지 ${result.files.length}개 생성`);
  await assertInlineStyles(OUT_DIR, [fontSrcs.pretendardStylesheet]);

  const { generateOgImages } = await import(`../${SSR_DIR}/og.js`);
  const ogImages = await generateOgImages(OUT_DIR);
  console.log(`OG 이미지 ${ogImages.length}개 생성`);
}

await main();
