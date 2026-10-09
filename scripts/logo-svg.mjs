import { readFile, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import opentype from 'opentype.js';

/**
 * 한글날 로고(`src/components/Logo`)의 SVG 윤곽을 만든다.
 *
 * 나눔스퀘어라운드 Regular(`NanumSquareRoundR.ttf`)의 글리프 윤곽을 뽑아
 * `src/components/Logo/hangulMark.ts` 로 쓴다. 1년에 하루 쓰는 로고 때문에 폰트 파일·@font-face·
 * preload 를 두지 않으려는 것이다. 빌드 중에는 돌지 않는다 — 로고 글자를 바꿀 때만 다시 실행해
 * 결과를 커밋한다.
 *
 *     node scripts/logo-svg.mjs <NanumSquareRoundR.ttf> [--text 김.민준]
 *
 * 좌표는 1em = 100 단위의 정수다. viewBox 는 글꼴의 ascent·descent 를 그대로 써서 기준선이 y=0 이고,
 * 같은 값으로 CSS 높이·vertical-align 을 함께 내보내 SVG 가 글자처럼 줄에 앉는다.
 *
 * 원본 TTF 는 네이버 한글 사이트(https://hangeul.naver.com) 배포본을 쓴다. 지금 커밋된 파일은 npm
 * `typeface-nanum-square-round@1.0.2` 에 든 같은 원본(name ID 3 `1.000;SAND;NanumSquareRoundR;170922_01`)
 * 에서 만들었다.
 */
const DEFAULT_TEXT = '김.민준';
const UNITS_PER_EM = 100;
const OUT = new URL('../src/components/Logo/hangulMark.ts', import.meta.url);

// viewBox 는 반올림하지 않는다 — 높이가 CSS height 와 어긋나면 기준선이 틀어진다
const exact = (value) => String(Number(value.toFixed(2)));
const em = (value) => `${Number(value.toFixed(3))}em`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { text: { type: 'string', default: DEFAULT_TEXT } },
});
const [source] = positionals;
if (!source) {
  console.error('사용법: node scripts/logo-svg.mjs <NanumSquareRoundR.ttf> [--text 김.민준]');
  process.exit(1);
}
const text = values.text;

const file = await readFile(source);
const font = opentype.parse(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const missing = [...new Set(text)].filter((ch) => font.charToGlyphIndex(ch) === 0);
if (missing.length > 0) {
  throw new Error(`원본 폰트에 없는 글자: ${missing.join(' ')}`);
}

const scale = UNITS_PER_EM / font.unitsPerEm;
const ascent = font.tables.hhea.ascender * scale;
const descent = font.tables.hhea.descender * scale;

let x = 0;
const glyphs = [...text].map((ch) => {
  const glyph = font.charToGlyph(ch);
  // getPath 는 y 가 아래로 커지는 화면 좌표라 기준선을 y=0 에 둔다. 객체 옵션은 기본으로 y 를 뒤집으므로 끈다
  const d = glyph.getPath(x, 0, UNITS_PER_EM).toPathData({ decimalPlaces: 0, flipY: false });
  x += glyph.advanceWidth * scale;
  return { d, dot: ch === '.' };
});

const viewBox = `0 ${exact(-ascent)} ${exact(x)} ${exact(ascent - descent)}`;
const lines = [
  '// scripts/logo-svg.mjs 가 만든 파일이다 — 손으로 고치지 않는다.',
  '',
  '/** 나눔스퀘어라운드 Regular 로 그린 한글날 로고. 1em = 100 단위, 기준선 y=0 */',
  'export const HANGUL_MARK = {',
  `  label: '${text}',`,
  `  viewBox: '${viewBox}',`,
  `  height: '${em((ascent - descent) / UNITS_PER_EM)}',`,
  `  verticalAlign: '${em(descent / UNITS_PER_EM)}',`,
  '  glyphs: [',
  ...glyphs.flatMap(({ d, dot }) => ['    {', `      d: '${d}',`, `      dot: ${dot},`, '    },']),
  '  ],',
  '} as const;',
  '',
];
await writeFile(OUT, lines.join('\n'));
console.log(`${OUT.pathname}: ${lines.join('\n').length} chars`);
