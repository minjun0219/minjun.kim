import React from "react";
import cx from "classnames";

import styles from "./TopHeading.module.scss";

export type Props<T = HTMLHeadingElement> = React.DelHTMLAttributes<T> & {
  children?: React.ReactNode;
};

const TopHeading = ({ children, className, ...props }: Props) => {
  return (
    <h1 className={cx(styles.root, className)} {...props}>
      {children}
    </h1>
  );
};

export default TopHeading;
