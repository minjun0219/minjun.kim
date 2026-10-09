import TopHeading from '@/components/TopHeading';
import { type ClassName, css, cx } from '@/lib/css';

const styles = {
  // "Minjun Logo" 는 이 로고 글자만 담은 서브셋이다. 글자를 바꾸면 `scripts/logo-font.py` 로 폰트를
  // 다시 만든다 — 빠진 글자는 에러 없이 다음 폰트(한글은 시스템 폰트)로 떨어진다.
  root: css`
    font-family: "Minjun Logo", Nunito, "Nunito Fallback", sans-serif;
  `,
};

type Props = {
  className?: ClassName;
  link?: boolean;
};

const Logo = ({ className, link }: Props) => {
  const title = (
    <>
      김<span>.</span>민준
    </>
  );
  return (
    <TopHeading className={cx(styles.root, className)}>
      {link ? <a href="/">{title}</a> : title}
    </TopHeading>
  );
};

export default Logo;
