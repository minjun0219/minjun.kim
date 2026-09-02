import { css } from "@/lib/css";
import PostContent from "../PostContent";
import PostHeader from "../PostHeader";

const article = css`
  margin: 3em 0;
  font-family: var(--font-family-base);
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text-color);
  transition-property: color;
  transition-duration: var(--transition-duration);

  & p > code,
  & p > a > code {
    font-family: var(--font-family-code);
    padding: 0.3em;
    font-size: 0.8em;
    border-radius: 5px;
    background: var(--code-highlight-color);
  }

  & a {
    word-break: break-all;
  }

  & a:link,
  & a:visited {
    text-decoration: none;
    color: var(--primary-color);
    transition: color 0.3s;
  }

  & a:hover,
  & a:focus,
  & a:active {
    text-decoration: underline;
  }
`;

const content = css`
  text-align: justify;
`;

export type Props = {
  title: string;
  date: string;
  html: string;
  mediumUrl?: string;
};

export const PostArticle = ({ title, date, html, mediumUrl }: Props) => {
  return (
    <article className={article}>
      <PostHeader title={title} date={date} mediumUrl={mediumUrl} />
      <PostContent html={html} className={content} />
    </article>
  );
};

export default PostArticle;
