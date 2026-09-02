import PostContent from '@/components/PostContent';
import Wrapper from '@/components/Wrapper';
import { css } from '@/lib/css';

const styles = {
  root: css`
    margin: 3em auto 5em;
    color: var(--text-color);
  `,
  article: css`
    font-family: var(--font-family-base);
    font-size: 1rem;
    line-height: 1.7;
  `,
  content: css`
    & h1 {
      margin-top: 0;
      margin-bottom: 0.2em;
      font-size: 2em;
    }

    & h2 {
      margin-top: 2em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid var(--text-secondary-color);
      font-size: 1.3em;
    }

    & h3 {
      margin-top: 1.5em;
      margin-bottom: 0.3em;
      font-size: 1.05em;
      color: var(--primary-color);
    }

    & ul {
      padding-left: 1.2em;
    }

    & li + li {
      margin-top: 0.3em;
    }

    & a {
      color: var(--primary-color);
    }
  `,
  updatedAt: css`
    margin-top: 3em;
    color: var(--text-secondary-color);
    font-size: 0.85em;
    text-align: right;
  `,
};

type Props = {
  html: string;
  updatedAt?: string;
};

const Resume = ({ html, updatedAt }: Props) => (
  <Wrapper className={styles.root}>
    <article className={styles.article}>
      <PostContent html={html} className={styles.content} />
      {updatedAt ? <p className={styles.updatedAt}>마지막 업데이트: {updatedAt}</p> : null}
    </article>
  </Wrapper>
);

export default Resume;
