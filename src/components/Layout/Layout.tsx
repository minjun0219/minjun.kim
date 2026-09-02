import type { Child } from 'hono/jsx';
import Footer from '@/components/Footer';
import Header from '@/containers/Header';
import { type ClassName, css, cx } from '@/lib/css';

const styles = {
  root: css`
    min-height: 100vh;
  `,
};

export type Props = {
  className?: ClassName;
  children: Child;
};

export const Layout = ({ className, children }: Props) => {
  return (
    <div className={cx(styles.root, className)}>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
