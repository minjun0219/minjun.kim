import cx from "classnames";
import type React from "react";

import styles from "./Wrapper.module.css";

export type Props = {
  children: React.ReactNode;
  className?: string;
};

export const Wrapper = ({ children, className }: Props) => {
  return <div className={cx(styles.wrapper, className)}>{children}</div>;
};

export default Wrapper;
