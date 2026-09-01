import PostContent from "../PostContent";
import PostHeader from "../PostHeader";

import styles from "./PostArticle.module.css";

export type Props = {
  className?: string;
  title: string;
  date: string;
  html: string;
  mediumUrl?: string;
};

export const PostArticle = ({ title, date, html, mediumUrl }: Props) => {
  return (
    <article className={styles.article}>
      <PostHeader title={title} date={date} mediumUrl={mediumUrl} />
      <PostContent html={html} className={styles.content} />
    </article>
  );
};

export default PostArticle;
