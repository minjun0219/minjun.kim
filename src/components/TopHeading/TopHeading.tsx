import cx from "classnames";
import type { Child } from "hono/jsx";

import styles from "./TopHeading.module.css";

export type Props = {
  className?: string;
  children?: Child;
};

const TopHeading = ({ children, className }: Props) => {
  return <h1 className={cx(styles.root, className)}>{children}</h1>;
};

export default TopHeading;
