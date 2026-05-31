import PostContent from "../PostContent";
import PostHeader from "../PostHeader";

import styles from "./PostArticle.module.css";

export type Props = {
  className?: string;
  title: string;
  date: string;
  content: string;
  mediumUrl?: string;
};

export const PostArticle = ({ title, date, content, mediumUrl }: Props) => {
  return (
    <article className={styles.article}>
      <PostHeader title={title} date={date} mediumUrl={mediumUrl} />
      <PostContent value={content} className={styles.content} />
    </article>
  );
};

export default PostArticle;
