import PostArticle from "@/components/PostArticle";
import Wrapper from "@/components/Wrapper";
import type { Post as PostType } from "@/lib/blog/types";

import styles from "./Post.module.css";

type Props = PostType & {
  className?: string;
};

const Post = ({ title, content, date, mediumUrl }: Props) => {
  return (
    <Wrapper className={styles.post}>
      <PostArticle
        title={title}
        content={content}
        date={date}
        mediumUrl={mediumUrl}
      />
    </Wrapper>
  );
};

export default Post;
