import React from "react";
import cx from "classnames";

import styles from "./Footer.module.css";

export type Props = {
  className?: string;
};

export const Footer = ({ className }: Props) => {
  const date = new Date();
  return (
    <footer className={cx(styles.footer, className)}>
      <p className={styles.copy}>&copy; {date.getFullYear()} by minjun.kim</p>
    </footer>
  );
};

export default Footer;
