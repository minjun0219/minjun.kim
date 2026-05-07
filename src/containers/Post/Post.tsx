import React from "react";

import type { Post as PostType } from "@/lib/blog/types";
import Wrapper from "@/components/Wrapper";
import PostArticle from "@/components/PostArticle";

import styles from "./Post.module.css";

type Props = PostType & {
  className?: string;
};

const Post = ({ title, content, date }: Props) => {
  return (
    <Wrapper className={styles.post}>
      <PostArticle title={title} content={content} date={date} />
    </Wrapper>
  );
};

export default Post;
