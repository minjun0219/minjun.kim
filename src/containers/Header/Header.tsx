import AdjustIcon from "@/components/icons/AdjustIcon";
import GithubIcon from "@/components/icons/GithubIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import LinkedinIcon from "@/components/icons/LinkedinIcon";
import MoonIcon from "@/components/icons/MoonIcon";
import SunIcon from "@/components/icons/SunIcon";
import Logo from "@/components/Logo";
import Wrapper from "@/components/Wrapper";
import styles from "./Header.module.css";

export const Header = () => {
  return (
    <header>
      <Wrapper className={styles.container}>
        <Logo link className={styles.logo} />
        <div className={styles.utils}>
          {/* 토글 동작은 public/app.js 가 document 위임으로 처리한다.
              hx-boost 가 body 를 통째로 교체하므로 요소에 직접 건 리스너는 살아남지 못한다. */}
          <button
            type="button"
            className={styles.mode}
            data-theme-toggle
            aria-label="toggle theme"
          >
            <AdjustIcon className={`${styles.icon} ${styles.iconSystem}`} />
            <SunIcon className={`${styles.icon} ${styles.iconLight}`} />
            <MoonIcon className={`${styles.icon} ${styles.iconDark}`} />
          </button>
          <a
            href="https://www.linkedin.com/in/minjun0219"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={styles.mode}
          >
            <LinkedinIcon className={styles.icon} />
          </a>
          <a
            href="https://instagram.com/3600s"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={styles.mode}
          >
            <InstagramIcon className={styles.icon} />
          </a>
          <a
            href="https://github.com/minjun0219"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={styles.mode}
          >
            <GithubIcon className={styles.icon} />
          </a>
        </div>
      </Wrapper>
    </header>
  );
};

export default Header;
