import React from "react";
import cx from "classnames";

import Header from "@/containers/Header";
import Footer from "@/components/Footer";

import styles from "./Layout.module.scss";

export type Props = {
  className?: string;
  children: React.ReactNode;
};

export const Layout = ({ className, children }: Props) => {
  return (
    <div className={cx(styles.container, className)}>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
