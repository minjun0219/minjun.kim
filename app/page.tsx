import React from "react";
import Link from "next/link";
import type { NextPage } from "next";

import Logo from "@/components/Logo";

import styles from "./page.module.css";

const IndexPage: NextPage = () => {
  return (
    <main className={styles.container}>
      <div className={styles.hero}>
        <span className={styles.prompt} aria-hidden="true">
          $
        </span>
        <Logo className={styles.logo} />
        <span className={styles.cursor} aria-hidden="true">
          _
        </span>
      </div>

      <ul className={styles.primaryNav}>
        <li>
          <Link href="/resume" className={styles.primaryLink}>
            Resume
          </Link>
        </li>
        <li>
          <Link href="/posts" className={styles.primaryLink}>
            Posts
          </Link>
        </li>
      </ul>

      <div className={styles.divider} aria-hidden="true" />

      <ul className={styles.externalNav}>
        <li>
          <a
            href="https://github.com/minjun0219"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            github
          </a>
        </li>
        <li>
          <a
            href="https://www.linkedin.com/in/minjun0219"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            linkedin
          </a>
        </li>
        <li>
          <a
            href="https://instagram.com/3600s"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            instagram
          </a>
        </li>
        <li>
          <a href="mailto:hi@minjun.kim" className={styles.externalLink}>
            mail
          </a>
        </li>
      </ul>
    </main>
  );
};

export default IndexPage;
