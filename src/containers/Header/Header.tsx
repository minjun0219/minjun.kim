import AdjustIcon from '@/components/icons/AdjustIcon';
import GithubIcon from '@/components/icons/GithubIcon';
import InstagramIcon from '@/components/icons/InstagramIcon';
import LinkedinIcon from '@/components/icons/LinkedinIcon';
import MoonIcon from '@/components/icons/MoonIcon';
import SunIcon from '@/components/icons/SunIcon';
import Logo from '@/components/Logo';
import Wrapper from '@/components/Wrapper';
import { css, cx } from '@/lib/css';

const container = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
`;

const interactive = css`
  color: var(--text-secondary-color);
  transition-duration: var(--transition-duration);
  transition-property: color;

  @media (hover: hover) {
    &:hover {
      color: var(--text-color);
    }
  }
`;

// cx 는 선언을 뒤가 이기게 병합하므로 TopHeading 의 color/font-size 를 !important 없이 덮는다.
const logo = cx(
  interactive,
  css`
    margin: 0;
    font-size: 2em;
  `,
);

const mode = cx(
  interactive,
  css`
    border: 0;
    background: none;
    padding: 10px;
    cursor: pointer;
    outline: none;
  `,
);

const icon = css`
  width: 20px;
  height: 20px;
  fill: currentColor;
`;

// 테마 아이콘 3상태. `<html data-theme>` 은 NoFlashThemeScript 와 클라이언트 토글이 세팅한다.
const iconSystem = css`
  :root[data-theme="light"] &,
  :root[data-theme="dark"] & {
    display: none;
  }
`;

const iconLight = css`
  display: none;

  :root[data-theme="light"] & {
    display: inline-block;
  }
`;

const iconDark = css`
  display: none;

  :root[data-theme="dark"] & {
    display: inline-block;
  }
`;

export const Header = () => {
  return (
    <header>
      <Wrapper className={container}>
        <Logo link className={logo} />
        <div>
          {/* 토글 동작은 src/client/main.ts 가 document 위임으로 처리한다.
              hx-boost 가 body 를 통째로 교체하므로 요소에 직접 건 리스너는 살아남지 못한다. */}
          <button type="button" className={mode} data-theme-toggle aria-label="toggle theme">
            <AdjustIcon className={cx(icon, iconSystem)} />
            <SunIcon className={cx(icon, iconLight)} />
            <MoonIcon className={cx(icon, iconDark)} />
          </button>
          <a
            href="https://www.linkedin.com/in/minjun0219"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={mode}
          >
            <LinkedinIcon className={icon} />
          </a>
          <a
            href="https://instagram.com/3600s"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={mode}
          >
            <InstagramIcon className={icon} />
          </a>
          <a
            href="https://github.com/minjun0219"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={mode}
          >
            <GithubIcon className={icon} />
          </a>
        </div>
      </Wrapper>
    </header>
  );
};

export default Header;
