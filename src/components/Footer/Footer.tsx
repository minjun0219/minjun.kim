import { type ClassName, css, cx } from '@/lib/css';
import { LANGUAGE_NAMES, type Lang, otherLang, type Translations } from '@/lib/i18n';

const styles = {
  root: css`
    margin-top: 3em;
    margin-bottom: 5em;
    text-align: center;
    color: var(--text-secondary-color);
  `,
  lang: css`
    &:link,
    &:visited {
      color: inherit;
      text-decoration: none;
      transition: color 0.3s;
    }

    &:hover,
    &:focus {
      color: var(--text-color);
      text-decoration: underline;
    }
  `,
};

export type Props = {
  className?: ClassName;
  lang?: Lang;
  /** 번역이 있는 페이지면 다른 언어판으로 가는 링크를 단다 */
  translations?: Translations;
};

export const Footer = ({ className, lang = 'ko', translations }: Props) => {
  const date = new Date();
  const other = otherLang(lang);
  return (
    <footer className={cx(styles.root, className)}>
      <p>
        &copy; {date.getFullYear()} by minjun.kim
        {/* 언어가 바뀌면 `<html lang>` 을 다시 받아야 해서 boost 하지 않는다(`@/lib/i18n`) */}
        {translations ? (
          <>
            {' · '}
            <a
              href={translations[other]}
              hreflang={other}
              lang={other}
              hx-boost="false"
              className={styles.lang}
            >
              {LANGUAGE_NAMES[other]}
            </a>
          </>
        ) : null}
      </p>
    </footer>
  );
};

export default Footer;
