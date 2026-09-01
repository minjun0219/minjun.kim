import PostContent from "@/components/PostContent";
import Wrapper from "@/components/Wrapper";

import styles from "./Resume.module.css";

type Props = {
  html: string;
  updatedAt?: string;
};

const Resume = ({ html, updatedAt }: Props) => (
  <Wrapper className={styles.resume}>
    <article className={styles.article}>
      <PostContent html={html} className={styles.content} />
      {updatedAt ? (
        <p className={styles.updatedAt}>마지막 업데이트: {updatedAt}</p>
      ) : null}
    </article>
  </Wrapper>
);

export default Resume;
