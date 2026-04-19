"use client";

import React from "react";

import AdjustIcon from "@/components/icons/AdjustIcon";
import GithubIcon from "@/components/icons/GithubIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import LinkedinIcon from "@/components/icons/LinkedinIcon";
import Wrapper from "@/components/Wrapper";

import styles from "./Header.module.css";
import Logo from "@/components/Logo";

const THEME_CYCLE = ["system", "light", "dark"] as const;

function handleSwitchTheme() {
  if (typeof document === "undefined") {
    return;
  }

  const html = document.documentElement;
  const current = html.getAttribute("data-theme") as
    | (typeof THEME_CYCLE)[number]
    | null;
  const index = current ? THEME_CYCLE.indexOf(current) : -1;
  const next = THEME_CYCLE[(index + 1) % THEME_CYCLE.length];

  html.setAttribute("data-theme", next);
  try {
    localStorage.setItem("theme", next);
  } catch (err) {}
}

export const Header = () => {
  return (
    <header>
      <Wrapper className={styles.container}>
        <Logo link className={styles.logo} />
        <div className={styles.utils}>
          <button
            type="button"
            className={styles.mode}
            onClick={handleSwitchTheme}
          >
            <AdjustIcon className={styles.icon} />
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
