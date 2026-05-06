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
      <footer className={styles.footer}>
        <a
          href="/feed.xml"
          className={styles.feedLink}
          aria-label="RSS 피드 구독"
        >
          <svg
            className={styles.feedIcon}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M6.18 15.64a2.18 2.18 0 1 1 0 4.36 2.18 2.18 0 0 1 0-4.36zM4 4.44A19.56 19.56 0 0 1 19.56 20h-2.83A16.73 16.73 0 0 0 4 7.27V4.44zm0 5.66a13.9 13.9 0 0 1 9.9 9.9h-2.83A11.07 11.07 0 0 0 4 12.93V10.1z" />
          </svg>
          RSS로 구독하기
        </a>
      </footer>
    </Wrapper>
  );
};

export default Post;
