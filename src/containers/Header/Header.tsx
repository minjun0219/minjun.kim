"use client";

import React from "react";

import AdjustIcon from "@/components/icons/AdjustIcon";
import GithubIcon from "@/components/icons/GithubIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import LinkedinIcon from "@/components/icons/LinkedinIcon";
import MoonIcon from "@/components/icons/MoonIcon";
import SunIcon from "@/components/icons/SunIcon";
import Wrapper from "@/components/Wrapper";
import { THEME_CYCLE, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

import styles from "./Header.module.css";
import Logo from "@/components/Logo";

function handleSwitchTheme() {
  if (typeof document === "undefined") {
    return;
  }

  const html = document.documentElement;
  const current = html.getAttribute("data-theme") as Theme | null;
  const index = current ? THEME_CYCLE.indexOf(current) : -1;
  const next = THEME_CYCLE[(index + 1) % THEME_CYCLE.length];

  if (next === "system") {
    html.removeAttribute("data-theme");
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } catch (err) {
      // Ignore storage failures (private mode, disabled cookies);
      // the document attribute has already been updated.
    }
  } else {
    html.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (err) {
      // Ignore storage failures (private mode, disabled cookies);
      // the document attribute has already been updated.
    }
  }
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
