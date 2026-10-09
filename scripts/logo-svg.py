# /// script
# requires-python = ">=3.9"
# dependencies = ["fonttools>=4.50"]
# ///
"""한글날 로고(`src/components/Logo`)의 SVG 윤곽을 만든다.

나눔스퀘어라운드 Regular(`NanumSquareRoundR.ttf`)의 글리프 윤곽을 뽑아 `src/components/Logo/hangulMark.ts`
로 쓴다. 1년에 하루 쓰는 로고 때문에 폰트 파일·@font-face·preload 를 두지 않으려는 것이다. 빌드 중에는
돌지 않는다 — 로고 글자를 바꿀 때만 다시 실행해 결과를 커밋한다.

    uv run scripts/logo-svg.py <NanumSquareRoundR.ttf> [--text 김.민준]
    # uv 가 없으면: pip install fonttools && python3 scripts/logo-svg.py …

좌표는 1em = 100 단위의 정수다. viewBox 는 글꼴의 ascent·descent 를 그대로 써서 기준선이 y=0 이고, 같은
값으로 CSS 높이·vertical-align 을 함께 내보내 SVG 가 글자처럼 줄에 앉는다.

원본 TTF 는 네이버 한글 사이트(https://hangeul.naver.com) 배포본을 쓴다. 지금 커밋된 파일은 npm
`typeface-nanum-square-round@1.0.2` 에 든 같은 원본(name ID 3 `1.000;SAND;NanumSquareRoundR;170922_01`)에서
만들었다.
"""

import argparse
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

DEFAULT_TEXT = "김.민준"
UNITS_PER_EM = 100
OUT = Path(__file__).resolve().parent.parent / "src/components/Logo/hangulMark.ts"


def number(value: float) -> str:
    return str(round(value))


def exact(value: float) -> str:
    # viewBox 는 반올림하지 않는다 — 높이가 CSS height 와 어긋나면 기준선이 틀어진다
    return f"{value:.2f}".rstrip("0").rstrip(".")


def em(value: float) -> str:
    return f"{value:.3f}".rstrip("0").rstrip(".") + "em"


def main() -> None:
    parser = argparse.ArgumentParser(description="한글날 로고 SVG 윤곽을 만든다")
    parser.add_argument("source", help="NanumSquareRoundR.ttf 경로")
    parser.add_argument("--text", default=DEFAULT_TEXT, help=f"로고 글자 (기본값 {DEFAULT_TEXT})")
    args = parser.parse_args()

    font = TTFont(args.source)
    cmap = font.getBestCmap()
    missing = sorted({ch for ch in args.text if ord(ch) not in cmap})
    if missing:
        raise SystemExit(f"원본 폰트에 없는 글자: {' '.join(missing)}")

    glyph_set = font.getGlyphSet()
    scale = UNITS_PER_EM / font["head"].unitsPerEm
    ascent = font["hhea"].ascent * scale
    descent = font["hhea"].descent * scale

    x = 0.0
    glyphs = []
    for ch in args.text:
        glyph = glyph_set[cmap[ord(ch)]]
        pen = SVGPathPen(glyph_set, ntos=number)
        # 글꼴 좌표는 y 가 위로 커지므로 뒤집는다. 기준선은 y=0 그대로다
        glyph.draw(TransformPen(pen, (scale, 0, 0, -scale, x, 0)))
        glyphs.append((ch, pen.getCommands()))
        x += glyph.width * scale

    view_box = f"0 {exact(-ascent)} {exact(x)} {exact(ascent - descent)}"
    lines = [
        "// scripts/logo-svg.py 가 만든 파일이다 — 손으로 고치지 않는다.",
        "",
        "/** 나눔스퀘어라운드 Regular 로 그린 한글날 로고. 1em = 100 단위, 기준선 y=0 */",
        "export const HANGUL_MARK = {",
        f"  label: '{args.text}',",
        f"  viewBox: '{view_box}',",
        f"  height: '{em((ascent - descent) / UNITS_PER_EM)}',",
        f"  verticalAlign: '{em(descent / UNITS_PER_EM)}',",
        "  glyphs: [",
    ]
    for ch, d in glyphs:
        lines += [
            "    {",
            f"      d: '{d}',",
            f"      dot: {'true' if ch == '.' else 'false'},",
            "    },",
        ]
    lines += ["  ],", "} as const;", ""]
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"{OUT}: {OUT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
