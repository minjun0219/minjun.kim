import React from "react";
import PostArticle from "@/components/PostArticle";
import Wrapper from "@/components/Wrapper";
import type { Post as PostType } from "@/lib/blog/types";

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
