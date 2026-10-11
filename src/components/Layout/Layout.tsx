import type { Child } from 'hono/jsx';
import Footer from '@/components/Footer';
import Header from '@/containers/Header';
import { type ClassName, css, cx } from '@/lib/css';
import type { Lang } from '@/lib/i18n';

const styles = {
  root: css`
    min-height: 100vh;
  `,
};

export type Props = {
  className?: ClassName;
  lang?: Lang;
  children: Child;
};

export const Layout = ({ className, lang, children }: Props) => {
  return (
    <div className={cx(styles.root, className)}>
      <Header lang={lang} />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
