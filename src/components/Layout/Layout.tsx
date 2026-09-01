import cx from "classnames";
import type { Child } from "hono/jsx";
import Footer from "@/components/Footer";
import Header from "@/containers/Header";

import styles from "./Layout.module.css";

export type Props = {
  className?: string;
  children: Child;
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
