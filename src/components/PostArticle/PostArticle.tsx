import React from "react";
import PostHeader from "../PostHeader";

import PostContent from "../PostContent";

import styles from "./PostArticle.module.css";

export type Props = {
  className?: string;
  title: string;
  date: string;
  content: string;
};

export const PostArticle = ({ title, date, content }: Props) => {
  return (
    <article className={styles.article}>
      <PostHeader title={title} date={date} />
      <PostContent value={content} className={styles.content} />
    </article>
  );
};

export default PostArticle;
