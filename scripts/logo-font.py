# /// script
# requires-python = ">=3.9"
# dependencies = ["fonttools[woff]>=4.50"]
# ///
"""로고(`src/components/Logo`)의 한글을 그리는 서브셋 폰트를 만든다.

원본은 네이버 나눔스퀘어라운드 Regular(`NanumSquareRoundR.ttf`)다. 로고 글자만 남겨
`src/assets/fonts/logo-hangul.woff2`(수 KB)로 쓰고, 빌드(`scripts/ssg.mjs`)가 내용 해시를 붙여
`dist/fonts/` 로 복사한다. 빌드 중에는 돌지 않는다 — 로고 글자를 바꿀 때만 다시 실행해 결과를 커밋한다.
글자가 빠진 폰트를 그대로 두면 에러 없이 그 글자만 다음 폰트(시스템 한글 폰트)로 떨어진다.

    uv run scripts/logo-font.py <NanumSquareRoundR.ttf> [--text 김.민준]
    # uv 가 없으면: pip install 'fonttools[woff]' && python3 scripts/logo-font.py …

원본 TTF 는 네이버 한글 사이트(https://hangeul.naver.com) 배포본을 쓴다. 지금 커밋된 파일은 npm
`typeface-nanum-square-round@1.0.2` 에 든 같은 원본(name ID 3 `1.000;SAND;NanumSquareRoundR;170922_01`)에서
만들었다. 나눔글꼴은 SIL OFL 1.1 로 배포된다고 알려져 있고, OFL 은 수정본(서브셋 포함)에 원래 글꼴 이름을
쓰지 못하게 하므로(Reserved Font Name) 패밀리 이름을 `Minjun Logo` 로 바꾼다. 저작권 표기(name ID 0)와
라이선스 필드(13·14)는 원본 그대로 둔다.
"""

import argparse
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

FAMILY = "Minjun Logo"
POSTSCRIPT_NAME = "MinjunLogo-Regular"
DEFAULT_TEXT = "김.민준"
OUT = Path(__file__).resolve().parent.parent / "src/assets/fonts/logo-hangul.woff2"
# 서브셋에 남길 name ID. 기본값(0-6)에 라이선스 설명·URL(13·14)을 더한다
KEPT_NAME_IDS = [0, 1, 2, 3, 4, 5, 6, 13, 14]
# 원본 이름이 들어 있는 name ID: 패밀리·스타일·고유 ID·전체 이름·PostScript 이름·타이포그래픽 패밀리/스타일
RENAMED_NAME_IDS = (1, 2, 3, 4, 6, 16, 17)
WINDOWS_EN = (3, 1, 0x409)


def main() -> None:
    parser = argparse.ArgumentParser(description="로고 한글 서브셋 폰트를 만든다")
    parser.add_argument("source", help="NanumSquareRoundR.ttf 경로")
    parser.add_argument("--text", default=DEFAULT_TEXT, help=f"남길 글자 (기본값 {DEFAULT_TEXT})")
    args = parser.parse_args()

    # 저장 시각을 head.modified 에 쓰지 않는다 — 같은 입력이면 같은 파일(같은 해시)이 나와야 한다
    font = TTFont(args.source, recalcTimestamp=False)
    cmap = font.getBestCmap()
    missing = sorted({ch for ch in args.text if ord(ch) not in cmap})
    if missing:
        raise SystemExit(f"원본 폰트에 없는 글자: {' '.join(missing)}")

    options = subset.Options()
    options.name_IDs = KEPT_NAME_IDS
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=args.text)
    subsetter.subset(font)

    name = font["name"]
    version = font["head"].fontRevision
    for name_id in RENAMED_NAME_IDS:
        name.removeNames(nameID=name_id)
    name.setName(FAMILY, 1, *WINDOWS_EN)
    name.setName("Regular", 2, *WINDOWS_EN)
    name.setName(f"{version:.3f};{POSTSCRIPT_NAME}", 3, *WINDOWS_EN)
    name.setName(f"{FAMILY} Regular", 4, *WINDOWS_EN)
    name.setName(POSTSCRIPT_NAME, 6, *WINDOWS_EN)

    # Options.flavor 는 pyftsubset CLI 의 저장 단계에서만 쓰인다 — 직접 저장할 때는 font.flavor 를 지정한다.
    font.flavor = "woff2"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    font.save(OUT)
    print(f"{OUT}: {OUT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
