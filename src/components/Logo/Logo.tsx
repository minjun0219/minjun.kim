import TopHeading from '@/components/TopHeading';
import { type ClassName, css } from '@/lib/css';
import { HANGUL_MARK } from './hangulMark';

const styles = {
  // 한글 로고의 SVG 는 `fill: currentColor` 를 물려받으므로 color 만으로 path 도 강조색이 된다
  dot: css`
    color: var(--primary-color);
  `,
  // 평소엔 영문, 한글날엔 한글 로고를 보인다. `<html data-hangul-day>` 는 HangulDayScript 가 붙인다.
  latin: css`
    :root[data-hangul-day] & {
      display: none;
    }
  `,
  // 글자가 아니라 나눔스퀘어라운드 윤곽을 뽑은 SVG 다(`scripts/logo-svg.py`). 높이·기준선을 글꼴 지표에
  // 맞춰 영문 로고처럼 줄에 앉는다.
  hangul: css`
    display: none;
    height: ${HANGUL_MARK.height};
    vertical-align: ${HANGUL_MARK.verticalAlign};
    fill: currentColor;

    :root[data-hangul-day] & {
      display: inline;
    }
  `,
};

type Props = {
  className?: ClassName;
  link?: boolean;
};

const Logo = ({ className, link }: Props) => {
  const title = (
    <>
      <span className={styles.latin}>
        minjun<span className={styles.dot}>.</span>kim
      </span>
      <svg
        className={styles.hangul}
        viewBox={HANGUL_MARK.viewBox}
        role="img"
        aria-label={HANGUL_MARK.label}
      >
        {HANGUL_MARK.glyphs.map(({ d, dot }) => (
          <path key={d} d={d} className={dot ? styles.dot : undefined} />
        ))}
      </svg>
    </>
  );
  return <TopHeading className={className}>{link ? <a href="/">{title}</a> : title}</TopHeading>;
};

export default Logo;
