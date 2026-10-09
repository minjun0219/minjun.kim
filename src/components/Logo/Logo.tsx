import TopHeading from '@/components/TopHeading';
import { type ClassName, css } from '@/lib/css';

const styles = {
  dot: css`
    color: var(--primary-color);
  `,
  // 평소엔 영문, 한글날엔 한글 로고를 보인다. `<html data-hangul-day>` 는 HangulDayScript 가 붙인다.
  latin: css`
    :root[data-hangul-day] & {
      display: none;
    }
  `,
  // "Minjun Logo" 는 이 로고 글자만 담은 서브셋이다. 글자를 바꾸면 `scripts/logo-font.py` 로 폰트를
  // 다시 만든다 — 빠진 글자는 에러 없이 다음 폰트(한글은 시스템 폰트)로 떨어진다.
  hangul: css`
    display: none;
    font-family: "Minjun Logo", Nunito, "Nunito Fallback", sans-serif;

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
      <span className={styles.hangul}>
        김<span className={styles.dot}>.</span>민준
      </span>
    </>
  );
  return <TopHeading className={className}>{link ? <a href="/">{title}</a> : title}</TopHeading>;
};

export default Logo;
