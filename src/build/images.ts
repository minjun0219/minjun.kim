import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';
import type { ImageManifest } from '@/lib/images';

const SOURCE_DIR = '_posts/images';
const PUBLIC_DIR = 'images';

/**
 * 글 이미지를 webp 로 변환해 `<outDir>/images/<name>-<hash8>.webp` 로 쓰고 매니페스트를
 * 돌려준다. 렌더 전에 한 번 도는 사전 패스라 렌더 중엔 파일 시스템을 건드리지 않는다.
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
    const outputName = `${parse(fileName).name}-${hash}.webp`;

    const image = sharp(source);
    const { width, height } = await image.metadata();
    if (!width || !height) {
      throw new Error(`이미지 크기를 읽지 못했다: ${fileName}`);
    }
    await writeFile(join(targetDir, outputName), await image.webp().toBuffer());

    manifest[fileName] = { url: `/${PUBLIC_DIR}/${outputName}`, width, height };
  }
  return manifest;
}
