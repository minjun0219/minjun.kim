import Wrapper from '@/components/Wrapper';
import { css } from '@/lib/css';
import { HOME_PATHS, type Lang } from '@/lib/i18n';

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: calc(100vh - 14rem);
    padding-top: 3em;
    padding-bottom: 3em;
    font-family: var(--font-family-base);
    color: var(--text-color);
  `,
  code: css`
    margin: 0 0 0.75em;
    font-size: 0.8rem;
    letter-spacing: 0.15em;
    color: var(--text-secondary-color);
  `,
  title: css`
    margin: 0;
    font-size: 1.6rem;
    font-weight: 800;
    line-height: 1.4;
    word-break: keep-all;
  `,
  description: css`
    margin: 0.75em 0 2em;
    color: var(--text-secondary-color);
    word-break: keep-all;
  `,
  home: css`
    &:link,
    &:visited {
      color: var(--text-secondary-color);
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

const TEXT: Record<Lang, { title: string; description: string; home: string }> = {
  ko: {
    title: '페이지를 찾을 수 없습니다',
    description: '요청하신 페이지가 이동되었거나 더 이상 존재하지 않습니다.',
    home: '← 홈으로 돌아가기',
  },
  en: {
    title: 'Page not found',
    description: 'The page you requested has moved or no longer exists.',
    home: '← Back to home',
  },
};

const NotFound = ({ lang = 'ko' }: { lang?: Lang }) => (
  <Wrapper className={styles.container}>
    <p className={styles.code}>404</p>
    <h1 className={styles.title}>{TEXT[lang].title}</h1>
    <p className={styles.description}>{TEXT[lang].description}</p>
    <a href={HOME_PATHS[lang]} className={styles.home}>
      {TEXT[lang].home}
    </a>
  </Wrapper>
);

export default NotFound;
