import type { Child } from 'hono/jsx';
import Footer from '@/components/Footer';
import Header from '@/containers/Header';
import { type ClassName, css, cx } from '@/lib/css';
import type { Lang, Translations } from '@/lib/i18n';

const styles = {
  root: css`
    min-height: 100vh;
  `,
};

export type Props = {
  className?: ClassName;
  lang?: Lang;
  /** 번역이 있는 페이지의 언어별 경로 — 푸터에 언어 전환 링크가 생긴다 */
  translations?: Translations;
  children: Child;
};

export const Layout = ({ className, lang, translations, children }: Props) => {
  return (
    <div className={cx(styles.root, className)}>
      <Header lang={lang} />
      {children}
      <Footer lang={lang} translations={translations} />
    </div>
  );
};

export default Layout;
