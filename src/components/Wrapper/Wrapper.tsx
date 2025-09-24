import React from "react";
import cx from "classnames";

import styles from "./Wrapper.module.scss";

export type Props = {
  children: React.ReactNode;
  className?: string;
};

export const Wrapper = ({ children, className }: Props) => {
  return <div className={cx(styles.wrapper, className)}>{children}</div>;
};

export default Wrapper;
