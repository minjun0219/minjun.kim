import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';
import type { ImageManifest, ImageVariant } from '@/lib/images';

const SOURCE_DIR = '_posts/images';
const PUBLIC_DIR = 'images';

/**
 * `srcset` 후보 너비. 원본보다 작은 것만 만들고(업스케일 없음) 원본 크기를 마지막에 붙인다.
 * 본문 이미지 최대 표시 폭이 732px(`markdown.ts` 의 `FIGURE_MAX_WIDTH`)이라 그 근처를 촘촘히 둔다.
 */
const VARIANT_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1536];

/**
 * 글 이미지를 webp 로 변환해 `<outDir>/images/<name>-<hash8>.webp`(원본 크기)와
 * `<name>-<hash8>-w<width>.webp`(축소본)로 쓰고 매니페스트를 돌려준다.
 * 렌더 전에 한 번 도는 사전 패스라 렌더 중엔 파일 시스템을 건드리지 않는다.
 *
 * 해시는 원본 내용 기준 — 원본이 같으면 URL 도 같아 배포 사이에 캐시가 유지된다.
 * 옛 절대 경로(`/images/posts/…`)는 의도적으로 살리지 않는다(404).
 */
export async function buildImageManifest(outDir: string): Promise<ImageManifest> {
  const targetDir = join(outDir, PUBLIC_DIR);
  await mkdir(targetDir, { recursive: true });

  const manifest: ImageManifest = {};
  for (const fileName of (await readdir(SOURCE_DIR)).sort()) {
    const source = await readFile(join(SOURCE_DIR, fileName));
    const hash = createHash('sha256').update(source).digest('hex').slice(0, 8);
    const baseName = `${parse(fileName).name}-${hash}`;

    const image = sharp(source);
    const { width, height } = await image.metadata();
    if (!width || !height) {
      throw new Error(`이미지 크기를 읽지 못했다: ${fileName}`);
    }

    const variants: ImageVariant[] = [];
    for (const variantWidth of VARIANT_WIDTHS.filter((w) => w < width)) {
      const outputName = `${baseName}-w${variantWidth}.webp`;
      await writeFile(
        join(targetDir, outputName),
        await image.clone().resize({ width: variantWidth }).webp().toBuffer(),
      );
      variants.push({ url: `/${PUBLIC_DIR}/${outputName}`, width: variantWidth });
    }
    const url = `/${PUBLIC_DIR}/${baseName}.webp`;
    await writeFile(join(targetDir, `${baseName}.webp`), await image.webp().toBuffer());
    variants.push({ url, width });

    manifest[fileName] = { url, width, height, variants };
  }
  return manifest;
}
