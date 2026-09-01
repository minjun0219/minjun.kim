import PostArticle from "@/components/PostArticle";
import Wrapper from "@/components/Wrapper";

import styles from "./Post.module.css";

type Props = {
  title: string;
  date: string;
  html: string;
  mediumUrl?: string;
  className?: string;
};

const Post = ({ title, html, date, mediumUrl }: Props) => {
  return (
    <Wrapper className={styles.post}>
      <PostArticle
        title={title}
        html={html}
        date={date}
        mediumUrl={mediumUrl}
      />
    </Wrapper>
  );
};

export default Post;
