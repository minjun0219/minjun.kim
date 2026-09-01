import cx from "classnames";
import type { Child } from "hono/jsx";

import styles from "./Wrapper.module.css";

export type Props = {
  children: Child;
  className?: string;
};

export const Wrapper = ({ children, className }: Props) => {
  return <div className={cx(styles.wrapper, className)}>{children}</div>;
};

export default Wrapper;
