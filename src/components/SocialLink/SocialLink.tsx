import { type ClassName, css, cx } from '@/lib/css';
import { ABOUT_PATHS, type Lang } from '@/lib/i18n';

const styles = {
  root: css`
    margin: 0;
    padding: 0;

    &::after {
      clear: both;
      display: block;
      content: "";
    }

    & li {
      list-style: none;
      float: left;
    }

    & li::after {
      content: "|";
      margin: 0 5px;
    }

    & li:last-child::after {
      content: none;
    }

    & span,
    & li::after {
      color: var(--text-secondary-color);
      opacity: 0.5;
    }

    & a:link,
    & a:visited {
      color: var(--text-secondary-color);
      text-decoration: none;
      transition: color 0.3s;
    }

    & a:hover,
    & a:focus {
      color: var(--text-color);
    }

    & a:active {
      text-decoration: underline;
    }

    & a > span {
      display: none;
    }

    & a > span::before {
      content: " ";
    }

    & a:hover > span,
    & a:focus > span {
      display: inline;
    }
  `,
};

export type Props = {
  className?: ClassName;
  lang?: Lang;
};

export const SocialLink = ({ className, lang = 'ko' }: Props) => (
  <ul className={cx(styles.root, className)}>
    <li>
      <a href={ABOUT_PATHS[lang]}>About</a>
    </li>
    <li>
      {/* 글은 한국어만 있다. 영어 홈에서 가면 언어가 바뀌므로 boost 하지 않는다(`@/lib/i18n`). */}
      <a href="/posts" hx-boost={lang === 'ko' ? undefined : 'false'}>
        Posts
      </a>
    </li>
    <li>
      <a href="https://github.com/minjun0219">Github</a>
    </li>
    <li>
      <a href="https://www.linkedin.com/in/minjun0219">Linkedin</a>
    </li>
    <li>
      <a href="mailto:hi@minjun.kim">
        Mail to<span>hi@minjun.kim</span>
      </a>
    </li>
  </ul>
);

export default SocialLink;
