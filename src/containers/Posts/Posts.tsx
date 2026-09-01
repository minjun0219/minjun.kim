import PostExcerpt from "@/components/PostExcerpt";
import Wrapper from "@/components/Wrapper";
import { getPostListing } from "@/lib/blog";

import styles from "./Posts.module.css";

const Posts = () => {
  const posts = getPostListing();

  return (
    <Wrapper>
      {posts.map((post) => (
        <PostExcerpt
          key={post.url}
          title={post.title}
          date={post.date}
          url={post.url}
          source={post.source}
          mediumUrl={post.mediumUrl}
        />
      ))}
      <footer className={styles.footer}>
        <a
          href="/posts/feed.xml"
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
          Feed
        </a>
      </footer>
    </Wrapper>
  );
};

export default Posts;
