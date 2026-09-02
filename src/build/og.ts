import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { getAllPosts } from '@/lib/blog';
import { SITE_NAME } from '@/lib/siteConfig';

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * Nunito 에는 한글 글리프가 없어 글 제목이 두부로 나온다.
 * satori 는 woff2 를 못 읽으므로 OTF 인 Pretendard 를 쓴다(빌드타임 전용, 브라우저로 안 나감).
 */
const FONT_DIR = 'node_modules/pretendard/dist/public/static';

type SatoriNode = {
  type: string;
  props: Record<string, unknown> & { children?: unknown };
};

function el(type: string, props: Record<string, unknown>, children?: unknown): SatoriNode {
  return { type, props: { ...props, children } };
}

function template(title: string, date: string): SatoriNode {
  const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return el(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)',
        color: '#ffffff',
      },
    },
    [
      el(
        'div',
        {
          style: {
            display: 'flex',
            fontSize: 32,
            opacity: 0.85,
            letterSpacing: '0.02em',
          },
        },
        SITE_NAME,
      ),
      el(
        'div',
        {
          style: {
            display: 'flex',
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          },
        },
        title,
      ),
      el('div', { style: { display: 'flex', fontSize: 28, opacity: 0.7 } }, formattedDate),
    ],
  );
}

/** 글마다 OG 이미지를 만들어 `<outDir>/og/<slug>.png` 로 저장한다. */
export async function generateOgImages(outDir: string): Promise<string[]> {
  const [regular, bold] = await Promise.all([
    readFile(join(FONT_DIR, 'Pretendard-Regular.otf')),
    readFile(join(FONT_DIR, 'Pretendard-Bold.otf')),
  ]);

  const fonts = [
    {
      name: 'Pretendard',
      data: regular,
      weight: 400 as const,
      style: 'normal' as const,
    },
    {
      name: 'Pretendard',
      data: bold,
      weight: 700 as const,
      style: 'normal' as const,
    },
  ];

  const dir = join(outDir, 'og');
  await mkdir(dir, { recursive: true });

  const written: string[] = [];
  for (const post of getAllPosts()) {
    // biome-ignore lint/suspicious/noExplicitAny: satori 는 React 엘리먼트 형태만 요구한다
    const svg = await satori(template(post.title, post.date) as any, {
      width: WIDTH,
      height: HEIGHT,
      fonts,
    });
    const png = new Resvg(svg, {
      fitTo: { mode: 'width', value: WIDTH },
    })
      .render()
      .asPng();

    const file = join(dir, `${post.slug}.png`);
    await writeFile(file, png);
    written.push(file);
  }

  return written;
}
