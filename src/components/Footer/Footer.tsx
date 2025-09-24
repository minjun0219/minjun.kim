import React from "react";
import cx from "classnames";

import styles from "./Footer.module.scss";

export type Props = {
  className?: string;
};

export const Footer = ({ className }: Props) => {
  const date = new Date();
  return (
    <footer className={cx(styles.footer, className)}>
      <p className={styles.copy}>&copy; {date.getFullYear()} by underfront</p>
    </footer>
  );
};

export default Footer;
